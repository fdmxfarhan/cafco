function getLocalStream() {
    navigator.mediaDevices.getUserMedia({video: false, audio: true}).then( stream => {
        window.localStream = stream; // A
        window.localAudio.srcObject = stream; // B
        window.localAudio.autoplay = true; // C
    }).catch( err => {
        console.log("u got an error:" + err)
    });
}

$(document).ready(function(){
    getLocalStream();
    var answers = document.getElementById('answers');
    var bars = document.getElementById('bars');
    var courseID = document.getElementById('courseID').textContent;
    var userName = document.getElementById('userName').textContent;
    var sum = 0;
    var answerNum = 4;
    var socket = io();
    var studentAnswers = [];
    var rightAnswer = 'undefined';
    $('.submit-button').click(() => {
        sum = 0;
        studentAnswers = [];
        rightAnswer = 'undefined';
        while (answers.childNodes.length > 0) {
            answers.removeChild(answers.childNodes[0]);
        }
        while (bars.childNodes.length > 0) {
            bars.removeChild(bars.childNodes[0]);
        }
        answerNum = parseInt($('input.number').val());
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

            var barArea = document.createElement('div');
            var question = document.createElement('div');
            var number = document.createElement('div');
            var bar = document.createElement('div');
            barArea.classList.add('bar-area');
            question.classList.add('question');
            number.classList.add('number');
            number.setAttribute("id", "number" + (i+1));
            bar.classList.add('bar');
            bar.setAttribute("id", "bar" + (i+1));
            question.textContent = (i + 1).toString();
            number.textContent = '0';
            barArea.appendChild(question);
            barArea.appendChild(number);
            barArea.appendChild(bar);
            bars.appendChild(barArea);
        }
        inputs.forEach(input => {
            input.addEventListener('change',() => {
                rightAnswer = parseInt(input.id.slice(6, 1000));
            });
        });
        socket.emit(courseID, {state: 'change-ans',answerNum, userName});
    });
    $('.button-end').click(() => {
        var scoreRight = parseInt($('#score-right').val());
        var scoreWrong = parseInt($('#score-wrong').val());
        socket.emit(courseID, {state: 'save', studentAnswers, scoreRight, scoreWrong, rightAnswer});
    });
    socket.on(courseID, (msg) => {
        if(msg.state == 'student-ans')
        {
            sum += 1;
            studentAnswers.push(msg);
            var number = document.getElementById('number' + msg.answer);
            number.textContent = parseInt(number.textContent) + 1;
            for(var i=0; i<answerNum; i++){
                var bar = document.getElementById('bar' + (i+1));
                number = document.getElementById('number' + (i+1));
                bar.style.width = `${(parseInt(number.textContent)/sum)*100}%`;
            }
        }
        else if(msg.state == 'student-change')
        {
            for (let i = 0; i < studentAnswers.length; i++) {
                if(msg.userName == studentAnswers[i].userName) studentAnswers[i].answer = msg.answer;
            }
            var number = document.getElementById('number' + msg.answer);
            var lastNumber = document.getElementById('number' + msg.lastAnswer);
            number.textContent = parseInt(number.textContent) + 1;
            lastNumber.textContent = parseInt(lastNumber.textContent) - 1;
            for(var i=0; i<answerNum; i++){
                var bar = document.getElementById('bar' + (i+1));
                number = document.getElementById('number' + (i+1));
                bar.style.width = `${(parseInt(number.textContent)/sum)*100}%`;
            }
        }
    });
});