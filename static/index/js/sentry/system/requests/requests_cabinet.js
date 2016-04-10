$(document).ready(function() {


    $('table.request_cabinet tbody').on('click','.tr_client_object', function() {
        var status = $(this).attr('status');
        if(status=='wait'){
            var request_id = $(this).attr('request_id');
            location.href='/manager/requests/cabinet/'+request_id;
        }
    });

    $("select.selectObject").change(function () {
        var status = $(this).val();
        location.href='/manager/requests/cabinet/status/'+status+'/';
    })
})


