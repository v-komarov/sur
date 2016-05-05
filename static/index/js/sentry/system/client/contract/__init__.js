$(document).ready(function(){
    client_id = $('.middleBlock').attr('client_id');
    object_id = $('.middleBlock').attr('object_id');
    contract_id = $('.middleBlock').attr('contract_id');

    if(!contract_id) contract_Add();
    else contract_Reset();

    $('#contract, #object_list').on('click', 'tr', function(){
        var action = $(this).attr('action');
        if(action=='contract'){
            contract_Edit();
        }
        else if(action=='object'){
            object_Edit( $(this).parents('.object__item').attr('object_id') );
        }
        else if(action=='cost'){
            cost_Edit( $(this).parents('[object_id]').attr('object_id'), $(this).attr('object_cost_id') );
        }
        else if(action=='event'){
            var contract_id = $(this).parents('#contract').attr('contract_id');
            var object_id = $(this).parents('[object_id]').attr('object_id');
            event_Edit(contract_id, object_id, $(this).attr('event_type'), $(this).attr('event_id'));
        }
        else if(action=='bonus') bonus_Edit(
            $(this).parents('.object__item').attr('object_id'),
            $(this).attr('event_type_id'),
            $(this).attr('event_id')
        );
        else if(action=='pause'){
            var object_id = $(this).parents('.object__item').attr('service_id');
            var object_cost_id = $(this).parents('.object__item').find('[object_cost_id]').attr('object_cost_id');
            // Без подключения не приостанавается
            var client_object_connect = $(this).parents('.object__item').find('[event_type=client_object_connect] [name=event_date]').text();
            if(client_object_connect=='') popMessage('Не произведено подключение','red');
            else if(!object_cost_id) popMessage('Стоимость не определена','red');
            else if(!!object_cost_id) {
                cost_Edit(object_id, object_cost_id, 'pause');
            }
        }
        else if(action=='device_install'){
            device_install_Edit($(this).parents('[object_id]').attr('object_id'), $(this).attr('device_install_id'));
        }

    });

    $(document).on('click', 'td[name=pause_list] div.pause__item', function(){
        cost_Edit( $(this).parents('.object__item').attr('service_id'), $(this).attr('object_cost_id') );
    });

    $('body').on('click', '.btn_ui:not(.disabled)', function(){
        var action = $(this).attr('action');

        if(action=='contract_reset') contract_Reset();
        else if(action=='contract_edit') contract_Edit();
        else if(action=='contract_delete'){
            if(confirm('Удалить договор?')) contract_Delete();
        }
        else if(action=='object_add') object_Edit();
        else if(action=='object_edit') object_Edit( $(this).parents('.object__item').attr('object_id') );
        else if(action=='object_reset') object_Edit( $('#object_pop').attr('object_id') );
        else if(action=='object_delete'){
            if(confirm('Удалить объект?')) object_Delete( $('#object_pop').attr('object_id') );
        }
        else if(action=='object_archive') client_object_set_Status('archive');
        else if(action=='object_unarchive') client_object_set_Status('disconnected');
        else if(action=='object_task') client_object_Task();

        else if(action=='top_object_edit'){
            object_Edit($(this).parents('#contract').attr('service_id'));
        }
        else if(action=='top_object_cost_edit'){
            cost_Edit( $(this).parents('#contract').attr('service_id'), $(this).parents('#contract').attr('object_cost_id') );
        }
        else if(action=='object_delete'){
            //if(8>0){
                if(confirm('Удалить объект?')){ client_object_Delete() }
            //}
        }
        else if(action=='device_install_add'){
            device_install_Edit($(this).parents('[object_id]').attr('object_id'));
        }
        else if(action=='device_install_priority'){
            device_install_Priority( $(this).parents('tr').attr('install_id') );
        }
        else if(action=='device_install_delete'){
            if(confirm('Удалить подключение?')) device_install_Delete();
        }
        else if(action=='device_install_reset'){
            device_install_Edit($('#device_install_pop').attr('service_id'), $('#device_install_pop').attr('device_install_id'));
        }

        else if(action=='device_update') device_Update();

        else if(action=='event_delete'){
            event_Update('event_delete');
        }
        else if(action=='bonus_add'){
            bonus_Edit($(this).parents('.object__item').attr('object_id'), 'manager');
        }

    });

    $('.pop').on('change', 'select', function() {
        var select_name = $(this).attr('name');
        if(select_name=='service_type'){
            service_subtype('set_type',$(this).val());
        }
        if(select_name=='service_organization' || select_name=='service_type'){
            contract_number_Interval();
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

