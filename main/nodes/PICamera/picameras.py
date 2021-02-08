import io
import sys
from PIL import Image
from nengo_extras.data import load_mnist
from nengo_extras.vision import Gabor, Mask
from nengo_extras.gui import image_display_function
import picamera
import time
import numpy as np
#카메라 입력
stream = io.BytesIO()
with picamera.PiCamera() as camera:

    camera.resolution = (112, 112)
    camera.color_effects = (128, 128)
    camera.start_preview()
    time.sleep(3)
    camera.capture(stream,format='png')
stream.seek(0)
image = Image.open(stream)
image = image.convert('L')
image = np.array(image)
image = Image.fromarray(image)
image = image.resize((14, 14))
image = np.array(image)
image = np.resize(image, (1, 196))
print(image)
#camera.capture('nodes/snn-nengo-fpga-picamera/image.png')
#camera.stop_preview()
#camera.close()
#img_file = Image.open('nodes/snn-nengo-fpga-picamera/image.png')
#img_file = img_file.convert('L')
#tmp_np = np.array(img_file)
#image_file = Image.fromarray(tmp_np)
#image_file.save('nodes/snn-nengo-fpga-picamera/image_s.png')

#im = Image.open('nodes/snn-nengo-fpga-picamera/image_s.png')
#resize_imgs = im.resize((14, 14))
#img_save = np.array(resize_imgs)
#img_save = np.resize(img_save, (1, 196))
#print(img_save)
sys.stdout.flush()
