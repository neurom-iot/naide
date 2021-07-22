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
import json

# Recv. Input dataset
data = sys.argv[1].split('|')
input_x = float(data[0])
res_y =float(data[1])

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
    inp = nengo.Node([0] * 1)    
    ens = nengo.Ensemble(1, 1, neuron_type=neuron_type)
    x = nengo.Connection(inp, ens.neurons, transform=nengo_dl.dists.Glorot(), synapse=None)
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
sys.stdout.flush()
try:
    output = {}
    output["last"] = sim.data[out_p_filt][0][-1].tolist()
    output["data"] = sim.data[out_p_filt][0].tolist()
    output["trange"] = sim.trange().tolist()
    output["sim"] = "true"
    jstr = json.dumps(output)
    print("sim:"+jstr)
    sys.stdout.flush()
except Exception as e:
    print(e)
finally:
    sys.stdout.flush()
    
try:
    plt.figure()
    plt.subplot(1, 2, 1)
    plt.text(0, 0.8, f"sepal width : {input_x}")
    plt.text(0, 0.7, f"petal width : {res_y}")
    plt.text(0, 0.5, f"result width : {sim.data[out_p_filt][-1][-1]}")
    plt.axis('off')
    plt.subplot(1, 2, 2)
    plt.plot(sim.trange(), sim.data[out_p_filt][0])
    #plt.legend([str(i) for i in range(10)], loc="upper left")
    plt.show()
except Exception as e:
    print(e)
sim.close()







