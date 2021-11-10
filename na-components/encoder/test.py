import gzip
import pickle
import numpy as np
import random
import torch
import matplotlib.pyplot as plt
from n3ml import encoder as n3Enc

path = "../naide-master/naide/na-components/snn-mnist/python/mnist_train_data/mnist.pkl.gz"
with gzip.open(path) as f:
    train_data, _, test_data = pickle.load(f, encoding="latin1")

train_data = list(train_data)
test_data = list(test_data)

time_interval = 5
encoder = n3Enc.Simple(time_interval = time_interval)
idx = random.randint(0, len(train_data[0]))
img = np.array(train_data[0][idx])
img_res = np.array(train_data[1][idx])
img = np.reshape(img, (1, 28, 28))
img = torch.Tensor(img)
print(img.shape)
transform = encoder(img)
print(transform.shape)


for i in transform:
    plt.figure(figsize=(28, 28))
    plt.imshow(i[0], 'gray')
    plt.show()