$(document).ready(function(){
    client_id = $('.middleBlock').attr('client_id');
    object_id = $('.middleBlock').attr('object_id');
    $('div[action=service_add]').show();

    $('#client_object, #service_list').on('click', 'tr', function(){
        var action = $(this).attr('action');
        if(action=='object'){
            client_object_Edit();
        }
        else if(action=='service'){
            object_service_Edit( $('.service__item:eq(0)').attr('service_id') );
        }
        else if(action=='cost'){
            service_cost_Edit($(this).parents('#client_object').attr('service_id'),$(this).parents('#client_object').attr('cost_id'));
        }
        else if(action=='bonus'){
            object_bonus_Edit($(this).attr('bonus_type_id'),$(this).attr('bonus_id'));
        }
        else if(action=='pause'){
            var service_cost_id = $('.service__item tr[action=cost]').attr('service_cost_id');
            //service_cost_Pause();
            service_cost_Edit($(this).parents('.service__item').attr('service_id'), service_cost_id,'pause');
        }

    });

    if(object_id=='None'){
        $('#client_object_pop select[name=address_region]').val(lunchbox['setting']['region']);
        $('h2.cabinet_title')
        client_object_Add();
        address_locality_Search();
    } else {
        client_object_Reset();
    }
    $('.pop').on('click', '.close', function(){
        object_Cancel();
    });

    $('.middleBlock').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='object_delete'){
            //if(8>0){
                if(confirm('Удалить объект?')){ client_object_Delete() }
            //}
        }
        else if(action=='object_reset'){
            client_object_Reset();
        }
        else if(action=='object_edit'){
            client_object_Edit();
        }
        else if(action=='event_edit'){
            client_object_Reset();
            popMenuPosition('#event_pop_list','single');
        }
        else if(action=='object_archive'){
            client_object_set_Status('archive');
        }
        else if(action=='object_unarchive'){
            client_object_set_Status('disconnected');
        }
        else if(action=='object_task'){
            client_object_Task();
        }
        else if(action=='top_object_service_edit'){
            object_service_Edit($(this).parents('#client_object').attr('service_id'));
        }
        else if(action=='top_object_service_cost_edit'){
            service_cost_Edit($(this).parents('#client_object').attr('service_id'),$(this).parents('#client_object').attr('cost_id'));
        }


    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('.datepicker').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        showButtonPanel: true,
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });
});


