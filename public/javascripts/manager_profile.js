function get_organisation_info() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const organisation_info = JSON.parse(this.responseText);

            let org_firstname = document.getElementById("org_firstname");
            let org_lastname = document.getElementById("org_lastname");
            let org_name = document.getElementById("org_name");
            let org_phone = document.getElementById("org_phone");
            let org_address_number = document.getElementById("org_address_number");
            let org_address_street = document.getElementById("org_address_street");
            let org_address_city = document.getElementById("org_address_city");
            let org_address_state = document.getElementById("org_address_state");
            let org_address_postcode = document.getElementById("org_address_postcode");
            let org_description = document.getElementById("org_description");
            let profile = document.getElementById("organisation_details");

            org_firstname.value = organisation_info[0].manager_firstname;
            org_lastname.value = organisation_info[0].manager_lastname;
            org_name.value = organisation_info[0].name;
            org_phone.value = organisation_info[0].phone_number;
            org_address_number.value = organisation_info[0].number;
            org_address_street.value = organisation_info[0].street;
            org_address_city.value = organisation_info[0].city;
            org_address_state.value = organisation_info[0].state;
            org_address_postcode.value = organisation_info[0].postcode;
            org_description.value = organisation_info[0].description;
            if (!document.getElementById("saveChangesButton")) {
                let saveButton = document.createElement("button");
                saveButton.type = "submit";
                saveButton.id = "saveChangesButton";
                saveButton.textContent = "Save Changes";
                saveButton.setAttribute("onclick", `saveInfoChanges(${organisation_info[0].abn})`);
                profile.appendChild(saveButton);
            }
        }
        else if(this.readyState==4) {
            window.location.href = "/";
        }
    };
    xhttp.open("GET", window.location.pathname + "/info", true);
    xhttp.send();
}

function get_organisation_services() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            let services = JSON.parse(this.response);

            for(let i of services) {
                let item = document.getElementById("service_" + i.service_id);
                item.checked = true;
            }

        } else if(req.readyState == 4){
            alert('FAILED to get services');
        }
    };

    let pathSegments = window.location.pathname.split('/');
    let org_abn = pathSegments[pathSegments.length - 1];
    req.open('GET','/organisation/page/' + org_abn + '/services');
    req.send();
}

function get_list_of_services() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            const services_list = document.getElementById("servicesList");
            services_list.innerHTML = "";
            let services = JSON.parse(this.response);

            for(let i in services) {
                let label = document.createElement("label");
                label.setAttribute("for", `service_${services[i].service_id}`);
                label.classList.add("service_label");

                let input = document.createElement("input");
                input.classList.add("service_item");
                input.type = "checkbox";
                input.id = `service_${services[i].service_id}`;
                label.appendChild(input);
                label.appendChild(document.createTextNode(services[i].name));
                services_list.appendChild(label);
            }
            get_organisation_services();
        } else if(req.readyState == 4){
            alert('FAILED to get services list');
        }
    };

    req.open('GET','/get_list_of_services');
    req.send();
}

let positionList = {};
function get_list_of_positions() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            let positions = JSON.parse(this.response);

            for(let i in positions) {
                positionList[i] = {};
                positionList[i].id = positions[i].position_id;
                positionList[i].name = positions[i].name;
            }
        } else if(req.readyState == 4){
            alert('FAILED to get position list');
        }
    };

    req.open('GET','/get_list_of_positions');
    req.send();
}

function dateValid() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    let dateInputs = document.getElementsByClassName("dateInput");
    for(let i = 0; i < dateInputs.length; i++) {
        dateInputs[i].setAttribute("min", today);
    }
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
    get_organisation_info();
    get_list_of_services();
    get_list_of_positions();
    dateValid();
    isValidNumber();
};

function isValidPhoneNumber(input) {
    var pattern = /^(?:\(\d{3}\)|\d{3})[- ]?\d{3}[- ]?\d{3}$/;
    return pattern.test(input);
}

function saveInfoChanges(org_abn) {
    if(confirm('Do you want to update your public information?') == true) {
        let profileData = {
            firstname: document.getElementById('org_firstname').value,
            lastname: document.getElementById('org_lastname').value,
            phone: document.getElementById('org_phone').value,
            orgName: document.getElementById('org_name').value,
            orgDescription: document.getElementById('org_description').value
        };

        for (let key in profileData) {
            if (!profileData[key].trim()) {
              alert(key + ' must not be empty');
              return;
            }
        }

        if(!isValidPhoneNumber(profileData.phone)) {
            alert("Invalid phone number");
            return;
        }

        let orgAddress = {
            number: document.getElementById('org_address_number').value,
            street: document.getElementById('org_address_street').value,
            city: document.getElementById('org_address_city').value,
            state: document.getElementById('org_address_state').value,
            postcode: document.getElementById('org_address_postcode').value,
        };

        for (let key in orgAddress) {
            if (!orgAddress[key].trim()) {
              alert(key + ' must not be empty');
              return;
            }
        }

        let orgServices = [];
        let services = document.getElementsByClassName("service_label");
        for(let i of services) {
            if(i.getElementsByTagName("input")[0].checked == true)
            orgServices.push(i.textContent);
        }
        if(orgServices.length == 0) {
            alert("Please choose at least one type of services");
            return;
        }

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                alert('Update successfully');
                window.location.href = window.location.pathname;
            } else if (xhttp.readyState == 4) {
                alert('Update FAILED');
            }
        };
        xhttp.open("POST", '/organisation/' + org_abn + '/profileChanges', true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify({profileData: profileData, orgAddress: orgAddress, orgServices: orgServices}));
    }
    else {
        window.location.href = window.location.pathname;
    }
}
function get2ndClassName(element) {
    return element.classList[1] || null;
}

