import RPi.GPIO as GPIO
from time import sleep
pin_number = 16
delay = 3.0
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(pin_number, GPIO.OUT, initial=GPIO.LOW)
while True:
   GPIO.output(pin_number, GPIO.HIGH)
   sleep(delay_s)
   GPIO.output(pin_number, GPIO.LOW)
   sleep(delay_s)
