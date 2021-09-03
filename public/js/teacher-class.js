// function getLocalStream() {
//     navigator.mediaDevices.getUserMedia({video: true, audio: true}).then( stream => {
//         window.localStream = stream; // A
//         window.localAudio.srcObject = stream; // B
//         window.localAudio.autoplay = true; // C
//     }).catch( err => {
//         console.log("u got an error:" + err)
//     });
// }
var allUsers = [];

$(document).ready(function(){
    $('#not-answered-bar-users').hide();
    // getLocalStream();
    // var iframe = document.getElementById("mainIframe");
    // iframe.allow="autoplay;fullscreen;speaker;microphone;camera;display-capture";
    var answers = document.getElementById('answers');
    var bars = document.getElementById('bars');
    var courseID = document.getElementById('courseID').textContent;
    var userName = document.getElementById('userName').textContent;
    var sum = 0;
    var maxUsers = 0;
    var answerNum = 0;
    var socket = io();
    var studentAnswers = [];
    var notAnsweredUsers = [];
    var rightAnswer = 'undefined';
    var refreshTime = 0;
    var showingScore = true;
    $('.submit-button').click(() => {
        console.log(allUsers);
        notAnsweredUsers = [];
        allUsers.forEach(usr => notAnsweredUsers.push(usr));
        updateNotAns(notAnsweredUsers);
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
        refreshTime = Date.now();
        var inputs = [];
        var barAreas = [];
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
            barArea.setAttribute("id", "bar-area" + (i+1));
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

            barAreas.push({barArea, num: i+1});
        }
        inputs.forEach(input => {
            input.addEventListener('change',() => {
                rightAnswer = parseInt(input.id.slice(6, 1000));
            });
        });
        barAreas.forEach(bar => {
            bar.barArea.addEventListener('mouseover',() => {
                questionAns = studentAnswers.filter(e => e.answer == bar.num);
                // console.log(questionAns);
                var barUsers = document.createElement('div');
                barUsers.classList.add('bar-users');
                for (let i = 0; i < questionAns.length; i++) {
                    var newUser = document.createElement('div');
                    newUser.classList.add('user');
                    newUser.textContent = questionAns[i].userName;
                    barUsers.appendChild(newUser); 
                }
                barUsers.setAttribute("id", "barusers" + bar.num);
                bar.barArea.appendChild(barUsers); 
            });
            bar.barArea.addEventListener('mouseleave',() => {
                document.getElementById("barusers" + bar.num).remove();
            });
        });

        socket.emit(courseID, {state: 'change-ans',answerNum, userName});
    });
    $('.button-end').click(() => {
        if(rightAnswer == 'undefined') {
            alert('پاسخ صحیح انتخاب نشده');
            return;
        }
        var scoreRight = parseInt($('#score-right').val());
        var scoreWrong = parseInt($('#score-wrong').val());
        socket.emit(courseID, {state: 'save', studentAnswers, scoreRight, scoreWrong, rightAnswer});
        socket.emit("avg", {courseID: courseID});
        alert('اطلاعات ثبت شد.');
        answerNum = 0;
        socket.emit(courseID, {state: 'change-ans', answerNum, userName});
        sum = 0;
        studentAnswers = [];
        rightAnswer = 'undefined';
        while (answers.childNodes.length > 0) {
            answers.removeChild(answers.childNodes[0]);
        }
        while (bars.childNodes.length > 0) {
            bars.removeChild(bars.childNodes[0]);
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

            var barArea = document.createElement('div');
            var question = document.createElement('div');
            var number = document.createElement('div');
            var bar = document.createElement('div');
            barArea.classList.add('bar-area');
            barArea.setAttribute("id", "bar-area" + (i+1));
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
    });
    socket.on(courseID, (msg) => {
        if(msg.state == 'student-ans')
        {
            sum += 1;
            msg.time -= refreshTime;
            studentAnswers.push(msg);
            answeredUser(msg.userName);
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
                if(msg.userName == studentAnswers[i].userName) 
                {
                    studentAnswers[i].answer = msg.answer;
                    studentAnswers[i].time = msg.time - refreshTime;
                }
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
        else if(msg.state == 'newUser'){
            socket.emit(courseID, {state: 'change-ans', answerNum, userName});
            if(notAnsweredUsers.indexOf(msg.userName) == -1){
                notAnsweredUsers.push(msg.userName);
                maxUsers++;
                updateNotAns(notAnsweredUsers);
            }
            if(allUsers.indexOf(msg.userName) == -1){
                allUsers.push(msg.userName);
            }
        }
    });
    var updateNotAns = (notAnsweredUsers) => {
        document.getElementById('not-answered-number').textContent = notAnsweredUsers.length.toString();
        document.getElementById('not-answered-bar').style.width    = `${(notAnsweredUsers.length/maxUsers)*100}%`;
        var notAnsweredUsersBar = document.getElementById('not-answered-bar-users')
        while (notAnsweredUsersBar.childNodes.length > 0) {
            notAnsweredUsersBar.removeChild(notAnsweredUsersBar.childNodes[0]);
        }
        notAnsweredUsers.forEach(usr => {
            var newUser = document.createElement('div');
            newUser.classList.add('user');
            newUser.textContent = usr;
            notAnsweredUsersBar.appendChild(newUser); 
        });
    }
    var answeredUser = (usr) => {
        var index = notAnsweredUsers.indexOf(usr);
        if(index != -1) notAnsweredUsers.splice(index, 1);
        updateNotAns(notAnsweredUsers);
    }
    $('#not-answered-bar-area').mouseover(() => {
        $('#not-answered-bar-users').show();
    });
    $('#not-answered-bar-area').mouseleave(() => {
        $('#not-answered-bar-users').hide();
    });
    $('.show-score').click(() => {
        if(showingScore){
            document.getElementById('show-score').textContent = 'عدم نمایش امتیازات';
            showingScore = false;
            socket.emit(courseID, {state: 'not-show-score', userName})
        }
        else{
            document.getElementById('show-score').textContent = 'نمایش امتیازات';
            showingScore = true;
            socket.emit(courseID, {state: 'show-score', userName})
        }
    });
});