function modifyEvents(event_id) {
    if(confirm('Do you want to modify your event information?') == true) {
        let eventData = {
            title: document.getElementById("modifying_event_title").value,
            start_date: document.getElementById("modifying_event_start_date").value,
            end_date: document.getElementById("modifying_event_end_date").value,
            description: document.getElementById("modifying_event_description").value,
        };

        for (let key in eventData) {
            if (!eventData[key].trim()) {
              alert(key + ' must not be empty');
              return;
            }
        }

        let today = new Date();
        today.setHours(0,0,0,0);
        if (new Date(eventData.start_date) < today) {
            alert("Invalid Event Start Date");
            return;
        }

        if (new Date(eventData.start_date) > new Date(eventData.end_date)) {
            alert("The end date for the event should be later than the start date");
            return;
        }

        let eventLocation = {
            number: document.getElementById("modifying_event_location_number").value,
            street: document.getElementById("modifying_event_location_street").value,
            city: document.getElementById("modifying_event_location_city").value,
            state: document.getElementById("modifying_event_location_state").value,
            postcode: document.getElementById("modifying_event_location_postcode").value
        };

        for (let key in eventLocation) {
            if (!eventLocation[key].trim()) {
              alert(key + ' must not be empty');
              return;
            }
        }

        let shiftData = {};
        let shift_item = document.getElementsByClassName("shift-item");
        if(shift_item.length == 0) {
            alert("Please add at least one shift");
            return;
        }
        for(let i = 0; i < shift_item.length; i++) {
            shiftData[i] = {};
            let date = shift_item[i].getElementsByClassName("shift_date")[0];
            if (!date.value.trim()) {
                alert("Please enter a valid date each shift");
                return;
            }
            let startDate = new Date(date.value);
            let today = new Date();
            today.setHours(0,0,0,0);
            if (startDate < new Date(eventData.start_date)) {
                alert("Invalid Shift Date");
                return;
            }
            shiftData[i].date = date.value;

            let start_time = shift_item[i].getElementsByClassName("shift_start_time")[0];
            if (start_time.value === "") {
                alert("Please enter a start time each shift");
                return;
            }
            let end_time = shift_item[i].getElementsByClassName("shift_end_time")[0];
            if (end_time.value === "") {
                alert("Please enter an end time for each shift");
                return;
            }
            if (start_time.value >= end_time.value) {
                alert("The end time for each shift should be later than the start time");
                return;
            }
            shiftData[i].start_time = start_time.value;
            shiftData[i].end_time = end_time.value;

            shiftData[i].description = shift_item[i].getElementsByClassName("shift_description")[0].value;
            let position_item = shift_item[i].getElementsByClassName("position-item");
            if(position_item.length == 0) {
                alert("Please add at least one position for each shift");
                return;
            }
            shiftData[i].shift_id = get2ndClassName(shift_item[i]);
            shiftData[i].position_list = [];
            for(let j = 0; j < position_item.length; j++) {
                let position_name = position_item[j].getElementsByClassName("position_name")[0];
                let num_people = position_item[j].getElementsByClassName("num_people")[0];
                if (position_name.value == "") {
                    alert("Please select a position name for each shift");
                    return;
                }
                if (num_people.value <= 0) {
                    alert("Please enter a valid number of volunteer needed for each shift");
                    return;
                }
                let position = {
                    id: position_name.value,
                    num_people: num_people.value,
                    status: get2ndClassName(position_name),
                };
                shiftData[i].position_list.push(position);
            }
        }

        let req = new XMLHttpRequest();

        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                alert('Successfully modified');
                location.reload();
            } else if (req.readyState == 4) {
                alert('Modifying FAILED');
            }
        };

        req.open('POST', window.location.pathname + "/" + event_id + "/modifyEvent");
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify({eventData: eventData, shiftData: shiftData, eventLocation: eventLocation}));
    }
    else {
        window.location.href = window.location.pathname;
    }
}

