$(document).ready(function(){
    $('#open-side-bar').click(() => {
        $('.side-bar').fadeIn(500);
        $('.black-modal2').fadeIn(500);
    });
    $('.black-modal2').click(() => {
        $('.side-bar').fadeOut(500);
        $('.black-modal2').fadeOut(500);
    });
    
});