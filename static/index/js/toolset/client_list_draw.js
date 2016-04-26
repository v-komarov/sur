function contract_list_draw(block_id,data) {
    $(block_id+' a.item').remove();
    for(var client_id in data['client_list']) {
        var client_block = '';
        var client = data['client_list'][client_id];
        var device_width = 0;
        var device_string = '';
        if(client['contract_list']) {
            for(var contract_id in client['contract_list']) {
                var contract = client['contract_list'][contract_id];
                var contract_string = get_contract_string(contract);
                var object_item = '';

                // Object list

                for(var object_id in contract['object_list']) {
                    var object = contract['object_list'][object_id];
                    object_item += '<div class="padding_5 right contract__object" status="'+object['status__label']+'">объект: <b>'+object['name']+'</b>';
                    if(object['console']){
                        object_item += ' ('+object['console']+', №'+object['console_number']+')';
                    }
                    if(object['address_string']){
                        object_item += ', адрес: '+object['address_string'];
                    }
                    object_item += '</div><div class="clear" />';
                }

                var item = '<a class="item" href="/system/client/'+client_id+'/contract/'+contract_id+'/">' +
                    '<div class="left">' +
                    '<div class="service left">'+contract_string+'</div>' +
                    '<div class="clear" />' +
                    '<div class="padding_55 left">клиент: <b>'+client['name']+'</b></div>' +
                    '</div>' +
                    '<div class="right">' +
                    '<div class="left">'+object_item+'</div></div>' +
                    '</a>';
                $(block_id).prepend(item);
            }

            if(data['contract_count']==0) {
                client_block += '<a class="item" href="/system/client/'+client_id+'/"><div class="padding_5 left">клиент: <b>'+client['name']+'</b></div></a>';
            }
            /*
             for(var key in contract['device_list']){
             device_width += 36;
             device_string += '<div class="btn_ui right" ' +
             'icon="'+contract['device_list'][key]['priority']+'" title="'+contract['device_list'][key]['device__name']+'"><div class="icon"></div></div>';
             }
             */
            $(block_id).prepend(client_block);
        }
        else {
            var item = '<a class="item" href="/system/client/'+client_id+'/">' +
                    '<div class="left">' +
                    '<div class="clear" />' +
                    '<div class="padding_5 left">клиент: <b>'+client['name']+'</b></div>' +
                    '</div></a>';
                $(block_id).append(item);
        }

    }
    $('.result_count').html('Клиентов: '+data['client_count']+', договоров: '+data['contract_count']+', объектов: '+data['object_count']);
}