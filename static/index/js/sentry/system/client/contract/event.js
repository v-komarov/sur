$(document).ready(function(){

    $('#event_pop').on('change','select[name=event_type]', function(){
        bonus_select_Switch();
    });

    $('#event_pop_list').on('click','td.data', function(){
        console.log('click');
        $(this).find('input').removeAttr('disabled');
    });
    $('#event_pop_list').on('change','input', function(){
        console.log('был изменен.');
    });
    $('#event_pop_list').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='clean_event'){
            $(this).parents('tr.row').find('input').val('');
        }
    });

    $('#event_pop_list [name=sentry_user], #event_pop [name=sentry_user], #bonus_pop [name=sentry_user]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/sentry_user/ajax/search/', type:'get', dataType:'json',
                data: {full_name:request.term, limit:10},
                success: function(data) {
                    response($.map(data['user_list'], function(item) {
                        return { label:item.full_name, user_id:item.id }
                    }));
                }
            });
        },
        change: function(event, ui){
            if(ui.item){
                $(this).attr('user_id', ui.item.user_id);
            } else {
                $(this).val('').removeAttr('user_id');
            }
        },
        //select: function(event, ui) { $('tr#holding__name').attr('holding_id', ui.item.holding_id); },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    event_Validate();
});


function event_Draw(type,object_id,event_list) {
    //console.log('event_Draw, object_id: '+object_id);
    if(type=='object'){
        var block = $('.object__item[object_id='+object_id+']');
    }
    else if(type=='contract'){
        var block = $('#contract[contract_id='+object_id+']');
    }
    block.find('tr[action=event]').each(function(){
        $(this).find('td:eq(1)').html('');
        $(this).find('td:eq(2)').html('');
        $(this).find('td:eq(3)').html('');
        $(this).removeAttr('event_id').removeAttr('object_id');
    });
    if(event_list && event_list['core']){
        for(var event_key in event_list['core']){
            var event = event_list['core'][event_key];
            if(event['event_type']=='client_object_warden'){
                var event_td = block.find('tr[action=object] td[name=client_object_warden]');
                event_td.attr('event_id',event['id']);
                event_td.find('span[name=event_date]').html(event['event_date']);
                event_td.find('span[name=sentry_user]').html(event['sentry_user']);
                event_td.find('span[name=log_date]').html(event['log_date']);
            }
            else {
                var event_tr = block.find('tr[event_type='+event['event_type']+']');
                event_tr
                    .attr('event_type_id',event['event_type_id'])
                    .attr('title',event['event_type_description'])
                    .attr('event_id',event['id'])
                    .attr('sentry_user_id',event['sentry_user_id']);
                event_tr.find('td[name=event_type]').html(event['event_type_name']);
                event_tr.find('td[name=event_date]').html(event['event_date']);
                event_tr.find('td[name=sentry_user]').html(event['sentry_user']);
                event_tr.find('td[name=log_date]').html(event['log_date']);
            }
        }
    }
    if(event_list && event_list['bonus']) {
        for (var event_key in event_list['bonus']) {
            var event = event_list['bonus'][event_key];
            var event_tr = '<tr class="row" action="bonus" event_type="' + event['event_type'] + '" event_id="' + event['id'] + '">' +
                '<td class="padding right" name="event_type">' + event['event_type_name'] + '</td>' +
                '<td class="cell_2" name="event_date">' + event['event_date'] + '</td>' +
                '<td class="cell" name="sentry_user">' + event['sentry_user'] + '</td>' +
                '<td class="cell_3">' + event['cost'] + ' руб.</td></tr>';
            block.find('.bonus_list tbody').append(event_tr);
            event_tr = $('[event_id=' + event['id'] + ']');
            event_tr
                .attr('event_type_id', event['event_type_id'])
                .attr('title', event['event_type_description'])
                .attr('event_id', event['id']);
            event_tr.find('td[name=event_type]').html(event['event_type_name']);
            event_tr.find('td[name=event_date]').html(event['event_date']);
            event_tr.find('td[name=sentry_user]').html(event['sentry_user']);
            event_tr.find('td[name=log_date]').html(event['log_date']);
        }
    }

}