function get_organisation_upcoming_events(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            const events_list = JSON.parse(this.responseText);

            const upcoming_events = document.getElementById("upcoming_events");
            upcoming_events.innerHTML = ``;

            if (events_list.length == 0) {
                upcoming_events.innerHTML += `
                <p style="text-align: center;">No upcoming events!</p>
                `;
            } else {

            for (let i = 0; i < events_list.length; i++) {

                upcoming_events.innerHTML += `
                <div class="inner_box">
                <div class="content">
                    <h3>${events_list[i].event_title}</h3>
                    <p><b><i class="fa-solid fa-location-dot" style="margin-right: 0.2rem;"></i>Location:</b> ${events_list[i].number} ${events_list[i].street}, ${events_list[i].city}, ${events_list[i].state}, ${events_list[i].postcode} </p>
                    <p><b>Start Date:</b> ${new Date(events_list[i].event_start_date).toDateString()} | <b>End Date:</b> ${new Date(events_list[i].event_end_date).toDateString()}</p>
                    <h3>Description:</h3>
                    <p>${events_list[i].event_description}</p>
                    <button type="button" onclick="open_panel('shifts_panel') ; get_upcoming_shifts(${events_list[i].event_id}); get_past_shifts(${events_list[i].event_id});">View Shifts</button>
                    <button type="button" onclick="open_panel('modifying_events_panel'); get_modifying_event_info(${events_list[i].event_id}); get_modifying_event_shifts(${events_list[i].event_id})">Modify</button>
                </div>
                </div>
                <br>
                `;

            }
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/upcoming_events", true);
    xhttp.send();
}

function get_organisation_past_events(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            const events_list = JSON.parse(this.responseText);

            const past_events = document.getElementById("past_events");
            past_events.innerHTML = ``;

            if (events_list.length == 0) {
                past_events.innerHTML += `
                <p style="text-align: center;">No past events!</p>
                `;
            } else {

            for (let i = 0; i < events_list.length; i++) {

                past_events.innerHTML += `
                <div class="inner_box">
                <div class="content">
                    <h3>${events_list[i].event_title}</h3>
                    <p><b><i class="fa-solid fa-location-dot" style="margin-right: 0.2rem;"></i>Location:</b> ${events_list[i].number} ${events_list[i].street}, ${events_list[i].city}, ${events_list[i].state}, ${events_list[i].postcode} </p>
                    <p><b>Start Date:</b> ${new Date(events_list[i].event_start_date).toDateString()} | <b>End Date:</b> ${new Date(events_list[i].event_end_date).toDateString()}</p>
                    <h3>Description:</h3>
                    <p>${events_list[i].event_description}</p>
                    <button type="button" onclick="open_panel('shifts_panel') ; get_upcoming_shifts(${events_list[i].event_id}); get_past_shifts(${events_list[i].event_id});">View Shifts</button>
                </div>
                </div>
                <br>
                `;
            }
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/past_events", true);
    xhttp.send();
}

function get_upcoming_shifts(event_id){
    var xhttp1 = new XMLHttpRequest();
    xhttp1.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            const shifts = JSON.parse(this.response);

            const upcoming_shifts = document.getElementById("upcoming_shifts");
            upcoming_shifts.innerHTML = ``;

            if (shifts.length == 0) {
                upcoming_shifts.innerHTML += `
                <p style="text-align: center;">No upcoming shifts!</p>
                `;
            } else {

                for (let i = 0; i < shifts.length; i++) {
                    var xhttp2 = new XMLHttpRequest();
                    xhttp2.onreadystatechange = function(){
                        if (this.readyState == 4 && this.status == 200) {
                            let num_people = JSON.parse(this.response);
                            let count = num_people["COUNT(application_id)"];
                            let shift_box = document.createElement('div');
                            let date = new Date(shifts[i].date).toDateString();
                            shift_box.classList.add("shift_box");
                            shift_box.style.cursor = 'pointer';

                            var xhttp3 = new XMLHttpRequest();
                            xhttp3.onreadystatechange = function() {
                                if (this.readyState == 4 && this.status == 200) {
                                    let people = JSON.parse(this.responseText);
                                    let total_people = people["SUM(num_people)"];
                                    shift_box.innerHTML = `
                                    <p id="shift_date"><b>Date: </b>${date}</p>
                                    <p id="shift_time"><b>Time: </b>${shifts[i].start_time} - ${shifts[i].end_time}</p>
                                    <p id="shift_people"><i class="fa-regular fa-user"></i> ${count}/${total_people}</p>
                                    `;

                                }
                            };
                            xhttp3.open("GET", window.location.pathname + "/shifts/" + shifts[i].shift_id + "/total_people", true);
                            xhttp3.send();

                            shift_box.addEventListener("click", function() {
                                close_panel('shifts_panel');
                                open_panel('shift_panel');
                                get_shift_positions(shifts[i].shift_id);
                            });

                            upcoming_shifts.appendChild(shift_box);
                        }
                    };
                    xhttp2.open("GET", window.location.pathname + "/shifts/" + shifts[i].shift_id, true);
                    xhttp2.send();
                }
            }
        }
    };
    xhttp1.open("GET", window.location.pathname + "/" + event_id + "/upcoming_shifts" , true);
    xhttp1.send();
}

