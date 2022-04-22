var exercises = ["arm-clap", "crunch", "deadlift", "double-lunge", "biceps-curl", "front-raise", "glute-bridge", "mountain-climber", "plank", "push-up", "squat", "tricep-extension"]

function createDatabaseStructure() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT,0, function(fileSystem){
        fileSystem.root.getDirectory('ExercisesDatabase', { create: true, exclusive: true }, function (dirEntry) {
            for(let exercise in exercises){
                console.log(dirEntry.fullPath);
                dirEntry.getDirectory(exercises[exercise], { create: true, exclusive: true }, function (path) { console.log(path)} , onErrorGetDir);
            }
    }, onErrorGetDir);
        fileSystem.root.getDirectory('ImageErrorDatabase', { create: true, exclusive: true }, function (dirEntry) {
            for(let exercise in exercises){
                console.log(dirEntry.fullPath);
                dirEntry.getDirectory(exercises[exercise], { create: true, exclusive: true }, function (path) { console.log(path)} , onErrorGetDir);
            }
        }, onErrorGetDir);
    });
}

function writeResults(exercise, results){
    var date = new Date();
    exercise = exercise.toLowerCase();
    exercise = exercise.replace(" ", "-");
    var filename = exercise+"_"+ date.toISOString().slice(0,-5).replace(/:/gi, "@") + "_" + results["exerciseSuccessRate"] + ".txt";
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){

        fileSystem.root.getDirectory('ExercisesDatabase/' + exercise, {create: true, exclusive:false }, function (dirEntry) {

            dirEntry.getFile(filename, {create: true, exclusive: false}, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {

                    fileWriter.onwriteend = function () {
                        console.log("Successful results write...");
                    };
                    fileWriter.onerror = function (e) {
                        console.log("Failed results write: " + e.toString());
                    };
                    var to_write = new Blob([JSON.stringify(results, null, 2)], {type: 'application/json'});
                    fileWriter.write(to_write);
                });
            }, onErrorGetDir);
        }, onErrorGetDir);
    });
    return filename.substring(0, findCharacter("_",filename)[1]);
}

function readResults(){
    var filename = this.querySelector(".li_filename").innerHTML;

    var folder = filename.slice(0, filename.indexOf("_"));
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        fileSystem.root.getDirectory('ExercisesDatabase/' + folder, {create: false, exclusive:false }, function (dirEntry) {
            dirEntry.getFile(filename, {create: false, exclusive: false}, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        window.sessionStorage.setItem("ex_name", folder.replace("-", " ").toUpperCase());
                        window.sessionStorage.setItem("analysis_results", this.result);
                        window.sessionStorage.setItem("folder_name", filename.substring(0, findCharacter("_",filename)[1]));
                        window.sessionStorage.setItem("fromServer", "false");
                        changeToResults(false);
                    };
                    reader.readAsText(file);

                }, onErrorReadFile);

            }, onErrorGetDir);
        }, onErrorGetDir);
    });

}

function waitDeviceReady(){
    document.addEventListener("deviceready", readResultsHistory, false);
}


function readResultsHistory(){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(internalStorage){
        internalStorage.root.getDirectory('ExercisesDatabase', { create: false }, function (dirEntry) {
            var reader = dirEntry.createReader();
            reader.readEntries(
                function (entries) {
                                for(let i=0; i<entries.length; i++){
                                    internalStorage.root.getDirectory(entries[i].fullPath,{ create: false }, function(entry){
                                        var filereader = entry.createReader()
                                        filereader.readEntries(function (historyFilesEntry){
                                                var exercises = [];
                                                for(var j = 0; j<historyFilesEntry.length; j++){
                                                    exercises.push(historyFilesEntry[j].name);
                                                }
                                                if(exercises.length > 0)
                                                    appendList(exercises);
                                            }
                                            , function (err) {
                                                console.log(err)
                                            });
                                    },function (err) {
                                        console.log(err);
                                    });
                                }
                },
                function (err) {
                    console.log(err);
                }
            );
        }, onErrorGetDir);

    });

}

