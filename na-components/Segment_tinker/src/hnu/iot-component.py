import os
import sys
import ASUS.GPIO as GPIO
GPIO.setwarnings(False)
GPIO.setmode(GPIO.ASUS)

GPIO1 = 165
GPIO2 = 168
GPIO3 = 238
GPIO4 = 185
GPIO5 = 224
GPIO6 = 223
GPIO7 = 187
GPIO8 = 188
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