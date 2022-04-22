
function appendList(ex_file_names) {
    var history = document.getElementById("workout_list");
    var last_id = history.getElementsByClassName("history_list_element").length;

    for (var i = 0; i<ex_file_names.length; i++) {
        var name = ex_file_names[i];
        var indices = [];
        for (var j = 0; j < name.length; j++) {
            if (name[j] === "_") indices.push(j);
        }

        var ex_name = name.slice(0, indices[0]);
        var date = new Date(name.slice(indices[0] + 1, indices[1]).replace(/@/gi, ":"));
        var success_rate = String(Math.round(name.slice(indices[1] + 1, name.indexOf(".txt")))) + "%";

        var li_p_exercise = document.createElement("p");
        var li_p_date = document.createElement("p");
        var li_p_SR = document.createElement("p");

        li_p_exercise.className = "li_p_exercise";
        li_p_date.className = "li_p_date";
        li_p_SR.className = "li_p_SR";

        li_p_exercise.innerHTML = ex_name.replace(/-/gi, " ").toUpperCase();
        li_p_date.innerHTML =date.toISOString().slice(0, -8).replace("T", " ");
        li_p_SR.innerHTML = success_rate;

        var history_icon = document.createElement("img");
        history_icon.src="./img/history_icons/"+ex_name+".png";
        history_icon.className = "history_icon";

        var history_icon_div = document.createElement("div");
        history_icon_div.className = "history_icon_div";
        history_icon_div.appendChild(history_icon);

        var history_EX_div = document.createElement("div");
        history_EX_div.className = "history_EX_div";
        history_EX_div.appendChild(li_p_exercise);

        var history_SR_div = document.createElement("div");
        history_SR_div.className = "history_SR_div";
        history_SR_div.id = "history_SR_"+String(last_id+i);
        history_SR_div.appendChild(li_p_SR);

        var bin_icon = document.createElement("img");
        bin_icon.src = "./img/history_icons/bin-icon.png";
        bin_icon.className = "bin_icon";

        var bin_div = document.createElement("div");
        bin_div.className = "bin_div";
        bin_div.addEventListener("click", dialogDelConfirm);
        bin_div.appendChild(bin_icon);

        var history_DATE_div = document.createElement("div");
        history_DATE_div.className = "history_DATE_div";
        history_DATE_div.appendChild(li_p_date);

        var history_paragraphs_div = document.createElement("div");
        history_paragraphs_div.className = "history_paragraphs_div";
        history_paragraphs_div.appendChild(history_EX_div);
        history_paragraphs_div.appendChild(history_DATE_div);

        var internal_li_div = document.createElement("div");
        internal_li_div.className = "internal_li_div";
        internal_li_div.appendChild(history_icon_div);
        internal_li_div.appendChild(history_paragraphs_div);
        internal_li_div.appendChild(history_SR_div);
        internal_li_div.appendChild(bin_div);

        var li = document.createElement("li");
        li.appendChild(internal_li_div);
        li.className = "history_list_element";


        var li_filename = document.createElement("p");
        li_filename.className = "li_filename";
        li_filename.innerHTML = name;
        li.addEventListener("click", readResults);
        li.addEventListener("long-press", showBinButton);
        li.appendChild(li_filename);

        history.appendChild(li);
        var bar = new ProgressBar.Circle("#"+history_SR_div.id, {
                trailColor: '#A1A1A1',
                duration: 1000,
                strokeWidth: 10,
                trailWidth: 10,
                from: { color: '#FF0000' },
                to: { color: '#1CCD22' },
                step: function(state, circle, attachment) {
                    circle.path.setAttribute('stroke', state.color);
                },
                text: {
                    value: success_rate,
                    className: "li_progress_text",
                    style: {
                        color: '#ffffff'
                    }
                }
            }
        );
        bar.animate(Math.round(success_rate.slice(0,success_rate.indexOf("%")))/100);
    }

}

