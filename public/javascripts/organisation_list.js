function get_services(abn) {
    return new Promise((resolve, reject) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                reject('Error: ' + this.status);
            }
        };
        xhttp.open("GET", `/organisation/page/` + abn + `/services`, true);
        xhttp.send();
    });
}

async function search_organisation_list(event) {
    event.preventDefault();
    var details = {
        keyword: document.getElementById("keywords").value,
        location: document.getElementById("location").value,
        serviceID: document.getElementById("servicesList").value
    };
    console.log(details.keyword);
    console.log(details.location);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function () {
        if (this.readyState == 4 && this.status == 200) {
            const organisation_list = JSON.parse(this.responseText);
            const box_item_element = document.getElementById("organisation_list");

            box_item_element.innerHTML = `<h4 id="num_org">Results found: ${organisation_list.length}</h4>`;

            for (let i of organisation_list) {
                let article_element = document.createElement("article");
                let org_service = document.createElement('aside');
                let list_service = document.createElement('ul');

                let services = await get_services(i.abn);
                for (let j of services) {
                    list_service.innerHTML += `<li><p>` + j.name + `</p></li>`;
                }
                org_service.appendChild(list_service);

                let org_info = document.createElement("div");
                org_info.classList.add("content");
                org_info.innerHTML = `
                    <h2><a href="organisation/page/${i.abn}" style="text-decoration: none;">${i.name}</a></h2>
                    <h4><i class="fa-solid fa-location-dot"></i> ${i.city}, ${i.postcode}</h4>
                    <p>${i.description}</p>
                    `;

                article_element.appendChild(org_service);
                article_element.appendChild(org_info);
                box_item_element.appendChild(article_element);
            }
        }
    };
    xhttp.open("POST", `/search_organisation_list`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(details));
}

function get_list_of_services() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            const services_list = document.getElementById("servicesList");
            services_list.innerHTML = "";
            let services = JSON.parse(req.response);
            for (let i in services) {
                services_list.innerHTML += `<option value="${services[i].service_id}">${services[i].name}</option>`;
            }
            services_list.innerHTML += `<option value="" disabled selected>Nothing Selected</option>`;
        } else if (req.readyState == 4) {
            alert('FAILED to get services list');
        }
    };

    req.open('GET', '/get_list_of_services');
    req.send();
}

function getQueryParameter(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
var query = getQueryParameter('keyword');
if (query) {
    document.getElementById('keywords').value = query;
}

window.onload = (event) => {
    search_organisation_list(event);
    get_list_of_services();
};