function get_past_shifts(event_id){
    var xhttp1 = new XMLHttpRequest();
    xhttp1.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            const shifts = JSON.parse(this.response);

            const past_shifts = document.getElementById("past_shifts");
            past_shifts.innerHTML = ``;

            if (shifts.length == 0) {
                past_shifts.innerHTML += `
                <p style="text-align: center;">No past shifts!</p>
                `;
            } else {

                for (let i = 0; i < shifts.length; i++) {
                    var xhttp2 = new XMLHttpRequest();
                    xhttp2.onreadystatechange = function(){
                        if (this.readyState == 4 && this.status == 200) {
                            let num_people = JSON.parse(this.response);
                            let count = num_people["COUNT(application_id)"];
                            let shift_box = document.createElement('div');
                            shift_box.classList.add("shift_box");
                            shift_box.style.cursor = 'pointer';

                            var xhttp3 = new XMLHttpRequest();
                            xhttp3.onreadystatechange = function() {
                                if (this.readyState == 4 && this.status == 200) {
                                    let people = JSON.parse(this.responseText);
                                    let total_people = people["SUM(num_people)"];
                                    shift_box.innerHTML = `
                                    <p id="shift_date"><b>Date: </b>${new Date(shifts[i].date).toDateString()}</p>
                                    <p id="shift_time"><b>Time: </b>${shifts[i].start_time} - ${shifts[i].end_time}</p>
                                    <p id="shift_people"><i class="fa-regular fa-user"></i> ${count}/${total_people}</p>
                                    `;

                                }
                            };
                            xhttp3.open("GET", window.location.pathname + "/shifts/" + shifts[i].shift_id + "/total_people", true);
                            xhttp3.send();

                            shift_box.addEventListener("click", function() {
                                close_panel('shifts_panel');
                                open_panel('shift_panel');
                                get_shift_positions(shifts[i].shift_id);
                            });

                            past_shifts.appendChild(shift_box);

                        }
                    };
                    xhttp2.open("GET", window.location.pathname + "/shifts/" + shifts[i].shift_id, true);
                    xhttp2.send();
                }
            }
        }
    };
    xhttp1.open("GET", window.location.pathname + "/" + event_id + "/past_shifts", true);
    xhttp1.send();
}

function get_shift_positions(shift_id){
    var xhttp1 = new XMLHttpRequest();
    xhttp1.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            const positions_list = JSON.parse(this.response);

            const positions = document.getElementById("shift_panel");
            positions.innerHTML = `
            <span style="color: gray; cursor: pointer; margin-bottom: 0.5rem;" onclick="close_panel('shift_panel'); open_panel('shifts_panel')"><i class="fa-solid fa-arrow-left fa-2xl"></i></span>
            `;
            if (positions_list.length == 0) {
                positions.innerHTML += `
                <p style="text-align: center;">No positions!</p>
                `;
            } else {
                for (let i = 0; i < positions_list.length; i++) {
                    positions.innerHTML += `
                    <div class="positions" style="margin-top: 2rem;">
                    <h3 class="member_table_name"> ${positions_list[i].name} </h3>
                    <h3 id="${positions_list[i].name} count"style="float: right; color: gray;"></h3>
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                            </tr>
                        </thead>
                        <tbody id="${positions_list[i].name} data"></tbody>
                    </table>
                    </div>
                    `;

                    var xhttp2 = new XMLHttpRequest();
                    xhttp2.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                        const people_list = JSON.parse(this.responseText);

                        const people_in_position = document.getElementById(positions_list[i].name + " data");
                        people_in_position.style.cursor = 'pointer';
                        let people_in_position_count = document.getElementById(positions_list[i].name + " count");
                        people_in_position_count.innerHTML = '<i class="fa-regular fa-user"></i> ' + people_list.length + '/' + positions_list[i].num_people;

                            people_in_position.innerHTML = ``;

                            for (let j = 0; j < people_list.length; j++) {
                                const row = document.createElement("tr");
                                // row.addEventListener("click", function() {
                                // location.href='profile.html';
                                // });

                                const firstNameCell = document.createElement("td");
                                firstNameCell.innerText = people_list[j].user_firstname;
                                row.appendChild(firstNameCell);

                                const lastNameCell = document.createElement("td");
                                lastNameCell.innerText = people_list[j].user_lastname;
                                row.appendChild(lastNameCell);

                                const emailCell = document.createElement("td");
                                emailCell.innerText = people_list[j].user_email;
                                row.appendChild(emailCell);

                                const phoneCell = document.createElement("td");
                                phoneCell.innerText = people_list[j].user_phone;
                                row.appendChild(phoneCell);

                                people_in_position.appendChild(row);
                            }
                        }
                    };
                    xhttp2.open("GET", window.location.pathname + "/shifts/" + shift_id + "/positions/" + positions_list[i].position_id, true);
                    xhttp2.send();
                }
            }
        }
    };
    xhttp1.open("GET", window.location.pathname + "/shifts/" + shift_id + "/positions", true);
    xhttp1.send();
}

function get_total_shift_people(shift_id, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const people = JSON.parse(this.responseText);
            let total_people = people["SUM(num_people)"];
            callback(total_people);
        }
    };
    xhttp.open("GET", window.location.pathname + "/shifts/" + shift_id + "/total_people", true);
    xhttp.send();
}

function get_organisation_updates() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const updates_list = JSON.parse(this.responseText);

            const box_item_element = document.getElementById("updates_list");
            box_item_element.innerHTML = ``;

            if (updates_list.length == 0) {
                box_item_element.innerHTML += `
                <p style="text-align: center;">No updates so far!</p>
                `;
            } else {
                for(let i = 0; i < updates_list.length; i++) {
                    let isPublic = updates_list[i].isPublic.data[0] === 1;
                    let icon = isPublic ? 'fa-earth-americas' : 'fa-lock';
                    box_item_element.innerHTML += `
                    <hr style="border-color: #f0f0f0;">
                    <div class="update-box">
                        <h2><a style="color: grey;" href="/organisation/${updates_list[i].abn}/update_page/${updates_list[i].update_id}">${updates_list[i].update_title}</a>&nbsp<i class="fa-solid ${icon}" style="color:#36454F;"></i></h2>
                        <span><b>Posted on:</b> ${new Date(updates_list[i].update_date_posted).toDateString()}</span>
                        <p class="update-description">
                        ${updates_list[i].update_description}
                        </p>
                    </div>
                    `;
                }
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/updates", true);
    xhttp.send();
}

