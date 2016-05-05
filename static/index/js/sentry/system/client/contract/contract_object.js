$(document).ready(function() {

    $("#object_pop").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='subtype_add') {
            service_subtype('add');
        }
        else if(action=='object_delete') {
            if(confirm('Удалить объект?')) {
                object_Delete( $('#object_pop').attr('object_id') );
                object_Cancel();
            }
        }
        else if(action=='object_tag_add') {
            object_Tag('add');
        }
    });

    $('#object_pop .in_pop_sublist').on('click', '.close', function() {
        var tag_id = $(this).parent().attr('tag_id');
        object_Tag('delete',tag_id)
    });

    $('#object_pop').on('change', 'select[name=console]', function() {
        console_number_interval_Set();
    });

    $('#object_pop').on('click', 'td.switch', function() {
        if($(this).attr('checked') == 'checked') {
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked', 'checked');
        }
    });

    $('#object_pop').on('change', 'select[name=referer_type]', function() {
        if($(this).val()==1) {
            $('#object_pop select[name=referer_user]').show().val('').removeAttr('disabled');
        } else {
            $('#object_pop select[name=referer_user]').hide().attr('disabled','disabled');
        }
    });

    $('#object_pop').find('.header').on('click', '.close', function() {
        object_Cancel();
    });

    $('#object_pop').on('click', '[action=cost_add]', function() {
        var cost_id = $(this).parents('td').find('[name=cost_value]').attr('item_id');
        cost_Edit( $(this).parents('[object_id]').attr('object_id'), cost_id, 'cost_add' );
    });

    $('#object_pop .in_pop_subtypes').on('click', '.close', function() {
        var subtype_id = $(this).parent().attr('subtype_id');
        service_subtype('delete',subtype_id)
    });

    $('#object_pop').on('change', 'select[name=address_region]', function() {
        address_locality_Search('change');
    });

    $('#object_pop input[name=address_street]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/street/ajax/search/', type:'get', dataType:'json', data: {
                    locality_id: $('#object_pop select[name=address_locality]').val(),
                    street_name: $('#object_pop input[name=address_street]').val(),
                    limit: 19 },
                success: function(data) {
                    response($.map(data['street'], function(item) {
                        return {
                            label: item.name,
                            street_id: item.id
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            if(ui.item){
                var street_id = ui.item.street_id
            } else {
                $(this).removeAttr('item_id');
                $('input[name=address_street]').val('');
            }
            $('#object_pop input[name=address_street]').attr('item_id',street_id);
            $('#object_pop input[name=address_building]').val('');
        },
        change: function(event, ui) { // change duplicate select
            if(ui.item){
                $(this).attr('item_id',ui.item.street_id);
                $('#object_pop input[name=address_building]').autocomplete('enable');
            } else {
                $(this).removeAttr('item_id');
                $('input[name=address_street]').val('');
                $('#object_pop input[name=address_building]').autocomplete('disable');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('#object_pop input[name=address_building]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/building/ajax/search/', type:'get', dataType:'json', data: {
                    street_id: $('#object_pop input[name=address_street]').attr('item_id'),
                    building_name: request.term ,
                    limit: 9 },
                success: function(data) {
                    response($.map(data['buildings'], function(item) {
                        return {
                            label: item.name,
                            building_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id',ui.item.building_id);
            } else {
                $(this).removeAttr('item_id')
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    object_Validate();
});


function console_number_interval_Set(number) {
    console.log(number);
    $('#object_pop select[name=console_number] option').remove();
    if(!!number) {
        var option = '<option>'+number+'</option>';
        $('#object_pop select[name=console_number]').prepend(option);
    }
    var ajax_array = {};
    ajax_array['service_organization_id'] = $('#contract').attr('service_organization_id');
    ajax_array['device_console_id'] = $('#object_pop [name=console]').val();
    ajax_array['exclude'] = 'true';
    $.ajax({ url:'/system/directory/console_interval/ajax/console_interval_list/', type:'get', dataType:'json', data:ajax_array,
        success: function(data) {
            if(data['error']!=null) alert(data['error']);
            else {
                $('#object_pop select[name=console_number]').append('<option />');
                for(var key in data['console_number_list']){
                    var option = '<option value="'+data['console_number_list'][key]+'">'+data['console_number_list'][key]+'</option>';
                    $('#object_pop select[name=console_number]').append(option);
                }
            }
        }
    });
}


function object_Delete(object_id) {
    var ajax_array = {};
    ajax_array['client'] = client_id;
    ajax_array['object'] = object_id;
    $.ajax({ url:'/system/client/object/ajax/delete/', type:'get', dataType:'json', data:ajax_array,
        success: function(data) {
            if(data['error']!=null) alert(data['error']);
            else {
                contract_Reset();
            }
        }
    });
}


function object_Edit(object_id) {
    object_Cancel();
    popMenuPosition('#object_pop','single');
    var contract_string = $('#contract .service_string').html();
    var service_type_id = $('#contract').attr('service_type_id');
    $('#object_pop tr').show();
    /* ПЦН */
    if(service_type_id!=1) {
        $('#object_pop [name=console]').parents('tr').hide();
        $('#object_pop [name=security_squad]').parents('tr').hide();
    }
    if(!!object_id) {
        $('#object_pop').attr('object_id',object_id);
        $.ajax({ url:'/system/client/object/ajax/get/?object='+object_id, type:'post', dataType:'json',
            success: function(data){
                if(data['error']!=null) {
                    popMessage(data['error'],'red');
                }
                else {
                    $('#object_pop tr[name=cost_type]').hide();
                    $('#object_pop tr[name=cost_value]').hide();
                    $('#object_pop div.txt_cost_type').text('');

                    if(data['object']['cost_list'] && data['object']['cost_list']['current']) {
                        $('#object_pop input[name=cost_value]')
                            .val(data['object']['cost_list']['current']['cost_value'])
                            .attr('item_id', data['object']['cost_list']['current']['id']);
                        //$('#object_pop div.txt_cost_type').text(data['object']['cost_list']['current']['cost_type__name']);
                        //$('#object_pop .select_cost_type').hide();
                        $('#object_pop .select_cost_type').val(data['object']['cost_list']['current']['cost_type']);
                        $('#object_pop [action=cost_add]').show();
                    }
                    else {
                        $('#object_pop input[name=cost]').removeAttr('item_id');
                        $('#object_pop .select_cost_type').val('').show();
                        $('#object_pop [action=cost_add]').hide();
                    }
                    //$('#object_pop tr[name=cost_string] td:eq(1)').html(data['object']['cost_list']['cost']+' '+data['object']['cost_list']['cost_type__name']);
                    //$('#object_pop tr[name=cost_string]').attr('service_cost_id',data['object']['cost_list']['id']);
                    $('#object_pop .header b').html('Карточка Обьекта.  Договор: '+contract_string);
                    $('#object_pop .header b .service_string').removeAttr('class').attr('style','display: inline-block');
                    for(var key in data['object']) {
                        $('#object_pop [name='+key+']').val(data['object'][key]);
                    }
                    console_number_interval_Set(data['object']['console_number']);

                    $('#object_pop select[name=client_object_warden]').val('');
                    if(data['object']['event_list']) {
                        for(key in data['object']['event_list']['core']){
                            var event = data['object']['event_list']['core'][key];
                            if(event['event_type']=='client_object_warden'){
                                $('#object_pop select[name=client_object_warden]').val(event['sentry_user_id']);
                            }
                        }
                    }
                    if('address' in data['object']) {
                        address_locality_Search('set',data['object']['address']);
                    }
                    else {
                        address_locality_Search();
                    }
                    //$('#object_pop #fieldset_subtypes legend').text(data['object']['service_type__name']+', подтипы охраны');
                    service_subtype('set',data['object']['subtype_list']);
                    object_Tag('set',object_id,data['object']['tag_list']);

                    $('#object_pop select[name=referer_type]').val(data['object']['referer_type']);
                    if(data['object']['referer_type']==1) {
                        $('#object_pop select[name=referer_user]').val(data['object']['referer_user']);
                        $('#object_pop select[name=referer_user]').show().removeAttr('disabled');
                    } else {
                        $('#object_pop select[name=referer_user]').hide().attr('disabled','disabled');
                    }
                }
            },
            complete: function() {

            }
        });
    }
    else {
        $('#object_pop').removeAttr('object_id');
        $('#object_pop select').val('').removeAttr('disabled');
        $('#object_pop [name=referer_user]').hide();
        $('#object_pop tr[name=cost_string]').hide();
        $('#object_pop .header b').html('Добавление обьекта. Договор: '+contract_string);
        $('#object_pop .header b .service_string').removeAttr('class').attr('style','display: inline-block');
        service_subtype('set_type');
        address_locality_Search();
        object_Tag('clear');
    }
}


function object_Tag(action, object_id, data) {
    if(action=='add'){
        var tag_id = parseInt( $('#object_pop select#client_object_tags').val() );
        var tag_txt = $('#object_pop select#client_object_tags :selected').attr('name');
        var span = '<span class="item" tag_id="'+tag_id+'">' +
            '<span class="txt">'+tag_txt+'</span>' +
            '<span class="close" title="Удалить"></span></span>';
        $('#object_pop div.in_pop_tag').append(span);
    }
    else if(action=='delete'){
        $('#object_pop .in_pop_tag .item[tag_id='+object_id+']').remove();
    }
    else if(action=='get'){
        var tag_list = [];
        $('#object_pop .in_pop_tag .item').each(function(){
            tag_list.push( $(this).attr('tag_id') );
        });
        // Метка материальной ответственности, вот так её сказали отдельно сделать
        if( $('#object_pop [name=financial_responsibility]').is('[checked]') ){
            tag_list.push( 2 );
        }
        return JSON.stringify(tag_list);
    }
    else if(action=='set'){
        $('#object_pop .in_pop_tag .item').remove();
        $('.object__item[object='+object_id+'] td[name=financial_responsibility]').html('');
        $('#object_pop td[name=financial_responsibility]').removeAttr('checked');
        for(var key in data){
            if(data[key]['id'] == 2){
                $('.object__item[object='+object_id+'] td[name=financial_responsibility]').html('да');
                $('#object_pop td[name=financial_responsibility]').attr('checked','checked');
            }
            else {
                var span = '<span class="item" tag_id="'+data[key]['id']+'">' +
                    '<span class="txt">'+data[key]['name']+'</span>' +
                    '<span class="close" title="Удалить"></span></span>';
                $('#object_pop .in_pop_tag').append(span);
            }
        }
    }
    else if(action=='clear') {
        $('#object_pop .in_pop_tag select').val('').removeAttr('style');
        $('#object_pop select .in_pop_tag option').removeClass('hide');
    }

    $('#object_pop select#client_object_tags option').removeAttr('class').removeAttr('selected');
    $('#object_pop .in_pop_tag .item').each(function(){
        var tag_id = $(this).attr('tag_id') ;
        $('#object_pop select#client_object_tags option[value='+tag_id+']').attr('class','hide');
    });

    if($('#object_pop select#client_object_tags option:not(.hide)').length>0){
        $('#object_pop select#client_object_tags').show();
        $('#object_pop span.btn_ui[name=subtypes]').show();
        $('#object_pop select#client_object_tags option:not(.hide):first').attr("selected", "selected");
    } else {
        $('#object_pop select#client_object_tags').hide();
        $('#object_pop span.btn_ui[name=subtypes]').hide();
    }
}


function service_subtype(action, data) {
    console.log('service_subtype:',action);
    $('#object_pop select#subtypes').show();
    $('#object_pop [action=subtype_add]').show();
    if(action=='add') {
        var subtype_id = parseInt( $('#object_pop select#subtypes').val() );
        var subtype_txt = $('#object_pop select#subtypes :selected').attr('short_name');
        var span = '<span class="item" subtype_id="'+subtype_id+'">' +
            '<span class="txt">'+subtype_txt+'</span>' +
            '<span class="close" title="Удалить"></span></span>';
        $('#object_pop').find('.in_pop_subtypes').append(span);
    }
    else if(action=='delete') {
        $('#object_pop .in_pop_subtypes .item[subtype_id='+data+']').remove();
    }
    else if(action=='get') {
        var subtype_list = [];
        $('#object_pop .in_pop_subtypes .item').each(function(){
            subtype_list.push( $(this).attr('subtype_id') );
        });
        return JSON.stringify(subtype_list);
    }
    else if(action=='set_type') {
        $('#object_pop .in_pop_subtypes .item').remove();
        if(!data) data = $('#object_pop select[name=service_type]').val();
        $('#object_pop select#subtypes').attr('service_type_id',data);
        $('#object_pop select#subtypes option').attr('class','hide');
        $('#object_pop select#subtypes option[service_type_id='+data+']').removeAttr('class');
    }
    else if(action=='set') {
        $('#object_pop .in_pop_subtypes .item').remove();
        for(var key in data) {
            var span = '<span class="item" subtype_id="'+data[key]['id']+'">' +
                '<span class="txt">'+data[key]['name']+'</span>' +
                '<span class="close" title="Удалить"></span></span>';
            $('#object_pop .in_pop_subtypes').append(span);
        }
    }

    var service_type_id = $('#object_pop select#subtypes').attr('service_type_id');
    $('#object_pop select#subtypes option[service_type_id='+service_type_id+']').removeAttr('class').removeAttr('selected');
    $('#object_pop .in_pop_subtypes .item').each(function() {
        var subtype_id = $(this).attr('subtype_id') ;
        $('#object_pop select#subtypes option[value='+subtype_id+']').attr('class','hide');
    });
    var subtypes_count = $('#object_pop #fieldset_subtypes div.in_pop_subtypes span.item').length;
    var subtypes_select_count = $('#object_pop select#subtypes option:not(.hide)').length;
    if(subtypes_count==0 && subtypes_select_count==0) {
        $('#object_pop select#subtypes').parents('tr').hide();
    }
    else if(subtypes_select_count>0) {
        $('#object_pop select#subtypes').parents('tr').show();
        $('#object_pop select#subtypes option:not(.hide):first').attr("selected", "selected");
        subtype_id = $('#object_pop select#subtypes option:not(.hide):eq(0)').val();
        $('#object_pop select#subtypes').val(subtype_id);
    } else {
        $('#object_pop select#subtypes').hide();
        $('#object_pop [action=subtype_add]').hide();
    }
}


function address_locality_Search(action, data_address) {
    //console.log('address_locality_Search:',action);
    console.log(lunchbox['setting']['region']);
    var region_id = '';
    if(action=='change') {
        region_id = $('#object_pop select[name=address_region]').val();
    }
    if(data_address && data_address['region']) {
        region_id = data_address['region'];
    }
    else {
        region_id = lunchbox['setting']['region'];
    }
    $('[name=address_region]').val(region_id);
    $.ajax({ url:'/system/directory/locality/ajax/search/?region_id='+region_id, type:'get', dataType:'json',
        success: function(data) {
            if(data['error']!=null) alert(data['error']);
            else if(data['locality']) {
                var locality_select = $('#object_pop select[name=address_locality]');
                locality_select.find('option').remove();
                for(var key in data['locality']) {
                    var selected = '';
                    if(data['locality'][key]['id']==lunchbox['setting']['locality']) selected = 'selected';
                    var option = '<option value="'+data['locality'][key]['id']+'" '+selected+'>'+data['locality'][key]['name']+'</option>';
                    locality_select.append(option);
                }
            }
        },
        complete: function() {
            address_street_Clear();
            if(data_address) {
                $('#object_pop [name=address_locality] [value=' +data_address['locality']+ ']').attr('selected', 'selected');
                $('#object_pop [name=address_street]').attr('item_id',data_address['street']);
                $('#object_pop [name=address_street]').val(data_address['street__name']);
                $('#object_pop [name=address_building]').attr('item_id',data_address['building']);
                $('#object_pop [name=address_building]').val(data_address['building__name']);
                $('#object_pop [name=address_placement]').val(data_address['placement']);
                $('#object_pop [name=address_placement_type]').val(data_address['placement_type']);
            }
        }
    });
}


function address_street_Clear() {
    $('#object_pop [name=address_street]').val('').removeAttr('item_id');
    $('#object_pop [name=address_building]').val('').removeAttr('item_id');
    $('#object_pop [name=address_placement]').val('');
}


function object_Update() {
    var service_array = get_each_value('#object_pop');
    service_array['client_contract'] = contract_id;
    service_array['client_object'] = $('#object_pop').attr('object_id');
    service_array['dir_service_subtype'] = service_subtype('get');
    service_array['dir_tag'] = object_Tag('get');
    $.ajax({ url:'/system/client/object/ajax/update/', type:'post', dataType:'json', traditional:true, data:service_array,
        success: function(data) {
            if(data['error']) {
                popMessage(data['error'],'red');
            }
            else if(data['form_errors']) {
                message_Pop_array(data['form_errors'],'red');
            }
            else {
                popMessage('Сохранено','green');
                contract_Reset();
                //if('object_service_id' in data) object_Edit(data['object_service_id']);
            }
        },
        complete: function() {

        }
    });
}


function object_Cancel() {
    $('.pop input, .pop textarea').val('');
    $('#object_pop .in_pop_sublist .item').remove();
}


function object_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            object_Update();
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
    $("#object_pop form").tooltip({
        show: false,
        hide: false
    });

    $("#object_pop form").validate({ // validate the comment form when it is submitted
        rules: {
            console: { required:true },
            console_number: { required:true },
            name: {
                required: true,
                minlength: 3
            },
            referer_type: {
                required: true
            },
            referer_user: {
                required: true
            },
            security_squad: {
                required: true
            },
            client_object_warden: {
                required: true
            }
        },
        messages: {
            console: { required: "Необходим пульт" },
            console_number: { required: "Необходим номер на пульте" },
            name: {
                required: "Необходимо название",
                minlength: "Минимум 3 знака"
            },
            referer_type: {
                required: "Кто привел?"
            },
            referer_user: {
                required: "Необходим менеджер"
            },
            security_squad: {
                required: "Необходим ГБР"
            },
            client_object_warden: {
                required: "Необходим ответственный менеджер"
            }
        }
    });
}