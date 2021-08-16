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
        for(var i=0;i<100; i++)
            $(`#course-video${i}`).fadeOut(500);
    });
    $('.close-popup').click(() => {
        $('.black-modal').fadeOut(500);
        $('#add-course').fadeOut(500);
        for(var i=0;i<100; i++)
            $(`#course-view${i}`).fadeOut(500);
    });
    var cards = [];
    for(var i=0; i<500; i++){
        cards.push({card: $(`#card${i}`), view: $(`#course-view${i}`)});
    }
    cards.forEach(card => {
        card.card.click(() => {
            card.view.fadeIn(500);
            $('.black-modal').fadeIn(500);
        });
    });

    var videos = [];
    for(var i=0; i<500; i++){
        videos.push({video: $(`#course-video${i}`), btn: $(`#course-video-btn${i}`)});
    }
    videos.forEach(video => {
        video.btn.click(() => {
            for(var i=0;i<100; i++)
                $(`#course-view${i}`).fadeOut(100);
            video.video.fadeIn(500);
            $('.black-modal').fadeIn(500);
        });
    });
});