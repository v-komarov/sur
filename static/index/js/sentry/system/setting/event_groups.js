$(document).ready(function() {
    $(".tableInfo").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            setting_Reset();
        }
        else if(action=='update'){
            setting_Update();
        }
    });


    setting_Reset();
});


function setting_Update(){
    $.ajax({ url:'/system/setting/event_groups/ajax/update/', type:'post', dataType:'json',
        data:{
            'manager_id': $('.tableInfo select[name=manager]').val(),
            'warden_id': $('.tableInfo select[name=warden]').val(),
            'programmer_id': $('.tableInfo select[name=programmer]').val(),
            'technician_id': $('.tableInfo select[name=technician]').val(),
            'bonus_connection': $('.tableInfo input[name=bonus_connection]').val(),
            'bonus_programming': $('.tableInfo input[name=bonus_programming]').val(),
            'region': $('.tableInfo select[name=region]').val(),
            'locality': $('.tableInfo select[name=locality]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                popMessage('Сохранено','green');
            }
        }
    });
}


function setting_Reset(){
    $.ajax({ url:'/system/setting/event_groups/ajax/get/', type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                for(var key in data['setting']){
                    $('table.searchObject [name='+key+']').val(data['setting'][key]);
                }
            }
        },
        complete: function(data){
            address_localitySearch(JSON.parse(data['responseText'])['setting']['locality']);
        }
    });
}
