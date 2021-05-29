$(document).ready(function(){
    $('.close-success-msg').click(() => {
        $('.success-msg').slideUp(500);
    });
    $('.close-notif-msg').click(() => {
        $('.notif-msg').slideUp(500);
    });

    $('.add-course').click(() => {
        $('.black-modal').fadeIn(500);
        $('#add-course').show(500);
    });
    
    $('.black-modal').click(() => {
        $('.black-modal').fadeOut(500);
        $('#add-course').fadeOut(500);
        for(var i=0;i<100; i++)
            $(`#course-view${i}`).fadeOut(500);
    });
    $('.close-popup').click(() => {
        $('.black-modal').fadeOut(500);
        $('#add-course').fadeOut(500);
        for(var i=0;i<100; i++)
            $(`#course-view${i}`).fadeOut(500);
    });
    var cards = [
        {card: $('#card0'), view: $('#course-view0')},
        {card: $('#card1'), view: $('#course-view1')},
        {card: $('#card2'), view: $('#course-view2')},
        {card: $('#card3'), view: $('#course-view3')},
        {card: $('#card4'), view: $('#course-view4')},
        {card: $('#card5'), view: $('#course-view5')},
        {card: $('#card6'), view: $('#course-view6')},
        {card: $('#card7'), view: $('#course-view7')},
        {card: $('#card8'), view: $('#course-view8')},
        {card: $('#card9'), view: $('#course-view9')},
        {card: $('#card10'), view: $('#course-view10')},
        {card: $('#card11'), view: $('#course-view11')},
    ];
    cards.forEach(card => {
        card.card.click(() => {
            card.view.fadeIn(500);
            $('.black-modal').fadeIn(500);
        });
    });


});