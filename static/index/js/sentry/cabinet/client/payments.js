$(document).ready(function() {

    $("select.year").change(function () {
        year = $(this).val();
        location.href='/cabinet/payments/'+year+'/';
    })

})