function addNewUpdates() {
    var is_public;
    if (document.getElementById("Public").checked == true) {
        is_public = 1;
    } else {
        is_public = 0;
    }
    let updateData = {
        title: document.getElementById("update_title").value,
        description: document.getElementById("update_description").value,
        isPublic: is_public
    };

    if (!updateData.title.trim() || !updateData.description.trim()) {
        alert("Invalid input");
        return;
    }

    let req = new XMLHttpRequest();

    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            alert('Successfully added');
            location.reload();
        } else if (req.readyState == 4) {
            alert('Adding FAILED');
        }
    };

    req.open('POST', window.location.pathname + "/newUpdate");
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(updateData));
}

function deleteShiftPosition(position_item) {
    let element = document.getElementById(position_item);
    if (element) {
        element.remove();
    }
}

let ShiftPositionCount = 0;
function addShiftPosition(shift_item) {
    let position_list = document.getElementById(shift_item).querySelector(".shift_position");
    if(position_list) {
        let positions_select = document.createElement("select");
        positions_select.classList.add("position_name");
        for(let i in positionList) {
            positions_select.innerHTML += `<option value="${positionList[i].id}">${positionList[i].name}</option>`;
        }
        positions_select.innerHTML += `<option value="" disabled selected>Nothing Selected</option>`;

        let position = document.createElement("div");
        position.classList.add("position-item");
        position.id = "position-item-" + ShiftPositionCount++;
        position.style.border = "1px solid black";
        position.style.padding = "1rem";
        position.style.marginBottom = "0.5rem";
        position.style.borderRadius = "0.5rem";
        position.appendChild(positions_select);
        position.innerHTML += `
        <label style="display: inline-block">Number of Volunteer:</label>
        <input type="number" min="1" style="width: fit-content; padding: 5px;" class="num_people" required>
        <i style="display: inline-block;cursor: pointer; float: right;" class="fa-solid fa-trash" onclick="deleteShiftPosition('${position.id}')"></i>
        <br>
        `;
        position_list.appendChild(position);
    }
}

function deleteEventShift(shift_item) {
    let element = document.getElementById(shift_item);
    if (element) {
        element.remove();
    }
}

let shiftCounter = 0;
function addEventShift(list) {
    let shift_list = document.getElementById(list);
    let shift = document.createElement("div");
    shift.classList.add("shift-item");
    shift.id = "shift-item-" + shiftCounter++;
    shift.style.border = "1px solid black";
    shift.style.padding = "1rem";
    shift.style.marginBottom = "0.5rem";
    shift.style.borderRadius = "0.5rem";
    shift.innerHTML = `
        <label style="display: inline-block">Date:</label>
        <input type="date" class="dateInput shift_date" style="display: inline-block" required>
        <label style="display: inline-block">Start Time:</label>
        <input type="time" style="display: inline-block" class="shift_start_time" required>
        <label style="display: inline-block">End Time:</label>
        <input type="time" style="display: inline-block" class="shift_end_time" required>
        <i style="display: inline-block;cursor: pointer; float: right;" class="fa-solid fa-trash" onclick="deleteEventShift('${shift.id}')"></i>
        <input type="text" class="shift_description" placeholder="Shift description (optional)" required>
        <label>Positions:</label>
        <div class="shift_position"></div>
        <i class="fa-solid fa-plus" onclick="addShiftPosition('${shift.id}')" style="cursor: pointer;"></i>
    `;
    shift_list.appendChild(shift);
    dateValid();
}

