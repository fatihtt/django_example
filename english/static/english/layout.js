document.addEventListener("DOMContentLoaded", function () {

    // home button activate
    const logo = document.querySelector(".divLogo h1");
    logo.addEventListener("click", function() {
        window.location.href = '/english';
    });

    // LOGOUT FUNCTION
    var logoutButton = document.querySelector(".logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            window.location.href = "/english/logout";
        });
    }
    
});
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
