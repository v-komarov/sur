$(document).ready(function() {
    client_id = $('.middleBlock').attr('client_id');
    object_id = $('.middleBlock').attr('object_id');
    service_Cancel();

    $('#service_list .drop_list').hover(
        function(){
        },
        function(){
            if($(this).attr('changed')=='changed'){
                object_service_Get_list()
            }
        }
    );

    $('#filter_service_type').on('click', 'li', function() {
        $(this).parents('.drop_list').attr('changed','changed');
        if( $(this).attr('checked')=='checked' ){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
    });

    $('#service_list').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='service_reset'){
            object_service_Get_list();
        }
        if(action=='service_add'){
            var name = $(this).attr('name');
            if(name == 'object_service'){
                service_Cancel();
                service_Create()
            }
        }
    });
    $('#client_object, #service_list').on('click', 'tr', function() {
        console.log('click');
        var action = $(this).attr('action');
        var service_id = $(this).parents('.service__item').attr('service_id');
        if(action=='service'){
            object_service_Edit( service_id );
        }
        else if(action=='cost'){
            service_cost_Edit( service_id, $(this).attr('service_cost_id') );
        }
        else if(action=='event'){
            object_event_Edit(service_id, $(this).attr('event_type'), $(this).attr('event_id'));
        }
    });


    $("#service_pop").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            var service_id = $('#service_pop').attr('service_id');
            service_Cancel();
            if(service_id=='new'){
                service_Create();
            } else {
                object_service_Edit( $('#service_pop').attr('service_id') );
            }
        }
        else if(action=='subtype_add'){
            service_subtype('add');
        }
        else if(action=='remove'){
            if (confirm('Удалить услугу?')){
                object_service_Delete( $('#service_pop').attr('service_id') );
                service_Cancel();
            }
        }
    });

    $('#service_pop').find('.header').on('click', '.close', function() {
        service_Cancel();
    });

    $('#service_pop .in_pop_subtypes').on('click', '.close', function() {
        var subtype_id = $(this).parent().attr('subtype_id');
        service_subtype('delete',subtype_id)
    });

    $('#service_pop').on('change', 'select', function() {
        var select_name = $(this).attr('name');
        if(select_name=='service_type'){
            service_subtype('set_type',$(this).val() );
        }
        if(select_name=='service_organization' || select_name=='service_type'){
            service_contract_Interval();
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

    if(object_id!='None') object_service_Get_list();
    object_service_Validate();
});


function service_contract_Interval(contract) {
    $('#service_pop select[name=contract_number] option').remove();
    if(!!contract){
        var option = '<option>'+contract+'</option>';
        $('#service_pop select[name=contract_number]').prepend(option);
    }
    var ajax_array = {};
    ajax_array['service_organization_id'] = $('#service_pop select[name=service_organization]').val();
    ajax_array['service_type_id'] = $('#service_pop select[name=service_type]').val();
    $.ajax({ url:'/system/client/object/service/ajax/get_contract_interval/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                for(var key in data['contract_list']){
                    var option = '<option>'+data['contract_list'][key]+'</option>';
                    $('#service_pop select[name=contract_number]').append(option);
                }
                $('#service_pop select[name=contract_number]').show();
            }
        }
    });
}


