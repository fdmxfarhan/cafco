$(document).ready(function(){
    $('a.add-user-icon').click(() => {
        $('#add-discount-popup').fadeIn(500);
        $('.black-modal').fadeIn(500);
    });
    $('.black-modal').click(() => {
        $('#add-discount-popup').fadeOut(500);
        $('.black-modal').fadeOut(500);
    });
    $('.close-popup').click(() => {
        $('#add-discount-popup').fadeOut(500);
        $('.black-modal').fadeOut(500);
    });
    
});