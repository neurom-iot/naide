import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import nengo
import nengo_dl

# neuron type
seed = 1
amp =1
max_rates = 100
intercepts = 0
tau_rc = 0.02
noise_filter = 0.1 #noise_filter

train_data_rate = 0.85
learning_rate = 0.001
epochs = 10000
np.random.seed(seed)
tf.set_random_seed(seed)
birth_file = ""
with open('./lowbirth.dat', 'r') as f:
    birth_file = f.read()

birth_all_data = birth_file.split('\n')
birth_header = [x for x in birth_all_data[0].split('\t') if len(x)>=1]
birth_data = [[float(x) for x in y.split('\t') if len(x)>=1] for y in birth_all_data[1:] if len(y)>=1]
print(birth_header)
print(len(birth_header))
data_size = len(birth_data)
print(data_size)

# Pull out predictor variables (not id, not target, and not birthweight)
x_data = np.array([x[1:8] for x in birth_data]) 
print(x_data.shape)

# Pull out target variable
y_data = np.array([y[0] for y in birth_data])
print(y_data.shape)

# Split data into train/test = 80%/20%  (189*0.8 = 151.2)  = 151:38
train_samples = round(data_size*train_data_rate)
print("number of train samples : ", train_samples)
train_indices = np.random.choice(data_size, train_samples, replace=False)
testset = set(range(data_size)) -  set(train_indices)
test_indices = np.array(list(testset))

x_train = x_data[train_indices]
y_train = np.transpose([y_data[train_indices]])


x_test = x_data[test_indices]
y_test = np.transpose([y_data[test_indices]])
print("X_TEST : ", x_test.shape)
print(y_test[0])

# Normalize by column (min-max norm)
def normalize_cols(m):
    print(m)
    col_max = m.max(axis=0)     
    col_min = m.min(axis=0)
    return (m - col_min) / (col_max - col_min)

#print(x_data)
print(x_test)
x_train = np.nan_to_num(normalize_cols(x_train))
x_test = np.nan_to_num(normalize_cols(x_test))
print(x_test[0])
#print(x_data)
#print(x_train.shape) #(132, 7)
#print(y_train.shape) #(132, 1)
#print(x_test.shape)  #(57, 7)
#print(y_test.shape)  #(57, 1)
##################################################
nfeatures = 7
minibatch_size = 189 - train_samples

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
sim.load_params("./lowbirth_train_data/lowbirth_params")

train_data = {inp: np.reshape(x_train, (x_train.shape[0], 1, nfeatures)),
              out_p: np.reshape(y_train, (y_train.shape[0], 1, 1))}
#print(y_test.shape)
n_steps = 500

test_data = {
        inp: np.tile(np.reshape(x_test, (x_test.shape[0], 1, nfeatures)), (1, n_steps, 1)),
        out_p_filt: np.tile(np.reshape(y_test, (y_test.shape[0], 1, 1)), (1, n_steps, 1))      
      }
print(x_test[0])
print(np.reshape(x_test, (x_test.shape[0], 1, nfeatures)).shape)

sim.run_steps(n_steps, data={inp: test_data[inp][:minibatch_size]})
print(sim.data[x].weights)
print(sim.data[ens].bias) 
'''
for i in range(minibatch_size):  
  print(test_data[inp][i,0])  
  print(test_data[out_p_filt][i,0])
  #print(sim.data[out_p][i][-1])
  print(sim.data[out_p_filt][i][-1])
sim.close()
'''