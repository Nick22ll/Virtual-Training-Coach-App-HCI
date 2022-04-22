# Virtual-Training-Coach-WebApp-HCI
A basic WebApp implementation of a Virtual Training Coach by BertaGUI.

## Why Virtual Training Coach? 
The WebApp Virtual Training Coach has been implemented to give support to those people who want to practise phisical exercises, both at home or at the gym, to evalute their correctness and to avoid wrong movements, which at worst can lead to injuries. 

## System Requirements 

### Server side
 
**Package** | **Version** 
---|--- 
Python | 3.8 
ai | 1.0.1
ai.cs | 1.0.7
cryptography | 36.0.0
fastdtw | 0.3.4
imutils | 0.5.4
matplotlib | 3.3.4
natsort | 7.1.1
numpy | 1.19.5
opencv_python | 4.5.2.54
scikit_image | 0.18.1
scipy | 1.7.3
skimage | 0.0
tensorflow | 2.8.0
tensorflow_gpu | 2.7.0

### Cordova app side

**Package** | **Version** 
---|--- 
cordova-android | ^10.1.1
cordova-plugin-camera | ^6.0.0
cordova-plugin-dialogs | ^2.0.2
cordova-plugin-file | ^6.0.2
cordova-plugin-media-capture | ^3.0.3
cordova-plugin-progressdialog | ^2.0.2

For the npm modules required, check [here](https://github.com/Nick22ll/Virtual-Training-Coach-App-HCI/blob/main/App/package-lock.json). <br>

To work properly, VTC requires some resource files (trainer video and other files); if you want to download all the files, you can do it [here]().

## Functionalities
VTC allows you to upload a video where you're doing a fitness exercise and check if you're doing it correctly. <br>
You can:
- upload a video recorded directly from the app
- upload a video from your phone gallery
- keep track of your progress thanks to a history
- filter and order results in the history
- delete results from the history
- read informations about the exercises
- see a tutorial of a trainer doing the exercise you've chosen
- visualize errors with marked images

## GUI
When you start the app, you will see the following page:
<p align="left"><img src=sample_images/homepage.png width="20%"></p> PRIRIRIRIOAWOSFIOJSCOICNOAINCOASICNOAISCNIOASC





