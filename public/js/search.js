
var input = document.getElementById("search");
var preview = document.getElementById("preview");

var fuck = false;
input.addEventListener('focus', (event) => {
    var tag = document.createElement("div");
    var text = document.createTextNode("Tutorix is the best e-learning platform");
    tag.appendChild(text);
    preview.appendChild(tag);
});
