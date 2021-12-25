// function getLocalStream() {
//     navigator.mediaDevices.getUserMedia({video: true, audio: true}).then( stream => {
//         window.localStream = stream; // A
//         window.localAudio.srcObject = stream; // B
//         window.localAudio.autoplay = true; // C
//     }).catch( err => {
//         console.log("u got an error:" + err)
//     });
// }


$(document).ready(function(){
    // getLocalStream();
    var answers  = document.getElementById('answers');
    var courseID = document.getElementById('courseID').textContent;
    var userName = document.getElementById('userName').textContent;
    var userID   = document.getElementById('userID').textContent;
    var todayScore = document.getElementById('todayScore');
    var totalScore = document.getElementById('totalScore');
    var todayAvg = document.getElementById('todayAvg');
    var totalAvg = document.getElementById('totalAvg');
    var socket   = io();
    var answeredBefore = false;
    var lastAnswer;
    var shortAnswer = '';
    socket.emit("avg", {courseID: courseID});
    socket.emit(courseID, {state: 'newUser', userName});

    socket.on('newAvg', (msg) => {
        todayAvg.textContent = msg.dayAvg;
        totalAvg.textContent = msg.totalAvg;
    })
    socket.on(courseID, (msg) => {
        if(msg.state == 'change-ans')
        {
            answeredBefore = false;
            answerNum = msg.answerNum;
            lastAnswer = 'undefined';
            while (answers.childNodes.length > 0) {
                answers.removeChild(answers.childNodes[0]);
            }
            var inputs = [];
            for(var i=0; i < answerNum; i++)
            {
                var ans = document.createElement('div');
                var input = document.createElement('input');
                var label = document.createElement('label');
                ans.classList.add('ans');
                input.classList.add('radio');
                label.classList.add('radio');
                input.setAttribute("type", "radio");
                input.setAttribute("name", "answer");
                input.setAttribute("id", "answer" + (i+1));
                label.setAttribute("for", "answer" + (i+1));
                label.textContent = "گزینه " + (i + 1);

                ans.appendChild(input);
                ans.appendChild(label);
                answers.appendChild(ans);
                inputs.push(input);
            }
            inputs.forEach(input => {
                input.addEventListener('change',() => {
                    answer = parseInt(input.id.slice(6, 1000));
                    if(!answeredBefore)
                    {
                        socket.emit(courseID, {state: 'student-ans', userName, answer, userID, time: Date.now()});
                        answeredBefore = true;
                    }
                    else
                    {
                        socket.emit(courseID, {state: 'student-change', userName, answer, userID, lastAnswer, time: Date.now()})
                    }
                    lastAnswer = answer;
                });
            });
        }
        else if(msg.state == 'save')
        {
            if(lastAnswer == 'undefined') return;
            if(lastAnswer == msg.rightAnswer)
            {
                todayScore.textContent = parseInt(todayScore.textContent) + Math.abs(msg.scoreRight);
                totalScore.textContent = parseInt(totalScore.textContent) + Math.abs(msg.scoreRight);
                alert('پاسخ شما درست بود.');
            }
            else
            {
                todayScore.textContent = parseInt(todayScore.textContent) - Math.abs(msg.scoreWrong);
                totalScore.textContent = parseInt(totalScore.textContent) - Math.abs(msg.scoreWrong);
                alert('پاسخ شما نادرست بود.');
            }
            socket.emit("avg", {courseID: courseID});
        }
        else if(msg.state == 'save2')
        {
            if(shortAnswer == '') alert('پاسخ شما نادرست بود.');
            else{
                rightAnswers = msg.rightAnswer.replace(/ /g, '').split('-');
                console.log(rightAnswers);
                var flag = false;
                for(var i=0; i<rightAnswers.length; i++){
                    if(shortAnswer.replace(/ /g, '') == rightAnswers[i]){
                        flag = true;
                        alert('پاسخ شما درست بود.');
                        break;
                    }
                }
                if(!flag) alert('پاسخ شما نادرست بود.');
            }
            shortAnswer = '';
            $('#short-ans').val('');
            socket.emit("avg", {courseID: courseID});
        }
        else if(msg.state == 'show-score'){
            $('.score-area').show();
        }
        else if(msg.state == 'not-show-score'){
            $('.score-area').hide();
        }
        else if(msg.state == 'multi-choice-question'){
            $('#question1').show();
            $('#question2').hide();
        }
        else if(msg.state == 'short-ans-question'){
            $('#question1').hide();
            $('#question2').show();
            $('#short-submit').show();
            $('#sent-ans').hide();
        }
        
    });

    $('.collapse-right').click(() => {
        $('.sideBar').css('width', '0');
        $('.iframe-area').css('width', '100%');
        $('.collapse-right').hide();
        $('.collapse-left').show();
    });
    $('.collapse-left').click(() => {
        $('.sideBar').css('width', '20%');
        $('.iframe-area').css('width', '80%');
        $('.collapse-right').show();
        $('.collapse-left').hide();
    });
    $('#short-submit').click(() => {
        $('#short-submit').hide();
        $('#sent-ans').show();
        shortAnswer = $('#short-ans').val();
        socket.emit(courseID, {state: 'student-short-answer', userName, answer: shortAnswer, userID, time: Date.now()});
    });
});