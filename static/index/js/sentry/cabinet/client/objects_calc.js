$(document).ready(function() {
    object_id = $(".selectObject").attr('object_id');

    $("select.selectObject").change(function () {
        id = $(this).val();
        location.href='/cabinet/objects/'+id+'/';
        console.log(id);
    })

    $("select.year").change(function () {
        year = $(this).val();
        location.href='/cabinet/objects/'+object_id+'/'+year+'/';
    })

})
