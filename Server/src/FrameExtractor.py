import os
import cv2

from src.ImagesPreProcessing import convert_cv2Img_to_256

for exercise in os.listdir("../trainer"):
    print("Working on folder: %s", exercise)
    vidcap = cv2.VideoCapture('../trainer/' + exercise + "/Video/" + exercise + ".MOV")
    success, image = vidcap.read()
    count = 0
    os.makedirs("../trainer/" + exercise + "/Frames", exist_ok=True)
    while success:
        cv2.imwrite("../trainer/" + exercise + "/Frames/frame%d.jpg" % count, convert_cv2Img_to_256(image))     # save frame as JPEG file
        success, image = vidcap.read()
        count += 1