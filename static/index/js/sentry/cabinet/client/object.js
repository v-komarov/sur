$(document).ready(function() {
    object_id = $(".tableInfo").attr('object_id');

    $("select.select_objects").change(function () {
        id = $(this).val();
        location.href='/cabinet/objects/'+id+'/';
        console.log(id);
    })

    $("select.select_year").change(function () {
        year = $(this).val();
        location.href='/cabinet/objects/'+object_id+'/'+year+'/';
    })

})
