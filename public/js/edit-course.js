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
    $('#change').click(() => {
        $('.black-modal').fadeIn(500);
        $('#upload-cover-popup').fadeIn(500);
    });
    $('.black-modal').click(()=>{
        $('.black-modal').fadeOut(500);
        $('#upload-cover-popup').fadeOut(500);
    });
    $('.close-popup').click(()=>{
        $('.black-modal').fadeOut(500);
        $('#upload-cover-popup').fadeOut(500);
    });
    
    $('#yearPayment').click(() => {
        if(document.getElementById('yearPayment').checked)
            $('#yearPaymentPrice').show();
        else
            $('#yearPaymentPrice').hide();
    })

});