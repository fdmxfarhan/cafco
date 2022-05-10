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
    var boughtMaterialsLength = parseInt(document.getElementById('bought-materials-length').textContent);
    var productsLength = parseInt(document.getElementById('products-length').textContent);
    var userProductsLength = parseInt(document.getElementById('user-products-length').textContent);
    var soldProductsLength = parseInt(document.getElementById('sold-products-length').textContent);
    var materials = [];
    for (let i = 0; i < materialsLength; i++) {
        materials.push({
            id: i,
            hours: parseInt(document.getElementById(`timer-${i}-hours`).textContent),
            min: parseInt(document.getElementById(`timer-${i}-minutes`).textContent),
            sec: parseInt(document.getElementById(`timer-${i}-seconds`).textContent),
            buy: $(`#market-material-buy-${i}`),
            buyForm: $(`#market-material-view-${i}`),
        })
    }
    materials.forEach(material => {
        material.buy.click(() => {
            material.buyForm.slideToggle(500);
        });
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



    var boughtMaterials = [];
    for (let i = 0; i < boughtMaterialsLength; i++) {
        boughtMaterials.push({
            id: i,
            hours: parseInt(document.getElementById(`bought-timer-${i}-hours`).textContent),
            min: parseInt(document.getElementById(`bought-timer-${i}-minutes`).textContent),
            sec: parseInt(document.getElementById(`bought-timer-${i}-seconds`).textContent),
        })
    }
    boughtMaterials.forEach(material => {
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
                document.getElementById(`bought-timer-${material.id}-hours`).textContent = material.hours < 10? '0'+material.hours : material.hours;
                document.getElementById(`bought-timer-${material.id}-minutes`).textContent = material.min < 10? '0'+material.min : material.min;
                document.getElementById(`bought-timer-${material.id}-seconds`).textContent = material.sec < 10? '0'+material.sec : material.sec;
            }, 1000);
        }
    });

    var userProducts = [];
    for (let i = 0; i < userProductsLength; i++) {
        userProducts.push({
            id: i,
            sell: $(`#sell-product-btn-${i}`),
            sellForm: $(`#sell-product-view-${i}`),
        })
    }
    userProducts.forEach( userProduct => {
        userProduct.sell.click(() => {
            userProduct.sellForm.slideToggle(500);
        })
    })

    var soldProducts = [];
    for (let i = 0; i < soldProductsLength; i++) {
        soldProducts.push({
            id: i,
            hours: parseInt(document.getElementById(`sell-product-${i}-hours`).textContent),
            min: parseInt(document.getElementById(`sell-product-${i}-minutes`).textContent),
            sec: parseInt(document.getElementById(`sell-product-${i}-seconds`).textContent),
        })
    }
    soldProducts.forEach(material => {
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
                document.getElementById(`sell-product-${material.id}-hours`).textContent = material.hours < 10? '0'+material.hours : material.hours;
                document.getElementById(`sell-product-${material.id}-minutes`).textContent = material.min < 10? '0'+material.min : material.min;
                document.getElementById(`sell-product-${material.id}-seconds`).textContent = material.sec < 10? '0'+material.sec : material.sec;
            }, 1000);
        }
    });

});