function addNewEvents() {
    let eventData = {
        title: document.getElementById("event_title").value,
        start_date: document.getElementById("event_start_date").value,
        end_date: document.getElementById("event_end_date").value,
        description: document.getElementById("event_description").value,
    };

    for (let key in eventData) {
        if (!eventData[key].trim()) {
          alert(key + ' must not be empty');
          return;
        }
    }

    let today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(eventData.start_date) < today) {
        alert("Invalid Event Start Date");
        return;
    }

    if (new Date(eventData.start_date) > new Date(eventData.end_date)) {
        alert("The end date for the event should be later than the start date");
        return;
    }

    let eventLocation = {
        number: document.getElementById("event_location_number").value,
        street: document.getElementById("event_location_street").value,
        city: document.getElementById("event_location_city").value,
        state: document.getElementById("event_location_state").value,
        postcode: document.getElementById("event_location_postcode").value
    };

    for (let key in eventLocation) {
        if (!eventLocation[key].trim()) {
          alert(key + ' must not be empty');
          return;
        }
    }

    let shiftData = {};
    let shift_item = document.getElementsByClassName("shift-item");
    if(shift_item.length == 0) {
        alert("Please add at least one shift");
        return;
    }
    for(let i = 0; i < shift_item.length; i++) {
        shiftData[i] = {};
        let date = shift_item[i].getElementsByClassName("shift_date")[0];
        if (!date.value.trim()) {
            alert("Please enter a valid date each shift");
            return;
        }
        let startDate = new Date(date.value);
        let today = new Date();
        today.setHours(0,0,0,0);
        if (startDate < new Date(eventData.start_date) || startDate > new Date(eventData.end_date)) {
            alert("Invalid Shift Date");
            return;
        }
        shiftData[i].date = date.value;

        let start_time = shift_item[i].getElementsByClassName("shift_start_time")[0];
        if (start_time.value === "") {
            alert("Please enter a start time each shift");
            return;
        }
        let end_time = shift_item[i].getElementsByClassName("shift_end_time")[0];
        if (end_time.value === "") {
            alert("Please enter an end time for each shift");
            return;
        }
        if (start_time.value >= end_time.value) {
            alert("The end time for each shift should be later than the start time");
            return;
        }
        shiftData[i].start_time = start_time.value;
        shiftData[i].end_time = end_time.value;

        shiftData[i].description = shift_item[i].getElementsByClassName("shift_description")[0].value;
        let position_item = shift_item[i].getElementsByClassName("position-item");
        if(position_item.length == 0) {
            alert("Please add at least one position for each shift");
            return;
        }
        shiftData[i].position_list = [];
        for(let j = 0; j < position_item.length; j++) {
            let position_name = position_item[j].getElementsByClassName("position_name")[0];
            let num_people = position_item[j].getElementsByClassName("num_people")[0];
            if (position_name.value == "") {
                alert("Please select a position name for each shift");
                return;
            }
            if (num_people.value <= 0) {
                alert("Please enter a valid number of volunteer needed for each shift");
                return;
            }
            let position = {
                id: position_name.value,
                num_people: num_people.value
            };

            let existingPosition = shiftData[i].position_list.find(pos => pos.id === position.id);
            if (!existingPosition) {
                shiftData[i].position_list.push(position);
            } else {
                alert('Conflicting positions');
                return;
            }
        }
    }

    let req = new XMLHttpRequest();

    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            alert('Successfully added');
            location.reload();
        } else if (req.readyState == 4) {
            alert('Adding FAILED');
        }
    };

    req.open('POST', window.location.pathname + "/newEvent");
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify({eventData: eventData, shiftData: shiftData, eventLocation: eventLocation}));
}

function get_modifying_event_info(event_id) {
    let panel = document.getElementById("modifying_events_panel");
    panel.innerHTML = `
    <label for="title">Event Title:</label>
    <input type="text" id="modifying_event_title" name="title" placeholder="Event Title" required>

    <label for="start_date">Start date:</label>
    <input type="date" class="dateInput" id="modifying_event_start_date" name="start_date" required>

    <label for="end_date">End date:</label>
    <input type="date" class="dateInput" id="modifying_event_end_date" name="end_date" required>
    <br>
    <label for="location_number">Address Number:</label>
    <input type="text" id="modifying_event_location_number" name="location_number" placeholder="Enter the address number" required>
    <label type="text" for="location_street">Street:</label>
    <input type="text" id="modifying_event_location_street" name="location_street" placeholder="Enter the street" required>
    <label type="text" for="location_city">City:</label>
    <input type="text" id="modifying_event_location_city" name="location_city" placeholder="Enter the city" required>
    <label type="text" for="location_state">State:</label>
    <input type="text" id="modifying_event_location_state" name="location_state" placeholder="Enter the state" required>
    <label type="text" for="location_postcode">Postcode:</label>
    <input type="text" id="modifying_event_location_postcode" name="location_postcode" placeholder="Enter the postcode" required>

    <label for="description">Description:</label>
    <textarea id="modifying_event_description" name="description" placeholder="Describe your event" required></textarea>

    <label>Shifts:</label>
    <div id="modifying_shift_list"></div>
    <i class="fa-solid fa-plus" onclick="addEventShift('modifying_shift_list')" style="cursor: pointer;"></i>

    <button class="saveChangesBtn" onclick="modifyEvents(${event_id})">Save</button>
    <button class="closeBtn" onclick="close_panel('modifying_events_panel')">Cancel</button>
    `;

    let title = document.getElementById("modifying_event_title");
    let start_date = document.getElementById("modifying_event_start_date");
    let end_date = document.getElementById("modifying_event_end_date");
    let description = document.getElementById("modifying_event_description");

    let number = document.getElementById("modifying_event_location_number");
    let street = document.getElementById("modifying_event_location_street");
    let city = document.getElementById("modifying_event_location_city");
    let state = document.getElementById("modifying_event_location_state");
    let postcode = document.getElementById("modifying_event_location_postcode");

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            const event_info = JSON.parse(this.responseText);
            let startDate = convertToDateString(event_info.event_start_date);
            let endDate = convertToDateString(event_info.event_end_date);

            title.value = event_info.event_title;
            start_date.value = startDate;
            end_date.value = endDate;
            description.value = event_info.event_description;
            number.value = event_info.number;
            street.value = event_info.street;
            city.value = event_info.city;
            state.value = event_info.state;
            postcode.value = event_info.postcode;
        }
    };
    xhttp.open("GET", window.location.pathname + "/events/" + event_id + "/info", true);
    xhttp.send();
}

