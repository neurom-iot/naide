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
from urllib.request import urlretrieve
import json
from PIL import Image
import random

# String Data Parse
select_number = int(sys.argv[2])
data_arg = sys.argv[1]
data_load = True
dataPath = ""
if (len(sys.argv) > 3):
    data_load = False
    dataPath = sys.argv[3]


x_data = []
y_data = []
n_steps = 20
if data_load:
    parse = data_arg.replace("\r", "")
    parse = parse.replace("\n", "")
    parse = parse.replace("[", "")
    parse = parse.replace("]", "")
    parse = parse.replace("0.", "#0.")
    parse = parse.replace("1.", "#1.")
    parse = parse.replace(" ", "")
    parse_list = parse.split("#")
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
else:
    dataStr = ""
    with open(dataPath, 'r') as f:
        dataStr = f.read()
    parse = dataStr.split("|")
    y_data = np.zeros(10)
    y_data[int(parse[0]) - 1] = 1.0
    sys.stdout = oldstdout
    for i in range(1, len(parse) - 1):
        temp = parse[i].split(",")
        arr = list(map(lambda x: float(x), temp))
        x_data.append(arr)
    x_data = np.array(x_data)
    n_steps = len(x_data)
    x_data = np.sum(x_data, axis=0)
    x_data = x_data / np.max(x_data)
    

# neuron type
amp = 0.01
max_rates = 100
intercepts = 0
tau_rc = 0.02
synapse = 0.1 #noise_filter

#evaluation
minibatch_size = 1


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
if data_load:
    test_data = {
        inp: np.tile(x_data, (1, n_steps, 1)),
        out_p_filt: np.tile(y_data,(1, n_steps, 1))
    }
else:
    test_data = {
        inp: np.tile(x_data, (1, n_steps, 1)),
        out_p_filt: np.tile(y_data,(1, n_steps, 1))
    }
sim.load_params("na-components/snn-mnist/python/mnist_train_data/mnist_params")
sim.run_steps(n_steps, data={inp: test_data[inp][:minibatch_size]})
sys.stdout = oldstdout
try:
    output = {}
    output["last"] = sim.data[out_p_filt][0][-1].tolist()
    output["data"] = sim.data[out_p_filt][0].tolist()
    output["trange"] = sim.trange().tolist()
    output["sim"] = "true"
    img = np.reshape(x_data * 255, (28, 28))
    img = Image.fromarray(img)
    img = img.convert("L")
    #print(img.size)
    path = os.getenv("USERPROFILE").replace("\\", "/") + "/.naide/lib/ui-media/lib/results"
    if not os.path.isdir(path):
        os.mkdir(path)
    path = path + "/result_img.png"
    img.save(path)
    output["image"] = "/uimedia/results/" + str(random.random()).replace("0.", "") + "_result_img.png" 
    jstr = json.dumps(output)
    print("sim:"+jstr)
    sys.stdout.flush()
except Exception as e:
    print(e)
finally:
    sys.stdout.flush()


plt.figure()
plt.subplot(1, 2, 1)
plt.imshow(np.reshape(test_data[inp][0, 0], (28, 28)),cmap="gray")
plt.axis('off')
plt.subplot(1, 2, 2)
plt.plot(sim.trange(), sim.data[out_p_filt][0])
plt.legend([str(i) for i in range(10)], loc="upper left")

plt.show()

