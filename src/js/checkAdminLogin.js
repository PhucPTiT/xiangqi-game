function checkAdminLogin() {
    console.log("checkAdminLogin");
    let user = JSON.parse(localStorage.getItem("admin"));
    if (user) {
        return user;
    } else {
        window.location.href = "/src/login.html";
    }
}

checkAdminLogin();
