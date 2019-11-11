import nengo
import nengo_dl
import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import gzip
import pickle
import zipfile
from urllib.request import urlretrieve

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
minibatch_size = 200
n_steps = 20

urlretrieve("http://deeplearning.net/data/mnist/mnist.pkl.gz", "mnist.pkl.gz")
with gzip.open("mnist.pkl.gz") as f:
    train_data, _, test_data = pickle.load(f, encoding="latin1")

train_data = list(train_data)
test_data = list(test_data)
for data in [train_data, test_data]:
    one_hot = np.zeros((data[0].shape[0], 10))
    one_hot[np.arange(data[0].shape[0]), data[1]] = 1
    data[1] = one_hot
# print(train_data[0].shape) 50000, 784
# print(train_data[1].shape) 50000, 10
# print(test_data[0].shape)  10000, 784
# print(test_data[1].shape)   10000, 10
    
with nengo.Network() as net:        
    neuron_type = nengo.LIF(amplitude=amp, tau_rc=tau_rc)
    net.config[nengo.Ensemble].max_rates = nengo.dists.Choice([max_rates])
    net.config[nengo.Ensemble].intercepts = nengo.dists.Choice([intercepts])
    nengo_dl.configure_settings(trainable=False)

    inp = nengo.Node([0] * 28 * 28)     
    #L1 : convolutional layer filter 32 (?, 28, 28, 1)
    layer = nengo_dl.tensor_layer(inp, tf.layers.conv2d, shape_in=(28, 28, 1), filters=32, kernel_size=3)
    layer = nengo_dl.tensor_layer(layer, neuron_type)
    #L2 : convolutional layer  filter 64  (28 - 3)/1 + 1 = 26 (?, 26, 26, 32)
    layer = nengo_dl.tensor_layer(layer, tf.layers.conv2d, shape_in=(26, 26, 32),filters=64, kernel_size=3)
    layer = nengo_dl.tensor_layer(layer, neuron_type)    
    #L3 : pooling layer (28 - 3)/1 + 1 = 24 (?, 24, 24, 64)
    layer = nengo_dl.tensor_layer(layer, tf.layers.average_pooling2d, shape_in=(24, 24, 64),pool_size=2, strides=2)    
    #L4: convolutional layer filter 128 (24-2)/2 + 1 = 12  (?, 12, 12, 64)
    layer = nengo_dl.tensor_layer(layer, tf.layers.conv2d, shape_in=(12, 12, 64),filters=128, kernel_size=3)
    layer = nengo_dl.tensor_layer(layer, neuron_type)
    #L5: pooling layer (12-3)/1 + 1 = 10 (?, 10, 10, 128) 
    layer = nengo_dl.tensor_layer(layer, tf.layers.average_pooling2d, shape_in=(10, 10, 128),pool_size=2, strides=2)    
    # FC 5x5x128 inputs -> 10 outputs
    layer = nengo_dl.tensor_layer(layer, tf.layers.dense, units=10)
    out_p = nengo.Probe(layer)
    out_p_filt = nengo.Probe(layer, synapse=synapse)


sim = nengo_dl.Simulator(net, minibatch_size=minibatch_size)
train_data = {
    inp: train_data[0][:, None, :], 
    out_p: train_data[1][:, None, :]
}

test_data = {
    inp: np.tile(test_data[0][:minibatch_size*1, None, :], (1, n_steps, 1)),
    out_p_filt: np.tile(test_data[1][:minibatch_size*1, None, :],(1, n_steps, 1))
    #inp: test_data[0][:, None, :],
    #out_p_filt: test_data[1][:, None, :]
}

def objective(outputs, targets):    
    return tf.nn.softmax_cross_entropy_with_logits_v2(logits=outputs, labels=targets)

#optimizer = tf.train.AdamOptimizer(learning_rate=learning_rate)
optimizer = tf.train.RMSPropOptimizer(learning_rate=learning_rate)

def accuracy(outputs, targets):    
    return 100 * tf.reduce_mean(tf.cast(tf.equal(tf.argmax(outputs[:, -1], axis=-1), tf.argmax(targets[:, -1], axis=-1)),tf.float32))

#9
do_training = do_train
if do_training:
    # run training
    print("training")
    sim.train(train_data, optimizer, objective={out_p: objective}, n_epochs=epochs)
    # save the parameters to file    
    sim.save_params("./mnist_params")
else:
    # download pretrained weights
    urlretrieve(
        "https://drive.google.com/uc?export=download&"
        "id=1u9JyNuRxQDUcFgkRnI1qfJVFMdnGRsjI",
        "mnist_params.zip")
    with zipfile.ZipFile("mnist_params.zip") as f:
        f.extractall()
    # load parameters
    sim.load_params("./mnist_params")

print("accuracy after training: %.2f%%" % sim.loss(test_data, {out_p_filt: accuracy}))
print("finished")


#11
sim.run_steps(n_steps, data={inp: test_data[inp][:minibatch_size]})
for i in range(5):
    plt.figure()
    plt.subplot(1, 2, 1)
    plt.imshow(np.reshape(test_data[inp][i, 0], (28, 28)),cmap="gray")
    plt.axis('off')
    plt.subplot(1, 2, 2)
    plt.plot(sim.trange(), sim.data[out_p_filt][i])
    plt.legend([str(i) for i in range(10)], loc="upper left")





