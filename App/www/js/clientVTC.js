
const max_payload_length = 65000; //bytes
const server_packet_size = 16384;

window.sessionStorage.setItem("analysis_results", undefined);



const sock = new WebSocket("wss://0.0.0.0:8080");
sock.onmessage = function(event) {
    console.log("sock.onmessage()");
    window.sessionStorage.setItem("analysis_results", event.data);
    cordova.plugin.progressDialog.dismiss();
    closeConnection();
 }

sock.onerror = function(event){console.error(event.data)};

sock.onopen = function (event){
    console.log("sock.onopen()");
    sock.send("!CONNECT");
    console.log("Connected to the server.");
    window.addEventListener("beforeunload", closeConnection, false);
}

sock.onclose = function(event){
    console.log("sock.onclose()");
    if(sock.readyState === sock.OPEN || sock.readyState === sock.CONNECTING)
        closeConnection();
    console.log("Disconnected from the server." + event.data);
}

function closeConnection() {
    console.log("closeConnection()");
    sock.send("!DISCONNECT$");
    window.removeEventListener("beforeunload", closeConnection);
    if(window.sessionStorage.getItem("analysis_results") !== undefined) {
        window.sessionStorage.setItem("fromServer", "true");
        changeToResults(true);
    }
}


function sendImageFromStorage(image_path) {
    var image_data;
    window.resolveLocalFileSystemURL(image_path, function success(fileEntry) {
        image_data = fileEntry.toURL();
    });

    var json_to_send = image_to_json(image_data)
    console.log("packet length: ", json_to_send.length );
    var packets_chunks = Math.ceil(json_to_send.length/max_payload_length);
    console.log("Packet chuncks", packets_chunks);

    var last_packet_size = json_to_send.slice(max_payload_length*(packets_chunks-1),max_payload_length*packets_chunks).length;
    console.log("last packet size: ", last_packet_size);

    var slice_last_packet = 0; //flag variable 0=false, 1=true -> active when the last packet to send has to be sliced because its dimension/server packet ratio is too near to 0.999
    if(((last_packet_size/server_packet_size)%1).toFixed(2) > 0.95)
        slice_last_packet = 1;

    console.log("slice last: ", slice_last_packet);
    sock.send("!IMAGE$"+(packets_chunks+slice_last_packet).toString());
    for( var i=0; i<packets_chunks-slice_last_packet; i++)
        sock.send(json_to_send.slice(max_payload_length*i,max_payload_length*(i+1)));
    if(slice_last_packet === 1){
        var slice_interval = last_packet_size/2;
        sock.send(json_to_send.slice(max_payload_length*(packets_chunks-1),max_payload_length*(packets_chunks-1)+slice_interval));
        sock.send(json_to_send.slice(max_payload_length*(packets_chunks-1)+slice_interval,max_payload_length*packets_chunks));
    }
}

function sendImageFromURI(image_data, name = "img") {
    var json_to_send = image_to_json(image_data, name)
    console.log("packet length: ", json_to_send.length )
    var packets_chunks = Math.ceil(json_to_send.length/max_payload_length);
    console.log("Packet chuncks", packets_chunks);
    var last_packet_size = json_to_send.slice(max_payload_length*(packets_chunks-1),max_payload_length*packets_chunks).length;
    console.log("last packet size: ", last_packet_size);
    var slice_last_packet = 0; //flag variable 0=false, 1=true -> active when the last packet to send has to be sliced because its dimension/server packet ratio is too near to 0.999
    if(((last_packet_size/server_packet_size)%1).toFixed(2) > 0.95)
        slice_last_packet = 1;
    console.log("slice last: ", slice_last_packet);
    sock.send("!IMAGE$"+(packets_chunks+slice_last_packet).toString());
    for( var i=0; i<packets_chunks-slice_last_packet; i++){
        console.log( "last_packet: ", json_to_send.slice(max_payload_length*i,max_payload_length*(i+1)).length)
        sock.send(json_to_send.slice(max_payload_length*i,max_payload_length*(i+1)));
    }
    if(slice_last_packet === 1){
        var slice_interval = last_packet_size/2;
        sock.send(json_to_send.slice(max_payload_length*(packets_chunks-1),max_payload_length*(packets_chunks-1)+slice_interval));
        sock.send(json_to_send.slice(max_payload_length*(packets_chunks-1)+slice_interval,max_payload_length*packets_chunks));
    }
}

