$(document).ready(function() {
    var client_id = $('.tableInfo').attr('client_id');

    $("select.select_year").change(function () {
        var year = $(this).val();
        location.href='/cabinet/mng/client/payments/'+client_id+'/'+year+'/';
    })

})
