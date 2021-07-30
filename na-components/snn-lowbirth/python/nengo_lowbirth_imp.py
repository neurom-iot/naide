import os
import sys

# Disable sys.out
class NullWriter (object):
    def write (self, arg):
        pass
    def flush(args):
        pass
#nullwrite = NullWriter()
#oldstdout = sys.stdout
#sys.stdout = nullwrite

import numpy as np
import matplotlib.pyplot as plt
import nengo
import nengo_dl
import json

answer = int(sys.argv[2])
data_arg = sys.argv[1]

parse = data_arg.replace("\r", "")
parse = parse.replace("\n", "")
parse = parse.split("|")
parse_list = parse[1].split(",")

x_test = np.array([])
for parse in parse_list:
    x_test = np.append(x_test, float(parse))

#x_test = np.array([x_test])
y_test = np.array([answer])

x_test[0] = (x_test[0] - 14) / (45 - 14)
x_test[1] = (x_test[1] - 80) / (250 - 80)
x_test = np.array([x_test])
y_test = np.transpose([y_test])

# neuron type
seed = 1
amp =1
max_rates = 100
intercepts = 0
tau_rc = 0.02
noise_filter = 0.1 #noise_filter

nfeatures = 7
minibatch_size = 1
n_steps = 500

with nengo.Network(seed=seed) as net:
    net.config[nengo.Ensemble].max_rates = nengo.dists.Choice([max_rates])
    net.config[nengo.Ensemble].intercepts = nengo.dists.Choice([intercepts])    
    neuron_type=nengo.LIF(amplitude=amp, tau_rc=tau_rc)
        
    inp = nengo.Node([0] * nfeatures)    
    ens = nengo.Ensemble(1, 1, neuron_type=neuron_type)
    x = nengo.Connection(inp, ens.neurons, transform=nengo_dl.dists.Glorot(), synapse=None) 
    #x = nengo_dl.tensor_layer(inp, tf.layers.dense, units=1)
    
    inp_p = nengo.Probe(inp)
    out_p = nengo.Probe(x)
    out_p_filt = nengo.Probe(x, synapse=noise_filter)

sim = nengo_dl.Simulator(net, minibatch_size=minibatch_size)
sim.load_params("na-components/snn-lowbirth/python/lowbirth_train_data/lowbirth_params")
test_data = {
    inp: np.tile(np.reshape(x_test, (x_test.shape[0], 1, nfeatures)), (1, n_steps, 1)),
    out_p_filt: np.tile(np.reshape(y_test, (y_test.shape[0], 1, 1)), (1, n_steps, 1))      
}

sim.run_steps(n_steps, data={inp: test_data[inp][:minibatch_size]})
#sys.stdout = oldstdout
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

