function get_admin_info() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const admin_info = JSON.parse(this.responseText);
            let admin_name = document.getElementById("admin_name");
            let admin_email = document.getElementById("admin_email");
            let admin_phone = document.getElementById("admin_phone");

            admin_name.value = admin_info.name;
            admin_email.value = admin_info.email;
            admin_phone.value = admin_info.phone_number;
        }
        else if(this.readyState ==4) {
            window.location.href = "/";
        }
    };
    xhttp.open("GET", window.location.pathname + "/info", true);
    xhttp.send();
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
    get_admin_info();
    isValidNumber();
};

function isValidPhoneNumber(input) {
    var pattern = /^(?:\(\d{3}\)|\d{3})[- ]?\d{3}[- ]?\d{3}$/;
    return pattern.test(input);
}
function isValidEmail(input) {
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(input);
}

function saveAdminInfoChanges() {
    let profileData = {
        name: document.getElementById('admin_name').value,
        email: document.getElementById('admin_email').value,
        phone_number: document.getElementById('admin_phone').value
    };

    for (let key in profileData) {
        if (!profileData[key].trim()) {
          alert(key + ' must not be empty');
          return;
        }
    }

    if(!isValidPhoneNumber(profileData.phone_number)) {
        alert("Invalid phone number");
        return;
    }
    if(!isValidEmail(profileData.email)) {
        alert("Invalid email");
        return;
    }

    let req = new XMLHttpRequest();

    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            alert('Update successfully');
            window.location.href = window.location.pathname;
        } else if (req.readyState == 4) {
            alert('Update FAILED');
        }
    };

    req.open('POST', '/admins/profileChanges');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(profileData));
}

function get_users() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const all_users = JSON.parse(this.responseText);
            let tableBody = document.getElementById("user_data");
            tableBody.style.cursor = 'pointer';

            let user_count = document.getElementById("user-count");
            user_count.innerHTML = '<i class="fa-regular fa-user"></i> ' + all_users.length;

            tableBody.innerHTML = ``;
            for (let i = 0; i < all_users.length; i++) {

                let newRow = document.createElement("tr");

                let id_cell = document.createElement("td");
                id_cell.textContent = all_users[i].user_id;
                let firstname_cell = document.createElement("td");
                firstname_cell.textContent = all_users[i].user_firstname;
                let lastname_cell = document.createElement("td");
                lastname_cell.textContent = all_users[i].user_lastname;
                let phone_cell = document.createElement("td");
                phone_cell.textContent = all_users[i].user_phone;
                let email_cell = document.createElement("td");
                email_cell.textContent = all_users[i].user_email;
                let action_cell = document.createElement("td");
                action_cell.innerHTML = `<i style="color: red; text-align: center" class="fa-solid fa-trash" onclick ="deleteUser('${all_users[i].user_id}')"></i>`;

                id_cell.addEventListener("click", function() {
                    window.location.href = '/users/profile/' + all_users[i].user_id;
                });
                firstname_cell.addEventListener("click", function() {
                    window.location.href = '/users/profile/' + all_users[i].user_id;
                });
                lastname_cell.addEventListener("click", function() {
                    window.location.href = '/users/profile/' + all_users[i].user_id;
                });
                phone_cell.addEventListener("click", function() {
                    window.location.href = '/users/profile/' + all_users[i].user_id;
                });
                email_cell.addEventListener("click", function() {
                    window.location.href = '/users/profile/' + all_users[i].user_id;
                });

                newRow.appendChild(id_cell);
                newRow.appendChild(firstname_cell);
                newRow.appendChild(lastname_cell);
                newRow.appendChild(phone_cell);
                newRow.appendChild(email_cell);
                newRow.appendChild(action_cell);

                tableBody.appendChild(newRow);
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/all_users", true);
    xhttp.send();
}

