if(document.getElementById('time-started').textContent == 'true'){
    setInterval(() => {
        var sec = parseInt(document.getElementById('time-seconds').textContent);
        sec++;
        if(sec > 59){
            sec = 0;
            var min = parseInt(document.getElementById('time-minutes').textContent);
            min++;
            if(min > 59){
                min = 0;
                var hours = parseInt(document.getElementById('time-hours').textContent);
                hours++;
                document.getElementById('time-hours').textContent = hours < 10? '0'+hours : hours;
            }
            document.getElementById('time-minutes').textContent = min < 10? '0'+min : min;
        }
        document.getElementById('time-seconds').textContent = sec < 10? '0'+sec : sec;
    }, 1000);
}