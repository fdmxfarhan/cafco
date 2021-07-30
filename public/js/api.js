$(document).ready(function(){
    var popups = [];
    for(var i=0; i<500; i++) popups.push({button: $(`#edit-senario-btn${i}`), view: $(`#edit-senario${i}`)});
    popups.forEach(popup => {
        popup.button.click(() => {
            popup.view.fadeIn(500);
            $('.black-modal').fadeIn(500);
        });
    });
    $('.black-modal').click(() => {
        $('.black-modal').fadeOut(500);
        $('#admins').fadeOut(500);
        popups.forEach(popup => {popup.view.fadeOut(500)});
    });
    $('.close-popup').click(() => {
        $('.black-modal').fadeOut(500);
        $('#admins').fadeOut(500);
        popups.forEach(popup => {popup.view.fadeOut(500)});
    });
    $('.edit-admins').click(() => {
        $('.black-modal').fadeIn(500);
        $('#admins').fadeIn(500);
    })
});