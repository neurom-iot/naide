import os
import sys

# Disable sys.out
class NullWriter (object):
    def write (self, arg):
        pass
    def flush(args):
        pass
nullwrite = NullWriter()
oldstdout = sys.stdout
sys.stdout = nullwrite
import nengo
import nengo_dl
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import gzip
import pickle
import zipfile
from urllib.request import urlretrieve
import random

# String Data Parse

select_number = int(sys.argv[2])
parse = sys.argv[1].replace("\r", "")
parse = parse.replace("\n", "")
parse = parse.replace("[", "")
parse = parse.replace("]", "")
parse = parse.replace("0.", "#0.")
parse = parse.replace("1.", "#1.")
parse = parse.replace(" ", "")
parse_list = parse.split("#")
x_data = []
y_data = []
for i in range(1, len(parse_list)):
    sd = parse_list[i]
    fd = float(sd)
    x_data.append(fd)
x_data = np.array([x_data])
for i in range(10):
    if (i == select_number):
        y_data.append(1.0)
    else:
        y_data.append(0.0)
y_data = np.array([y_data])

# neuron type
amp = 0.01
max_rates = 100
intercepts = 0
tau_rc = 0.02
synapse = 0.1 #noise_filter

#train
do_train = False
epochs = 20
learning_rate = 0.001

#evaluation
minibatch_size = 1
n_steps = 20

with nengo.Network() as net:        
    neuron_type = nengo.LIF(amplitude=amp, tau_rc=tau_rc)
    net.config[nengo.Ensemble].max_rates = nengo.dists.Choice([max_rates])
    net.config[nengo.Ensemble].intercepts = nengo.dists.Choice([intercepts])
    nengo_dl.configure_settings(trainable=False)

    inp = nengo.Node([0] * 28 * 28)     
    layer = nengo_dl.tensor_layer(inp, tf.layers.conv2d, shape_in=(28, 28, 1), filters=32, kernel_size=3)
    layer = nengo_dl.tensor_layer(layer, neuron_type)
    layer = nengo_dl.tensor_layer(layer, tf.layers.conv2d, shape_in=(26, 26, 32),filters=64, kernel_size=3)
    layer = nengo_dl.tensor_layer(layer, neuron_type)    
    layer = nengo_dl.tensor_layer(layer, tf.layers.average_pooling2d, shape_in=(24, 24, 64),pool_size=2, strides=2)    
    layer = nengo_dl.tensor_layer(layer, tf.layers.conv2d, shape_in=(12, 12, 64),filters=128, kernel_size=3)
    layer = nengo_dl.tensor_layer(layer, neuron_type)
    layer = nengo_dl.tensor_layer(layer, tf.layers.average_pooling2d, shape_in=(10, 10, 128),pool_size=2, strides=2)    
    layer = nengo_dl.tensor_layer(layer, tf.layers.dense, units=10)
    out_p = nengo.Probe(layer)
    out_p_filt = nengo.Probe(layer, synapse=synapse)

sim = nengo_dl.Simulator(net, minibatch_size=minibatch_size)
test_data = {
    inp: np.tile(x_data, (1, n_steps, 1)),
    out_p_filt: np.tile(y_data,(1, n_steps, 1))
}
sim.load_params("nodes/mnist_python/mnist_train_data/mnist_params")
sim.run_steps(n_steps, data={inp: test_data[inp][:minibatch_size]})
sys.stdout = oldstdout
for i in range(10):
    print(str(i) + ":" + str(sim.data[out_p_filt][0][-1][i]))
sys.stdout.flush()


plt.figure()
plt.subplot(1, 2, 1)
plt.imshow(np.reshape(test_data[inp][0, 0], (28, 28)),cmap="gray")
plt.axis('off')
plt.subplot(1, 2, 2)
plt.plot(sim.trange(), sim.data[out_p_filt][0])
plt.legend([str(i) for i in range(10)], loc="upper left")

plt.show()

