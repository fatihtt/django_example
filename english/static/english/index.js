document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".newListButton").addEventListener("click", function () {
        window.location.href = "newlist";
        window.event.preventDefault();
    });

    // REVIEW BUTTONS
    var review_buttons = document.querySelectorAll(".button-review");

    for (let i = 0; i < review_buttons.length; i++) {
        review_buttons[i].addEventListener("click", go_review);
    }

    document.querySelector(".myWordsReview").addEventListener("click", function () {
        window.location.href = "my-words-review";
        window.event.preventDefault();
    })

    // LEARNED BUTTONS
    var learned_buttons = document.querySelectorAll(".button-learned");

    for (let i = 0; i < learned_buttons.length; i++) {
        learned_buttons[i].addEventListener("click", sent_to_learned);
    }
});

function go_review() {
    const target = window.event.target;
    window.location.href = `review?l=${target.dataset.list_id}`;
    window.event.preventDefault();
}
function sent_to_learned (e) {
    const list_id = e.target.dataset.list_id;

    // START REQUEST
    // getCookie must be in layout js
    const request = new Request('move-list-learned',
    {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "list_id": list_id
        }),
        mode: 'same-origin',
    }
    );
    fetch(request).then(response => response.json()).then(data => {
        // data.data.result === 1 => successfully added
        console.log(data.data.result)
        if (data.data.result === 1) {
            window.location.href = "./";
        }
        else {
            // IN CASE OF ERROR
            console.log(data.data.message)
        }
    });

    e.preventDefault();
}