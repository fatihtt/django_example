let showPage = 0;
let amountPerPage = 10;


// request words which this.user has not
const word_list = JSON.parse(words);
let word_list_filtered = word_list;

let filter_level_list = [];
let checked_words = [];

function filterToggle (code) {
    // CONTROL CODE IS IN FILTER OR NOT
    // IF IN, OMIT IT FROM FILTER LIST
    // IF NOT, ADD IT TO FILTER LIST
    if (filter_level_list.includes(code)) filter_level_list.splice(filter_level_list.indexOf(code), 1);
    else filter_level_list.push(code);
    // MAKE FILTRATION FROM SCRATCH
    word_list_filtered = [];
    for (let i = 0; i < word_list.length; i++) {
        if (filter_level_list.includes(word_list[i].level.toLowerCase())) word_list_filtered.push(word_list[i])
    }
    // SHOW NEW WORD LIST
    showList();
}
function showList (pageNo) {
    if (!pageNo) pageNo = 1;
    let htmlList = "";
    if(filter_level_list.length < 1) word_list_filtered = word_list;
    if (word_list_filtered.length < 1) htmlList += "<div class='divSelectWordItem'>no words</div>"
    for (let i = 0; i + (pageNo - 1) * amountPerPage < word_list_filtered.length && i < amountPerPage; i++) {
        let word = word_list_filtered[i + (pageNo - 1) * amountPerPage];
        htmlList += `
        <div class='divSelectWordItem'>
            <input type="checkbox" class="chkWord" value="${word.id}" ${checked_words.includes(word.id.toString()) ? "checked": ""} id="chxWord${word.id}" name="chxWord${word.id}">
            <label for="chxWord${word.id}">${word.word}</label>
        </div>
        `
    }
    // PAGINATION
    const page_count = Math.ceil(word_list_filtered.length / amountPerPage);
    htmlList += `<div class="divPagination"><span class="spanPage active">Page</span>`;
    pageNo = parseInt(pageNo);
    for (let i = 1; i < page_count + 1; i++) {
        if (pageNo - 5 < i  && i < pageNo - 2 ) htmlList += `<span class="spanPage active">.</span>`;
        if (pageNo - 2 <= i && i <= pageNo + 2) {
            htmlList += `<span class="spanPage${i === parseInt(pageNo) ? " active" : " link"}">${i}</span>`;
        }
        if (pageNo + 2 < i && i < pageNo + 5) htmlList += `<span class="spanPage active">.</span>`;
    }
    htmlList += "</div>";
    document.querySelector(".divWordSelection").innerHTML = "";
    document.querySelector(".divWordSelection").innerHTML = htmlList;
    spans = document.querySelectorAll(".spanPage");
    for (let i = 0; i < spans.length; i++) {
        if (!spans[i].classList.contains("active")) {
            spans[i].addEventListener("click", function () {
                showList(spans[i].innerHTML);
            });
        }
    }

    // ADD EVENT LISTENER TO CHEKBOXES
    const checkboxes = document.querySelectorAll(".chkWord");
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener("change", function () {
            if (this.checked && !checked_words.includes(this.value)) checked_words.push(this.value);
            else if(!this.checked) checked_words.splice(checked_words.indexOf(this.value), 1);
            updateSummary();
        });
    }

}
function updateSummary () {
    let summaryHtml = "";
    if (checked_words.length > 0) summaryHtml = "<h3>Selected Words</h3>";
    for (let i = 0; i < checked_words.length; i++) {
        summaryHtml += word_list.filter(word => { return word.id === parseInt(checked_words[i]) })[0].word;
        if (i != checked_words.length -1) summaryHtml += ", ";
    }
    document.querySelector(".divSummary").innerHTML = summaryHtml;
}
function writeMessage(message, element, mainScreen) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("divWarning");
    messageDiv.innerHTML = `
                            <img src="https://cdnjs.cloudflare.com/ajax/libs/emojify.js/1.1.0/images/basic/warning.png" alt="warning" width="32">
                            ${message}
                        `;
    mainScreen.insertBefore(messageDiv, element);
    setTimeout(() => {
        $(messageDiv).fadeOut("slow", function(){messageDiv.remove()});
    }, 1500);
}
document.addEventListener("DOMContentLoaded", function () {

    // WAIT FOR FILTERING OR SELECTION COMMAND
    // WAIT FOR AMOUNT PER PAGE CHANGE
    document.querySelector("#ddPageAmount").addEventListener("change", function () {
        amountPerPage = this.value;
        showList();
    });
    document.querySelector("#selectAll").addEventListener("change", function () {
        const checkboxes = document.querySelectorAll("input[type=checkbox]");
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i] != this)
            {
                // UPDATE checked_words AFTER selectAll CHANGED
                if(!this.checked && checked_words.includes(checkboxes[i].value)) checked_words.splice(checked_words.indexOf(checkboxes[i].value), 1);
                else if (this.checked && !checked_words.includes(checkboxes[i].value)) checked_words.push(checkboxes[i].value)

                // UPDATE CHEKBOXES AFTER selectAll CHANGED
                checkboxes[i].checked = this.checked;
                checkboxes[i].addEventListener("change", function () {
                    document.querySelector("#selectAll").checked = false;
                });
            }
        }
        updateSummary();
        console.log("checked words after all: ", checked_words);
    });

    const filterItems = document.querySelectorAll(".divFilterLevelItem");
    for (let i = 0; i < filterItems.length; i++) {
        filterItems[i].addEventListener("click", function () {
            filterToggle(filterItems[i].dataset.code);
            this.classList.toggle("active");
        })
    }

    const newListButton = document.querySelector(".newListButton");
    newListButton.addEventListener("click", function () {

        // HIDE FORM AND BIND LOADING IMAGE
        const mainElement = document.querySelector("main");
        mainElement.style.visibility = "hidden";
        const mainScreen = document.querySelector(".divMainScreen");
        mainScreen.insertBefore(loadingImg, mainElement);
        document.createElement("img");

        if (checked_words.length < 10) {
            mainScreen.querySelector(".iamloading").remove();

            writeMessage("at least 10 elements needed to create a new list!", mainElement, mainScreen);
            mainElement.style.visibility = "";
        }
        else {
            // START REQUEST
            // getCookie must be in layout js
            const request = new Request('newlistcreate',
            {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "checked_word_ids": checked_words
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
                    mainScreen.querySelector(".iamloading").remove();

                    writeMessage("error while creating new list!", mainElement, mainScreen);

                    mainElement.style.visibility = "";
                }
            });
        }
        console.log("hello from new list");
    });

    // SHOW WORDS FROM WORDS LIST AS UNFILTERED
    showList();
});
function giveMessage (message) {

}
const loadingImg = document.createElement("img");
loadingImg.src = "https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/images/loading.gif";
loadingImg.width = 20;
loadingImg.classList.add("iamloading");