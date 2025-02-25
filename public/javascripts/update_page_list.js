function get_update_list() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const update_list = JSON.parse(this.responseText);
            let title = document.getElementById("organisation_updates");
            if(window.location.pathname === "/updates/all_update") title.innerHTML = `<i class="fa-solid fa-bell"></i> All recent public updates`;
            else title.innerHTML = `<i class="fa-solid fa-bell"></i> ${update_list[0].name}'s Recent Updates`;
            const box_item_element = document.getElementById("updates");
            box_item_element.innerHTML="";

            if(update_list.length>0) for (let i = 0; i < update_list.length; i++) {
                let isPublic = update_list[i].isPublic.data[0] === 1;
                let icon = isPublic ? 'fa-earth-americas' : 'fa-lock';
                let update_infor = document.createElement("div");
                update_infor.classList.add("update_box");
                update_infor.innerHTML = `
                <hr style="border-color: #f0f0f0;">
                <h2><a href= "/organisation/${update_list[i].abn}/update_page/${update_list[i].update_id}" style="text-decoration: none; color: grey;"> ${update_list[i].update_title}</a>&nbsp<i class="fa-solid ${icon}" style="color: #36454F;"></i></h2>
                <p><b>${update_list[i].name}</b> | <i class="fa-regular fa-clock"></i> ${new Date(update_list[i].update_date_posted).toDateString()}</p>
                `;
                box_item_element.appendChild(update_infor);
            }
            else box_item_element.innerText="No updates so far!";
        }
    };
    xhttp.open("GET", window.location.pathname + "/list", true);
    xhttp.send();
}

window.onload = (event) => {
    get_update_list();
};