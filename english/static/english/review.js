let divScreen;
let j_my_words;
let j_word_images;
let j_examples;
let reviewStarted = false;
document.addEventListener("DOMContentLoaded", function() {
    if (my_list) {
        j_my_words = JSON.parse(my_words);
        j_word_images = JSON.parse(word_images);
        j_examples = JSON.parse(examples);
    }

    const divSecond = document.querySelector("#settingsAutoPlay");
    const divSecondTextBox = document.querySelector(".divReviewSecond");

    divSecond.addEventListener("change", function () {
        if (window.event.target.checked) {
            divSecondTextBox.classList.remove("hidden");
            auto_play = true;
            take_seconds_from_user();
        }
        else {
            divSecondTextBox.classList.add("hidden");
        }
    });

    divScreen = document.querySelector(".screen");
    if(!divScreen)  ferror("E104 - render error!");

    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !auto_play) {
          checkEnter();
        }
    });

    document.querySelector(".buttonStartReview").addEventListener("click", startReview)
    document.querySelector(".buttonNext").addEventListener("click", reviewNext);
});

let cur_index = 0;
let auto_play = false;
let auto_speech = false;
let answer_wait_seconds = 4;
let go_next_seconds = 3;



function startReview () {
    // HIDE START SCREEN
    reviewStarted = true;
    document.querySelector(".startScreen").classList.add("hidden");
    // SHOW QUESTION SCREEN
    document.querySelector(".divReviewQuestion").classList.remove("hidden");
    // CHECK AUTO PLAY AND IF ON; TAKE SECONDS SETTING
    take_seconds_from_user();
    // START FUNCTION -> reviewNext
    reviewNext();

}
function reviewNext () {
    // document.body.style.backgroundColor = "";
    makeAnswerReaction(2);
    // HIDE ANSWER
    document.querySelector(".divReviewAnswer").classList.add("hidden");
    // BIND SITUATION
    document.querySelector(".reviewSituation").innerHTML = `${ cur_index + 1 } / ${ j_my_words.length }`
    // BIND IMAGE
    document.querySelector(".reviewImage").setAttribute("src", `/english/word_images/${ j_word_images[cur_index] }`);
    // CLEAN TEXTBOX
    const txtBox = document.querySelector(".reviewAnswer");
    txtBox.value = "";
    txtBox.focus();
    
    // BIND ANSWER
    //  MEANING: j_my_words[0].fields.meaning
    document.querySelector(".pReviewMeaning").innerHTML = `${j_my_words[cur_index].fields.word}: - ${j_my_words[cur_index].fields.meaning}`;

    // IF AUTO PLAY: ON -> START TIMER FOR SELF ANSWER
    if (auto_play) {
        setTimeout(() => {
            console.log("review next timeout triggered");
            reviewAnswer();
        }, answer_wait_seconds * 1000);
    }
}
function makeAnswerReaction (sit) {
    review_image = document.querySelector(".reviewImage");
    switch (sit) {
        case 0:
            review_image.style.border = "15px solid red";
            break;
        case 1:
            review_image.style.border = "15px solid green";
            break;
        case 2:
            review_image.style.border = "";
            break;
        default:
            review_image.style.border = "";
            break;
    }
}
function reviewAnswer () {
    // SHOW ANSWER
    document.querySelector(".divReviewAnswer").classList.remove("hidden");
    // IF AUTO SPEECH ON -> MAKE SPEECH
    if (auto_speech) speak(j_my_words[cur_index].fields.word);
    // IF AUTO PLAY OFF -> CHECK ANSWER AND BIND SITUATION
    answer = document.querySelector(".reviewAnswer").value;
    if (answer === j_my_words[cur_index].fields.word) {
        // ANSWER IS TRUE
        makeAnswerReaction(1);
    }
    else {
        // ANSWER IS WRONG
        makeAnswerReaction(0);
    }
    // UPDATE CUR_INDEX
    cur_index++;
    // IF THIS IS LAST WORD ->  HIDE NEXT BUTTON
    //                          MAKE REQUEST FOR DB ENTRY OF REVIEW
    if (cur_index === j_my_words.length) {
        document.querySelector(".buttonNext").disabled = true;
        reviewStarted = false;
        sendReviewed();
    }
    // ELSE -> IF AUTO PLAY: ON -> START TIMER FOR GO NEXT
    else {
        if (auto_play) setTimeout(() => {
            reviewNext();
        }, go_next_seconds * 1000);
    }
}
function take_seconds_from_user () {
    try {
        answer_wait_seconds = document.querySelector("#reviewSecond").value;
        console.log("answer_wait_seconds changed: ", answer_wait_seconds);
    } catch (error) {
        ferror("E105 - wait seconds taking error!");
    }
}
function speak (text) {
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}
function checkEnter () {
    console.log("entered");
    if (reviewStarted) {
        if (document.querySelector(".divReviewAnswer").classList.contains("hidden")) reviewAnswer();
        else reviewNext();
    }
}
function sendReviewed () {
    const request = new Request('reviewed',
    {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "m_list": my_list
        }),
        mode: 'same-origin',

    }
    );
    fetch(request).then(response => response.json()).then(data => {
        // data.data.result === 1 => successfully added
        console.log(data.data.result)
    });
}
function ferror (message) {
    console.log(message);
}

