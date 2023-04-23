// const words = [ { "id": 5, "word": "acquaintances", "img_url": "for_good.jpg", "meaning": "bla bla bla", "examples": ["example1", "example2"] } ];

let words = [];

let cur_index = 0;
let explanation = false;
document.addEventListener("DOMContentLoaded", function () {
    words = JSON.parse(words_s);
    console.log("words: ", words);
    window.addEventListener("resize", adjustImg);
    window.addEventListener("click", proceed);
    // document.querySelector(".spanHome").addEventListener("click", function () { window.location.href = "./"; })
    proceed();
    adjustImg();
});

function proceed () {
    // IF explanation = false, ASK, MAKE EXPLANATION true
    // ELSE ANSWER

    if (window.event.target != document && window.event.target.classList.contains("spanHome")) {
        window.location.href = "./";
        return;
    }

    if (cur_index >= words.length) {
        console.log("the end");
        document.querySelector(".divExplanation").style.backgroundColor = "rgb( 0, 100, 0, 0.9)";
        return;
    };

    const explanationDiv = document.querySelector(".divExplanation");
    const meaningElement = document.querySelector(".pMeaning");
    const wordElement = document.querySelector(".pWord");
    const exampleElement = document.querySelector(".ulExample");
    const imageElement = document.querySelector(".divImage > img");;
    if (!explanation) {
        imageElement.src = `/english/word_images/${words[cur_index].img_url}`;
        explanationDiv.classList.add("hidden");
        explanation = true;
    }
    else {
        // WRITE EXPLANATION ELEMENTS
        meaningElement.innerHTML = words[cur_index].meaning;
        wordElement.innerHTML = words[cur_index].word;
        let exampleHtml = "";
        for (let i = 0; i < words[cur_index].examples.length; i++) {
            exampleHtml += `<li>${ words[cur_index].examples[i] }</li>`
        }
        exampleElement.innerHTML = exampleHtml;
        explanationDiv.classList.remove("hidden");

        // UPDATE LAST REVIEW DATETIME OF WORD

        // START REQUEST
        // getCookie must be in layout js
        const request = new Request('word-reviewed',
        {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "word_id": words[cur_index].id
            }),
            mode: 'same-origin',
        }
        );
        fetch(request).then(response => response.json()).then(data => {
            // data.data.result === 1 => request succeded
            console.log(data.data.result)
            if (data.data.result === 1) {
                // nothing needed to do
            }
            else {
                // IN CASE OF ERROR
                console.log(data.data.message);
            }
        });

        explanation = false;
        cur_index++;
    }
}

function adjustImg () {
    const img = document.querySelector(".divImage > img");
    const w_width = $(window).width();
    const w_height = $(window).height();
    if (w_width < w_height) {
        img.style.width = "100%";
        img.style.height = "auto";
    }
    else {
        img.style.width = "auto";
        img.style.height = "100%";
    }
}