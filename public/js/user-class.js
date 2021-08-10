$(document).ready(function(){
    var answers  = document.getElementById('answers');
    var courseID = document.getElementById('courseID').textContent;
    var userName = document.getElementById('userName').textContent;
    var userID   = document.getElementById('userID').textContent;
    var socket   = io();
    var answeredBefore = false;
    var lastAnswer;
    socket.on(courseID, (msg) => {
        if(msg.state == 'change-ans')
        {
            answeredBefore = false;
            answerNum = msg.answerNum;
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
            if(lastAnswer == msg.rightAnswer)
            {
                alert('پاسخ شما درست بود.');
            }
            else
            {
                alert('پاسخ شما نادرست بود.');
            }
            
        }
    });
});