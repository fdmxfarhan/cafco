$(document).ready(function(){
    var userView = [];
    var modal = $('.black-modal');
    for(var i=0; i<1000; i++){
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
        $('#add-user-popup2').fadeOut(500);
        modal.fadeOut(500);
        userView.forEach(user => {
            user.popup.fadeOut(500);
        });
    });
    modal.click(() => {
        $('#add-user-popup').fadeOut(500);
        $('#add-user-popup2').fadeOut(500);
        modal.fadeOut(500);
        userView.forEach(user => {
            user.popup.fadeOut(500);
        });
    });


    $('a.add-user').click(()=>{
        modal.fadeIn(500);
        $('#add-user-popup').fadeIn(500);
    });
    $('a.add-user2').click(()=>{
        modal.fadeIn(500);
        $('#add-user-popup2').fadeIn(500);
    });
    $('a.add-user-icon').click(()=>{
        modal.fadeIn(500);
        $('#add-user-popup').fadeIn(500);
    });
    $('.label#edit-price').click(() => {
        $('.label#edit-price').hide();
        $('form#edit-price-form').show();
    });


});