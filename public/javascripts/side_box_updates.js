function get_updates() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const updates = JSON.parse(this.responseText);

            let box_item_element = document.getElementById("update_container");
            const updates_list = document.createElement("ul");

            for (let i = 0; i < updates.length; i++) {
                let update = document.createElement("li");
                update.innerHTML = `
                <div class="updates_info">
                    <a href="${updates[i].update_id}"><span>${updates[i].update_title}</span></a><br>
                    <p>${updates[i].update_description}</p>
                    <ul class="time">
                    ${updates[i].update_date_posted}
                        <span aria-hidden="true"></span>
                    </ul>
                </div>
                `;
                updates_list.appendChild(update);
            }
            box_item_element.appendChild(updates_list);
        }
    };
    xhttp.open("GET", window.location.pathname + "/get_updates", true);
    xhttp.send();
}

window.onload = (event) => {
    get_updates();
};