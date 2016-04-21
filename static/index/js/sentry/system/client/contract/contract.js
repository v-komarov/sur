function contract_Reset(){
    loading('begin');
    $('.pop').hide();
    $.ajax({ url:'/system/client/contract/ajax/get/?contract_id='+contract_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']){
                alert(data['error']);
            } else {
                loading('end');
                $('div[action=object_archive]').hide();
                $('div[action=object_unarchive]').hide();
                if(data['contract']['status_label']=='disconnected'){
                    $('div[action=object_archive]').show();
                } else if(data['contract']['status_label']=='archive'){
                    $('div[action=object_unarchive]').show();
                }

                $('#contract_pop input').val('');
                for(var key in data['contract']){
                    $('#contract td[name='+key+']').html(data['contract'][key]);
                    $('#contract_pop [name='+key+']').val(data['contract'][key]);
                }
                $('#contract').attr('contract_id',data['contract']['id']);
                $('#contract').attr('service_organization_id',data['contract']['service_organization']);
                $('#contract').attr('service_type_id',data['contract']['service_type']);
                $('#contract [name=name]').html(get_contract_string(data['contract']));
                $('h2.cabinet_title .service_string_').html(get_contract_string(data['contract'])).attr('style','display:inline-block');
                $('h2.cabinet_title .service_string_ div.service_string').removeAttr('class').attr('style','display:inline-block');

                $('#contract_pop .header b').text('Карточка договора '+data['contract']['client__name']);
                $('#contract_pop [name=service_type]').val(data['contract']['service_type']);

                service_subtype('set_type',data['contract']['service_type']);

                $('td[name=tag_list]').html('');
                var tag_cnt = 0;
                for(var key in data['contract']['tag_list']){
                    if(data['contract']['tag_list'][key]['id']!=2){
                        var string = '';
                        if(tag_cnt>0) string = ', '; tag_cnt++;
                        $('td[name=tag_list]').append(string + data['contract']['tag_list'][key]['name']);
                    }
                }

                event_Draw('contract',data['contract']['id'], data['contract']['event_list']);
                contract_number_Interval(data['contract']['name']);
                contract_tag('set',data['contract']['tag_list']);

                /* Objects draw */
                $('#object_list div#list .object__item').remove();
                for(var object_id in data['contract']['object_list']){
                    var object = data['contract']['object_list'][object_id];
                    var object_item = $('#object_sample').clone();
                    object_item.removeAttr('id').removeClass('hide').attr('object_id',object_id).attr('bind_id',object['bind']);

                    for(object_key in object){
                        if(object[object_key+'__name']){
                            object_item.find('[name='+object_key+']').html(object[object_key+'__name']);
                        } else {
                            object_item.find('[name='+object_key+']').html(object[object_key]);
                        }
                    }
                    if(object['referer_user__full_name']){
                        object_item.find('[name=referer_type]').html(object['referer_user__full_name']);
                    }
                    object_item.find('td[name=charge_month_day]').text(object['charge_month_day']+', '+object['charge_month__name']);

                    var subtype_string = '[';
                    var subtype_count = 0;
                    for(var subtype_key in object['subtype_list']) {
                        subtype_string += object['subtype_list'][subtype_key]['name']+'+';
                        subtype_count ++;
                    }
                    if(subtype_count>0) subtype_string = subtype_string.slice(0,-1)+']';
                    else subtype_string = '';
                    object_item.find('span[name=name]').html(subtype_string+' '+object['name']);

                    object_item.find('.object__item__title b').attr('status',object['status']);

                    if(data['contract']['service_type']!=1){ // ПЦН
                        object_item.find('[name=console_number]').parents('tr').remove();
                        object_item.find('[name=security_squad]').parents('tr').remove();
                        object_item.find('div.device_list').hide();
                    }

                    if(object['cost_list'] && object['cost_list']['current']) {
                        var cost = object['cost_list']['current'];
                        object_item.find('td[name=cost_value]').html('<span name="value">'+cost['cost_value']+'</span> '+cost['cost_type__name']);
                        object_item.find('td[name=cost_value]').parents('tr').attr('object_cost_id',cost['id']);

                        for(var cost_key in object['cost_list']['list']) {
                            var cost = object['cost_list']['list'][cost_key];
                            if(cost['cost_type']=='pause') {
                                object_item.find('tr[event_type=pause]').removeAttr('action');
                                var cost_str = '<div class="pause__item" object_cost_id="'+cost['id']+'">' +
                                    cost['begin_date'] + ' - ' + cost['end_date'];
                                if(cost['comment']) cost_str += '<br/>' + cost['comment'];
                                cost_str += '</div>';
                                object_item.find('tr[event_type=pause] td[name=pause_list]').append(cost_str);
                            }
                        }
                    }
                    object_item.appendTo('#object_list div#list');
                    var object_tag_cnt = 0;
                    for(var key in object['tag_list']){
                        if(object['tag_list'][key]['id'] == 2){
                            object_item.find('td[name=financial_responsibility]').text('да');
                        }
                        else {
                            var string = '';
                            if(object_tag_cnt>0) string = ', '; object_tag_cnt++;
                            object_item.find('td[name=tag_list]').append(string + object['tag_list'][key]['name']);
                        }
                    }
                    event_Draw('object',object_id,object['event_list']);
                    device_install_Draw(object_id,object['device_install_list']);
                }
                /* End objects draw */
            }
        },
        complete: function() {
            loading('end');
            contract_Check();
        },
        error: function() {
            loading('end');
        }
    });
}


function client_object_Task(){
    task_Pop(client_id,object_id);
    //popMenuPosition('#task_add__pop','single');
}
