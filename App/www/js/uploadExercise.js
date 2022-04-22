function getExerciseName(){
    var ex_name = window.sessionStorage.getItem('ex_name');
    ex_name = ex_name.toUpperCase();
    ex_name = ex_name.replace("-", " ");
    ex_name = ex_name.replace("_", " ");
    document.getElementById("retrieved_exercise").innerHTML = ex_name;

    var videoTag = document.createElement("video");
    videoTag.id = "preview_video";
    videoTag.autoplay = true;
    videoTag.loop = true;

    var sourceTag = document.createElement("source");
    sourceTag.type = "video/mp4";
    sourceTag.id = "video_src";

    videoTag.appendChild(sourceTag);
    //var source = document.getElementById('video_src');
    videoTag.addEventListener("loadeddata", function(){
        var placeholder = document.getElementById("video_placeholder");
        placeholder.style = null;
        placeholder.appendChild(videoTag);
        placeholder.id = "exercise_video"
    })

    switch (ex_name){
        case 'ARM CLAP':
            sourceTag.src = "video/trainer/arm-clap(0)/Video/arm-clap(0).mov";
            break;
        case 'BICEPS CURL':
            sourceTag.src = "video/trainer/dumbbell-curl(0)/Video/dumbbell-curl(0).mov";
            break;
        case 'FRONT RAISE':
            sourceTag.src = "video/trainer/front-dumbbell-raise(45)/Video/front-dumbbell-raise(45).mov";
            break;
        case 'TRICEP EXTENSION':
            sourceTag.src = "video/trainer/tricep-extension(90)/Video/tricep-extension(90).mov";
            break;
        case 'DEADLIFT':
            sourceTag.src = "video/trainer/deadlift(90)/Video/deadlift(90).mov";
            break;
        case 'DOUBLE LUNGE':
            sourceTag.src ="video/trainer/double-lunge(90)/Video/double-lunge(90).mov";
            break;
        case 'SQUAT':
            sourceTag.src ="video/trainer/squat(90)/Video/squat(90).mov";
            break;
        case 'GLUTE BRIDGE':
            sourceTag.src ="video/trainer/glute-bridge(90)/Video/glute-bridge(90).mov";
            break;
        case 'MOUNTAIN CLIMBER':
            sourceTag.src ="video/trainer/mountain-climber(45)/Video/mountain-climber(45).mov";
            break;
        case 'PLANK':
            sourceTag.src ="video/trainer/plank(90)/Video/plank(90).mov";
            break;
        case 'PUSH UP':
            sourceTag.src = "video/trainer/push-up(90)/Video/push-up(90).mov";
            break;
    }
    videoTag.load();
}



