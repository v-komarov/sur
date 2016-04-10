$(document).ready(function() {
    client_id = $(".selectObject").attr('client_id');
    object_id = $(".selectObject").attr('object_id');

    $("select.selectObject").change(function () {
        id = $(this).val();
        location.href='/cabinet/mng/client/calc/'+client_id+'/'+id+'/';
        console.log(id);
    })

    $("select.year").change(function () {
        year = $(this).val();
        location.href='/cabinet/mng/client/calc/'+client_id+'/'+object_id+'/'+year+'/';
    })

})