function client_object_Reset(){
    console.log('client_object_Reset');
    object_Cancel();
    $.ajax({ url:'/system/client/object/ajax/get/?object_id='+object_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']){
                alert(data['error']);
            } else {
                $('div[action=object_archive]').hide();
                $('div[action=object_unarchive]').hide();
                if(data['object_info']['status_label']=='disconnected'){
                    $('div[action=object_archive]').show();
                } else if(data['object_info']['status_label']=='archive'){
                    $('div[action=object_unarchive]').show();
                }

                $('h2.cabinet_title').text(data['object_info']['name']);
                $('#client_object_pop').find('.header b').text('Объект: '+data['object_info']['name']);
                for(var key in data['object_info']){
                    $('td[name='+key+']').html(data['object_info'][key]);
                    $('#client_object_pop [name='+key+']').val(data['object_info'][key]);
                }
                $('#event_list [name=object_status]').text(data['object_info']['status']);

                //$('#client_object td[name=service_list]').html('');
                //$('#client_object td[name=service_list]').html(contract_string_set(data['service_list'][0],'one'));

                $('div.device_list a').remove();
                if(data['object_info']['device']){
                    for(key in data['object_info']['device']){
                        var install = data['object_info']['device'][key];
                        var icon = '<a href="/system/client/'+client_id+'/object/'+object_id+'/device/" ' +
                            'class="btn_ui btn_28" icon="'+install['priority']+'" title="'+install['device__name']+'"><div class="icon"></div></a>';
                        $('#client_object tr[name=service] td:eq(1)').append(icon);
                        var device_string = '<a href="/system/client/'+client_id+'/object/'+object_id+'/device/" class="block">' +
                            '<div class="padding">установлено: '+install['installation_date']+', '+install['installation_user__full_name']+'</div></a>';
                        $('div.device_list').append(device_string);
                    }
                }
                $('#client_object_pop select[name=referer_type_id]').val(data['object_info']['referer_type_id']);
                if(data['object_info']['referer_user']){
                    $('td[name=referer]').html(data['object_info']['referer_user']);
                    $('#client_object_pop select[name=referer_user]')
                        .removeAttr('disabled').show()
                        .val(data['object_info']['referer_user_id']);
                    //.attr('user_id',data['object_info']['referer_user_id']);
                } else {
                    $('#client_object td[name=referer]').html(data['object_info']['referer_type']);
                    $('#client_object_pop select[name=referer_user]').attr('disabled','disabled').hide();
                }
                $('td[name=address]').html(data['address']['string']+' '+data['address']['map_yandex']);
                console.log(data['address']['string']+' '+data['address']['map_yandex']);
                $('td[name=tag_list]').html('');
                var tag_cnt = 0;
                for(var key in data['object_info']['tag_list']){
                    var string = '';
                    if(tag_cnt>0) string = ', '; tag_cnt++;
                    $('td[name=tag_list]').append(string + data['object_info']['tag_list'][key]['name']);
                }

                /* Events */
                /*
                 $('#event_list tbody tr').remove();
                 for(var key in data['event_list']['core_list']){
                 var item = data['event_list']['core_list'][key];

                 var item_tr = '<tr class="row" event_type="'+item['event_type']+'" event_type_id="'+item['event_type_id']+'" title="'+item['event_type_description']+'">' +
                 '<td class="padding right" name="event_type">'+item['event_type_name']+'</td>' +
                 '<td class="cell_2" name="event_date"></td>' +
                 '<td class="cell" name="sentry_user"></td>' +
                 '<td class="cell_3" name="log_date"></td></tr>';
                 $('#event_list tbody').append(item_tr);
                 }

                 // trash, old sur style
                 var item_tr = '<tr class="row" event_type="pause" title="Приостановка">' +
                 '<td class="padding right" name="event_type">Приостановка</td>' +
                 '<td class="cell_2" name="cost_log_pause" colspan="3"></td></tr>';
                 $('#event_list tbody').append(item_tr);
                 */

                $('#event_pop_list input').val('');
                $('tr[action=event]').each(function(){
                    $(this).find('td:eq(1)').html('');
                    $(this).find('td:eq(2)').html('');
                    $(this).find('td:eq(3)').html('');
                    $(this).removeAttr('event_id').removeAttr('service_id');
                });
                for(var key in data['event_list']['core']){
                    var event = data['event_list']['core'][key];
                    //var event_tr = $('#event_list tr[event_type='+event['event_type']+']');
                    var event_tr = $('tr[event_type='+event['event_type']+']');
                    event_tr
                        .attr('event_type_id',event['event_type_id'])
                        .attr('title',event['event_type_description'])
                        .attr('event_id',event['id']);
                    if(event['service_id']) event_tr.attr('service_id',event['service_id']);
                    event_tr.find('td[name=event_type]').html(event['event_type_name']);
                    event_tr.find('td[name=event_date]').html(event['event_date']);
                    event_tr.find('td[name=sentry_user]').html(event['sentry_user']);
                    event_tr.find('td[name=log_date]').html(event['log_date']);

                    $('#event_pop_list tr[event_type='+event['event_type']+']').attr('event_type_id',event['event_type_id']);
                    $('#event_pop_list tr[event_type='+event['event_type']+'] input[name=event_date]').val(event['event_date']);
                    $('#event_pop_list tr[event_type='+event['event_type']+'] input[name=sentry_user]').val(event['sentry_user']);
                    $('#event_pop_list tr[event_type='+event['event_type']+'] input[name=sentry_user]').attr('user_id',event['sentry_user_id']);
                }
                /* Bonus */
                $('div.bonus_list tbody tr').remove();
                for(var key in data['event_list']['bonus']) {
                    var bonus = data['event_list']['bonus'][key];
                    var bonus_tr = '<tr class="row" action="bonus" bonus_type="'+bonus['event_type']+'" bonus_type_id="'+bonus['event_type_id']+'"' +
                        'bonus_id="'+bonus['id']+'" title="'+bonus['event_type_description']+'">' +
                        '<td class="padding right" name="event_type">'+bonus['name']+'</td>' +
                        '<td class="cell_2" name="event_date">'+bonus['event_date']+'</td>' +
                        '<td class="cell" name="sentry_user">'+bonus['sentry_user']+'</td>' +
                        '<td class="cell_3" name="cost">'+bonus['cost']+' руб.</td></tr>';
                    $('div.bonus_list tbody').append(bonus_tr);
                }
                /* reset Pop */
                client_object_tag('set',data['object_info']['tag_list']);
                $('#client_object_pop select[name=address_region]').val(data['address']['region_id']);
                address_locality_Search(data);
            }
        }
    });
}


function client_object_set_Status(status){
    var object_array = {};
    object_array['object_id'] = object_id;
    object_array['status'] = status;
    $.ajax({ url:'/system/client/object/ajax/set_status/',
        type:'post', dataType:'json', traditional:true, data:object_array,
        success: function(data){
            if(data['error']){
                alert(data['error']);
            }
            else {
                client_object_Reset();
                popMessage('Сохранено','green');
            }
        }
    });
}


function client_object_Task(){
    task_Pop(client_id,object_id);
    //popMenuPosition('#task_add__pop','single');
}
