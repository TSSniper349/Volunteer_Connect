function get_user_info() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let user_info = JSON.parse(this.responseText);
            let user_firstname = document.getElementById("user_firstname");
            let user_lastname = document.getElementById("user_lastname");
            let user_phone = document.getElementById("user_phone");
            let user_skills = document.getElementById("user_skills");
            let user_experience = document.getElementById("user_experience");
            let profile = document.getElementById("profile_info");

            user_firstname.value = user_info.user_firstname;
            user_lastname.value = user_info.user_lastname;
            user_phone.value = user_info.user_phone;
            user_skills.value = user_info.user_skill;
            user_experience.value = user_info.user_experience;
            if (!document.getElementById("saveChangesButton")) {
                let saveButton = document.createElement("button");
                saveButton.type = "submit";
                saveButton.id = "saveChangesButton";
                saveButton.textContent = "Save Changes";
                saveButton.setAttribute("onclick", `saveUserInfoChanges(${user_info.user_id})`);
                profile.appendChild(saveButton);
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/info", true);
    xhttp.send();
}

window.onload = (event) => {
    get_user_info();
};

function saveUserInfoChanges(user_id) {
    if(confirm('Do you want to update your public information?')){
        let profileData = {
            firstname: document.getElementById('user_firstname').value,
            lastname: document.getElementById('user_lastname').value,
            phone: document.getElementById('user_phone').value,
            skill: document.getElementById('user_skills').value,
            experience: document.getElementById('user_experience').value
        };

        for (let key in profileData - 2) {
            if (!profileData[key].trim()) {
              alert(key + ' must not be empty');
              return;
            }
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

        req.open('POST', '/users/' + user_id + '/profileChanges');
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(profileData));
    }
    else {
        window.location.href = window.location.pathname;
    }
}

function get_user_upcoming_enrolled_events() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const upcoming_enrolled_events_list = JSON.parse(this.responseText);

            const upcoming_events = document.getElementById('upcoming_events');
            upcoming_events.innerHTML=``;

            if (upcoming_enrolled_events_list.length == 0) {
                upcoming_events.innerHTML += `
                <p style="text-align: center;">No upcoming enrolled events!</p>
                ` ;
            } else {
                for (let i = 0; i < upcoming_enrolled_events_list.length; i++) {
                    let start_date = new Date(upcoming_enrolled_events_list[i].event_start_date).toDateString();
                    let end_date = new Date(upcoming_enrolled_events_list[i].event_end_date).toDateString();

                    upcoming_events.innerHTML += `
                        <div class="inner_box">
                        <div class="content">
                        <h3>${upcoming_enrolled_events_list[i].event_title}</h3>
                        <a href="/organisation/page/${upcoming_enrolled_events_list[i].abn}" style="text-decoration: none;"><p>${upcoming_enrolled_events_list[i].name}</p></a>
                        <p><b><i class="fa-solid fa-location-dot" style="margin-right: 0.2rem;"></i>Location:</b> ${upcoming_enrolled_events_list[i].number} ${upcoming_enrolled_events_list[i].street}, ${upcoming_enrolled_events_list[i].city}, ${upcoming_enrolled_events_list[i].state}, ${upcoming_enrolled_events_list[i].postcode} </p>
                        <p><b>Start Date:</b> ${start_date} | <b>End Date:</b> ${end_date}</p>
                        <h3>Description:</h3>
                        <p>${upcoming_enrolled_events_list[i].event_description}</p>
                        <button type="button" onclick="open_panel('shifts_panel'); get_user_upcoming_shifts(${upcoming_enrolled_events_list[i].event_id}); get_user_past_shifts(${upcoming_enrolled_events_list[i].event_id});">View shifts</button>
                        </div>
                        </div>
                        <br>
                    `;
                }
            }

        }
    };
    xhttp.open("GET", window.location.pathname + "/upcoming_enrolled_events", true);
    xhttp.send();
}

