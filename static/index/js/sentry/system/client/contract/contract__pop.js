$(document).ready(function(){

    $('#contract_pop').on('change', 'select[name=referer_type_id]', function(){
        if($(this).val()==1){
            $('#contract_pop select[name=referer_user]').show().val('').removeAttr('disabled');
        } else {
            $('#contract_pop select[name=referer_user]').hide().attr('disabled','disabled');
        }
    });

    $('#contract_pop').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        console.log('pop action: '+action);
        if(action=='reset'){
            client_object_Edit();
        }
        else if(action=='cancel'){
            //client_object_infoCancel();
        }
        else if(action=='object_tag_add'){
            contract_tag('add');
        }
    });

    $('#contract_pop .in_pop_sublist').on('click', '.close', function(){
        var tag_id = $(this).parent().attr('tag_id');
        contract_tag('delete',tag_id)
    });

    contract_Validate();
});


function contract_Edit() {
    contract_Reset();
    popMenuPosition('#contract_pop','single');
}


function contract_number_Interval(contract) {
    // Дибильная и ненужная функция, написано по принуждению. После возмущения клиентов, ушла в корзину.
    $('#contract_pop select[name=name] option').remove();
    if(!!contract){
        var option = '<option>'+contract+'</option>';
        $('#contract_pop select[name=name]').prepend(option);
    }
    var ajax_array = {
        'service_organization_id': $('#contract_pop select[name=service_organization]').val(),
        'service_type_id': $('#contract_pop select[name=service_type]').val()
    };
    $.ajax({ url:'/system/client/contract/ajax/get_contract_interval/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            }
            if(data['error']!=null){
                alert(data['error']);
            } else {
                for(var key in data['contract_list']){
                    var option = '<option>'+data['contract_list'][key]+'</option>';
                    $('#contract_pop select[name=name]').append(option);
                }
                $('#contract_pop select[name=name]').show();
            }
        },
        error: function() {
            loading('end');
        }
    });
}


function contract_Check() {
    $('#contract_pop [name]').removeAttr('disabled');
    $('#contract_pop .ui-datepicker-trigger').show();
    var client_object_contract_register = $('#contract [event_type=client_object_contract_register] [name=event_date]').text();
    if(client_object_contract_register!=''){
        $('#contract_pop input[name]:not([name=comment]), #contract_pop select[name]:not([name=comment])').attr('disabled','disabled');
        $('#contract_pop .ui-datepicker-trigger').hide();
    }
}


function contract_Add() {
    //contract_number_Interval();
    popMenuPosition('#contract_pop','single');
}


function contract_tag(action,data) {
    if(action=='add'){
        var tag_id = parseInt( $('#contract_pop select#client_contract_tags').val() );
        var tag_txt = $('#contract_pop select#client_contract_tags :selected').attr('name');
        if(!!tag_id){
            var span = '<span class="item" tag_id="'+tag_id+'">' +
                '<span class="txt">'+tag_txt+'</span>' +
                '<span class="close" title="Удалить"></span></span>';
            $('#contract_pop div.in_pop_sublist').append(span);
        }
    }
    else if(action=='delete'){
        $('#contract_pop .in_pop_sublist .item[tag_id='+data+']').remove();
    }
    else if(action=='get'){
        var tag_list = [];
        $('#contract_pop .in_pop_sublist .item').each(function(){
            tag_list.push( $(this).attr('tag_id') );
        });
        // Метка материальной ответственности, вот так её сказали отдельно сделать
        if( $('#contract_pop [name=financial_responsibility]').is('[checked]') ){
            tag_list.push(2);
        }
        return JSON.stringify(tag_list);
    }
    else if(action=='set'){
        $('#contract_pop .in_pop_sublist .item').remove();
        $('#contract td[name=financial_responsibility]').html('');
        $('#contract_pop td[name=financial_responsibility]').removeAttr('checked');
        for(var key in data){
            if(data[key]['id']==2){
                $('#contract td[name=financial_responsibility]').html('да');
                $('#contract_pop td[name=financial_responsibility]').attr('checked','checked');
            }
            else {
                var span = '<span class="item" tag_id="'+data[key]['id']+'">' +
                    '<span class="txt">'+data[key]['name']+'</span>' +
                    '<span class="close" title="Удалить"></span></span>';
                $('#contract_pop .in_pop_sublist').append(span);
            }
        }
    }

    $('#contract_pop select#client_contract_tags option').removeAttr('class').removeAttr('selected');
    $('#contract_pop .in_pop_sublist .item').each(function(){
        var tag_id = $(this).attr('tag_id') ;
        $('#contract_pop select#client_contract_tags option[value='+tag_id+']').attr('class','hide');
    });

    if($('#contract_pop select#client_contract_tags option:not(.hide)').length>0){
        $('#contract_pop select#client_contract_tags').show();
        $('#contract_pop span.btn_ui[name=subtypes]').show();
        $('#contract_pop select#client_contract_tags option:not(.hide):first').attr("selected", "selected");
    } else {
        $('#contract_pop select#client_contract_tags').hide();
        $('#contract_pop span.btn_ui[name=subtypes]').hide();
    }
}


function contract_Update() {
    var contract_array = get_each_value('#contract_pop');
    contract_array['client'] = client_id;
    contract_array['contract'] = contract_id;
    var ajax_action = 'add';
    if(contract_id) ajax_action = 'update';
    var referer_user_id = $('#contract_pop [name=referer_user]').val();
    if(referer_user_id) contract_array['referer_user_id'] = referer_user_id;
    contract_array['dir_tag'] = contract_tag('get');
    $.ajax({ url:'/system/client/contract/ajax/'+ajax_action+'/', type:'post', dataType:'json', data:contract_array,
        success: function(data){
            if(data['errors']) message_Pop_array(data['errors'], 'red');
            else if(data['error']!=null){
                alert(data['error']);
            }
            else if(data['url']){
                location.href = data['url'];
            }
            else {
                popMessage('Сохранено','green');
                contract_Reset();
            }
        }
    });
}


function contract_Delete() {
    var contract_id = $('#contract').attr('contract_id');
    $.ajax({ url:'/system/client/contract/ajax/delete/?contract_id='+contract_id, type:'post', dataType:'json',
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else if(data['url']) location.href = data['url'];
        }
    });
}


function contract_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            contract_Update();
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
    $("#contract_pop form").tooltip({
        show: false,
        hide: false
    });

    $("#contract_pop form").validate({ // validate the comment form when it is submitted
        rules: {
            service_organization: {
                required: true
            },
            service_type: {
                required: true
            },
            name: {
                required: true
            },
            charge_month_day: {
                required: true,
                number: true,
                maxlength: 2
            }
        },
        messages: {
            service_organization: {
                required: "Необходима обслуживающая организация"
            },
            service_type: {
                required: "Необходим тип услуги"
            },
            name: {
                required: "Необходим номер договора"
            },
            charge_month_day: {
                required: "Необходим день начисления",
                number: "Только цифры",
                maxlength: "Максимум 2 числа"
            }
        }
    });
}