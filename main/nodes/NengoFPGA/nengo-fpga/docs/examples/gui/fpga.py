import os
import sys
import logging
import numpy as np
import nengo
import gzip
import pickle
import zipfile
# Requires python image library: pip install pillow
from PIL import Image
from nengo_extras.data import load_mnist
from nengo_extras.vision import Gabor, Mask
from nengo_extras.gui import image_display_function
import picamera
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
#im_resize = Image.open('/home/pi/Desktop/naide/main/nodes/snn-nengo-fpga/nengo-fpga/docs/examples/gui/test_6.png')

# ------ MISC HELPER FUNCTIONS -----
def resize_img(img, _im_size, _im_size_new):
    # Resizes the MNIST images to a smaller size so that they can be processed
    # by the FPGA (the FPGA currently has a limitation on the number of
    # dimensions and neurons that can be built into the network)
    # Note: Requires the python PIL (pillow) library to work
    img = Image.fromarray(img.reshape((_im_size, _im_size)) * 256, "F")
    img = img.resize((_im_size_new, _im_size_new), Image.ANTIALIAS)
    return np.array(img.getdata(), np.float32) / 256.0


def one_hot(labels, c=None):
    # One-hot function. Converts a given class and label list into a vector
    # of 0's (no class match) and 1's (class match)
    assert labels.ndim == 1
    n = labels.shape[0]
    c = len(np.unique(labels)) if c is None else c
    y = np.zeros((n, c))
    y[np.arange(n), labels] = 1
    return y
def result_data(data):
    max = np.where(np.max(data)==data)
    max = max[1]
    tmp = np.bincount(max)
    max = tmp.argmax()
    return max
try:
    im_resize = sys.argv[1]
    im_resize = im_resize.replace("]","")
    im_resize = im_resize.replace("[","")
    im_resize = im_resize.split()
    im_resize = np.array(im_resize)
    im_resize = im_resize.astype('int32')
    im_resize = np.resize(im_resize,(1,196))
    #im_resize = Image.open('nodes/snn-nengo-fpga/nengo-fpga/docs/examples/gui/imgae_q.png')
    #im_tmp = np.array(im_resize)
    #im_resize = np.resize(im_resize, (1, 196))
    im_resize = im_resize / 256.0


    

    # ---------------- BOARD SELECT ----------------------- #
    # Change this to your desired device name
    board = "de1"
    # ---------------- BOARD SELECT ----------------------- #

    # Set the nengo logging level to 'info' to display all of the information
    # coming back over the ssh connection.
    logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)

    # Set the rng state (using a fixed seed that works)
    rng = np.random.RandomState(9)

    # Load the MNIST data
    with gzip.open("nodes/mnist_python/mnist_train_data/mnist.pkl.gz") as f:
        train_data, _, test_data = pickle.load(f, encoding="latin1")

    train_data = list(train_data)
    test_data = list(test_data)
    (x_train, y_train) = train_data
    (x_test, y_test) = test_data

    x_train = 2 * x_train - 1  # normalize to -1 to 1
    x_test = 2 * x_test - 1  # normalize to -1 to 1
    im_resize = 2 * im_resize - 1



    #print(x_train.shape)
    #print('im', im_resize.shape)
    # Get information about the image
    im_size = int(np.sqrt(x_train.shape[1]))  # Dimension of 1 side of the image

    # Resize the images
    reduction_factor = 2
    if reduction_factor > 1:
        im_size_new = int(im_size // reduction_factor)

        x_train_resized = np.zeros((x_train.shape[0], im_size_new ** 2))
        for i in range(x_train.shape[0]):
            x_train_resized[i, :] = resize_img(x_train[i], im_size, im_size_new)
        x_train = x_train_resized

        x_test_resized = np.zeros((x_test.shape[0], im_size_new ** 2))
        for i in range(x_test.shape[0]):
            x_test_resized[i, :] = resize_img(x_test[i], im_size, im_size_new)
        x_test = x_test_resized

        im_size = im_size_new
    # print(im_resize)
    # Generate the MNIST training and test data
    train_targets = one_hot(y_train, 10)
    test_targets = one_hot(y_test, 10)
    # Set up the vision network parameters
    n_vis = x_train.shape[1]  # Number of training samples
    n_out = train_targets.shape[1]  # Number of output classes
    n_hid = 16000 // (im_size ** 2)  # Number of neurons to use
    # Note: the number of neurons to use is limited such that NxD <= 16000,
    #       where D = im_size * im_size, and N is the number of neurons to use
    gabor_size = (int(im_size / 2.5), int(im_size / 2.5))  # Size of the gabor filt
    # Generate the encoders for the neural ensemble
    encoders = Gabor().generate(n_hid, gabor_size, rng=rng)
    encoders = Mask((im_size, im_size)).populate(encoders, rng=rng, flatten=True)
    # data = pd.DataFrame(x_train)
    # data.to_csv('encoder.csv',header=False,index=False)
    # Ensemble parameters
    max_firing_rates = 4000
    ens_neuron_type = nengo.neurons.RectifiedLinear()
    ens_intercepts = nengo.dists.Choice([-0.5])
    ens_max_rates = nengo.dists.Choice([max_firing_rates])
    # Output connection parameters
    conn_synapse = None
    conn_eval_points = x_train
    conn_function = train_targets
    conn_solver = nengo.solvers.LstsqL2(reg=0.01)
    # Visual input process parameters
    presentation_time = 0.25
    #print('network model creating')
    # Nengo model proper
    with nengo.Network(seed=3) as model:
        # Visual input (the MNIST images) to the network
        input_node = nengo.Node(
            nengo.processes.PresentInput(im_resize, presentation_time), label="input"
        )
        # Ensemble to run on the FPGA. This ensemble is non-adaptive and just
        # uses the encoders and decoders to perform the image classification
        ens = FpgaPesEnsembleNetwork(
            board,
            n_neurons=n_hid,
            dimensions=n_vis,
            learning_rate=0,
            function=conn_function,
            eval_points=conn_eval_points,
            label="output class",
        )

        # Set custom ensemble parameters for the FPGA Ensemble Network
        ens.ensemble.neuron_type = ens_neuron_type
        ens.ensemble.intercepts = ens_intercepts
        ens.ensemble.max_rates = ens_max_rates
        ens.ensemble.encoders = encoders
        # Set custom connection parameters for the FPGA Ensemble Network
        ens.connection.synapse = conn_synapse
        ens.connection.solver = conn_solver
        p2 = nengo.Probe(ens.output, synapse=None)
        # Output display node
        output_node = nengo.Node(size_in=n_out, label="output class")

        # Projections to and from the fpga ensemble
        nengo.Connection(input_node, ens.input, synapse=None)
        nengo.Connection(ens.output, output_node, synapse=None)

        # Input image display (for nengo_gui)
        image_shape = (1, im_size, im_size)
        display_func = image_display_function(image_shape, offset=1, scale=128)
        display_node = nengo.Node(display_func, size_in=input_node.size_out)
        nengo.Connection(input_node, display_node, synapse=None)
        print('network connect')

    with nengo_fpga.Simulator(model) as sim:
        sim.run_steps(1000)
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
    #print("err", e)
    sys.stdout.flush()

