function submit_application() {
    let answer = document.getElementById("organisation_question").value;
    let updatesConsent = document.getElementById("updatesCheckbox").checked;
    let eventsConsent = document.getElementById("eventsCheckbox").checked;

    if (answer.trim() === '') {
        alert('Answer must not be empty');
        return;
    }
      
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          alert("Your application has been recorded");
          var url = window.location.pathname;
          var urlArray = url.split('/');
          var lastElement = urlArray[urlArray.length - 1];
          window.location.href = '/organisation/page/' + lastElement;
        }
        else if(this.readyState == 4 & this.status == 412) {
            alert("You have already apply for this");
        }
    };
    xhttp.open("POST", window.location.pathname + "/submit_application", true);
    xhttp.setRequestHeader('Content-Type','application/json');
    xhttp.send(JSON.stringify({ answer: answer, updatesConsent: updatesConsent, eventsConsent: eventsConsent }));
}