function event_Edit(contract_id,object_id,event_type,event_id) {
    //console.log('event_Edit, event_type: '+event_type+', event_id: '+event_id+', contract_id: '+contract_id+', object_id: '+object_id);
    $('#event_pop select[name=event_type]').parents('tr').hide();
    $('#event_pop')
        .removeAttr('contract_id')
        .removeAttr('object_id')
        .removeAttr('event_type_id')
        .removeAttr('event_id');
    //if($.inArray('system.'+event_type, lunchbox['permissions'])>=0){
    if($.inArray('system.client', lunchbox['permissions'])>=0){
        if(!!contract_id){
            $('#event_pop').attr('contract_id',contract_id);
            var tr = $('#contract tr[event_type='+event_type+']');
        } else {
            $('#event_pop').attr('object_id',object_id);
            var tr = $('.object__item[object_id='+object_id+'] tr[event_type='+event_type+']');
        }

        var event_type_id = tr.attr('event_type_id');
        $('#event_pop').attr('event_type_id',event_type_id);
        $('#event_pop .header b').text(tr.find('td[name=event_type]').text());
        $('#event_pop select[name=sentry_user] option[name=choosen]').remove();
        if(event_type=='client_object_warden') {
            $('#event_pop select[name=service]').parents('tr').hide();
            $('#event_pop select[name=sentry_user]').removeAttr('disabled');
        } else {
            $('#event_pop select[name=service]').parents('tr').show();
            $('#event_pop select[name=sentry_user]').attr('disabled','disabled');
        }
        $('#event_pop select[name=bonus_type_id]').parents('tr').hide();
        $('#event_pop input[name=cost]').attr('disabled','disabled').parents('tr').hide();
        $('#event_pop input[name=event_date]').val(lunchbox['setting']['today']);
        $('#event_pop textarea[name=comment]').val('');

        // Договор не зарегистрирован и не вернулся - нельзя подключить обьект вручную
        if( event_type=='client_object_connect' && !event_id &&
            $('#contract [event_type=client_contract_register] [name=event_date]').text()=='' &&
            $('#contract [event_type=client_contract_return] [name=event_date]').text()=='' ){
            popMessage('Договор должен быть зарегистрирован и вернулся','red');
        }
        // Подключение для ПЦН возможно только при установленных ОУ
        else if( event_type=='client_object_connect' && !event_id &&
            $('#contract').attr('service_type_id')==1 &&
            $('.object__item[object_id='+object_id+'] .device_list tbody').children().length<1 ){
            popMessage('Подлючение объекта ПЦН возможно только установки ОУ','red');
        }
        else {
            if(!!event_id){
                $('#event_pop').attr('event_id',event_id);
                $('#event_pop div[action=event_delete]').show();
                $.ajax({ url:'/system/client/object/ajax/event_get/?event_id='+event_id, type:'get', dataType:'json',
                    success: function(data){
                        if(data['error']) {
                            alert(data['error']);
                        } else {
                            for(key in data['event']){
                                $('#event_pop [name='+key+']').val(data['event'][key]);
                            }
                            //console.log('sentry_user:',data['event']['sentry_user_id']);
                            if( !$('#event_pop select[name=sentry_user] option[value='+data['event']['sentry_user_id']+']').is('option') ){
                                var item_option = '<option value="'+data['event']['sentry_user_id']+'" name="choosen">'+data['event']['sentry_user_name']+'</option>';
                                $('#event_pop select[name=sentry_user] option:eq(0)').after(item_option);
                            }
                            $('#event_pop select[name=sentry_user]').val(data['event']['sentry_user_id']);
                        }
                    }
                });
            }
            else {
                if( !$('#event_pop select[name=sentry_user] option[value='+lunchbox['setting']['sentry_user_id']+']').is('option') ){
                    var item_option = '<option value="'+lunchbox['setting']['sentry_user_id']+'" name="choosen">'+lunchbox['setting']['sentry_user_full_name']+'</option>';
                    $('#event_pop select[name=sentry_user] option:eq(0)').after(item_option);
                }
                $('#event_pop select[name=sentry_user]').val(lunchbox['setting']['sentry_user_id']);
                $('#event_pop div[action=event_delete]').hide();
            }
            popMenuPosition('#event_pop','single');
        }
    }
    else {
        popMessage('Редактирование запрещено','red');
    }
}


function bonus_Edit(object_id,event_type,event_id) {
    //console.log('bonus_Edit, object_id: '+object_id);
    object_Cancel();
    $('#event_pop').attr('object_id',object_id);
    $('#event_pop').removeAttr('event_type_id').removeAttr('event_id');
    $('#event_pop select[name=event_type]').parents('tr').show();
    $('#event_pop select[name=event_type] option').removeAttr('selected');
    $('#event_pop .header b').text('Бонус');
    $('#event_pop input[name=cost]').removeAttr('disabled').parents('tr').show();
    $('#event_pop select[name=sentry_user] option[name=choosen]').remove();
    $('#event_pop select[name=sentry_user]').removeAttr('disabled');
    $('#event_pop select[name=service]').parents('tr').hide();
    $('#event_pop div[action=event_delete]').hide();
    if(!!event_id) {
        $('#event_pop').attr('event_id',event_id);
        $('#event_pop div[action=event_delete]').show();
        $.ajax({ url:'/system/client/object/ajax/event_get/?event_id='+event_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']){
                    alert(data['error']);
                } else {
                    for(key in data['event']) $('#event_pop [name='+key+']').val(data['event'][key]);
                    //console.log('sentry_user:',data['event']['sentry_user_id']);
                    if( !$('#event_pop select[name=sentry_user] option[value='+data['event']['sentry_user_id']+']').is('option') ){
                        var item_option = '<option value="'+data['event']['sentry_user_id']+'" name="choosen">'+data['event']['sentry_user_name']+'</option>';
                        $('#event_pop select[name=sentry_user] option:eq(0)').after(item_option);
                    }
                    $('#event_pop select[name=sentry_user]').val(data['event']['sentry_user_id']);
                    $('#event_pop select[name=event_type]').val(data['event']['event_type_id']);
                }
            }
        });
    }
    else {
        var select_val = $('#event_pop select[name=event_type] option[name='+event_type+']').val();
        $('#event_pop select[name=event_type]').val(select_val);
        if( !$('#event_pop select[name=sentry_user] option[value='+lunchbox['setting']['sentry_user_id']+']').is('option') ){
            var item_option = '<option value="'+lunchbox['setting']['sentry_user_id']+'" name="choosen">'+lunchbox['setting']['sentry_user_full_name']+'</option>';
            $('#event_pop select[name=sentry_user] option:eq(0)').after(item_option);
        }
        $('#event_pop select[name=sentry_user]').val(lunchbox['setting']['sentry_user_id']);
    }
    bonus_select_Switch();
    popMenuPosition('#event_pop','single');
}


