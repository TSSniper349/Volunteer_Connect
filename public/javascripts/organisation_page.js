function get_organisation_page_info() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let org_info = JSON.parse(this.responseText);
      let bread = document.getElementById("current_breadcrumb");
      bread.innerText = org_info.name;

      let updates_title = document.getElementById("organisation_updates");
      updates_title.href = window.location.href + "/update_list";
      updates_title.innerText = org_info.name + "'s Updates";

      let org_name = document.getElementsByClassName("org_name");
      org_name[0].innerText = org_info.name;

      let org_location = document.getElementsByClassName("org_location");
      org_location[0].innerHTML =
        '<i class="fa-solid fa-location-dot" style="margin-right: 1rem;"></i>' + org_info.number + ' ' + org_info.street + ', ' + org_info.city + ', ' + org_info.state + ', ' + org_info.postcode;

      let org_description = document.getElementsByClassName("org_description");
      org_description[0].innerText = org_info.description;

      let org_contact = document.getElementsByClassName("org_contact");
      org_contact[0].style.color = "grey";
      org_contact[0].innerHTML =
        "Email: " +
        org_info.email +
        "<br>" +
        "Contact number: +" +
        org_info.phone_number +
        "<br>" +
        "Manager: " +
        org_info.manager_firstname;
    }
  };
  xhttp.open("GET", window.location.pathname + "/info", true);
  xhttp.send();
}

function get_organisation_page_services() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let org_info = JSON.parse(this.responseText);

      let org_services = document.getElementsByClassName("org_services");
      org_services[0].innerHTML = "";
      for (let i of org_info) {
        let service = document.createElement("li");
        service.innerHTML = `<p>${i.name}</p>`;
        org_services[0].appendChild(service);
      }
    }
  };
  xhttp.open("GET", window.location.pathname + "/services", true);
  xhttp.send();
}

function get_organisation_page_events() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let org_info = JSON.parse(this.responseText);

      let org_events = document.getElementsByClassName("org_events");
      let upcoming_events_count = 0;
      let past_events_count = 0;
      org_events[0].innerHTML = "<h4>Upcoming Events:</h4>";
      for (let i of org_info) {
        let current_date = new Date();
        let end_date = new Date(i.event_end_date);
        if (current_date <= end_date) {
          ++upcoming_events_count;
          org_events[0].innerHTML += `
        <div class="inner_box">
            <div class="content">
                <h3>${i.event_title}</h3>
                <p><b><i class="fa-solid fa-location-dot" style="margin-right: 0.2rem;"></i>Location:</b> ${i.number} ${i.street}, ${i.city}, ${i.state}, ${i.postcode} </p>
                <p><b>Start Date:</b> ${new Date(i.event_start_date).toDateString()} | <b>End Date:</b> ${new Date(i.event_end_date).toDateString()}</p>
                <button type="button" onclick="location.href='${window.location.href + '/event/' + i.event_id}'">Learn More</button>
            </div>
        </div>
        `;
        }
      }
      if (upcoming_events_count == 0) {
        org_events[0].innerHTML += `
        <p style="text-align: center;">No upcoming events!</p>
        `;
      }
      org_events[0].innerHTML += "<h4>Past Events:</h4>";
      for (let i of org_info) {
        let current_date = new Date();
        let end_date = new Date(i.event_end_date);
        if (current_date > end_date) {
          ++past_events_count;
          org_events[0].innerHTML += `
          <div class="inner_box">
          <div class="content">
              <h3>${i.event_title}</h3>
              <p><b><i class="fa-solid fa-location-dot" style="margin-right: 0.2rem;"></i>Location:</b> ${i.number} ${i.street}, ${i.city}, ${i.state}, ${i.postcode} </p>
              <p><b>Start Date:</b> ${new Date(i.event_start_date).toDateString()} | <b>End Date:</b> ${new Date(i.event_end_date).toDateString()}</p>
              <button type="button" onclick="location.href='${window.location.href + '/event/' + i.event_id}'">Learn More</button>
          </div>
      </div>
        `;
        }
      }
      if (past_events_count == 0) {
        org_events[0].innerHTML += `
        <p style="text-align: center;">No past events!</p>
        `;
      }
    }
  };
  xhttp.open("GET", window.location.pathname + "/events", true);
  xhttp.send();
}

function get_org_update_list() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const org_update_list = JSON.parse(this.response);
      const box_item_element = document.getElementById("right-side-board");

      if (org_update_list.length == 0) {
        let p = document.createElement("p");
        p.innerText = "No updates so far!";
        box_item_element.appendChild(p);
      }
      else for (const i of org_update_list) {
        let isPublic = i.isPublic.data[0] === 1;
        let icon = isPublic ? 'fa-earth-americas' : 'fa-lock';
        let update_info = document.createElement("article");
        update_info.innerHTML = `
          <h3><a href="/organisation/${i.abn}/update_page/${i.update_id}" style="color: grey;">${i.update_title}</a>&nbsp<i class="fa-solid ${icon}" style="color: #36454F;"></i></h3>
          <p><b>Posted on:</b> ${new Date(i.update_date_posted).toDateString()}</p>
          `;
        box_item_element.appendChild(update_info);
      }
    }
  };
  xhttp.open("GET", window.location.pathname + "/updates", true);
  xhttp.send();
}

function check_join_status() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("join_button").style.display = "none";
      document.getElementById("events_list").style.display = "";
      document.getElementsByClassName("leave_button")[0].style.display = "";
      get_organisation_page_events();
    } else if (this.readyState == 4 && this.status == 418) {
      let button = document.getElementById("join_button");
      button.innerText = "Pending";
      button.style.cursor = "not-allowed";
      button.style.background = "red";
    } else if (
      (this.readyState == 4 && this.status == 401) ||
      this.status == 412
    ) {
      document.getElementById("join_button").onclick = function () {
        if (
          xhttp.status == 401 &&
          confirm("Please login to join this organisation!") == true
        )
          window.location.href = xhttp.responseText;
        else if (xhttp.status == 412) window.location.href = xhttp.responseText;
      };
    }
  };
  xhttp.open("GET", window.location.pathname + "/join_status", true);
  xhttp.send();
}

document.addEventListener("DOMContentLoaded", (event) => {
  check_join_status();
  get_organisation_page_info();
  get_organisation_page_services();
  get_org_update_list();
});

function leaveOrganisation() {
  if (confirm("Are you sure want to leave this organisation? The action can not be reversed") == true) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        window.location.href = window.location.pathname;
      } else if (this.readyState == 4) {
        alert("Something went wrong");
      }
    };
    xhttp.open("GET", window.location.pathname + "/leave", true);
    xhttp.send();
  }
}