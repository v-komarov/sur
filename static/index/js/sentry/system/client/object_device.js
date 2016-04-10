$(document).ready(function() {
    client_id = $("#device_installation_list").attr('client_id');
    object_id = $("#device_installation_list").attr('object_id');

    $('.pop .header').on('click', '.close', function(){
        var pop_id = $(this).parents('.pop').attr('id');
        if(pop_id=='pop_device_installation'){
            $('#device_installation_list tbody tr.hover').attr('class','row');
        }
        var pop_menu = $(this).parents('.pop');
        pop_menu.hide();
    });

    $(".middleBlock").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='list_reset') {
            device_installation_Refresh();
        }
        else if(action=='device_add'){
            device_installation_Edit();
        }
        else if(action=='installation_priority'){
            device_installation_Priority( $(this).parents('tr').attr('install_id') );
        }
        else if(action=='installation_reset'){
            var device_installation_id = $('#device_installation_list tbody tr.hover').attr('device_installation_id');
            device_installation_Edit(device_installation_id);
        }
        else if(action=='installation_delete'){
            if(confirm('Удалить подключение?')){
                device_installation_Delete();
            }
        }
        else if(action=='device_reset'){
            device_Edit();
        }
        else if(action=='device_update'){
            deviceUpdate();
        }
    });
    $('#device_installation_list tbody').on('click', 'tr.row', function() {
        device_installation_Edit( $(this).attr('device_installation_id') );
    });
    $('#pop_device_installation tbody').on('click', 'div.device_link', function() {
        device_Edit();
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('input[action=date]').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });

    $('#pop_device_installation [name=device__name]').autocomplete({
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
            } else {
                $(this).removeAttr('device_id');
            }
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('device_id',ui.item.device_id);
            } else {
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

    device_installation_Refresh();
    install_Validate()
});


function device_installation_Reset(){
    $('#pop_device_installation').attr('device_installation_id');
    $('#pop_device_installation [name=device_type] :contains(Банк)').attr('selected', 'selected');
    $("#pop_device_installation input").each(function(){ $(this).val(''); });
    $("#pop_device_installation textarea").each(function(){ $(this).val(''); });
}


function device_installation_Refresh(){
    $('#device_installation_list tbody tr.row').remove();
    $('.loading').show();
    $('.pop').hide();
    $.ajax({ url:'/system/client/object/device/ajax/get_installation/?object_id='+object_id,
        type:'get', dataType:'json', traditional:true,
        success: function(data){
            for(var key in data['device_installation_list']){
                var installation = data['device_installation_list'][key];
                var tr = '<tr class="row" device_installation_id="'+installation['id']+'">' +
                    '<td class="cell" name="installation_date">'+installation['installation_date']+'</td>' +
                    '<td class="cell" name="uninstall_date">'+installation['uninstall_date']+'</td>' +
                    '<td class="cell" name="device__name">'+installation['device__name']+'</td>' +
                    '<td class="cell" name="comment">'+installation['comment']+'</td></tr>';
                $('#device_installation_list tbody').append(tr);
            }
            $('.loading').hide();
        }
    });
}


function device_installation_Edit(device_installation_id){
    console.log(device_installation_id);
    device_installation_Reset();
    
    $('#device_installation_list tbody tr.hover').attr('class','row');
    $('#device_installation_list tbody tr[device_installation_id='+device_installation_id+']').attr('class','row hover');

    $('#pop_device_installation [name=uninstall_user]').removeAttr('user_id');
    if(!device_installation_id){
        $('#pop_device_installation').removeAttr('device_installation_id');
        $('#pop_device_installation input').val('');
        $('#pop_device_installation textarea').val('');
        $('#pop_device_installation [name=device__name]').removeAttr('disabled').removeAttr('device_id');
    }
    else {
        $('#pop_device_installation [name=device__name]').attr('disabled','disabled');
        $.ajax({ url:'/system/client/object/device/ajax/get_installation/?device_installation_id='+device_installation_id,
            type:'get', dataType:'json', traditional:true,
            success: function(data){
                data = data['device_installation_list'][0];
                $('#pop_device_installation').attr('device_installation_id', data['id'] );
                $('#pop_device_installation [name=device__name]').val( data['device__name'] );
                $('#pop_device_installation [name=device__name]').attr('device_id', data['device_id'] );
                $('#pop_device_installation [name=device__series]').val( data['device__series'] );
                $('#pop_device_installation [name=device__number]').val( data['device__number'] );
                $('#pop_device_installation [name=installation_date]').val( data['installation_date'] );
                $('#pop_device_installation [name=installation_user]').attr('user_id', data['installation_user_id'] );
                $('#pop_device_installation [name=installation_user]').val( data['installation_user__full_name'] );
                $('#pop_device_installation [name=uninstall_date]').val( data['uninstall_date'] );
                $('#pop_device_installation [name=uninstall_user]').attr('user_id', data['uninstall_user_id'] );
                $('#pop_device_installation [name=uninstall_user]').val( data['uninstall_user__full_name'] );
                $('#pop_device_installation [name=password]').val( data['password'] );
                $('#pop_device_installation [name=comment]').val( data['comment'] );
            }
        });
    }
    $('#pop_device_installation').attr('device_installation_id',device_installation_id);
    popMenuPosition('#pop_device_installation','single');
}


