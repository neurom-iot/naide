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
idx = int(sys.argv[1])

birth_file = ""
with open('na-components/snn-lowbirth/python/lowbirth.dat', 'r') as f:
    birth_file = f.read()

birth_all_data = birth_file.split('\n')
birth_header = [x for x in birth_all_data[0].split('\t') if len(x)>=1]
birth_data = [[float(x) for x in y.split('\t') if len(x)>=1] for y in birth_all_data[1:] if len(y)>=1]

output = str(birth_data[idx][1:8])
output = str(birth_data[idx][0]) + "|" + output.replace('[', '').replace(']', '').replace(' ', '')
sys.stdout = oldstdout
print(output)
sys.stdout.flush()