function get_user_past_enrolled_events() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const past_enrolled_events_list = JSON.parse(this.responseText);

            const past_events = document.getElementById('past_events');
            past_events.innerHTML=``;

            if (past_enrolled_events_list.length == 0) {
                past_events.innerHTML += `
                <p style="text-align: center;">No past enrolled events!</p>
                ` ;
            } else {

                for (let i = 0; i < past_enrolled_events_list.length; i++) {
                    let start_date = new Date(past_enrolled_events_list[i].event_start_date).toDateString();
                    let end_date = new Date(past_enrolled_events_list[i].event_end_date).toDateString();

                    past_events.innerHTML += `
                        <div class="inner_box">
                        <div class="content">
                        <h3>${past_enrolled_events_list[i].event_title}</h3>
                        <a href="/organisation/page/${past_enrolled_events_list[i].abn}"><p>${past_enrolled_events_list[i].name}</p></a>
                        <h5><i class="fa-solid fa-location-dot" style="margin-right: 0.5rem;"></i>Location: ${past_enrolled_events_list[i].number} ${past_enrolled_events_list[i].street}, ${past_enrolled_events_list[i].city}, ${past_enrolled_events_list[i].state}, ${past_enrolled_events_list[i].postcode} </h5>
                        <h5>Start Date: ${start_date} | End Date: ${end_date}</h5>
                        <h5>Description:</h5>
                        <p>${past_enrolled_events_list[i].event_description}</p>
                        <a href="/"><button type="button">Learn More</button></a>
                        <button type="button" onclick="open_panel('shifts_panel'); get_user_upcoming_shifts(${past_enrolled_events_list[i].event_id}); get_user_past_shifts(${past_enrolled_events_list[i].event_id});">View shifts</button>
                        </div>
                        </div>
                        <br>
                    `;
                }
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/past_enrolled_events", true);
    xhttp.send();
}

function drop_shifts(shift_ID) {
    if(confirm("Are you sure want to drop this shift?")) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert('Successfully dropped');
                location.reload();
            } else if (this.readyState == 4) {
                alert('Drop FAILED');
            }
        };
        xhttp.open("POST", window.location.pathname + "/drop_shifts", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({shift_id: shift_ID}));
    }
}

function get_user_upcoming_shifts(event_id) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const upcoming_shifts_list = JSON.parse(this.responseText);

            const upcoming_shifts = document.getElementById('upcoming_shifts');
            upcoming_shifts.innerHTML=``;

            if (upcoming_shifts_list.length == 0) {
                upcoming_shifts.innerHTML += `
                <p style="text-align: center;">No upcoming shifts!</p>
                ` ;
            } else {
                for (let i = 0; i < upcoming_shifts_list.length; i++) {
                    let date = new Date(upcoming_shifts_list[i].date).toDateString();
                    upcoming_shifts.innerHTML += `
                    <div class="shift">
                        <p class="shift_position">Position: ${upcoming_shifts_list[i].name}</p>
                        <button class="closeBtn" style="background: red;" onclick="drop_shifts('${upcoming_shifts_list[i].shift_id}')";>Drop</button>
                        <p class="shift_date"><i class="far fa-clock"></i> ${upcoming_shifts_list[i].start_time} - ${upcoming_shifts_list[i].end_time}</p>
                        <p class="shift_date"><i class="far fa-calendar"></i> ${date}</p>
                        <p class="shift_description">${upcoming_shifts_list[i].description}</p>
                    </div>
                    `;
                }
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/upcoming_shifts/" + event_id, true);
    xhttp.send();
}

