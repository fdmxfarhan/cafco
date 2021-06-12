$(document).ready(function(){
    $('.cover-img-edit').mouseenter(() => {
        $('#change').fadeIn(500);
    })
    $('.cover-img-edit').mouseleave(() => {
        $('#change').fadeOut(500);
    })
    $('.close-success-msg').click(() => {
        $('.success-msg').slideUp(500);
    });
    $('.close-notif-msg').click(() => {
        $('.notif-msg').slideUp(500);
    });

});