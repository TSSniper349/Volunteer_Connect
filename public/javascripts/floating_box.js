function open_panel(input) {
    let panel = document.getElementById(input);
    panel.classList.add("show");
    document.getElementById("overlay").classList.toggle('active');
    document.body.classList.toggle('scroll-lock');
}
function close_panel(input) {
    document.getElementById(input).classList.remove('show');
    document.getElementById("overlay").classList.remove('active');
    document.body.classList.remove('scroll-lock');
}
