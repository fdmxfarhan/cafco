$(document).ready(function(){
    $('#unlock-all').hide();
    var socket = io();
    var devices = {};
    // alert('hello');
    var messageContainer = document.getElementById('messages-container');
    var devicesArea = document.getElementById('devices-area');
    var messageBox = document.getElementById('message-box');
    var lastLeaveName = '';
    socket.on('leave', (msg) => {
        if(msg.deviceName != '' && lastLeaveName != msg.deviceName){
            var message = document.createElement('div');
            var text = document.createElement('div');
            var time = document.createElement('div');
            
            message.classList.add('message');
            text.classList.add('text');
            time.classList.add('time');
            var now = new Date();
            text.textContent = msg.text;
            time.textContent = `${now.getHours()}:${now.getMinutes()}`;

            message.appendChild(text);
            message.appendChild(time);
            messageContainer.appendChild(message);
            messageContainer.scrollTo(0,1000000000);
            lastLeaveName = msg.deviceName;
        }
    });

    socket.on('log', (msg) => {
        var message = document.createElement('div');
        var text = document.createElement('div');
        var time = document.createElement('div');
        
        message.classList.add('message');
        text.classList.add('text');
        time.classList.add('time');
        var now = new Date();
        text.textContent = msg.text;
        time.textContent = `${now.getHours()}:${now.getMinutes()}`;

        message.appendChild(text);
        message.appendChild(time);
        messageContainer.appendChild(message);
        messageContainer.scrollTo(0,1000000000);
        
        // Add Device
        if(msg.type == 'start')
        {
            var device = document.createElement('div');
            var icon = document.createElement('i');
            var actions = document.createElement('div');
            var lock = document.createElement('a');
            var lockIcon = document.createElement('i');
            var message = document.createElement('a');
            var msgIcon = document.createElement('i');
            device.classList.add('device');
            // icon.classList.add('fa');
            // icon.classList.add('fa-mobile-phone');
            // icon.classList.add('icon');
            actions.classList.add('actions');
            lock.classList.add('green-bg');
            lock.classList.add(msg.deviceName + 'message');
            message.classList.add('red-bg');
            message.classList.add(msg.deviceName + 'lock');
            lockIcon.classList.add('fa');
            lockIcon.classList.add('fa-comment');
            msgIcon.classList.add('fa');
            msgIcon.classList.add('fa-lock');
            msgIcon.classList.add(msg.deviceName + 'lockIcon');
            
            // device.appendChild(icon);
            device.textContent = msg.deviceName;
            lock.appendChild(lockIcon);
            message.appendChild(msgIcon);
            actions.appendChild(lock);
            actions.appendChild(message);
            device.appendChild(actions);
            devices[msg.deviceName] = 'unlocked';
            devicesArea.appendChild(device);
            $('.' + msg.deviceName + 'lock').click(() => {
                if(devices[msg.deviceName] == 'unlocked'){
                    socket.emit('lock', {state: 'lock', name: msg.deviceName});
                    devices[msg.deviceName] = 'locked';
                    $('.' + msg.deviceName + 'lockIcon').removeClass('fa-lock');
                    $('.' + msg.deviceName + 'lockIcon').addClass('fa-unlock');
                }
                else{
                    socket.emit('lock', {state: 'unlock', name: msg.deviceName});
                    devices[msg.deviceName] = 'unlocked';
                    $('.' + msg.deviceName + 'lockIcon').addClass('fa-lock');
                    $('.' + msg.deviceName + 'lockIcon').removeClass('fa-unlock');
                }
            });
            $('.' + msg.deviceName + 'message').click(() => {
                socket.emit('popup', {text: messageBox.value, name: msg.deviceName});
            })
        }
    })
    $('#lock-all').click(() => {
        socket.emit('lock', {state: 'lock', name: 'all'});
        $('#lock-all').hide();
        $('#unlock-all').show();
    });
    $('#unlock-all').click(() => {
        socket.emit('lock', {state: 'unlock', name: 'all'});
        $('#unlock-all').hide();
        $('#lock-all').show();
    });
    $('#send-to-all').click(() => {
        socket.emit('popup', {text: messageBox.value, name: 'all'});
        
    });
});