function get_user_past_shifts(event_id) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const past_shifts_list = JSON.parse(this.responseText);

            const past_shifts = document.getElementById('past_shifts');
            past_shifts.innerHTML=``;

            if (past_shifts_list.length == 0) {
                past_shifts.innerHTML += `
                <p style="text-align: center;">No past shifts!</p>
                ` ;
            } else {
                for (let i = 0; i < past_shifts_list.length; i++) {
                    let date = new Date(past_shifts_list[i].date).toDateString();
                    past_shifts.innerHTML += `
                    <div class="shift">
                        <p class="shift_position">Position: ${past_shifts_list[i].name}</p>
                        <p class="shift_date"><i class="far fa-clock"></i> ${past_shifts_list[i].start_time} - ${past_shifts_list[i].end_time}</p>
                        <p class="shift_date"><i class="far fa-calendar"></i> ${date}</p>
                        <p class="shift_description">${past_shifts_list[i].description}</p>
                    </div>
                    `;
                }
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/past_shifts/" + event_id, true);
    xhttp.send();
}


function get_user_joined_organisations() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const joined_organisations_list = JSON.parse(this.responseText);

            const joined_organisations = document.getElementById("joined_organisations");
            joined_organisations.innerHTML = '';
            const list = document.createElement('ul');
            list.style.paddingLeft = "0";

            if (joined_organisations_list.length == 0) {
                joined_organisations.innerHTML += `
                <p style="text-align: center;">It seems you have not joined any organisation yet! Try joining one <a href="/organisation_list">here</a>!</p>
                ` ;
            } else {
                joined_organisations.innerHTML = `<h3 style="color: grey;">Number of joined organisations: ${joined_organisations_list.length}</h3>`;
                for (let i = 0; i < joined_organisations_list.length; i++) {
                    let joined_organisation = document.createElement('li');
                    joined_organisation.classList.add("organisation");
                    let dateTime = new Date(joined_organisations_list[i].joined_date).toDateString();

                    var xhttp1 = new XMLHttpRequest();
                    xhttp1.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            let num_events = JSON.parse(this.responseText);
                            let num_events_completed = num_events["COUNT(ea.application_id)"];
                            joined_organisation.innerHTML = `
                            <div class="organisation_details">
                                <a href="/organisation/page/${joined_organisations_list[i].abn}" style="text-decoration: none; color: #0047AB;"><h1 class="organisation_name">${joined_organisations_list[i].name}</h1></a>
                                <p><b>Joined on</b>: ${dateTime}</p>
                                <p><b>Number of shifts completed</b>: ${num_events_completed}</p>
                            </div>
                        `;
                        }
                    };
                    xhttp1.open("GET", window.location.pathname + "/joined_organisations/" + joined_organisations_list[i].abn + "/num_events_completed", true);
                    xhttp1.send();

                    list.appendChild(joined_organisation);
                }
                joined_organisations.appendChild(list);
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/joined_organisations", true);
    xhttp.send();
}

function get_user_updates() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const updates_list = JSON.parse(this.responseText);

            const updates = document.getElementById("updates");
            updates.innerHTML = '';

            if (updates_list.length == 0) {
                updates.innerHTML += `
                <p style="text-align: center;">No updates so far!</p>
                ` ;
            } else {

                for (let i = 0; i < updates_list.length; i++) {
                    let isPublic = updates_list[i].isPublic.data[0] === 1;
                    let icon = isPublic ? 'fa-earth-americas' : 'fa-lock';
                    updates.innerHTML += `
                    <div class="update-box">
                        <a href="/organisation/${updates_list[i].abn}/update_page/${updates_list[i].update_id}" style="text-decoration: none; color: #AA4A44;"><h2>${updates_list[i].update_title}&nbsp<i class="fa-solid ${icon}" style="color:#36454F;"></i></h2></a>
                        <div class="update-info">
                            <span style="color: grey;">From ${updates_list[i].name}</span>
                            <span><b>Posted on:</b> ${new Date(updates_list[i].update_date_posted).toDateString()}</span>
                        </div>
                    </div>
                    `;
                }
        }
        }
    };
    xhttp.open("GET", window.location.pathname + "/updates", true);
    xhttp.send();
}
