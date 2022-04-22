function changeToResults(temporary_flag = true){
    if(temporary_flag)
        window.sessionStorage.setItem("from_temporary", "true");
    else
        window.sessionStorage.setItem("from_temporary", "false");
    window.location = "results.html";
}


function showResults(){
    var ex_name = window.sessionStorage.getItem("ex_name");
    document.getElementById("description-p").innerHTML = "Here your results for " + ex_name.toUpperCase() +"!";
    if(window.sessionStorage.getItem("fromServer") === "true"){
        document.addEventListener("deviceready", function() {
            window.sessionStorage.setItem("folder_name", writeResults(ex_name, JSON.parse(window.sessionStorage.getItem("analysis_results"))))
        }, false);
    }

    document.addEventListener("deviceready", function() { generateCarousel(results); });

    var results = JSON.parse(window.sessionStorage.getItem("analysis_results"));
    drawSuccessBar(results["exerciseSuccessRate"]);

    document.getElementById("errors_number").innerHTML = results["errorNumber"];
    document.getElementById("most_common_error").innerHTML = results["MostCommonError"]["joint"].toUpperCase();

}




function drawSuccessBar(successPercentage){
    var bar = new ProgressBar.SemiCircle('#success_bar', {
            trailColor: '#A1A1A1',
            duration: 2000,
            strokeWidth: 10,
            trailWidth: 10,
            from: { color: '#FF0000' },
            to: { color: '#1CCD22' },
            step: function(state, circle, attachment) {
                circle.path.setAttribute('stroke', state.color);
            },
            text: {
                value: String(Math.round(successPercentage)) + "%",
                style: {
                    color: '#ffffff'
                }
            }
        }
    );
    bar.animate(Math.round(successPercentage)/100);
}


function appendCarouselItem(img_src, error_id, json_error){
    //img element
    var error_img = new Image();
    error_img.className = "d-block w-100";
    error_img.id = "error_img_" + String(error_id)
    error_img.src = img_src;

    //calculation of the ratio to adjust the coordinates of the error points because they're calculated on resized images (256x256)

    var joint_error_list = json_error["jointErrorList"];


    var img_x_red = document.createElement("img");
    img_x_red.className = "x_error";
    img_x_red.id = "x_red_"+String(error_id);
    img_x_red.src = "./img/error_marks/x-red.png";


    var img_x_orange = document.createElement("img");
    img_x_orange.className = "x_error";
    img_x_orange.id = "x_orange_"+String(error_id);
    img_x_orange.src = "./img/error_marks/x-orange.png"


    var error_id_h5 = document.createElement("h5");
    error_id_h5.innerHTML = "ERROR " + String(error_id+1);

    var caption_p = document.createElement("p");
    caption_p.innerHTML = "Pay attention to " + json_error["jointErrorNameList"][error_id][0] +"!";

    var caption_div = document.createElement("div");
    caption_div.className = "carousel-caption d-md-block custom-carousel-caption";
    caption_div.appendChild(error_id_h5);
    caption_div.appendChild(caption_p);

    var carousel_item = document.createElement("div");

    if(error_id===0)
        carousel_item.className = "carousel-item active custom-carousel-item";
    else
        carousel_item.className = "carousel-item custom-carousel-item";

    carousel_item.id = String(error_id);
    carousel_item.appendChild(img_x_red);
    carousel_item.appendChild(img_x_orange);
    carousel_item.appendChild(error_img);
    carousel_item.appendChild(caption_div);

    // Add the third error only if exists
    if(joint_error_list.length > 2){
        var img_x_yellow = document.createElement("img");
        img_x_yellow.className="x_error";
        img_x_yellow.id = "x_yellow_"+String(error_id);
        img_x_yellow.src = "./img/error_marks/x-yellow.png";

        carousel_item.appendChild(img_x_yellow);
    }

    var carousel = document.getElementsByClassName("carousel-inner")[0];
    if(carousel.children.length === 0)  //Se non ha figli inserisco direttamente
        carousel.appendChild(carousel_item);
    else //Calcolo la posizione corretta in cui inserire l'item attraverso l'error_id
    {
        var i = 0;
        while(i < carousel.children.length && error_id > parseInt(carousel.children.item(i).id)){
            i++;
        }
        if(i===0)
            carousel.insertAdjacentElement('afterbegin', carousel_item);
        else if(i===carousel.children.length)
            carousel.insertAdjacentElement('beforeend', carousel_item);
        else
            carousel.insertBefore(carousel_item, carousel.children.item(i));
    }


    error_img.onload = function (){
        var id = this.id.match(/\d+/g)[0];
        var img_x_red = document.getElementById("x_red_"+id);
        var img_x_orange = document.getElementById("x_orange_"+id);
        var img_x_yellow = document.getElementById("x_yellow_"+id);
        //Cross image errors
        var error_list = joint_error_list[parseInt(id)];

        var ratio = this.naturalHeight/this.naturalWidth;

        //Error crosses centering
        var fix_x = Math.round((img_x_red.naturalWidth * 0.05) / 2);

        if(this.naturalHeight >= this.naturalWidth){
            //Re-mapping from error_list coordinates system to carousel error_image coordinate system

            var W = window.screen.width * 0.90;
            var H = W * ratio;
            var fixing_coef_y = H/256;

            img_x_red.style.left = String(Math.round((H*(error_list[0][0]-128)+(128*W))/256-fix_x))+"px";
            img_x_red.style.top = String(Math.round((error_list[0][1] * fixing_coef_y)-fix_x))+"px";
            img_x_orange.style.left = String(Math.round(((H*(error_list[1][0]-128)+(128*W))/256)-fix_x))+"px";
            img_x_orange.style.top = String(Math.round((error_list[1][1] * fixing_coef_y)-fix_x))+"px";
            img_x_yellow.style.left = String(Math.round(((H*(error_list[2][0]-128)+(128*W))/256)-fix_x))+"px";
            img_x_yellow.style.top = String(Math.round((error_list[2][1] * fixing_coef_y)-fix_x))+"px";
        }
        else{

            //Re-mapping from error_list coordinates system to carousel error_image coordinate system
            var W = window.screen.width * 0.90;
            var H = W * ratio;
            var fixing_coef_x = W/256;


            img_x_red.style.left = String(Math.round((error_list[0][0]*fixing_coef_x)-fix_x))+"px";
            img_x_red.style.top = String(Math.round(((W*(error_list[0][1]-128)+(128*H))/256)-fix_x))+"px";
            img_x_orange.style.left = String(Math.round((error_list[1][0]*fixing_coef_x)-fix_x))+"px";
            img_x_orange.style.top = String(Math.round(((W*(error_list[1][1]-128)+(128*H))/256)-fix_x))+"px";
            img_x_yellow.style.left = String(Math.round((error_list[2][0]*fixing_coef_x)-fix_x))+"px";
            img_x_yellow.style.top = String(Math.round(((W*(error_list[2][1]-128)+(128*H))/256)-fix_x))+"px";
        }




    }


}



