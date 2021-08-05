$(document).ready(function(){
    var answers = document.getElementById('answers');
    var courseID = document.getElementById('courseID').textContent;
    var userName = document.getElementById('userName').textContent;
    var socket = io();
    socket.on('leave', (msg) => {});
    $('.submit-button').click(() => {
        while (answers.childNodes.length > 0) {
            answers.removeChild(answers.childNodes[0]);
        }
        var answerNum = parseInt($('input.number').val());
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
            input.setAttribute("id", "answer" + i);
            label.setAttribute("for", "answer" + i);
            label.textContent = "گزینه " + (i + 1);

            ans.appendChild(input);
            ans.appendChild(label);
            answers.appendChild(ans);
        }
        socket.emit(courseID, {answerNum, userName});
        
    });
});