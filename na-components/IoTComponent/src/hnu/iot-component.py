import io
import sys
from PIL import Image
import picamera
import time
import numpy as np

stream = io.BytesIO()
with picamera.PiCamera() as camera:

    camera.resolution = (112,112)
    camera.color_effects = (128,128)
    camera.start_preview()
    time.sleep(3)
    camera.capture(stream,format='png')
stream.seek(0)

image = Image.open(stream)
image = image.convert('L')
image = np.array(image)
image = Image.fromarray(image)
image = image.resize((14,14))
image = np.array(image)
image = np.resize(image, (1, 196))
print(image)
sys.stdout.flush()
