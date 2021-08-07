import os
import sys
import RPi.GPIO as GPIO
from time import sleep

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)

GPIO1 = 36
GPIO2 = 38
GPIO3 = 40
GPIO.setup(GPIO1,GPIO.OUT)
GPIO.setup(GPIO2,GPIO.OUT)
GPIO.setup(GPIO3,GPIO.OUT)
num = sys.argv[1]
num = num.replace("\n","")
num = int(num)
res = "none"
if (num>=0 and num<=3):
    res = "green"
elif (num<=6):
    res = "yellow"
elif(num<=9):
    res = "red"
print(res)
sys.stdout.flush()
if(res == green):
    GPIO.output(GPIO1,GPIO.HIGH)
    GPIO.output(GPIO2,GPIO.LOW)
    GPIO.output(GPIO3,GPIO.LOW)
elif(res == yellow):
    GPIO.output(GPIO1,GPIO.LOW)
    GPIO.output(GPIO2,GPIO.HIGH)
    GPIO.output(GPIO3,GPIO.LOW)
elif(res == red):
    GPIO.output(GPIO1,GPIO.LOW)
    GPIO.output(GPIO2,GPIO.LOW)
    GPIO.output(GPIO3,GPIO.HIGH)
