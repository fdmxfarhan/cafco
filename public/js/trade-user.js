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
$(document).ready(() => {
    var materialsLength = parseInt(document.getElementById('materials-length').textContent);
    var productsLength = parseInt(document.getElementById('products-length').textContent);
    var materials = [];
    for (let i = 0; i < materialsLength; i++) {
        materials.push({
            id: i,
            hours: parseInt(document.getElementById(`timer-${i}-hours`).textContent),
            min: parseInt(document.getElementById(`timer-${i}-minutes`).textContent),
            sec: parseInt(document.getElementById(`timer-${i}-seconds`).textContent),
        })
    }
    materials.forEach(material => {
        if(document.getElementById('time-started').textContent == 'true'){
            console.log('hello')
            setInterval(() => {
                if(material.sec == 0 && material.min == 0 && material.hours == 0)
                    location.reload();
                material.sec--;
                if(material.sec <= 0){
                    if(material.min == 0 && material.hours == 0)
                        location.reload();
                    else{
                        material.sec = 59;
                        material.min--;
                        if(material.min <= 0 && material.hours > 0){
                            material.min = 59;
                            material.hours--;
                        }
                    }
                }
                document.getElementById(`timer-${material.id}-hours`).textContent = material.hours < 10? '0'+material.hours : material.hours;
                document.getElementById(`timer-${material.id}-minutes`).textContent = material.min < 10? '0'+material.min : material.min;
                document.getElementById(`timer-${material.id}-seconds`).textContent = material.sec < 10? '0'+material.sec : material.sec;
            }, 1000);
        }
    });
});