function generateCarousel(json_result){
    for(let i=0; i<json_result["errorNumber"]; i++){;
        var frameName = "frame"+json_result["errorList"][i][1].toString();
        if(window.sessionStorage.getItem("from_temporary") === "true")
            readTemporaryFrame(frameName, i, json_result);
        else
            readStoredFrame(frameName, i, json_result);
    }
}

function readTemporaryFrame(frameName, error_id, json_error){
    window.requestFileSystem(window.TEMPORARY, 0, function (fs) {
        fs.root.getFile(frameName, {create: false, exclusive: false}, function(fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    appendCarouselItem(this.result,error_id,json_error);
                    var ex_name = window.sessionStorage.getItem("ex_name").toLowerCase().replace(" ", "-");;
                    var folder_name = window.sessionStorage.getItem("folder_name");
                    storeErrorFrame(this.result, ex_name, folder_name, frameName);
                };
                reader.readAsText(file);
            }, onErrorReadFile);
        }, onErrorCreateFile);
    }, onErrorLoadFs);
}

function readStoredFrame(frameName, error_id, json_error){
    var ex_name = window.sessionStorage.getItem("ex_name").toLowerCase().replace(" ", "-");
    var folder_name = window.sessionStorage.getItem("folder_name");
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        // Creates a new file or returns the file if it already exists.
        fs.root.getDirectory("ImageErrorDatabase/" + ex_name, {create: false, exclusive:false }, function (dirEntry) {
            dirEntry.getDirectory(folder_name, {create: false, exclusive: false}, function (fileEntry) {
                fileEntry.getFile(frameName, {create: false, exclusive: false}, function(frameEntry) {
                    frameEntry.file(function (file) {
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            appendCarouselItem(this.result,error_id,json_error)
                        };
                        reader.readAsText(file);
                    }, onErrorReadFile);
                }, onErrorGetDir);
            },onErrorGetDir);
        },onErrorGetDir);
    }, onErrorLoadFs);


}



function deleteTemporaryFrames(lastFrameCounter){
 //TODO fare questa funzione
}