function object_service_Get_list() {
    $('.pop').hide();
    $('#service_list .down_box').removeAttr('changed');
    var cost_array = {};
    cost_array['object_id'] = object_id;
    var service_type_list = [];
    $("#filter_service_type [checked=checked]").each(function() {
        service_type_list.push( $(this).attr('service_type_id') );
    });
    cost_array['service_type_list'] = JSON.stringify( service_type_list );
    $.ajax({ url:'/system/client/object/service/ajax/get_list/', type:'get', dataType:'json', traditional:true, data:cost_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            }
            else {
                $('#service_list .service__item').remove();
                if($('div').is('#event_pop')) $('#event_pop select[name=service] option').remove();
                for(var key in data['service_list']){
                    $('div[action=service_add]').hide();
                    var service = data['service_list'][key];
                    if(service['cost_type_id']==4){ service['cost']='' }
                    $('td[name=contract_number]').html(contract_string_set(service,'one'));
                    $('td[name=contract_date]').html(service['contract_date']);

                    var service__item = '<div class="service__item" service_id="'+service['id']+'">' +
                        '<table class="tableInfo wide"><tbody class="show">' +
                            //'<tr class="row" action="service"><td class="padding_5 text_right">Договор</td><td>'+contract_string_set(service,'one')+'</td></tr>' +
                            //'<tr class="row" action="service"><td class="padding_5 text_right border_right">Обслуживающая организация</td><td class="padding_5">'+service['service_organization__name']+'</td></tr>' +
                        '<tr class="row" action="service"><td class="padding_5 text_right border_right">Название / Номер на пульте</td><td class="padding_5">'+service['name']+'</td></tr>' +
                        '<tr class="row" action="service"><td class="padding_5 text_right border_right">Адрес</td><td class="padding_5" name=address></td></tr>';
                    //'<tr class="row" action="service"><td class="padding_5 text_right border_right">Дата подключения</td><td class="padding_5">'+service['contract_date']+'</td></tr>';

                    if($.inArray('system.client', lunchbox['permissions'])>=0) {
                        service__item += '<tr class="row" action="cost" service_cost_id="'+service['cost_id']+'">' +
                        '<td class="padding_5 text_right border_right">Стоимость</td><td class="cell">'+service['cost']+' '+service['cost_type']+'</td></tr>' +
                        '<tr class="row" action="cost" service_cost_id="'+service['cost_id']+'">' +
                        '<td class="padding_5 text_right border_right">День начисления</td><td class="cell">'+service['month_day']+', '+service['month']+'</td></tr>' +
                        '</tr>';
                    }
                    service__item += '<tr class="row" action="service"><td class="padding_5 text_right border_right">Пароль</td><td class="padding_5">'+service['password']+'</td></tr>' +
                    '<tr class="row" action="service"><td class="padding_5 text_right border_right">ГБР</td><td class="padding_5">'+service['security_squad__name']+'</td></tr>' +

                    '</tbody></table>' +
                    '<div class="event_list">' +
                    '<div class="bonus__button_list"><!--b class="txt">Статус объекта</b><b class="txt right" name="status">Подключен</b--></div>' +

                    '<table class="tableInfo wide"><tbody class="show">' +
                    '<tr class="row" action="event" event_type="client_object_warden" event_type_id="1">' +
                    '<td class="padding text_right" name="event_type">Ответственный менеджер</td>' +
                    '<td class="cell_2" name="event_date"></td>' +
                    '<td class="cell" name="sentry_user"></td>' +
                    '<td class="cell_3" name="log_date"></td></tr>' +
                        /*
                         '<tr class="row" event_type="client_object_warden" event_type_id="1" event_id="9" action="event">' +
                         '<td class="padding text_right" name="event_type">Договор зарегистрирован</td>' +
                         '<td class="cell" name="sentry_user"></td></tr>' +

                         '<tr class="row" event_type="client_object_warden" event_type_id="1" event_id="9" action="event">' +
                         '<td class="padding text_right" name="event_type">Договор вернулся</td>' +
                         '<td class="cell" name="sentry_user"></td></tr>' +
                         */
                    '<tr class="row" action="event" event_type="client_object_connect" event_type_id="6" title="Подключение объекта">' +
                    '<td class="padding text_right" name="event_type">Подключение</td>' +
                    '<td class="cell_2" name="event_date"></td>' +
                    '<td class="cell" name="sentry_user"></td>' +
                    '<td class="cell_3" name="log_date"></td></tr>' +

                    '<tr class="row" action="event" event_type="client_object_disconnect" event_type_id="7" title="Отключение объекта">' +
                    '<td class="padding text_right" name="event_type">Отключение</td>' +
                    '<td class="cell_2" name="event_date"></td>' +
                    '<td class="cell" name="sentry_user"></td>' +
                    '<td class="cell_3" name="log_date"></td></tr>' +
                        /*
                         '<tr class="row" event_type="client_object_warden" event_type_id="1" title="Назначение ответственного менеджера" event_id="9">' +
                         '<td class="padding text_right" name="event_type">Уведомление ОВД (подключение)</td>' +
                         '<td class="cell" name="sentry_user"></td></tr>' +

                         '<tr class="row" event_type="client_object_warden" event_type_id="1" title="Уведомление ОВД (отключение)" event_id="9">' +
                         '<td class="padding text_right" name="event_type">Уведомление ОВД (отключение)</td>' +
                         '<td class="cell" name="sentry_user"></td></tr>' +
                         */
                    '<tr class="row" action="pause" event_type="pause" title="Приостановка">' +
                    '<td class="padding text_right" name="event_type">Приостановка</td>' +
                    '<td class="cell_2" name="event_date"></td>' +
                    '<td class="cell" name="sentry_user"></td>' +
                    '<td class="cell_3" name="log_date"></td></tr>' +

                    '</tbody></table></div>' +
                    '<div class="clear">' +
                    '<div class="button_list"><b class="txt">Объектовые устройства</b>' +
                    '<div class="device_list"></div>' +
                    '</div>' +

                    '<div class="clear">' +
                    '<div class="bonus_list">' +
                    '<div class="button_list__button"><b class="txt">Бонусы</b>' +
                    '<div class="btn_ui" action="bonus_add" icon="object_add" title="Добавить бонус"><div class="icon"></div></div>' +
                    '</div>' +
                    '<table class="tableInfo wide"><tbody class="bonus_list show">' +
                    '</div>';

                    $('#service_list #list').append(service__item);

                    if($('div').is('#event_pop')){
                        var option = '<option value="'+service['id']+'">'+service['service_string']+' '+service['name']+'</option>';
                        $('#event_pop select[name=service]').append(option);
                    }
                }
                client_object_Reset();
            }
        }
    });
}


