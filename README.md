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
<p align="center"><img src=sample_images/homepage.png width="20%"></p>

Clicking on `LET'S GET STARTED`, you will be automatically redirected to the main page of VTC, where you can choose if you want the App to analyze your exercise or if you want to see your exercise scores.<br>
If you decide to click on `NEW EXERCISE`, VTC will guide you in the choice of the exercise: it will ask you to select the category and the corresponding exercise, as shown below:
<p align="center"><img src=sample_images/category_choose_ex.png width="45%"></p>

For example, if you've selected a `FRONT RAISE` exercise, that's what you will see:
<p align="center"><img src=sample_images/front_raise.png width="45%"></p>

In the center of the page, there is a video tutorial of the training doing the corresponding exercise. If you click on the info button next to the exercise name, it will be shown a popup containg some information about the exercise (how to do it, difficulty, impact level, target body parts). <br>
After the video, there are two buttons: if you click on `RECORD`, you will be able to record a video of you doing the exercise directly from the app; instead, if you click on `LOAD`, you can select a video from your phone gallery. <br>
Independently from your choice, VTC will show you the results of the analysis:

<p align="center"><img src=sample_images/results_and_errorframe.png width="45%"></p>

First of all, you will find the success rate, the number of errors and the most wrong joint during the exercise execution. Scrolling down, you will see the images taken from your video where the app find some errors (which are marked with a colored "X"). 

On the other side, if from the main page you click on the button `HISTORY`, the app will display your results history. That's what you see:
<p align="center"><img src=sample_images/history.png width="45%"></p>

On the top of the page, there are two dropdown buttons: the first one, with label `FILTER`, allows you to filter your results by exercise type and by date; the second one, with label `ORDER`, orders the results by exercise name, date or success rate. If you want to delete a result from the history, you can hold press on it and, clicking on the bin which will appear, a message box will ask you to confirm. 






