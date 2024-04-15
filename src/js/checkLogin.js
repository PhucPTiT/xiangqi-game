function checkLogin() {
    console.log("checkLogin");
    let user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
        return user;
    } else {
        window.location.href = "/src/login.html";
    }
}
checkLogin();
