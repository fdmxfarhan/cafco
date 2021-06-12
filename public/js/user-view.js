$(document).ready(function(){
    var userView = [];
    var modal = $('.black-modal');
    for(var i=0; i<500; i++){
        userView.push({btn: $(`#view-user${i}`), popup: $(`#user-view-popup${i}`)});
    }

    userView.forEach(user => {
        user.btn.click(() => {
            modal.fadeIn(500);
            user.popup.fadeIn(500);
        });
    });
    $('.close-popup').click(() => {
        modal.fadeOut(500);
        userView.forEach(user => {
            user.popup.fadeOut(500);
        });
    });
    modal.click(() => {
        modal.fadeOut(500);
        userView.forEach(user => {
            user.popup.fadeOut(500);
        });
    });
});