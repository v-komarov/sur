$(document).ready(function() {
    client_id = $('.middleBlock').attr('client_id');
    $('.middleBlock').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='reset'){
            client_object_Refresh();
        }
    });

    client_object_Refresh();
});


function client_object_Refresh(){
    $('.loading').show();
    $.ajax({ url:'/system/client/search/ajax/search/?client_id='+client_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']){
                alert(data['error']);
            } else {
                $('#object_list a.item').remove();
                for(var key in data['object_list']){
                    var object = data['object_list'][key];
                    var device_width = 0;
                    var device_string = '';
                    for(var key in object['device']){
                        device_width += 36;
                        device_string += '<div class="btn_ui right" ' +
                        'icon="'+object['device'][key]['priority']+'" title="'+object['device'][key]['device__name']+'"><div class="icon"></div></div>';
                    }
                    var service_string = contract_string_set(object);
                    var item = '<a class="item" href="/system/client/'+object['client']+'/contract/'+object['id']+'/"><table><tbody>' +
                        '<tr class="title"><td class="inline_block">' +
                        '<div class="service left">'+service_string+'</div>' +
                        '</td><td rowspan="2" style="width:'+device_width+'px">'+device_string+'</td></tr>' +
                        '<tr class="border_bottom"><td><div class="inline_block padding bold left">'+object['name']+'</div></td></tr>' +
                        '<tr><td colspan="2"><div class="inline_block padding left">Плательщик: '+object['client__name']+'</div><div class="inline_block padding right">'+object['address']+'</div></td></tr>' +
                        '</tbody></table></a>';
                    $('#object_list').append(item);

                }
                $('.loading').hide();
            }
        }
    });
}

