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
        $('#add-user-popup').fadeOut(500);
        modal.fadeOut(500);
        userView.forEach(user => {
            user.popup.fadeOut(500);
        });
    });
    modal.click(() => {
        $('#add-user-popup').fadeOut(500);
        modal.fadeOut(500);
        userView.forEach(user => {
            user.popup.fadeOut(500);
        });
    });


    $('a.add-user').click(()=>{
        modal.fadeIn(500);
        $('#add-user-popup').fadeIn(500);
    });
    $('a.add-user-icon').click(()=>{
        modal.fadeIn(500);
        $('#add-user-popup').fadeIn(500);
    });

});