$(document).ready(function() {
    $(".tableInfo").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            setting_Reset();
        }
        if(action=='update'){
            setting_Update();
        }
    });

    $('.tableInfo').on('change', 'select[name=region]', function(){
        address_localitySearch();
    });

    setting_Reset();
});


function address_localitySearch(locality){
    var region_id = $('.tableInfo select[name=region]').val();
    $.ajax({ url:'/system/directory/locality/ajax/search/?region_id='+region_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            }
            else if(data['locality']){
                var locality_select = $('.tableInfo select[name=locality]');
                locality_select.find('option').remove();
                for(var key in data['locality']){
                    var option = '<option value="'+data['locality'][key]['id']+'">'+data['locality'][key]['name']+'</option>';
                    locality_select.append(option);
                }
            }
        },
        complete: function(){
            console.log(locality);
            if(locality){
                $('.tableInfo [name=locality] [value=' +locality+ ']').attr('selected', 'selected');
            }
        }
    });
}


function setting_Update(){
    $.ajax({ url:'/system/setting/general/ajax/update/', type:'post', dataType:'json',
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
    $.ajax({ url:'/system/setting/general/ajax/get/?user=null', type:'get', dataType:'json',
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
