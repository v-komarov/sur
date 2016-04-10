$(document).ready(function() {
    client_id = $('.middleBlock').attr('client_id');
    $('body').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='reset'){
            client_object_Refresh();
        }
    });

    client_object_Refresh();
});


function client_object_Refresh(){
    loading('begin');
    $.ajax({ url:'/system/client/search/ajax/search/?client='+client_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']){
                alert(data['error']);
            }
            else {
                contract_list_draw('#object_list',data);
                loading('end');
            }
        },
        complete: function() {
            loading('end');
        }
    });
}

