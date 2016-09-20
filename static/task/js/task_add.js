$(document).ready(function() {

    $('.search select').change(function () {
        client_object_Search();
    });

    $('.search').keypress(function(e) {
        if(e.keyCode==13){ client_object_Search() }
    });
    $('.search').on('click','[action=search]', function() {
        client_object_Search();
    });

    $('.search input').focus(function() {
        var focus_name = $(this).attr('name');
        $('.search input').each(function(){
            if(focus_name!=$(this).attr('name')){
                $(this).val('');
            }
        });
    });

    $('.search').on('click','[action=reset]', function() {
        $('.search select').find(":first").attr("selected", "selected");
        $('.search input').val('');
    });

});


function get_array_Ajax() {
    var ajax_array = {};
    $('.search input, .search select').each(function() {
        var input_name = $(this).attr('name');
        var input_value = $(this).val();
        if($(this).hasClass('sentry_user')) {
            var user_id = $(this).attr('user_id');
            if(!!user_id) ajax_array[input_name] = user_id;
        } else if(!!input_value) {
            ajax_array[input_name] = input_value;
        }
    });
    return ajax_array;
}


function client_object_Search() {
    var ajax_array = get_array_Ajax();
    loading('begin');
    console.log(ajax_array);
    $.ajax({ url: '/system/client/search/ajax/search/', type: 'get', dataType: 'json', data: ajax_array,
        success: function (data) {
            client_list_draw_('#object_list',data);
            loading('end');
        }
    });
}


function client_list_draw_(block_id,data) {
    $('.result_count').hide();
    $(block_id+' div.item').remove();
    var client_block = '';
    var count = 0;
    for(var client_id in data['client_list']){
        var client = data['client_list'][client_id];
        var contract_count = 0;
        for(var contract_id in client['contract_list']) {
            var contract = client['contract_list'][contract_id];
            var contract_string = get_contract_string(contract);
            var object_item = '';
            for(object_id__ in contract['object_list']){
                var object = contract['object_list'][object_id__];
                object_item += '<div class="padding_5 right">объект: <b>'+object['name']+'</b>';
                if(object['console']){
                    object_item += ' ('+object['console']+', №'+object['console_number']+')';
                }
                if(object['address_string']){
                    object_item += ', адрес: '+object['address_string'];
                }
                object_item += '</div><div class="clear" />';
            }
            var item = '<div class="item" client_id="'+client_id+'" object_id="'+contract['object_id']+'">' +
                '<div class="left">' +
                '<div class="service left">'+contract_string+'</div>' +
                '<div class="clear" />' +
                '<div class="padding_5 left">клиент: <b>'+client['name']+'</b></div>' +
                '</div>' +
                '<div class="right">' +
                '<div class="left">'+object_item+'</div></div>' +
                '</div>';
            $(block_id).append(item);
            count ++;
            contract_count++;
        }
        if(contract_count==0) {
            client_block += '<a class="item" href="/system/client/'+client_id+'/"><div class="padding_5 left">клиент: <b>'+client['name']+'</b></div></a>';
        }
    }
    $(block_id).prepend(client_block);
    $('.result_count').html('Найдено договоров: '+count);
    $('.result_count').show();
    if(count > 0) {
        $(block_id).show();
    } else {
        $(block_id).hide();
    }
}


function setTable(data) {
    $('.result_count').hide();
    $('#object_list div.item').remove();
    var count = 0;
    for(var key in data['object_list']) {
        var object = data['object_list'][key];
        var device_width = 0;
        var device_string = '';
        for(var key in object['device']) {
            device_width += 36;
            device_string += '<div class="btn_ui right" ' +
            'icon="'+object['device'][key]['priority']+'" title="'+object['device'][key]['device__name']+'"><div class="icon"></div></div>';
        }
        var service_string = contract_string_set(object);
        var item = '<div class="item" client_id="'+object['client']+'" object_id="'+object['id']+'"/"><table><tbody>' +
            '<tr class="title"><td class="inline_block">' +
            '<div class="service left">'+service_string+'</div>' +
            '</td><td rowspan="2" style="width:'+device_width+'px">'+device_string+'</td></tr>' +
            '<tr class="border_bottom"><td><div class="inline_block padding bold left">'+object['name']+'</div></td></tr>' +
            '<tr><td colspan="2">' +
            '<div class="inline_block padding left" name="client">Плательщик: '+object['client__name']+'</div><div class="inline_block padding right">'+object['address']+'</div></td></tr>' +
            '</tbody></table></div>';
        $('#object_list').append(item);
        count ++;
    }
    $('.result_count').html('Найдено: '+count);
    $('.result_count').show();
    if(count > 0){
        $('.objectsList').show();
    } else {
        $('.objectsList').hide();
    }
}
