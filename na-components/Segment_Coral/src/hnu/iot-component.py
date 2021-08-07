import os
import sys
from periphery import GPIO
def display_seg(index):
    for i in range(0,8):
        if(index == 0):
            if(i==6):
                segments[i].write(False)
            else:
                segments[i].write(True)

        if(index == 1):
            if(i==1 or i==2):
                segments[i].write(True)
            else:
                segments[i].write(False)

        if(index == 2):
            if(i==2 or i==3):
                segments[i].write(False)
            else:
                segments[i].write(True)

        if(index == 3):
            if(i==4 or i==5):
                segments[i].write(False)
            else:
                segments[i].write(True)

        if(index == 4):
            if(i==0 or i==3 or i==4):
                segments[i].write(False)
            else:
                segments[i].write(True)

        if(index == 5):
            if(i==1 or i==4):
                segments[i].write(False)
            else:
                segments[i].write(True)

        if(index == 6):
            if(i==0 or i==1):
                segments[i].write(False)
            else:
                segments[i].write(True)

        if(index == 7):
            if(i==3 or i==4 or i==5 or i==6):
                segments[i].write(False)
            else:
                segments[i].write(True)

        if(index == 8):
            segments[i].write(True)

        if(index == 9):
            if(i==3 or i==4):
                segments[i].write(False)
            else:
                segments[i].write(True)

GPIO1 = 6
GPIO1 = GPIO(GPIO1, "out")
GPIO2 = 7
GPIO2 = GPIO(GPIO2, "out")
GPIO3 = 8
GPIO3 = GPIO(GPIO3, "out")
GPIO4 = 77
GPIO4 = GPIO(GPIO4, "out")
GPIO5 = 73
GPIO5 = GPIO(GPIO5, "out")
GPIO6 = 138
GPIO6 = GPIO(GPIO6, "out")
GPIO7 = 140
GPIO7 = GPIO(GPIO7, "out")
GPIO8 = 141
GPIO8 = GPIO(GPIO8, "out")
index = sys.argv[1]
index = index.replace("\n","")
index = int(index)
print("result: ",index)
sys.stdout.flush()
segments = (GPIO1,GPIO2,GPIO3,GPIO4,GPIO5,GPIO6,GPIO7,GPIO8)
for i in range(0,8):
    segments[i].write(False)
try:
    display_seg(index)
finally:
    pass