function object_service_Delete(service_id) {
    $.ajax({ url:'/system/client/object/service/ajax/delete/?service_id='+service_id, type:'get', dataType:'json',
        success: function(data) {
            if($('table.tableInfo').is('#client_object')) {
                client_object_Reset();
            }
            object_service_Get_list();
        }
    });
}


function service_Create() {
    service_Cancel();
    $('#service_pop tr.row').show();
    $('#service_pop select').removeAttr('disabled');
    $('#service_pop .header b').text('Добавление услуги');
    $('#service_pop').attr('service_id','new');
    $('#service_pop [name=status]').val(1);
    service_subtype('set_type');
    service_contract_Interval();
    popMenuPosition('#service_pop','single');
}


function object_service_Edit(service_id) {
    service_Cancel();
    //$('#service_list [service_id='+service_id+']').attr('class','row hover');
    $('#service_pop').attr('service_id',service_id);
    //$('#service_pop select[name=service_organization]').attr('disabled','disabled');
    //$('#service_pop select[name=service_type]').attr('disabled','disabled');
    popMenuPosition('#service_pop','single');
    $.ajax({ url:'/system/client/object/service/ajax/get/?service_id='+service_id, type:'post', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('#service_pop .header b').text( data['service']['service_string'] );
                for(var key in data['service']){
                    $('#service_pop [name=' + key + ']').val(data['service'][key]);
                }
                service_contract_Interval(data['service']['contract_number']);
                service_subtype('set_type',data['service']['service_type']);
                service_subtype('set',data['subtype_list']);
            }
        }
    });
}