function generateHistoryList(){
    var select = document.getElementById("dropdown_filter_menu");
    var filter = select.options[select.selectedIndex].value;
    var history = document.getElementById("workout_list");
    history.innerHTML = "";

    var insert_date_div = document.getElementById("insert_date_div");
    insert_date_div.style.display = "none";
    insert_date_div.style.display = "0";
    document.getElementById("dropdown_filter_menu_div").style.width = "78%";
    document.getElementById("dropdown_filter_menu").style.width = "none";

    if(exercises.includes(filter))
        readResultsHistoryFromExercise(filter);
    else if(filter === "AllExercises")
        readResultsHistory();
    else{
        insert_date_div.style.display = "flex";
        insert_date_div.style.width = "40%";
        document.getElementById("dropdown_filter_menu_div").style.width = "60%";
        document.getElementById("dropdown_filter_menu").style.width = "58%";
        var date =  new Date().toISOString();
        document.getElementById("insert_date").value = date.slice(0,date.indexOf("T"));
        readResultsHistoryFromDate();
    }

    sortHistoryList("exercise");

}


function updateHistoryList(){
    var select = document.getElementById('dropdown_ord_menu');
    var option = select.options[select.selectedIndex].value;
    sortHistoryList(option);
}


function sortHistoryList(typeOfSorting){ //typeOfSorting must be an integer, it should derive from the index of a select in a form
    var ul = document.getElementById("workout_list");
    var new_ul = ul.cloneNode(false);

    var lis = [];

    for(var i = ul.childNodes.length; i--;){
        if(ul.childNodes[i].nodeName === 'LI')
            lis.push(ul.childNodes[i]);
    }

    switch (typeOfSorting) {
        case "exercise":
            lis.sort(compareExerciseFromListElement);
            break;
        case "date":
            lis.sort(compareDatesFromListElement);
            break;
        case "success_rate":
            console.log(lis);
            lis.sort(compareSuccessRateFromListElement);
            console.log(lis);
            break;
    }

    for(var i = 0; i < lis.length; i++)
        new_ul.appendChild(lis[i]);
    ul.parentNode.replaceChild(new_ul, ul);
}

function compareDatesFromListElement(a, b){
    var dateA = a.getElementsByClassName("li_p_date")[0].innerHTML;
    var dateB = b.getElementsByClassName("li_p_date")[0].innerHTML;
    return new Date(dateB) - new Date(dateA);
}

function compareSuccessRateFromListElement(a, b){
    var SRA =  a.getElementsByClassName("li_p_SR")[0].innerHTML;
    SRA = parseInt(SRA.substring(0, SRA.indexOf("%")));
    var SRB = b.getElementsByClassName("li_p_SR")[0].innerHTML;
    SRB = parseInt(SRB.substring(0, SRB.indexOf("%")));
    return SRB - SRA;
}

function compareExerciseFromListElement(a, b){
    var exA =  a.getElementsByClassName("li_p_exercise")[0].innerHTML;
    var exB = b.getElementsByClassName("li_p_exercise")[0].innerHTML;

    return exA.localeCompare(exB);
}

function showBinButton(){
    var SR_div = this.querySelector(".history_SR_div");
    SR_div.style.display = "none";
    var bin_div = this.querySelector(".bin_div");
    bin_div.style.display = "block";

    var li_element = this;
    li_element.removeEventListener("click", readResults);

    window.addEventListener("click", closeBin);

    function closeBin(event) {
        if (event.target !== bin_div) {
            bin_div.style.display = "none";
            SR_div.style.display = "block";
            li_element.addEventListener("click", readResults);
            window.removeEventListener("click", closeBin);
        }
    }
}

function dialogDelConfirm() {
    var li_element = this.parentElement.parentElement;
    var filename = li_element.getElementsByClassName("li_filename")[0].innerHTML;
    var message = "Are you sure you want to delete this " + li_element.getElementsByClassName("li_p_exercise")[0].innerHTML + " from the history?";
    var title = 'DELETE CONFIRM';
    var buttonLabels = ["NO", "YES"];

    navigator.notification.confirm(message, confirmCallback, title, buttonLabels);

    function confirmCallback(buttonIndex) {
        switch (buttonIndex){
            case 1:  //NO
                break;
            case 2:  //YES
                deleteResult(filename, li_element);
                break;
        }


    }
}