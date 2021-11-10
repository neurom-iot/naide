import io
import sys
import cv2
from PIL import Image
import time
import numpy as np

cam = cv2.VideoCapture(0)
cam.set(3,112)
cam.set(4,112)
while True:
    ret_val, img = cam.read()
    img = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    cv2.imshow('CamViewr',img)
    if cv2.waitKey(1) == 27:
        cv2.imwrite('image.png',img)
        break
image = Image.open('image.png')
image = image.convert('L')
image = np.array(image)
image = Image.fromarray(image)
image = image.resize((14,14))
image = np.array(image)
image = np.resize(image, (1,196))
print(image)
sys.stdout.flush()
