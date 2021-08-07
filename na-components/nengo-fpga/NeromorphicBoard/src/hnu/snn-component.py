import os
import sys
import numpy as np
import nengo
import gzip
import pickle
import zipfile
from PIL import Image
from nengo_extras.data import load_mnist
from nengo_extras.vision import Gabor, Mask
from nengo_extras.gui import image_display_function
import time
import matplotlib.pyplot as plt
from nengo_fpga.networks import FpgaPesEnsembleNetwork
import nengo_fpga
class NullWriter():
    def write(self,arg):
        pass
    def flush(args):
        pass
nullwriter = NullWriter()
oldstdout = sys.stdout
sys.stdout = nullwriter

def resize_img(img, _im_size, _im_size_new):
    img = Image.fromarray(img.reshape((_im_size, _im_size)) * 256, "F")
    img = img.resize((_im_size_new, _im_size_new), Image.ANTIALIAS)
    return np.array(img.getdata(), np.float32) / 256.0
def one_hot(labels, c=None):
    assert labels.ndim == 1
    n = labels.shape[0]
    c = len(np.unique(labels))
    y = np.zeros((n, c))
    y[np.arange(n), labels] = 1
    return y

def result_data(data):
    result = []
    for i in range(0,len(data)):
       result.append(np.argmax(data[i]))
    result.remove(0)
    result = np.bincount(result)
    print(result)
    return result
try:
    im_resize = sys.argv[1]
    im_resize = im_resize.replace("]","")
    im_resize = im_resize.replace("[","")
    im_resize = im_resize.split()
    im_resize = np.array(im_resize)
    im_resize = im_resize.astype('int32')
    im_resize = np.resize(im_resize,(1,196))
    im_resize = im_resize / 256.0
    epoc = 10
    neuronSize = 1.0
    board = "de1"
    logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    rng = np.random.RandomState(9)
    with gzip.open("nodes/mnist_python/mnist_train_data/mnist.pkl.gz") as f:
        train_data, _, test_data = pickle.load(f, encoding="latin1")
    train_data = list(train_data)
    test_data = list(test_data)
    (x_train, y_train) = train_data
    (x_test, y_test) = test_data
    x_train = 2 * x_train - 1
    x_test = 2 * x_test - 1
    im_resize = 2 * im_resize - 1
    im_size = int(np.sqrt(x_train.shape[1]))
    reduction_factor = 0.5
    if reduction_factor > 0:
        im_size_new = int(im_size * reduction_factor)
        x_train_resized = np.zeros((x_train.shape[0], im_size_new ** 2))
        for i in range(x_train.shape[0]):
            x_train_resized[i, :] = resize_img(x_train[i], im_size, im_size_new)
        x_train = x_train_resized

        x_test_resized = np.zeros((x_test.shape[0], im_size_new ** 2))
        for i in range(x_test.shape[0]):
            x_test_resized[i, :] = resize_img(x_test[i], im_size, im_size_new)
        x_test = x_test_resized

        im_size = im_size_new

    train_targets = one_hot(y_train, 10)
    test_targets = one_hot(y_test, 10)
    n_vis = x_train.shape[1]
    n_out = train_targets.shape[1]
    n_hid = int(16000 * neuronSize) // (im_size ** 2)
    gabor_size = (int(im_size / 2.5), int(im_size / 2.5))
    encoders = Gabor().generate(n_hid, gabor_size, rng=rng)
    encoders = Mask((im_size, im_size)).populate(encoders, rng=rng, flatten=True)
    max_firing_rates = 100
    ens_neuron_type = nengo.neurons.RectifiedLinear()
    ens_intercepts = nengo.dists.Choice([-0.5])
    ens_max_rates = nengo.dists.Choice([max_firing_rates])
    conn_synapse = None
    conn_eval_points = x_train
    conn_function = train_targets
    conn_solver = nengo.solvers.LstsqL2(reg=0.01)
    presentation_time = 0.25

    with nengo.Network(seed=3) as model:
        input_node = nengo.Node(
            nengo.processes.PresentInput(im_resize, presentation_time), label="input"
        )
        ens = FpgaPesEnsembleNetwork(
            board,
            n_neurons=n_hid,
            dimensions=n_vis,
            learning_rate=0,
            function=conn_function,
            eval_points=conn_eval_points,
            label="output class",
        )
        ens.ensemble.neuron_type = ens_neuron_type
        ens.ensemble.intercepts = ens_intercepts
        ens.ensemble.max_rates = ens_max_rates
        ens.ensemble.encoders = encoders
        ens.connection.synapse = conn_synapse
        ens.connection.solver = conn_solver
        p2 = nengo.Probe(ens.output, synapse=None)
        output_node = nengo.Node(size_in=n_out, label="output class")
        nengo.Connection(input_node, ens.input, synapse=None)
        nengo.Connection(ens.output, output_node, synapse=None)
        image_shape = (1, im_size, im_size)
        display_func = image_display_function(image_shape, offset=1, scale=128)
        display_node = nengo.Node(display_func, size_in=input_node.size_out)
        nengo.Connection(input_node, display_node, synapse=None)

    with nengo_fpga.Simulator(model) as sim:
       sim.run_steps(epoc*1000)
    data = sim.data[p2]
    sys.stdout = oldstdout
    result = result_data(data)
    print(result)
    sys.stdout.flush()
    plt.figure()
    plt.plot(sim.data[p2], label="")
    plt.xlabel("Timesteps")
    plt.ylabel("Output")
    plt.legend(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], loc='upper right')
    plt.show()
    sim.close()
except Exception as e:
    sys.stdout.flush()
