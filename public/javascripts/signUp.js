function isValidPhoneNumber(input) {
    var pattern = /^(?:\(\d{3}\)|\d{3})[- ]?\d{3}[- ]?\d{3}$/;
    return pattern.test(input);
}
function isValidEmail(input) {
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(input);
}
function isValidNumber() {
    var inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(function(input) {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });
}
window.onload = (event) => {
    isValidNumber();
};

function userSignup() {

    let logindata = {
        firstname: document.getElementById('user_firstname').value,
        lastname: document.getElementById('user_lastname').value,
        phone: document.getElementById('user_phone').value,
        email: document.getElementById('user_email').value,
        password: document.getElementById('user_password').value
    };

    for (let key in logindata) {
        if (!logindata[key].trim()) {
          alert(key + ' must not be empty');
          return;
        }
    }

    if(!isValidPhoneNumber(logindata.phone)) {
        alert("Please enter a valid phone number");
        return;
    }
    if(!isValidEmail(logindata.email)) {
        alert("Please enter a valid email");
        return;
    }

    if(logindata.password !== document.getElementById('user_confirmPassword').value){
        alert("Passwords don't match");
        return;
    }

    let req = new XMLHttpRequest();

    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            window.location.href = '/';
        } else if(req.readyState == 4 && req.status == 401){
            alert('Signed Up FAILED');
        } else if(req.readyState == 4 && req.status == 400){
            alert('Email already exists');
        }
    };

    req.open('POST','/users/signup');
    req.setRequestHeader('Content-Type','application/json');
    req.send(JSON.stringify(logindata));
}

function organisationSignup() {
    let logindata = {
        firstname: document.getElementById('user_firstname').value,
        lastname: document.getElementById('user_lastname').value,
        phone: document.getElementById('user_phone').value,
        email: document.getElementById('user_email').value,
        password: document.getElementById('user_password').value,
        orgName: document.getElementById('org_name').value,
        orgABN: document.getElementById('org_abn').value,
        orgDescription: document.getElementById('org_description').value
    };

    let orgAddress = {
        Number: document.getElementById('org_address_number').value,
        Street: document.getElementById('org_address_street').value,
        City: document.getElementById('org_address_city').value,
        State: document.getElementById('org_address_state').value,
        Postcode: document.getElementById('org_address_postcode').value
    };

    for (let key in logindata) {
        if (!logindata[key].trim()) {
          alert(key + ' must not be empty');
          return;
        }
    }

    if(!isValidPhoneNumber(logindata.phone)) {
        alert("Please enter valid phone number");
        return;
    }

    if(logindata.password !== document.getElementById('user_confirmPassword').value){
        alert("Passwords don't match");
        return;
    }

    for (let key in orgAddress) {
        if (!orgAddress[key].trim()) {
          alert(key + ' must not be empty');
          return;
        }
    }

    let orgServices = [];
    let services = document.querySelectorAll(".checked");
    for(let i of services) {
        orgServices.push(i.id);
    }
    if(orgServices.length == 0) {
        alert("Please choose at least one type of services!");
        return;
    }

    let req = new XMLHttpRequest();

    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            window.location.href = '/';
        } else if(req.readyState == 4 && req.status == 401){
            alert('Signed Up FAILED');
        } else if(req.readyState ==4 && req.status ==400) {
            alert('An account already exists with these details');
        }
    };

    req.open('POST','/organisation/signup');
    req.setRequestHeader('Content-Type','application/json');
    req.send(JSON.stringify({logindata: logindata, orgServices: orgServices, orgAddress: orgAddress}));
}

function signUp() {

    let termsAccepted = document.getElementById('remember').checked;
    if (!termsAccepted) {
        alert('You must accept the Terms of Use & Privacy Policy');
        return;
    }
    if(document.getElementById("orgRegis").checked) {
        organisationSignup();
    }
    else {
        userSignup();
    }
}

function revealForm() {
    const checkBox = document.getElementById("orgRegis");
    const regisForm = document.getElementById("org-regis-form");

    if (checkBox.checked === true) {
        regisForm.style.display = "block";
    } else {
        regisForm.style.display = "none";
    }

    get_list_of_services();
    const selectBtn = document.querySelector(".select-btn");
    selectBtn.addEventListener("click", () => {
        selectBtn.classList.toggle("open");
    });
}

function get_list_of_services() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            const services_list = document.getElementsByClassName("list-items")[0];
            services_list.innerHTML = "";
            let services = JSON.parse(this.response);
            for(let i of services) {
                services_list.innerHTML += `
                <li class="item" id="${i.service_id}">
                    <span class="checkbox">
                    <i class="fa-solid fa-check check-icon"></i>
                    </span>
                    <span class="item-text">${i.name}</span>
                </li>
                `;
            }

            const items = document.querySelectorAll(".item");
            items.forEach(item => {
                item.addEventListener("click", () => {
                item.classList.toggle("checked");

                let checked = document.querySelectorAll(".checked"),
                    btnText = document.querySelector(".btn-text");

                if (checked && checked.length > 0) {
                    btnText.innerText = `${checked.length} Selected`;
                } else {
                    btnText.innerText = "Select Services";
                }
                });
            });
        } else if(req.readyState == 4){
            alert('FAILED to get services list');
        }
    };

    req.open('GET','/get_list_of_services');
    req.send();
}