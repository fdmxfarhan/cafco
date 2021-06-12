$(document).ready(function(){
    $('#open-side-bar').click(() => {
        $('.side-bar').fadeIn(500);
        $('.black-modal').fadeIn(500);
    });
    $('.black-modal').click(() => {
        $('.side-bar').fadeOut(500);
        $('.black-modal').fadeOut(500);
    });
    
});