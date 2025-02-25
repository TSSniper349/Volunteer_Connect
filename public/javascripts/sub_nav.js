function active(input) {
    let sub_nav = document.getElementById("sub_nav").children;
    for(let i=0;i<sub_nav.length;i++) {
        if(sub_nav[i].title==input) sub_nav[i].className = "selected";
        else sub_nav[i].className = "not_selected";
    }

    let container = document.getElementById("container").children;
    for(let i=0;i<container.length;i++) {
        if(container[i].id===input) container[i].className ="active";
        else container[i].className = "deactive";
    }
}