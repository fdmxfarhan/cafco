function searchUsers() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("search-input");
    filter = input.value;
    table = document.getElementById("myTable");
    tr = table.getElementsByClassName("row");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("label")[0];
        if (td) {
            var txtValue = td.innerHTML;
            if (txtValue.indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
$(document).ready(function(){
    $('a.add-user-icon').click(() => {
        $('#add-discount-popup').fadeIn(500);
        $('.black-modal').fadeIn(500);
    });
    $('.black-modal').click(() => {
        $('#add-discount-popup').fadeOut(500);
        $('.black-modal').fadeOut(500);
    });
    $('.close-popup').click(() => {
        $('#add-discount-popup').fadeOut(500);
        $('.black-modal').fadeOut(500);
    });
    
});