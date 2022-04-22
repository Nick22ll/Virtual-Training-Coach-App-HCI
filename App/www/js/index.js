
function onHomepageLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
    createDatabaseStructure();
}

function toNewExercise() {
    window.location = "newExercise.html";
}

function toHistoryExercise(){
    window.location = "historyExercises.html";
}

function toUpperExercise(){
    window.location = "upperBody.html";
}

function toLowerExercise(){
    window.location = "lowerBody.html";
}

function toFullExercise(){
    window.location = "fullBody.html";
}

function retrieveExerciseName(element){
    window.location = "uploadExercise.html";
    window.sessionStorage.setItem('ex_name', element.id);
}