function device_installation_Update(){
    console.log('device_installation_Update');
    var device_array = {};
    device_array['object_id'] = object_id;
    device_array['device_installation_id'] = $('#pop_device_installation').attr('device_installation_id');
    $('#pop_device_installation input, #pop_device_installation textarea').each(function(){
        var input_name = $(this).attr('name');
        device_array[input_name] = $(this).val();
    });
    var device_id = $('#pop_device_installation input[name=device__name]').attr('device_id');
    if(device_id) device_array['device_id'] = device_id;
    device_array['installation_user_id'] = $('#pop_device_installation [name=installation_user]').attr('user_id');
    device_array['uninstall_user_id'] = $('#pop_device_installation [name=uninstall_user]').attr('user_id');
    $.ajax({ url:'/system/client/object/device/ajax/update_installation/',
        type:'post', dataType:'json', traditional:true, data:device_array,
        success: function(data){
            if(data['error']){
                for(var key in data['error']){
                    alert( key+': '+ data['error'][key] );
                }
            }
            else {
                popMessage('Сохранено','green');
                device_installation_Refresh();
                $('#pop_device_installation').hide();
            }
        }
    });
}


function device_installation_Delete() {
    var device_installation_id = $('#pop_device_installation').attr('device_installation_id');
    $.ajax({ url:'/system/client/object/device/ajax/delete_installation/?device_installation_id='+device_installation_id,
        type:'get', dataType:'json', traditional:true,
        success: function(data){
            $('#device_installation_list tr[device_installation_id='+device_installation_id+']').remove();
            $('#pop_device_installation').hide();
        }
    });
}


function device_installation_Priority(install_id) {
    var ajax_array = {'install_id': install_id};
    $.ajax({ url:'/system/directory/device/ajax/priority/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            device_Edit();
        }
    });
}


function device_Edit(){
    var device_id = $('#pop_device_installation input[name=device__name]').attr('device_id');
    $.ajax({ url:'/system/client/object/device/ajax/get_device/?device_id='+device_id, type:'get', dataType:'json', traditional:true,
        success: function(data){
            $('#pop_device [name=name]').val( data['device']['name'] );
            $('#pop_device [name=series]').val( data['device']['series'] );
            $('#pop_device [name=number]').val( data['device']['number'] );
            $('#pop_device #device_installation tbody tr').remove();
            var installation_count = 0;
            for(var key in data['installation_list']){
                installation_count++;
                var install = data['installation_list'][key];
                var object_name = install['object_name'];
                var item = '<tr install_id="'+install['id']+'"><td class="middle">' +
                    '<a class="inline_block" href="/system/client/'+install['client_id']+'/object/'+install['object_id']+'/" >' +
                    '<div class="padding">'+object_name+'</div></a>' +
                    '</td><td><div class="btn_ui btn_28 left" action="installation_priority" icon="'+install['priority']+'"><div class="icon"></div></div></td></tr>';
                $('#pop_device #device_installation tbody').append(item);
                $('#pop_device #device_installation').attr('installation_count',installation_count);
            }
        }
    });
    popMenuPosition('#pop_device','multiple');
}


function deviceUpdate(){
    var device_array = {};
    device_array['action'] = 'save';
    device_array['device_id'] = $('#pop_device_installation input[name=device__name]').attr('device_id');
    $('#pop_device input').each(function(){
        var input_name = $(this).attr('name');
        var input_value = $(this).val();
        if(!!input_value) device_array[input_name] = input_value;
    });
    $.ajax({ url:'/system/directory/device/ajax/update/', type:'post', dataType:'json', data:device_array,
        success: function(data){
            if(data['error']){
                alert(data['error']);
            }
            else {
                device_Edit();
            }
        }
    });
}


function install_Validate(){
    $.validator.setDefaults({
        submitHandler: function() {
            device_installation_Update();
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
    $('#pop_device_installation form').tooltip({
        show: false,
        hide: false
    });

    $('#pop_device_installation form').validate({ // validate the comment form when it is submitted
        rules: {
            device__name: {
                required: true
            },
            installation_date: {
                required: true
            },
            installation_user: {
                required: true
            }
        },
        messages: {
            device__name: {
                required: "Необходимо устройство"
            },
            installation_date: {
                required: "Необходим день установки"
            },
            installation_user: {
                required: "Необходим установщик"
            }
        }
    });
}