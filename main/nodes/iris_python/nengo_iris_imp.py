import numpy as np
from sklearn import datasets
import tensorflow as tf
import matplotlib.pyplot as plt
import random
import nengo
import nengo_dl

#n_steps = 3
#1. 한실험에 대해 3번씩 구한 MSE 평균을 구한다.seed = 1, 2, 3
#2. max_rates (50, 100, 150, 200, 250)
#3. tau_rc = 0.02, 0.07, 0.12, 0.17, 0.22
#4. noise_filter  0.001, 0.01, 0.1 

# neuron type
amp = 1
max_rates = 200
tau_rc = 0.02
noise_filter = 0.01 #noise_filter, #0.1 #1
intercepts = 0

seed = 1 
sp = 0
ntrain = 43
ntest = 50 - ntrain
minibatch_size = ntest

'''
x_train = np.array([[[10, 15], [20, 25], [30, 35]],
                    [[20, 25], [30, 35], [40, 45]],
                    [[30, 35], [40, 45], [50, 55]],
                    [[40, 45], [50, 55], [60, 65]],
                    [[50, 55], [60, 65], [70, 75]],
                    [[60, 65], [70, 75], [80, 85]],
                    [[70, 75], [80, 85], [90, 95]]])  # (7, 3, 2)
y_train = np.array([65, 85, 105, 125, 145, 165, 185])  # (7, )
x_test = np.array([[[80, 85], [90, 95], [100, 105]]]) #  # (1, 3, 2)
y_test = np.array([206.0161])  # (1, )
'''
iris = datasets.load_iris()
x_data = np.array([[x[1] for x in iris.data]]).T # sepal width  #(150, 1)
y_data = np.array([[y[3] for y in iris.data]]).T # petal width #(150, 1)

x_train = x_data[sp:sp+ntrain]  # setosa train  #(35, 1)
y_train = y_data[sp:sp+ntrain]  # setosa train #(35, 1)
x_test = x_data[sp+ntrain:sp+50] # setosa test  #(15, 1)
y_test = y_data[sp+ntrain:sp+50] # setosa test  #(15, 1)


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

# add the single timestep to the training data

train_data = {inp: np.reshape(x_train, (x_train.shape[0], 1, 1)),
              out_p: np.reshape(y_train, (y_train.shape[0], 1, 1))}
print(y_test.shape)
n_steps = 300
test_data = {
        inp: np.tile(np.reshape(x_test, (x_test.shape[0], 1, 1)), (1, n_steps, 1)),
        out_p_filt: np.tile(np.reshape(y_test, (y_test.shape[0], 1, 1)), (1, n_steps, 1))      
      }

def objective(outputs, targets):
    return tf.losses.mean_squared_error(predictions=outputs, labels=targets)

opt = tf.train.RMSPropOptimizer(learning_rate=0.001)
print("MSE before training: %.4f" % sim.loss(test_data, {out_p_filt: objective}))
sim.train(train_data, opt, objective={out_p: objective}, n_epochs=1000)
print("MSE after training: %.4f" % sim.loss(test_data, {out_p_filt: objective}))
sim.run_steps(n_steps, data={inp: test_data[inp][:minibatch_size]})
print(sim.data[x].weights)
print(sim.data[ens].bias) 
for i in range(minibatch_size):  
  print(test_data[inp][i,0])  
  print(test_data[out_p_filt][i,0])
  print(sim.data[out_p][i][-1])
  print(sim.data[out_p_filt][i][-1])
sim.close()