function get_update_info() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let update_info = JSON.parse(this.responseText);
            let isPublic = update_info.isPublic.data[0] === 1;
            let icon = isPublic ? 'fa-earth-americas' : 'fa-lock';
            let title = document.getElementById("announcement-title");
            title.innerHTML = update_info.update_title + `&nbsp<i class="fa-solid ${icon}" style="color: #36454F;"></i>`;

            let breadcrumb = document.getElementById("current_breadcrumb");
            breadcrumb.innerText = update_info.update_title;

            let date = document.getElementsByClassName("update_date");
            date[0].innerHTML = '<i class="fa-regular fa-clock"></i> ' + new Date(update_info.update_date_posted).toDateString();

            let description = document.getElementsByClassName("update_description");
            description[0].innerText = update_info.update_description;

            let author = document.getElementById("author");
            author.innerText = update_info.name;
            author.onclick = function() {
                location.href = '/organisation/page/' + update_info.abn;
            };
        } else if (this.readyState == 4 && this.status == 403) {
            alert("Please log in to view this update");
        }
    };
    xhttp.open("GET", window.location.pathname + "/info", true);
    xhttp.send();
}

window.onload = (event) => {
    get_update_info();
};