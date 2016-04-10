 $(document).ready(function() {
    $('#device_install_list').on('click', 'tr.row', function() {
        device_install_Edit( $(this).attr('device_install_id') );
    });
    $('#device_install_pop tbody').on('click', 'div.device_link', function() {
        device_Edit();
    });

    $('#device_pop').on('click', 'tr.switch', function(){
        if($(this).attr('checked')=='checked'){
            $(this).removeAttr('checked');
            $('#device_pop tr.switch td.text_right').html('Аренда');
        } else {
            $(this).attr('checked','checked');
            $('#device_pop tr.switch td.text_right').html('Продано');
        }
    });

    $('#device_install_pop [name=device]').autocomplete({
        source: function(request, response) {
            $.ajax({ url:'/system/client/object/device/ajax/search_device/', type:'get', dataType:'json',
                data:{ name:request.term, limit:7 },
                success: function(data) {
                    response($.map(data['device_list'], function(item) {
                        return {
                            label: item.name,
                            device_id: item.id
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            if(ui.item){
                $(this).attr('device_id',ui.item.device_id);
                $('#device_install_pop .device_link').show();
            }
            else {
                $(this).val('');
                $(this).removeAttr('device_id');
            }
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('device_id',ui.item.device_id);
                $('#device_install_pop .device_link').show();
            }
            else {
                $(this).val('');
                $(this).removeAttr('device_id');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('.user_right').autocomplete({
        source: function(request, response) {
            $.ajax({ url: '/system/sentry_user/ajax/search/', type:'get', dataType: "json", data: {
                full_name: request.term,
                user_post_id: 'all',
                limit: 10 },
                success: function(data) {
                    response($.map(data['user_list'], function(item) {
                        return {
                            label: item.full_name,
                            user_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                var user_id = ui.item.user_id;
                $(this).attr('user_id',user_id);
            } else {
                $(this).val('');
                $(this).removeAttr('user_id');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    install_Validate()
});


function device_install_Reset(){
    $('#device_install_pop').removeAttr('device_install_id');
    $("#device_install_pop input").each(function(){ $(this).val(''); });
    $("#device_install_pop textarea").each(function(){ $(this).val(''); });
    $('#device_install_pop [name=device]').removeAttr('disabled').removeAttr('device_id');
}


function device_install_Draw(object_id,device_install_list){
    // Усли есть подключение
    var td_bg = '';

    if($('.object__item[object_id='+object_id+'] [event_type=client_object_disconnect] [name=event_date]').text()!=''){
        td_bg = 'class="bg_red"';
    }
    else if($('.object__item[object_id='+object_id+'] [event_type=client_object_connect] [name=event_date]').text()!=''){
        td_bg = 'class="bg_green"';
    }
    var table_list = $('[object_id='+object_id+'] div.device_list table');
    for(var install_key in device_install_list){
        var install = device_install_list[install_key];
        var priority = install['priority'];
        var tr = '<tr class="row" action="device_install" device_install_id="'+install['id']+'" sentry_user_id="'+install['install_user']+'">' +
            '<td class="padding">'+install['device__device_type__name']+'</td>' +
            '<td class="padding">'+install['device__name']+'</td>' +
            '<td class="padding">'+install['install_date']+' / '+install['install_user__full_name']+'</td>' +
            '<td '+td_bg+'><div class="btn_ui btn_28 disabled" action="device_install_priority" icon="'+priority+'"><div class="icon"></div></div></td>' +
            '</tr>';
        table_list.find('thead').show();
        table_list.find('tbody').append(tr);
    }
}


function device_install_Edit(object_id,device_install_id){
    //console.log(object_id,device_install_id);
    device_install_Reset();
    $('#device_install_pop').attr('object_id',object_id);
    $('#device_install_pop .device_link').hide();
    $('#device_install_pop [action=device_install_delete]').hide();
    if(!device_install_id){
        $('#device_install_pop').removeAttr('device_install_id');
    }
    else {
        $('#device_install_pop .device_link').show();
        $('#device_install_pop').attr('device_install_id',device_install_id);
        $('#device_install_pop [name=device]').attr('disabled','disabled');
        $.ajax({ url:'/system/client/object/device/ajax/get_install/?device_install_id='+device_install_id,
            type:'get', dataType:'json', traditional:true,
            success: function(data){
                $('#device_install_pop [action=device_install_delete]').show();
                data = data['device_install_list'][0];
                $('#device_install_pop').attr('device_install_id', data['id'] );
                $('#device_install_pop [name=device]').val( data['device__name'] );
                $('#device_install_pop [name=device]').attr('device_id', data['device_id'] );
                $('#device_install_pop [name=device__series]').val( data['device__series'] );
                $('#device_install_pop [name=device__number]').val( data['device__number'] );
                $('#device_install_pop [name=install_date]').val( data['install_date'] );
                $('#device_install_pop [name=install_user]').val(data['install_user_id'] );
                $('#device_install_pop [name=uninstall_date]').val( data['uninstall_date'] );
                $('#device_install_pop [name=uninstall_user]').val(data['uninstall_user_id'] );
                $('#device_install_pop [name=comment]').val( data['comment'] );
            }
        });
    }
    popMenuPosition('#device_install_pop','single');
}


function device_install_Update(){
    console.log('device install Update');
    var device_array = get_each_value('#device_install_pop');
    device_array['object'] = $('#device_install_pop').attr('object_id');
    device_array['device_install'] = $('#device_install_pop').attr('device_install_id');
    var device_id = $('#device_install_pop input[name=device]').attr('device_id');
    if(device_id) device_array['device'] = device_id;

    $.ajax({ url:'/system/client/object/device/ajax/install_update/',
        type:'post', dataType:'json', traditional:true, data:device_array,
        success: function(data){
            if(data['error']) alert( data['error'] );
            else {
                popMessage('Сохранено','green');
                contract_Reset();
                $('#device_install_pop').hide();
            }
        }
    });
}


function device_install_Delete(){
    var device_install_id = $('#device_install_pop').attr('device_install_id');
    $.ajax({ url:'/system/client/object/device/ajax/install_delete/?device_install_id='+device_install_id,
        type:'get', dataType:'json', traditional:true,
        success: function(data){
            $('#device_install_list tr[device_install_id='+device_install_id+']').remove();
            contract_Reset();
        }
    });
}


function device_install_Priority(install_id){
    var ajax_array = {'install_id': install_id};
    $.ajax({ url:'/system/directory/device/ajax/priority/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            device_Edit();
        }
    });
}


function device_Edit(){
    var device_id = $('#device_install_pop input[name=device]').attr('device_id');

    $.ajax({ url:'/system/directory/device/ajax/get/?device='+device_id, type:'get', dataType:'json', traditional:true,
        success: function(data){
            $('#device_pop [name=name]').val( data['device']['name'] );
            $('#device_pop [name=device_type]').val( data['device']['device_type'] );
            $('#device_pop [name=series]').val( data['device']['series'] );
            $('#device_pop [name=number]').val( data['device']['number'] );
            $('#device_pop #device_pop_install_list tbody tr').remove();
            $('#device_pop [name=belong].switch').removeAttr('checked');
            if(data['device']['belong']=='sell'){
                $('#device_pop tr.switch').attr('checked','checked');
                $('#device_pop tr.switch td.text_right').html('Продано');
            } else {
                $('#device_pop tr.switch td.text_right').html('Аренда');
            }
            var install_count = 0;
            for(var key in data['device']['install_list']){
                install_count++;
                var install = data['device']['install_list'][key];
                var item = '<tr install_id="'+install['id']+'"><td class="middle">' +
                    '<a class="inline_block" href="/system/client/'+install['client']+'/contract/'+install['contract']+'/" >' +
                    '<div class="padding">'+install['object__name']+'</div></a>' +
                    '</td><td><div class="btn_ui btn_28 left" action="device_install_priority" icon="'+install['priority']+'"><div class="icon"></div></div></td></tr>';
                $('#device_pop #device_pop_install_list tbody').append(item);
                $('#device_pop #device_pop_install_list').attr('install_count',install_count);
            }
        }
    });
    popMenuPosition('#device_pop','multiple');
}


function device_Update() {
    var device_array = get_each_value('#device_pop');
    device_array['device'] = $('#device_install_pop input[name=device]').attr('device_id');
    if($('#device_pop [name=belong].switch').is('[checked]')) device_array['belong'] = 'sell'; else device_array['sell'] = 'rent';
    if($('#device_pop tr[name=belong]').is('[checked]')) device_array['belong'] = 'sell'; else device_array['belong'] = 'rent';
    device_array['device_type_id'] = $('#device_pop [name=device_type]').val();

    $.ajax({ url:'/system/directory/device/ajax/update/', type:'post', dataType:'json', data:device_array,
        success: function(data){
            if(data['error']){
                alert(data['error']);
            }
            else {
                popMessage('Сохранено','green');
                $('#device_pop').hide();
                contract_Reset();
            }
        }
    });
}


function install_Validate(){
    $.validator.setDefaults({
        submitHandler: function() {
            device_install_Update();
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
    $('#device_install_pop form').tooltip({
        show: false,
        hide: false
    });

    $('#device_install_pop form').validate({ // validate the comment form when it is submitted
        rules: {
            device: {
                required: true
            },
            install_date: {
                required: true
            },
            install_user: {
                required: true
            }
        },
        messages: {
            device: {
                required: "Необходимо устройство"
            },
            install_date: {
                required: "Необходим день установки"
            },
            install_user: {
                required: "Необходим установщик"
            }
        }
    });
}