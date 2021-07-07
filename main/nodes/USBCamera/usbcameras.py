import cv2
import sys
import numpy as np
from PIL import Image
import time
cam = cv2.VideoCapture(0)
cam.set(3,112) #CV_CAP_PROP_FRAME_WIDTH
cam.set(4,112) #CV_CAP_PROP_FRAME_HEIGHT
#cam.set(5,0) #CV_CAP_PROP_FPS
 
while True:
    ret_val, img = cam.read() # 캠 이미지 불러오기
    img = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    cv2.imshow("Cam Viewer",img) # 불러온 이미지 출력하기
    if cv2.waitKey(1) == 27:
        cv2.imwrite('image.png',img)       
        break  # esc to quit
image = Image.open('image.png')
image = image.convert('L')
image = np.array(image)
image = Image.fromarray(image)
image = image.resize((14, 14))
image = np.array(image)
image = np.resize(image, (1, 196))
print(image)
sys.stdout.flush()