function get_modifying_event_shifts(event_id) {

    let shift_list = document.getElementById('modifying_shift_list');
    shift_list.innerHTML =``;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            const shifts = JSON.parse(this.responseText);
            for (let i = 0; i < shifts.length; i++) {
                let shift = document.createElement("div");
                let Date = convertToDateString(shifts[i].date);
                shift.classList.add("shift-item");
                shift.classList.add(shifts[i].shift_id);
                shift.id = "-shift-item-" + shiftCounter++;
                shift.style.border = "1px solid black";
                shift.style.padding = "1rem";
                shift.style.marginBottom = "0.5rem";
                shift.style.borderRadius = "0.5rem";
                shift.innerHTML = `
                    <label style="display: inline-block">Date:</label>
                    <input type="date" class="dateInput shift_date" style="display: inline-block" value="${Date}" required>
                    <label style="display: inline-block">Start Time:</label>
                    <input type="time" style="display: inline-block" class="shift_start_time" value="${shifts[i].start_time}" required>
                    <label style="display: inline-block">End Time:</label>
                    <input type="time" style="display: inline-block" class="shift_end_time" value="${shifts[i].end_time}" required>
                    <input type="text" class="shift_description" placeholder="Shift description (optional)" value="${shifts[i].description}"  required>
                    <label>Positions:</label>
                    <div class="shift_position"></div>
                    <i class="fa-solid fa-plus" onclick="addShiftPosition('${shift.id}')" style="cursor: pointer;"></i>
                `;
                shift_list.appendChild(shift);
                get_modifying_shift_positions(shift.id, shifts[i].shift_id);
            }

        }
    };
    xhttp.open("GET", window.location.pathname + "/events/" + event_id + "/shifts", true);
    xhttp.send();
}

function get_modifying_shift_positions(shift_item, shift_id) {

    let position_list = document.getElementById(shift_item).querySelector(".shift_position");

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            const positions = JSON.parse(this.responseText);

            for (let i = 0; i < positions.length; i++) {

                let positions_select = document.createElement("select");
                positions_select.classList.add("position_name");
                positions_select.classList.add("existing");
                for(let j in positionList) {
                    if (positionList[j].name == positions[i].name) {
                        positions_select.innerHTML += `<option value="${positionList[j].id}" selected>${positionList[j].name}</option>`;
                    }
                }

                let position = document.createElement("div");
                position.classList.add("position-item");
                position.id = "position-item-" + ShiftPositionCount++;
                position.style.border = "1px solid black";
                position.style.padding = "1rem";
                position.style.marginBottom = "0.5rem";
                position.style.borderRadius = "0.5rem";
                position.appendChild(positions_select);
                position.innerHTML += `
                <label style="display: inline-block">Number of Volunteer:</label>
                <input type="number" min="1" style="width: fit-content; padding: 5px;" class="num_people" value="${positions[i].num_people}"required>
                <br>
                `;
                position_list.appendChild(position);
            }

        }
    };
    xhttp.open("GET", "/organisation/positions/" + shift_id, true);
    xhttp.send();
}

function get_current_members() {
    var xhttp1 = new XMLHttpRequest();
    xhttp1.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const current_members_list = JSON.parse(this.responseText);

            const current_members= document.getElementById("current_members_data");
            current_members.style.cursor = 'pointer';
            let current_members_count = document.getElementById("current_members_count");
            current_members_count.innerHTML = '<i class="fa-regular fa-user"></i> ' + current_members_list.length;

            current_members.innerHTML = ``;

            for (let i = 0; i < current_members_list.length; i++) {
                const row = document.createElement("tr");
                let date = new Date(current_members_list[i].joined_date).toDateString();
                let skills = current_members_list[i].user_skill;
                let experience = current_members_list[i].user_experience;

                if (skills == null) {
                    skills = 'No skills!';
                }
                if (experience == null) {
                    experience = 'No experience!';
                }


                row.addEventListener("click", function() {
                    let member_panel = document.getElementById("member_panel");
                    member_panel.innerHTML = `
                    <span style="color: gray; float: right; cursor: pointer; margin-bottom: 0.5rem;" onclick="close_panel('member_panel')"><i class="fa-solid fa-xmark fa-2xl"></i></span>
                    <h1 id="info-title">Member's Information</h1>
                    <h3>Name:</h3>
                    <p id="member_name">${current_members_list[i].user_firstname} ${current_members_list[i].user_lastname} </p>
                    <h3>Joined date:</h3>
                    <p id="member_joined_date">${date}</p>
                    <h3>Email:</h3>
                    <p id="member_email">${current_members_list[i].user_email}</p>
                    <h3>Phone Number:</h3>
                    <p id="member_phone">${current_members_list[i].user_phone}</p>
                    <h3>Skills:</h3>
                    <p id="member_skill">${skills}</p>
                    <h3>Experience:</h3>
                    <p id="member_experience">${experience}</p>
                    <button class="closeBtn" style="background: red" onclick="close_panel('member_panel'); kick(${current_members_list[i].user_id});">Kick</button>
                    `;
                open_panel("member_panel");
                });

                const firstNameCell = document.createElement("td");
                firstNameCell.innerText = current_members_list[i].user_firstname;
                row.appendChild(firstNameCell);

                const lastNameCell = document.createElement("td");
                lastNameCell.innerText = current_members_list[i].user_lastname;
                row.appendChild(lastNameCell);

                const joinDateCell = document.createElement("td");
                joinDateCell.innerText = date;
                row.appendChild(joinDateCell);

                var xhttp2 = new XMLHttpRequest();
                xhttp2.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let num_events = JSON.parse(this.responseText);
                    let num_events_completed = num_events["COUNT(ea.application_id)"];

                    const eventsCompletedCell = document.createElement("td");
                    eventsCompletedCell.innerText = num_events_completed;
                    row.appendChild(eventsCompletedCell);
                }
            };
                xhttp2.open("GET", window.location.pathname + "/users/" + current_members_list[i].user_id + "/num_shifts_completed", true);
                xhttp2.send();

                current_members.appendChild(row);
        }
    }
    };
    xhttp1.open("GET", window.location.pathname + "/current_members", true);
    xhttp1.send();
}