function bonus_select_Switch() {
    //console.log( lunchbox['bonus'] );
    var object_id = $('#event_pop').attr('object_id');
    var label = $('#event_pop select[name=event_type] option:selected').attr('name');
    var event_date = $('#event_pop input[name=event_date]').val();
    if(!event_date) $('#event_pop input[name=event_date]').val(lunchbox['setting']['today']);
    $('#event_pop input[name=cost]').val(lunchbox['bonus'][label]['cost']);
    $('#event_pop select[name=sentry_user]').val( lunchbox['bonus'][label]['sentry_user_id'] );
    // Бонус менеджеру
    if(label=='manager'){
        var referer_user_id = $('.object__item[object_id='+object_id+'] td[name=referer]').attr('referer_user_id');
        var manager_cost = $('.object__item[object_id='+object_id+'] td[name=cost] span[name=value]').text();
        if(!!manager_cost){
            $('#event_pop input[name=cost]').val(manager_cost);
        }
        if(!!referer_user_id){
            $('#event_pop select[name=sentry_user]').val(referer_user_id);
        }
    }
    // Бонус за подключение
    if(label=='connect'){
        var sentry_user_id = $('.object__item[object_id='+object_id+'] .device_list tbody tr:eq(0)').attr('sentry_user_id');
        if(!!sentry_user_id){
            $('#event_pop select[name=sentry_user]').val(sentry_user_id);
        }
    }
    //$('#event_pop input[name=sentry_user]').val(lunchbox['bonus'][label]['sentry_user_full_name']).attr('user_id',lunchbox['bonus'][label]['sentry_user_id']);
    $('#event_pop').attr('event_type_id',$('#event_pop select[name=event_type]').val());
}


function event_Update(action,event_type) {
    console.log('event_Update');
    var event_array = get_each_value('#event_pop');
    event_array['workflow'] = $('#event_pop').attr('event_id');
    event_array['workflow_date'] = event_array['event_date'];
    event_array['workflow_type'] = $('#event_pop').attr('event_type_id');
    event_array['contract'] = $('#contract').attr('contract_id');
    event_array['object'] = $('#event_pop').attr('object_id');
    event_array['sentry_user'] = $('#event_pop select[name=sentry_user]').val();
    $.ajax({ url:'/system/client/object/ajax/'+action+'/', type:'post', dataType:'json', data:event_array,
        success: function(data){
            if(data['error']){
                alert(data['error']);
            } else if(data['answer']=='done'){
                popMessage('Сохранено','green');
                contract_Reset();
                $('#event_pop').hide();
            }
        }
    });
}


function event_Validate(){
    $.validator.setDefaults({
        submitHandler: function() {
            event_Update('event_update');
        },
        showErrors: function(map, list) { // there's probably a way to simplify this
            var focussed = document.activeElement;
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("close", {
                    currentTarget: focussed
                }, true)
            }
            this.currentElements.removeAttr("title").removeClass("ui-state-highlight");
            $.each(list, function(index, error) {
                $(error.element).attr("title", error.message).addClass("ui-state-highlight");
            });
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("open", {
                    target: focussed
                });
            }
        }
    });

    // use custom tooltip; disable animations for now to work around lack of refresh method on tooltip
    $('#event_pop form').tooltip({
        show: false,
        hide: false
    });

    $('#event_pop form').validate({ // validate the comment form when it is submitted
        rules: {
            cost: {
                required: true
            },
            event_date: {
                required: true
            },
            sentry_user: {
                required: true
            },
            comment: {
                required: false
            }
        },
        messages: {
            cost: {
                required: "Необходима сумма"
            },
            event_date: {
                required: "Необходима дата"
            },
            sentry_user: {
                required: "Необходим сотрудник"
            },
            comment: {
                required: "Комментарий"
            }
        }
    });
}


function check_event(){
    $('#event_pop_list tbody tr.row').each(function(){
        var begin_date = $(this).find('input[name=begin_date]').val();
        var sentry_user = $(this).find('input[name=sentry_user]').val();
        //console.log(begin_date+' '+sentry_user);
        if(!!begin_date || !!sentry_user){
            $(this).find('input').removeAttr('disabled');
        } else {
            $(this).find('input').attr('disabled','disabled');
        }
    });

    $('#event_pop_list form').validate().resetForm();
    //event_Validate();
}