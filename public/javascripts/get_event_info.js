function get_event_info() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const event_info = JSON.parse(this.responseText);

            let org_bread = document.getElementById("org_breadcrumb");
            org_bread.href = "/organisation/page/" + event_info[0].abn;
            org_bread.innerText = event_info[0].name;

            let bread = document.getElementById("current_breadcrumb");
            bread.innerText = event_info[0].event_title;

            const box_item_element = document.getElementById("event_info");

            box_item_element.innerHTML = `
            <h1 class="event_title">${event_info[0].event_title}</h1>
            <div class="event_details">
                <dt>Start Date:</dt>
                <dd>${new Date(event_info[0].event_start_date).toDateString()}</dd>
                <dt>End Date:</dt>
                <dd>${new Date(event_info[0].event_end_date).toDateString()}</dd>
                </div>
            <p><b><i class="fa-solid fa-location-dot" style="margin-right: 0.2rem;"></i>Location:</b>  ${event_info[0].number} ${event_info[0].street}, ${event_info[0].city}, ${event_info[0].state}, ${event_info[0].postcode} </p>

            <div class="event_requirements">
            <h2><i class="fa-solid fa-exclamation"></i> Description</h2>
            <ul>
                <p class="event_description">${event_info[0].event_description}</p>
            </ul>
            </div>
            <button id="apply_button" onclick="open_panel('event_application');  shift_selection(); " >Apply Now!</button>
            `;

            let apply_button = document.getElementById("apply_button");
            let current_date = new Date();
            let end_date = new Date(event_info[0].event_end_date);
            if (current_date > end_date) {
                apply_button.style.display = "none";
            } else {
                apply_button.style.display = "block";
            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/info", true);
    xhttp.send();
}
var selected_shift = null;
function shift_selection(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const shift_info = JSON.parse(this.responseText);
            let container = document.getElementById("container");

            let selectedShift = null;

            function clearSelectedClass() {
                const items = form_menu.getElementsByClassName("pos-item");
                for (let item of items) {
                    item.classList.remove("selected");
                }
            }

            let form_menu = document.getElementById("form-menu");
            form_menu.innerHTML = ``;
            for (let i = 0; i < shift_info.length; i++) {
                let shift = document.createElement("li");
                let containter = document.getElementById("container");
                shift.classList.add("pos-item");
                shift.innerHTML = `
                <b>${new Date(shift_info[i].date).toDateString()}</b> | ${shift_info[i].start_time} - ${shift_info[i].end_time}
                `;
                shift.addEventListener("click", function() {
                    clearSelectedClass();
                    shift.classList.add("selected");
                    selected_shift = shift_info[i].shift_id;
                    containter.innerHTML = `
                        <h2>Description</h2>
                        <p style="font-size: 20px;" id="shift_description">${shift_info[i].description}</p>
                        <h2><i class="fa-regular fa-user"></i> Positions</h2>
                        <div id="positions"></div>
                        <button type="submit" class="closeBtn" onclick="apply_for_event();">Apply!</button> 
                        `;
                    get_shift_info(shift_info[i].shift_id);
                });
                form_menu.appendChild(shift);

            }
        }
    };
    xhttp.open("GET", window.location.pathname + "/shift", true);
    xhttp.send();
}

function get_shift_info(shift_id) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const position_info = JSON.parse(this.responseText);
            let positions = document.getElementById("positions");

            for (let j = 0; j < position_info.length; j++) {
                let item = document.createElement("div");
                item.classList.add("shift_position")
                item.innerHTML = `
                <input type="radio" name="position" id="item-btn-${j}" value="${position_info[j].position_id}">
                <label for="item-btn-${j}" class="item-text"></label>
                `;
                positions.appendChild(item);

                get_current_num_people_in_position(shift_id, position_info[j].position_id, function(num) {
                    let label = document.querySelector(`label[for="item-btn-${j}"]`);
                    label.innerHTML = `
                    ${position_info[j].name}  <span style="float: right;">${position_info[j].num_people - num}/${position_info[j].num_people} slot(s) remaining </span>
                    `;
                });
            }
        }
    };
    xhttp.open("GET", shift_id + "/positions", true);
    xhttp.send();
}

function get_current_num_people_in_position(shift_id, position_id, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const current_num_people = JSON.parse(this.responseText);
            var num = current_num_people.length;
            callback(num);  
        }
    };
    xhttp.open("GET", shift_id + "/positions/" + position_id, true);
    xhttp.send();
}

function apply_for_event() {
    let event_application_data = {
        shift_id: selected_shift,
        position_id: document.querySelector('input[name="position"]:checked').value
    };

    var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                alert('Apply successfully');
                window.location.href = window.location.pathname;
            } else if (xhttp.readyState == 4 && xhttp.status == 405) {
                alert('You have already applied for this shift!');
            } 
            else if (xhttp.readyState == 4 && xhttp.status == 406) {
                alert('There is no remaining slots!');
            } 
            else if (xhttp.readyState == 4) {
                alert('Apply FAILED');
            }
        };
        xhttp.open("POST", "/users/apply_for_event", true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify({event_application_data: event_application_data}));
}

window.onload = (event) => {
    get_event_info();
};


