import RPi.GPIO as GPIO
import io
import sys
pin_number_g = 16
pin_number_y = 20
pin_number_r = 21
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(pin_number_g, GPIO.OUT)
GPIO.setup(pin_number_y, GPIO.OUT)
GPIO.setup(pin_number_r, GPIO.OUT)
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
if(res == "green"):
    GPIO.output(pin_number_g, GPIO.HIGH)
    GPIO.output(pin_number_y, GPIO.LOW)
    GPIO.output(pin_number_r, GPIO.LOW)
elif(res == "yellow"):
    GPIO.output(pin_number_g, GPIO.LOW)
    GPIO.output(pin_number_y, GPIO.HIGH)
    GPIO.output(pin_number_r, GPIO.LOW)
elif(res == "red"):
    GPIO.output(pin_number_g, GPIO.LOW)
    GPIO.output(pin_number_y, GPIO.LOW)
    GPIO.output(pin_number_r, GPIO.HIGH)

        