function service_subtype(action,data) {
    if(action=='add'){
        var subtype_id = parseInt( $('#service_pop select#subtypes').val() );
        var subtype_txt = $('#service_pop select#subtypes :selected').attr('short_name');
        var span = '<span class="item" subtype_id="'+subtype_id+'">' +
            '<span class="txt">'+subtype_txt+'</span>' +
            '<span class="close" title="Удалить"></span></span>';
        $('#service_pop').find('.in_pop_subtypes').append(span);
    }
    else if(action=='delete') {
        $('#service_pop .in_pop_sublist .item[subtype_id='+data+']').remove();
    }
    else if(action=='get') {
        var subtype_list = [];
        $('#service_pop .in_pop_sublist .item').each(function(){
            subtype_list.push( $(this).attr('subtype_id') );
        });
        return JSON.stringify(subtype_list);
    }
    else if(action=='set_type') {
        $('#service_pop .in_pop_sublist .item').remove();
        if(!data) data = $('#service_pop select[name=service_type]').val();
        $('#service_pop select#subtypes').attr('service_type_id',data);
        $('#service_pop select#subtypes option').attr('class','hide');
        $('#service_pop select#subtypes option[service_type_id='+data+']').removeAttr('class');
    }
    else if(action=='set') {
        $('#service_pop .in_pop_sublist .item').remove();
        for(var key in data){
            var span = '<span class="item" subtype_id="'+data[key]['id']+'">' +
                '<span class="txt">'+data[key]['name']+'</span>' +
                '<span class="close" title="Удалить"></span></span>';
            $('#service_pop .in_pop_sublist').append(span);
        }
    }
    var service_type_id = $('#service_pop select#subtypes').attr('service_type_id');
    $('#service_pop select#subtypes option[service_type_id='+service_type_id+']').removeAttr('class').removeAttr('selected');
    $('#service_pop .in_pop_sublist .item').each(function(){
        var subtype_id = $(this).attr('subtype_id') ;
        $('#service_pop select#subtypes option[value='+subtype_id+']').attr('class','hide');
    });

    if($('#service_pop select#subtypes option:not(.hide)').length>0){
        $('#service_pop select#subtypes').show();
        $('#service_pop span.btn_ui[action=subtype_add]').show();
        $('#service_pop select#subtypes option:not(.hide):first').attr("selected", "selected");
    } else {
        $('#service_pop select#subtypes').hide();
        $('#service_pop span.btn_ui[action=subtype_add]').hide();
    }
}


function object_service_Update() {
    var service_array = {};
    service_array['object_id'] = object_id;
    service_array['service_id'] = $('#service_pop').attr('service_id');
    var service_name = $('#service_pop').find('input[name=name]').val();
    if(service_name) service_array['name'] = service_name;

    var contract_number = $('#service_pop select[name=contract_number] option:selected').text();
    if(!!contract_number) service_array['contract_number'] = contract_number;

    service_array['password'] = $('#service_pop').find('input[name=password]').val();
    service_array['begin_date'] = $('#service_pop').find('input[name=begin_date]').val();
    service_array['end_date'] = $('#service_pop').find('input[name=end_date]').val();
    //service_array['status'] = $('#service_pop').find('select[name=status]').val();
    service_array['service_type_id'] = $('#service_pop').find('select[name=service_type]').val();
    service_array['service_organization'] = $('#service_pop').find('select[name=service_organization]').val();
    service_array['security_squad'] = $('#service_pop').find('select[name=security_squad]').val();
    service_array['subtype_list'] = service_subtype('get');

    var comment = $('#service_pop textarea[name=comment]').val();
    if(comment) service_array['comment'] = comment;
    $.ajax({ url:'/system/client/object/service/ajax/update/',
        type:'post', dataType:'json', traditional:true, data:service_array,
        success: function(data){
            if(data['error']){
                alert(data['error']);
            }
            else {
                popMessage('Сохранено','green');
                if($('table.tableInfo').is('#client_object')){
                    client_object_Reset();
                }
                object_service_Get_list();
            }
        }
    });
}


function object_Cancel() {
    if($('table').is('#event_list')) {
        $('#event_pop').hide();
        $('#event_pop input').val('');
        $('#event_pop textarea').val('');
        $('#event_list tbody tr.row').attr('class','row');
        $('#bonus_list tbody tr.row').attr('class','row');
    }
}


function service_Cancel() {
    object_Cancel();
    $('#service_pop input').val('');
    $('#service_pop textarea').val('');
    $('#service_pop .in_pop_sublist .item').remove();
}


function object_service_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            object_service_Update();
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
    $("#service_pop form").tooltip({
        show: false,
        hide: false
    });

    $("#service_pop form").validate({ // validate the comment form when it is submitted
        rules: {
            name: {
                required: true,
                minlength: 3
            },
            contract_number: {
                required: true
            }
            /*password: {
             required: true,
             minlength: 3
             }*/
        },
        messages: {
            name: {
                required: "Необходимо наименование",
                minlength: "Минимум 3 знака"
            },
            contract_number: {
                required: "Необходим контракт"
            }
            /*password: {
             required: "Необходим пароль",
             minlength: "Минимум 3 знака"
             }*/
        }
    });
}