function get_organisations() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const all_organisations = JSON.parse(this.responseText);
            let tableBody = document.getElementById("organisation_data");
            tableBody.style.cursor = 'pointer';

            let organisation_count = document.getElementById("organisation-count");
            organisation_count.innerHTML = '<i class="fa-regular fa-user"></i> ' + all_organisations.length;

            tableBody.innerHTML = ``;
            for (let i = 0; i < all_organisations.length; i++) {

                let newRow = document.createElement("tr");

                let abn_cell = document.createElement("td");
                abn_cell.textContent = all_organisations[i].abn;
                let name_cell = document.createElement("td");
                name_cell.textContent = all_organisations[i].name;
                let email_cell = document.createElement("td");
                email_cell.textContent = all_organisations[i].email;
                let phone_cell = document.createElement("td");
                phone_cell.textContent = all_organisations[i].phone_number;
                let address_cell = document.createElement("td");
                address_cell.textContent = all_organisations[i].city + " " + all_organisations[i].postcode;
                let action_cell = document.createElement("td");
                action_cell.innerHTML = `<i style="color: red; text-align: center" class="fa-solid fa-trash" onclick ="deleteOrganisation('${all_organisations[i].abn}')"></i>`;

                abn_cell.addEventListener("click", function() {
                    window.location.href = '/organisation/profile/' + all_organisations[i].abn;
                });
                name_cell.addEventListener("click", function() {
                    window.location.href = '/organisation/profile/' + all_organisations[i].abn;
                });
                address_cell.addEventListener("click", function() {
                    window.location.href = '/organisation/profile/' + all_organisations[i].abn;
                });
                phone_cell.addEventListener("click", function() {
                    window.location.href = '/organisation/profile/' + all_organisations[i].abn;
                });
                email_cell.addEventListener("click", function() {
                    window.location.href = '/organisation/profile/' + all_organisations[i].abn;
                });

                newRow.appendChild(abn_cell);
                newRow.appendChild(name_cell);
                newRow.appendChild(email_cell);
                newRow.appendChild(phone_cell);
                newRow.appendChild(address_cell);
                newRow.appendChild(action_cell);

                tableBody.appendChild(newRow);
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/all_organisations", true);
    xhttp.send();
}

function addNewAdmins() {

    let profileData = {
        name: document.getElementById('new_name').value,
        email: document.getElementById('new_email').value,
        phone_number: document.getElementById('new_phone').value,
        password: document.getElementById('new_password').value
    };

    let req = new XMLHttpRequest();

    if(!isValidPhoneNumber(profileData.phone_number)) {
        alert("Invalid phone number");
        return;
    }
    if(!isValidEmail(profileData.email)) {
        alert("Invalid email");
        return;
    }

    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            alert('Successfully added');
            location.reload();
        } else if (req.readyState == 4 && req.status == 409) {
            alert("Email already exists!");
        } else if (req.readyState == 4) {
            alert('Add FAILED');
        }
    };

    req.open('POST', '/admins/newAdminCreate');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(profileData));

}

function get_admin_board() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const admin_board_list = JSON.parse(this.responseText);
            const admin_board = document.getElementById("current_admin_board");

            admin_board.innerHTML = ``;

            for (let i = 0; i < admin_board_list.length; i++){
                const row = document.createElement("tr");

                const nameCell = document.createElement("td");
                nameCell.innerHTML = admin_board_list[i].name;
                row.appendChild(nameCell);


                const emailCell = document.createElement("td");
                emailCell.innerHTML = admin_board_list[i].email;
                row.appendChild(emailCell);

                const phoneCell = document.createElement("td");
                phoneCell.innerHTML = admin_board_list[i].phone_number;
                row.appendChild(phoneCell);

                admin_board.appendChild(row);
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/admin_board", true);
    xhttp.send();
}

function deleteUser(user_id) {
    if (confirm("Do you really want to delete this user?") == true) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                alert('Successfully deleted');
                location.reload();
            } else if (xhttp.readyState == 4) {
                alert('delete failed');
            }
        };
        xhttp.open('POST', '/admins/delete/user', true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({ user_id: user_id }));
    }
    
}

function deleteOrganisation(abn) {
    if (confirm("Do you really want to delete this organisation?") == true) {
        let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert('Successfully deleted');
            location.reload();
        } else if (xhttp.readyState == 4) {
            alert('delete failed');
        }
    };
    xhttp.open('POST', '/admins/delete/organisation', true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({ abn: abn}));
    }
    
}
