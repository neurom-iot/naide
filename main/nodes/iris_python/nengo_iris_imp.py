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
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import random
import nengo
import nengo_dl

# Recv. Input dataset
data = sys.argv[1].split('|')
input_x = float(data[0])
res_y = float(data[1])

# neuron type
amp = 1
max_rates = 200
tau_rc = 0.02
noise_filter = 0.01 #noise_filter, #0.1 #1
intercepts = 0

seed = 1 
minibatch_size = 1

x_data = np.array([[input_x]]).T # sepal width  #(150, 1)
y_data = np.array([[res_y]]).T # petal width #(150, 1)

x_test = x_data[0] # setosa test  #(15, 1)
y_test = y_data[0] # setosa test  #(15, 1)

with nengo.Network(seed=seed) as net:
    net.config[nengo.Ensemble].max_rates = nengo.dists.Choice([max_rates])
    net.config[nengo.Ensemble].intercepts = nengo.dists.Choice([intercepts])    
    neuron_type=nengo.LIF(amplitude=amp, tau_rc=tau_rc)
    #nengo_dl.configure_settings(trainable=False)

    inp = nengo.Node([0] * 1)    
    ens = nengo.Ensemble(1, 1, neuron_type=neuron_type) # max_rates=nengo.dists.Choice([max_rates]), intercepts=nengo.dists.Choice([intercepts]))
    x = nengo.Connection(inp, ens.neurons, transform=nengo_dl.dists.Glorot(), synapse=None) #, transform=np.random.normal(0, 0.1, size=[1,1]))    
    #x = nengo_dl.tensor_layer(inp, tf.layers.dense, units=1)
    
    inp_p = nengo.Probe(inp)
    out_p = nengo.Probe(x)
    out_p_filt = nengo.Probe(x, synapse=noise_filter)
sim = nengo_dl.Simulator(net, minibatch_size=minibatch_size)

sim.load_params("nodes/iris_python/iris_train_data/train")
n_steps = 300
test_data = {
        inp: np.tile(np.reshape(x_test, (x_test.shape[0], 1, 1)), (1, n_steps, 1)),
        out_p_filt: np.tile(np.reshape(y_test, (y_test.shape[0], 1, 1)), (1, n_steps, 1))      
      }
sim.run_steps(n_steps, data={inp: test_data[inp][:minibatch_size]})
sys.stdout = oldstdout
print(sim.data[out_p_filt][-1][-1])
sim.close()