$(document).ready(function(){
    $('#add-senario-btn').click(() => {
        $('.black-modal').fadeIn(500);
        $('#add-senario').fadeIn(500);
    });
    $('.black-modal').click(() => {
        $('.black-modal').fadeOut(500);
        $('#add-senario').fadeOut(500);
    });
    $('.close-popup').click(() => {
        $('.black-modal').fadeOut(500);
        $('#add-senario').fadeOut(500);
    });

});