function get_nav_bar() {
    var nav_bar = document.getElementById("nav_bar");
    let button = document.getElementById("learn_more");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            nav_bar.innerHTML = `
            <a href="/" id="web_title">VolunTeer</a>
            <a href="javascript:void(0);" onclick="logout()">Logout</a>
            <a href="/users/profile"><i class="fa-solid fa-user"></i></a>
            <a href="/updates/all_update"><i class="fa-solid fa-bell" style="color: #880808;"></i></a>
            `;
            if(button != null) {
                button.onclick = function() { alert('Please login as organisations if you want to continue!'); };
            }
        }
        else if (this.readyState === 4 && this.status === 418) {
            nav_bar.innerHTML = `
            <a href="/" id="web_title">VolunTeer</a>
            <a href="javascript:void(0);" onclick="logout()">Logout</a>
            <a href="/organisation/profile"><i class="fa-solid fa-user"></i></a>
            <a href="/updates/all_update"><i class="fa-solid fa-bell" style="color: #880808;"></i></a>
            `;
            if(button != null) {
                button.onclick = function() { location.href='/organisation/profile'; };
            }
        } else if (this.readyState === 4 && this.status === 202) {
            nav_bar.innerHTML = `
            <a href="/" id="web_title">VolunTeer</a>
            <a href="javascript:void(0);" onclick="logout()">Logout</a>
            <a href="/admins/profile"><i class="fa-solid fa-user"></i></a>
            <a href="/updates/all_update"><i class="fa-solid fa-bell"></i></a>
            `;
            if(button != null) {
                button.onclick = function() { location.href='/admins/profile'; };
            }
        } else if(this.readyState === 4) {
            nav_bar.innerHTML = `
            <a href="/" id="web_title">VolunTeer</a>
            <a href="/login_page">Login</a>
            <a href="/signup_page">Sign up</a>
            <a href="/updates/all_update"><i class="fa-solid fa-bell" style="color: #880808;"></i></a>
            `;
        }
    };
    xhttp.open("GET", "/check_login_status", true);
    xhttp.send();
}

document.addEventListener('DOMContentLoaded', (event) => {
    get_nav_bar();
});