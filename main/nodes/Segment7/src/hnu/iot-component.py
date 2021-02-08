import os
import sys
import RPi.GPIO as GPIO
import time
GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False) 

# GPIO ports for the 7seg pins

segments =  (29,31,33,35,37,36,38,40)
index = sys.argv[1]
index = index.replace("\n","")
#index = '1'
print("result: ",index)
for segment in segments:
    GPIO.setup(segment, GPIO.OUT)
    GPIO.output(segment, 0)
num = {'':(0,0,0,0,0,0,0),                      
    '0':(1,1,1,1,1,1,0),
    '1':(0,1,1,0,0,0,0),
    '2':(1,1,0,1,1,0,1),
    '3':(1,1,1,1,0,0,1),
    '4':(0,1,1,0,0,1,1),
    '5':(1,0,1,1,0,1,1),
    '6':(0,0,1,1,1,1,1),
    '7':(1,1,1,0,0,1,0),
    '8':(1,1,1,1,1,1,1),
    '9':(1,1,1,0,0,1,1)}
try:
    s = index
    for loop in range(0,7):
        GPIO.output(segments[loop],num[s][loop])
    #time.sleep(2)    
finally:
    pass
    #GPIO.cleanup()


