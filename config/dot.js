module.exports =  function(number){
    number = number.toString();
    var result = '';
    for (let i = number.length-1; i >= 0; i--) {
        result += number[i];
        if((number.length - i)%3 == 0 && i>0)
            result += '.';
    }
    return(result.split("").reverse().join(""));
};