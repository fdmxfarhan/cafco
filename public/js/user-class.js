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
                        socket.emit(courseID, {state: 'student-ans', userName, answer, userID});
                        answeredBefore = true;
                    }
                    else
                    {
                        socket.emit(courseID, {state: 'student-change', userName, answer, userID, lastAnswer})
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
    });
});