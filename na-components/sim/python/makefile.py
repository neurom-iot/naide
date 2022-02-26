# %%
import os
import sys
import json
import numpy as np
import h5py

_, ftype, jsonString = sys.argv

def convert_h5(data, f):
    dtype = type(data)
    if dtype is dict:
        for k, v in data.items():
            key = k.encode()
            f.create_group(key)
            f[key].attrs['data'] = convert_h5(v, f[key])
    elif dtype is list:
        arr = []
        for item in data:
            arr.append(convert_h5(item, f))

        return np.array(arr)
    elif dtype is int:
        return data
    elif dtype is float:
        return data
    elif dtype is str:
        return data.encode()

jsonDict = dict(json.loads(jsonString.encode('utf8')))
path = os.path.dirname(os.path.abspath(__file__))

if ftype == 'npz':
    np.savez(path + "/simulator_data.npz", jsonDict)
    print("simulator_data.npz")
elif ftype == 'npy':
    np.save(path + "/simulator_data.npy", jsonDict)
    print("simulator_data.npy")
elif ftype == 'h5':
    with h5py.File(path + "/simulator_data.hdf5", 'w') as f:
        convert_h5(jsonDict, f)
    print("simulator_data.hdf5")