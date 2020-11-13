import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import nengo
import nengo_dl
from urllib.request import urlretrieve
amp = 0.01 
max_rates = 100
intercepts = 0
synapse = None
epochs = 10
learning_rate = 0.001
minibatch_size = 2
print('init')
data = np.loadtxt("nodes/SNNComponent/src/DataSets/mnist_test_100.csv", delimiter=",", dtype = np.float32)
test_images = data[:,1:785]
test_labels = data[:,0]
print('init2')
with nengo.Network(seed=0) as net:
    net.config[nengo.Ensemble].max_rates = nengo.dists.Choice([max_rates])
    net.config[nengo.Ensemble].intercepts = nengo.dists.Choice([intercepts])
    net.config[nengo.Connection].synapse = None
    neuron_type = nengo.LIF(amplitude=amp)

    nengo_dl.configure_settings(stateful=False)
    
    inp = nengo.Node(np.zeros(28*28))  

    layer = nengo_dl.Layer(tf.keras.layers.Conv2D(filters=32, kernel_size=3)) (inp, shape_in=(28, 28, 1))
    layer = nengo_dl.Layer(neuron_type)(layer)
    layer = nengo_dl.Layer(tf.keras.layers.Conv2D(filters=64, kernel_size=3, strides=2)) (layer, shape_in=(26, 26, 32))
    layer = nengo_dl.Layer(neuron_type)(layer)
    layer = nengo_dl.Layer(tf.keras.layers.Conv2D(filters=128, kernel_size=3, strides=2)) (layer, shape_in=(12, 12, 64))
    layer = nengo_dl.Layer(neuron_type)(layer)

    out = nengo_dl.Layer(tf.keras.layers.Dense(units=10))(layer)

    out_p = nengo.Probe(out, label="out_p")
    out_p_filt = nengo.Probe(out, synapse=synapse, label="out_p_filt")

sim = nengo_dl.Simulator(net, minibatch_size=minibatch_size)

n_steps = 30
test_images = np.tile(test_images[:, None, :], (1, n_steps, 1))
test_labels = np.tile(test_labels[:, None, None], (1, n_steps, 1))

def classification_accuracy(y_true, y_pred):
    return tf.metrics.sparse_categorical_accuracy(
        y_true[:, -1], y_pred[:, -1])

sim.compile(loss={out_p_filt: classification_accuracy})
print("accuracy before training:",
      sim.evaluate(test_images, {out_p_filt: test_labels}, verbose=0)["loss"])


if os.path.isfile("nodes/SNNComponent/model_ex.npz"):
    sim.load_params("nodes/SNNComponent/model_ex")
    print("file load success")
else:
    print("file does not existed")
    urlretrieve(
        "https://drive.google.com/uc?export=download&"
        "id=1l5aivQljFoXzPP5JVccdFXbOYRv3BCJR",
        "nodes/SNNComponent/model_ex.npz")

sim.compile(loss={out_p_filt: classification_accuracy})

print("accuracy after training:", sim.evaluate(test_images, {out_p_filt: test_labels}, verbose=0)["loss"])

print("finished")

