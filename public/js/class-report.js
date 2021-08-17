$(document).ready(function(){
    var dropdowns = [];
    for(var i=0; i<500; i++){
        dropdowns.push({btn: $(`#dropdown-btn${i}`), cont: $(`#dropdown-cont${i}`)});
    }
    dropdowns.forEach(dropdown => {
        dropdown.btn.click(() => {
            dropdown.cont.slideToggle(500);
        });
    });
});