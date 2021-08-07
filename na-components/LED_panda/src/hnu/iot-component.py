import os
import sys
import serial
ser = serial.Serial('COM6',9600)
num = sys.argv[1]
num = num.replace("\n","")
if(ser.readable()):
    num = num.encode('utf-8')
    ser.write(num)
