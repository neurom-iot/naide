import os
import sys
from periphery import GPIO
GPIO1 = 73
GPIO2 = 138
GPIO3 = 140
GPIO1 = GPIO(GPIO1,"out")
GPIO2 = GPIO(GPIO2,"out")
GPIO3 = GPIO(GPIO3,"out")
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
    GPIO1.write(True)
    GPIO2.write(False)
    GPIO3.write(False)
elif(res == yellow):
    GPIO1.write(False)
    GPIO2.write(True)
    GPIO3.write(False)
elif(res == red):
    GPIO1.write(False)
    GPIO2.write(False)
    GPIO3.write(True)