function readResultsHistoryFromExercise(exercise){
    exercise = exercise.toLowerCase();
    exercise = exercise.replace(" ", "-");
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(internalStorage){
        internalStorage.root.getDirectory('ExercisesDatabase/' + exercise, { create: false }, function (dirEntry) {
            var reader = dirEntry.createReader();
            reader.readEntries(
                function (entries) {
                    var entries_names = [];
                    for(let i = 0; i< entries.length; i++)
                        entries_names.push(entries[i].name);
                    appendList(entries_names);
                },
                function (err) {
                    console.log(err);
                }
            );
        }, onErrorGetDir);
    });
}

function readResultsHistoryFromDate(){
    var ul = document.getElementById("workout_list");
    var child = ul.lastElementChild;
    while (child) {
        ul.removeChild(child);
        child = ul.lastElementChild;
    }
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(internalStorage){
        internalStorage.root.getDirectory('ExercisesDatabase', { create: false }, function (dirEntry) {
            var reader = dirEntry.createReader();
            reader.readEntries(
                function (entries) {
                    for(let i=0; i<entries.length; i++){
                        internalStorage.root.getDirectory(entries[i].fullPath,{ create: false }, function(entry){
                            var filereader = entry.createReader()
                            filereader.readEntries(function (historyFilesEntry){
                                    var exercises = [];
                                    for(var j = 0; j<historyFilesEntry.length; j++){
                                        var date = historyFilesEntry[j].name.slice(historyFilesEntry[j].name.indexOf("_")+1, historyFilesEntry[j].name.indexOf("T"));
                                        if(date === document.getElementById("insert_date").value)
                                            exercises.push(historyFilesEntry[j].name);
                                    }
                                    if(exercises.length > 0)
                                        appendList(exercises);
                                }
                                , function (err) {
                                    console.log(err)
                                });
                        },function (err) {
                            console.log(err);
                        });
                    }
                },
                function (err) {
                    console.log(err);
                });
        }, onErrorGetDir);
    });

}

function deleteResult(filename, li_element){
    var exercise = filename.slice(0, filename.indexOf("_"));
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        fileSystem.root.getDirectory('ExercisesDatabase/' + exercise, {create: true, exclusive:false }, function (dirEntry) {
            dirEntry.getFile(filename, {create: false, exclusive: false}, function (fileEntry) {
                fileEntry.remove(
                    function (file) {
                    console.log("File removed...");
                    li_element.remove();
                    updateHistoryList();
                    //modal success
                },
                    function(err){
                        console.log("File NOT removed...");
                        console.log(err);
                    });
            }, onErrorGetDir);
        }, onErrorGetDir);
    });

}

function storeTemporaryFrame(frame, frameName){
    window.requestFileSystem(window.TEMPORARY, 0, function (fs) {
        // Creates a new file or returns the file if it already exists.
        fs.root.getFile(frameName, {create: true, exclusive: false}, function(fileEntry) {
            writeFile(fileEntry, frame);
        }, onErrorCreateFile);
    }, onErrorLoadFs);
}

function storeErrorFrame(frame, exercise_name, folder_name, frameName){
    exercise_name = exercise_name.toLowerCase();
    exercise_name = exercise_name.replace(" ", "-");
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        // Creates a new file or returns the file if it already exists.
        fs.root.getDirectory("ImageErrorDatabase/" + exercise_name, {create: false, exclusive:false }, function (dirEntry) {
            dirEntry.getDirectory(folder_name, {create: true, exclusive: false}, function (fileEntry) {
                fileEntry.getFile(frameName, {create: true, exclusive: false}, function(frameEntry) {
                    writeFile(frameEntry, frame);
                }, onErrorCreateFile);
            },onErrorGetDir);
        },onErrorGetDir);
    }, onErrorLoadFs);
}


function writeFile(fileEntry, object) {
    fileEntry.createWriter(function (fileWriter) {
        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        fileWriter.onwriteend = function (e) {
            console.log("Writing ended: ", fileEntry.name);
        };
        var dataObj = new Blob([object],{type: 'image/jpeg' });
        fileWriter.write(dataObj);
    });
}

function findCharacter(character, string){
    var indices = [];
    for (var j = 0; j < string.length; j++)
        if (string[j] === character) indices.push(j);
    return indices;
}

function onErrorCreateFile(error){
    console.log("Error Create File: ", error);
}

function onErrorReadFile(error){
    console.log("Error read File: ", error);
}

function onErrorLoadFs(error){
    console.log("Error FileSystem Load: ", error);
}

function onErrorGetDir(error){
    console.log("ErrorGetDir: ", error);
}