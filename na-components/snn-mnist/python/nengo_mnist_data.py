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

import gzip
import pickle
import zipfile
from urllib.request import urlretrieve
import random

with gzip.open("na-components/snn-mnist/python/mnist_train_data/mnist.pkl.gz") as f:
    train_data, _, test_data = pickle.load(f, encoding="latin1")

train_data = list(train_data)
test_data = list(test_data)
idx = int(sys.argv[1])
sys.stdout = oldstdout
print(str(test_data[1][idx]) + "|" + str(test_data[0][idx]))
sys.stdout.flush()




