function redirect_organisation_list() {
  var keyword = document.getElementById("keyword").value;
  window.location.href = `/organisation_list?keyword=${encodeURIComponent(keyword)}`;
}