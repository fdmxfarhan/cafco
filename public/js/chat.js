var socket = io();
// alert('hello');
var messageContainer = document.getElementById('messages-container');

socket.on(`log`, (msg) => {
    var message = document.createElement('div');
    var text = document.createElement('div');
    var time = document.createElement('div');
    
    message.classList.add('message');
    text.classList.add('text');
    time.classList.add('time');
    var now = new Date();
    text.textContent = msg;
    time.textContent = `${now.getHours()}:${now.getMinutes()}`;

    message.appendChild(text);
    messageContainer.appendChild(message);
    messageContainer.scrollTo(0,1000000000);
    alert(msg);
})
