import sys
import os

# Disable sys.out
class NullWriter (object):
    def write (self, arg):
        pass
    def flush(args):
        pass
nullwrite = NullWriter()
oldstdout = sys.stdout
sys.stdout = nullwrite

import torch
import torch.nn as nn
import numpy as np
from n3ml.model import Wu2018

# String Data Parse
select_number = int(sys.argv[2])
data_arg = sys.argv[1]
data_load = True
dataPath = ""
if (len(sys.argv) > 3):
    data_load = False
    dataPath = sys.argv[3]

x_data = []
y_data = []
n_steps = 5
if data_load:
    parse = data_arg.replace("\r", "")
    parse = parse.replace("\n", "")
    parse = parse.replace("[", "")
    parse = parse.replace("]", "")
    parse = parse.replace("0.", "#0.")
    parse = parse.replace("1.", "#1.")
    parse = parse.replace(" ", "")
    parse_list = parse.split("#")
    for i in range(1, len(parse_list)):
        sd = parse_list[i]
        fd = float(sd)
        x_data.append(fd)
    x_data = np.array([x_data])
    for i in range(10):
        if (i == select_number):
            y_data.append(1.0)
        else:
            y_data.append(0.0)
    y_data = np.array([y_data])
else:
    dataStr = ""
    with open(dataPath, 'r') as f:
        dataStr = f.read()
    parse = dataStr.split("|")
    y_data = np.zeros(10)
    y_data[int(parse[0]) - 1] = 1.0
    #sys.stdout = oldstdout
    for i in range(1, len(parse) - 1):
        temp = parse[i].split(",")
        arr = list(map(lambda x: float(x), temp))
        x_data.append(arr)
    x_data = np.array(x_data)
    n_steps = len(x_data)
    x_data = np.sum(x_data, axis=0)
    x_data = x_data / np.max(x_data)


images = torch.tensor(np.reshape(x_data, (-1, 1, 28, 28)))
labels = torch.tensor(y_data, dtype=torch.int64)

pretrained = os.path.dirname(os.path.abspath(__file__)) + "/pretrained/STBP_epoch65_moduleOut.ckpt"
num_classes = 10
batch_size = 1
num_steps = n_steps

device = torch.device("cpu")
model = Wu2018(batch_size=batch_size)
loadModel = torch.load(pretrained, map_location=device)
model.load_state_dict(loadModel['model'])

if torch.cuda.is_available():
    images = images.device(device)
    labels = labels.device(device)
    model.device(device)

criterion = nn.MSELoss()

with torch.no_grad():
    outs, spike = model(images, num_steps)
    
    labels_ = torch.zeros(torch.numel(labels), num_classes, device=device)
    labels_ = labels_.scatter_(1, labels.view(-1, 1), 1)
    
    #loss = criterion(outs, labels_)
    #print(loss)
    num_correct = torch.argmax(outs, dim=1).eq(labels).sum(dim=0)
    sys.stdout = oldstdout
    print(str(outs.detach().cpu().numpy()[0]) + "|" + str(spike.detach().cpu().numpy()[0]), end="")
    sys.stdout.flush()
