var socket = io();
// alert('hello');

var title = document.getElementById('title');
socket.on(`popup`, (msg) => {
    title.textContent = msg;
})
