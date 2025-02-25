function login_admin() {
    let logindata = {
        email: document.getElementById('login_email').value,
        password: document.getElementById('login_password').value
    };

    let req = new XMLHttpRequest();

    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            window.location.href = '/';
        } else if (req.readyState == 4 && req.status == 403) {
            alert('No account found');
        } else if (req.readyState == 4) {
            alert('Login FAILED');
        }
    };

    req.open('POST', '/admins/login');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(logindata));
}

function login() {

    let logindata = {
        email: document.getElementById('login_email').value,
        password: document.getElementById('login_password').value
    };

    let req = new XMLHttpRequest();

    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            window.location.href = '/';
        } else if (req.readyState == 4 && req.status == 403) {
            alert('No account found');
        } else if (req.readyState == 4) {
            alert('Login FAILED');
        }
    };

    if (document.getElementById('orgLogin').checked) {
        req.open('POST', '/organisation/login');
    }
    else {
        req.open('POST', '/users/login');
    }
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(logindata));
}

function logout() {
    if (confirm("Are you sure want to log out?") == true) {
        let req = new XMLHttpRequest();

        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) {
                window.location.href = "/";
            } else if (req.readyState === 4 && req.status === 500) {
                alert('Could not log out');
            } else if (req.readyState === 4 && req.status === 403) {
                alert('You are not currently logged in');
            }
        };

        req.open('POST','/logout');
        req.send();
    }
}