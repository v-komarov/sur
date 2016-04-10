$(document).ready(function() {

    console.log('id');

    $('table.tableInfo').on('click','.tr_cust_objects', function() {
        id = $(this).attr('id');
        location.href='/cabinet/objects/'+id+'/';
        console.log(id);
    });

})