function getExerciseInfo(){
    // Get the modal div
    var modal = document.getElementById("infoModalDiv");
    modal.style.display ="block";

    var check_empty = document.getElementById("modalHeader")
    if(check_empty.textContent === '') {
        var ex_name = window.sessionStorage.getItem('ex_name');
        ex_name = ex_name.toUpperCase();
        ex_name = ex_name.replace("-", " ");
        ex_name = ex_name.replace("_", " ");

        //write different messages based on the exercise type
        switch (ex_name) {
            case 'ARM CLAP':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Standing upright with your feet at hip width, and legs straight, engage your glutes and brace your core whilst drawing your ribs in. Then stretch your arms out as wide as you can at shoulder height to make a T-shape with your body. From there, rotate your arms so your palms face down.";
                document.getElementById("difficulty_value").innerHTML += "Easy";
                document.getElementById("impact_value").innerHTML += "Low";
                document.getElementById("target_body_value").innerHTML += "Shoulders";
                break;
            case 'BICEPS CURL':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Stand with your feet at hip width and core engaged to support you throughout the movement. Start with a dumbbell in each hand, at your sides. Bend your right arm at the elbow and raise the right dumbbell up towards your shoulder, rotating it as you do so that your palm faces in towards your right shoulder. Then lower it with control, rotating it back to the start position. Repeat this movement with the left arm and then keep alternating left and right for the duration of the exercise.";
                document.getElementById("difficulty_value").innerHTML += "Medium";
                document.getElementById("impact_value").innerHTML += "Normal";
                document.getElementById("target_body_value").innerHTML += "Biceps";
                break;
            case 'FRONT RAISE':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Stand with good posture and a dumbbell in each hand, by your sides. Keeping your arms straight, raise one dumbbell forwards up to shoulder height, lower it with control. Repeat on the other side and keep alternating for the duration of the exercise.";
                document.getElementById("difficulty_value").innerHTML += "Medium";
                document.getElementById("impact_value").innerHTML += "Normal";
                document.getElementById("target_body_value").innerHTML += "Triceps, upper back, shoulders";
                break;
            case 'TRICEP EXTENSION':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Begin with your feet shoulder width apart, and tighten your core. Hold the dumbbell in both hands. Lift the dumbbell straight above your head with your elbows tucked in by your ears. Lower the dumbbell behind, bending at your elbows. Lowering the dumbbell should be a controlled motion";
                document.getElementById("difficulty_value").innerHTML += "Medium";
                document.getElementById("impact_value").innerHTML += "Low";
                document.getElementById("target_body_value").innerHTML += "Triceps, abs, shoulders";
                break;
            case 'DEADLIFT':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Stand with your feet at hip width and a dumbbell in each hand, by your sides. Drive your hips back and hinge forward at the hips, maintain the natural inward curve of your lower back. From the bottom position, keep your shoulders drawn back and down, then straighten your legs and drive your hips forwards to return you back to standing with the dumbbells at your sides again. You do not need to lift the dumbbells higher by bending your arms.";
                document.getElementById("difficulty_value").innerHTML += "Hard";
                document.getElementById("impact_value").innerHTML += "Normal";
                document.getElementById("target_body_value").innerHTML += "Upper back, lower back, calves, glutes, hamstrings, quadriceps";
                break;
            case 'DOUBLE LUNGE':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Start standing up with your feet at hip width, and your hands on your hips. Rise up on to your toes and balance yourself, then take a long step forwards with your right foot. As your front foot makes contact with the floor, bend at both knees to lower yourself down into the lunge position. At the bottom of your lunge, your knees should both be bent to approximately 90 degrees. From the bottom position, push up and backwards using your front foot. Repeat this whole step with the other leg. Make sure you complete an even number of repetitions on each leg during the time for the exercise.";
                document.getElementById("difficulty_value").innerHTML += "Easy";
                document.getElementById("impact_value").innerHTML += "Normal";
                document.getElementById("target_body_value").innerHTML += "Calves, hamstrings, quadriceps";
                break;
            case 'SQUAT':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Start with your feet shoulder width apart on a flat level surface. Begin the movement by sitting your hips back, bending your knees and push them out to the sides a little. Your heels should stay in contact with the floor and your weight should be centered, mid-foot. Continue down until your hips are level with your knees and your thighs are parallel. This is the bottom of the squat, and quickly reverse the motion until you return to the starting position. As you squat, keep your head and chest up and push your knees out.";
                document.getElementById("difficulty_value").innerHTML += "Easy";
                document.getElementById("impact_value").innerHTML += "Normal";
                document.getElementById("target_body_value").innerHTML += "Calves, glutes, quadriceps";
                break;
            case 'GLUTE BRIDGE':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Lay on the floor with your knees bent to the ceiling and your feet under your knees at hip width, near to your Glutes. Have your arms flat to the floor alongside your body. Pull your belly button into your spine, and then tense your glutes and hamstrings to lift your hips up as far as you can. Once in the position, it can be tempting just to ‘hang out’. Instead, continually push your feet down into the floor to activate the glutes and ensure the belly stays active.";
                document.getElementById("difficulty_value").innerHTML += "Easy";
                document.getElementById("impact_value").innerHTML += "Normal";
                document.getElementById("target_body_value").innerHTML += "Lower back, glutes, hamstrings";
                break;
            case 'MOUNTAIN CLIMBER':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Start off with your hands on the floor, your arms straight and your legs straight out behind you, feet on the floor. Then step one foot in underneath your chest and rest it there on the floor. Then, keeping your shoulders lined up above your hands, push down into the floor with your hands and jump switch your feet so that the one that was tucked underneath you straightens out behind you and visa versa. As soon as your feet land in one position, jump switch them back to the other position and keep alternating as fast as you can for the duration of the exercise.";
                document.getElementById("difficulty_value").innerHTML += "Medium";
                document.getElementById("impact_value").innerHTML += "Normal";
                document.getElementById("target_body_value").innerHTML += "Abs, glutes, hamstrings, quadriceps";
                break;
            case 'PUSH UP':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Start at the top of the push up position with your hands on the floor, arms straight and underneath your shoulders. Step your feet back behind you and lift your knees. Engage your glutes, tense your legs and brace your core to keep your body rigid. Keeping your elbows in towards your ribs and your forearms vertical, bend at the elbows to lower your body towards the floor. Your head and shoulders should move forwards of your hands as you get closer to the floor. Use your full range of motion to lower your chest in between your hands, as close to the floor as you can, then push your hands into the floor, keeping you body tensed, to move it up away from the floor back to the start position.";
                document.getElementById("difficulty_value").innerHTML += "Medium";
                document.getElementById("impact_value").innerHTML += "Normal";
                document.getElementById("target_body_value").innerHTML += "Triceps, upper back, shoulders";
                break;
            case 'PLANK':
                document.getElementById("modalHeader").innerHTML = ex_name;
                document.getElementById("modalBody").innerHTML = "Start off in a crawling position on your hands and knees. Pick up one hand, bend it at the elbow and place your elbow on the floor directly underneath your shoulder. Repeat for the other hand so that you are resting your upper body on your elbows. Then walk your knees back out behind you, tuck your toes and pick your knees up off the floor into Plank position. Make your body as rigid as you can from your feet to your head to keep it in a straight “plank-like” shape side on. Do this by tensing your quads to lift your knee caps up your thighs, squeezing your glutes together, bracing your core and drawing your belly button up away from the floor, whilst at the same time pressing down into the floor with your elbows. Keep your neck in a neutral position, aligned with the rest of your spine, by looking at the floor just in front of your hands.  uch that your chest slumps down in between your shoulders.";
                document.getElementById("difficulty_value").innerHTML += "Easy";
                document.getElementById("impact_value").innerHTML += "Normal";
                document.getElementById("target_body_value").innerHTML += "Abs, lower back, shoulders, glutes";
                break;

        }

    }

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}