function kick(user_ID) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert('Successfully kicked');
            location.reload();
        } else if (this.readyState == 4) {
            alert('Kick FAILED');
        }
    };
    xhttp.open("POST", window.location.pathname + "/current_members/kick_members", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({user_id: user_ID }));
}


function get_pending_applications() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const pending_applications_list = JSON.parse(this.responseText);

            const pending_applications = document.getElementById("pending_applications_data");
            pending_applications.style.cursor = 'pointer';
            let pending_applications_count = document.getElementById("pending_applications_count");
            pending_applications_count.innerHTML = '<i class="fa-regular fa-user"></i> ' + pending_applications_list.length;

            pending_applications.innerHTML = ``;

            for (let i = 0; i < pending_applications_list.length; i++) {
                const row = document.createElement("tr");

                row.addEventListener("click", function() {
                    let candidate_panel = document.getElementById("candidate_panel");
                    candidate_panel.innerHTML = `
                    <span style="color: gray; float: right; cursor: pointer; margin-bottom: 0.5rem;" onclick="close_panel('candidate_panel')"><i class="fa-solid fa-xmark fa-2xl"></i></span>
                    <h1 id="info-title">Applicant's Information</h1>
                    <h3>Name:</h3>
                    <p id="applicant_name">${pending_applications_list[i].user_firstname} ${pending_applications_list[i].user_lastname} </p>
                    <h3>Email:</h3>
                    <p id="applicant_email">${pending_applications_list[i].user_email}</p>
                    <h3>Phone Number:</h3>
                    <p id="applicant_phone">${pending_applications_list[i].user_phone}</p>
                    <h3>Skills:</h3>
                    <p id="applicant_skill">${pending_applications_list[i].user_skill}</p>
                    <h3>Experience:</h3>
                    <p id="applicant_experience">${pending_applications_list[i].user_experience}</p>
                    <h3>Applicant's answer:</h3>
                    <p id="applicant_answer">${pending_applications_list[i].answers}</p>
                    <button class="closeBtn" style="background: red" onclick="close_panel('candidate_panel'); decline(${pending_applications_list[i].user_id})">Decline</button>
                    <button class="acceptBtn" style="background: green" onclick="close_panel('candidate_panel'); accept(${pending_applications_list[i].user_id})" >Accept</button>
                    `;
                open_panel("candidate_panel");
                });

                const firstNameCell = document.createElement("td");
                firstNameCell.innerText = pending_applications_list[i].user_firstname;
                row.appendChild(firstNameCell);

                const lastNameCell = document.createElement("td");
                lastNameCell.innerText = pending_applications_list[i].user_lastname;
                row.appendChild(lastNameCell);

                const ApplyDateCell = document.createElement("td");
                let date = new Date(pending_applications_list[i].apply_date).toDateString();
                ApplyDateCell.innerText = date;
                row.appendChild(ApplyDateCell);

                pending_applications.appendChild(row);
        }
    }
    };
    xhttp.open("GET", window.location.pathname + "/pending_applications", true);
    xhttp.send();
}

function decline(user_id) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert('Successfully deleted');
            location.reload();
        } else if (this.readyState == 4) {
            alert('Delete FAILED');
        }
    };
    xhttp.open("POST", window.location.pathname + "/pending_applications/delete_app", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({ app_id: user_id }));
}

function accept(user_id) {
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var xhttp1 = new XMLHttpRequest();
            xhttp1.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    alert('Successfully Accepted');
                    location.reload();
                } else if (this.readyState == 4) {
                    alert('FAILED');
                }
            };
            xhttp1.open("POST", window.location.pathname + "/pending_applications/delete_app", true);
            xhttp1.setRequestHeader("Content-type", "application/json");
            xhttp1.send(JSON.stringify({ app_id: user_id }));
        }
    };
    xhttp2.open("POST", window.location.pathname + "/pending_applications/add_to_current_members", true);
    xhttp2.setRequestHeader("Content-type", "application/json");
    xhttp2.send(JSON.stringify({ app_id: user_id }));
}


function convertToDateString(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}