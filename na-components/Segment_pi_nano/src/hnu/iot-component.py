import os
import sys
import RPi.GPIO as GPIO
from time import sleep

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)

GPIO1 = 29
GPIO2 = 31
GPIO3 = 33
GPIO4 = 35
GPIO5 = 37
GPIO6 = 36
GPIO7 = 38
GPIO8 = 40
index = sys.argv[1]
index = index.replace("\n","")
index = int(index)
print("result: ",index)
sys.stdout.flush()
segments = (GPIO1,GPIO2,GPIO3,GPIO4,GPIO5,GPIO6,GPIO7,GPIO8)
for segment in segments:
    GPIO.setupt(segment,GPIO.OUT)
    GPIO.output(segment, 0)
num = {'':(0,0,0,0,0,0,0),
    '0':(1,1,1,1,1,1,0),
    '1':(0,1,1,0,0,0,0),
    '2':(1,1,0,1,1,0,1),
    '3':(1,1,1,1,0,0,1),
    '4':(0,1,1,0,0,1,1),
    '5':(1,0,1,1,0,1,1),
    '6':(0,0,1,1,1,1,1),
    '8':(1,1,1,1,1,1,1),
    '9':(1,1,1,0,0,1,1)}

try:
    s = index
    for loop in range(0,7):
        GPIO.output(segments[loop],num[s][loop])
finally:
    pass