function image_to_json(image_data, name){
    var json_to_send = {
        image_name: name,
        image_type: "jpg",
        encoding: "base64",
        data: image_data.slice(image_data.search(",")+1, image_data.length)
    };
    return JSON.stringify(json_to_send);
}

function imageToBase64(src, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat, 1);
        callback(dataURL);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}


async function extractFramesFromVideo(videoUrl, fps=60) {

    cordova.plugin.progressDialog.init({
        theme: 'HOLO_DARK',
        progressStyle: 'HORIZONTAL',
        cancelable: true,
        title: 'Uploading...',
        message: 'Uploading your video...\n(the process may take a few minutes)',
    });
    cordova.plugin.progressDialog.setProgress(0);
    return new Promise(async () => {

        // fully download it first (no buffering):
        let video = document.createElement("video");

        let seekResolve;
        video.addEventListener('seeked', async function() {
            if(seekResolve) seekResolve();
        });
        video.addEventListener('loadeddata', async function() {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            let [w, h] = [video.videoWidth, video.videoHeight]
            canvas.width = w;
            canvas.height = h;

            let interval = 5 / fps;
            let currentTime = 0;
            let duration = video.duration;
            let counter = 0;

            while (currentTime < duration) {  //send 5 frames then stop
                video.currentTime = currentTime;
                await new Promise(r => seekResolve = r);
                context.drawImage(video, 0, 0, w, h);
                var frame = canvas.toDataURL("image/jpeg", 0.3);
                sendImageFromURI(frame, "frame" + counter.toString());
                storeTemporaryFrame(frame, "frame" + counter.toString())
                currentTime += interval;
                counter += 5;
                cordova.plugin.progressDialog.setProgress(Math.floor(100 * currentTime / duration));
            }
            sock.send('!EXERCISE_COMPLETED${"frame_thr":1.1, "joint_thr":1.0, "exercise":"' + document.getElementById("retrieved_exercise").textContent + '"}');
            window.sessionStorage.setItem("lastFrameUploaded", counter.toString());
            cordova.plugin.progressDialog.dismiss();
            waitingForResults();
        });
        // set video src *after* listening to events in case it loads so fast
        // that the events occur before we were listening.
        video.src = videoUrl;
    });
}

function recordVideo() {
    if(sock.readyState!==sock.OPEN){
        navigator.notification.alert("Unable to reach the server... please try again later!", null, 'Connection Error')
        return;
    }
    var options = {
        limit: 1,
        duration: 10
    };
    navigator.device.capture.captureVideo(onSuccess, onError, options);

    function onSuccess(mediaFiles) {
        var i, path, len;
        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            path = mediaFiles[i].fullPath;
            window.resolveLocalFileSystemURL(path, function success(fileEntry) {
                var promise = extractFramesFromVideo(fileEntry.toURL());
                //promise.then(waitingForResults, function(){navigator.notification.alert("Video Upload Failed! Try again!")});
            });
            var video = mediaFiles[0];
            video.localURL = video.fullPath;
            video.getFormatData(function (format){console.log(format);});
        }
    }

    function onError(error) {
        console.log('Error code: ' + error.code, null, 'Capture Error')
        navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
    }
}


function loadVideo() {
    if(sock.readyState!==sock.OPEN){
        navigator.notification.alert("Unable to reach the sever... please try again later!", null, 'Connection Error')
        return;
    }
    var options = {
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: Camera.MediaType.VIDEO,
        allowEdit: true,
        correctOrientation: true
    }

    navigator.camera.getPicture(function cameraSuccess(imageUri) {
        window.resolveLocalFileSystemURL("file:///" + imageUri, function success(fileEntry) {
            extractFramesFromVideo(fileEntry.toURL()); //.then(waitingForResults, function(){navigator.notification.alert("Video Upload Failed! Try again!")});
        });

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}

function waitingForResults(){
    cordova.plugin.progressDialog.init({
         theme: 'HOLO_DARK',
         progressStyle: 'SPINNER',
         cancelable: false,
         title: 'Analyzing...',
         message: 'The trainer is analyzing your exercise...',
     });
 }
