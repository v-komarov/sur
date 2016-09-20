$(document).ready(function() {

    $('body').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='contract_task_add') {
            var client_id = $('.middleBlock').attr('client_id');
            var contract_id = $('#contract').attr('contract_id');
            var object_id = $(this).parents('.object__item').attr('object_id');
            var bind_id = $(this).parents('.object__item').attr('bind_id');
            contract_task_add_Pop(client_id,contract_id,object_id,bind_id);
        }
    });

    $('#object_list').on('click', 'div.item', function() {
        var client_id = $(this).attr('client_id');
        var object_id = $(this).attr('object_id');
        var bind_id = $(this).attr('bind_id');
        task_add_Pop(client_id, object_id, bind_id);
    });

    $('#task_add__pop').on('change', 'select[name=task_type]', function() {
        check_task_type_select();
    });

    $('#task_add__pop').on('change', 'select[name=initiator]', function() {
        check_initiator();
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('#task_add__pop [name=complete_date]').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        showButtonPanel: true,
        monthNamesShort: $.datepicker.regional["ru"].monthNames,
        onClose: function( selectedDate ) {
            $("#stopValue").datepicker( "option", "minDate", selectedDate );
        }
    });

    $('#task_add__pop input[name=device]').autocomplete({
        source: function(request, response) {
            $.ajax({ url:'/system/client/object/device/ajax/search_device/', type:'get', dataType:'json',
                data:{
                    name: request.term,
                    install: true,
                    exclude_object: $('#task_add__pop').attr('object_id'),
                    limit: 7
                },
                success: function(data) {
                    response($.map(data['device_list'], function(item) {
                        return { label:item.name, device_id:item.id, install:item.install }
                    }));
                }
            });
        },
        select: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id', ui.item.device_id);
                $('#device_install_pop .device_link').show();
            }
            else {
                $(this).val('');
                $(this).removeAttr('item_id');
            }
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id', ui.item.device_id);
                $('#device_install_pop .device_link').show();
            }
            else {
                $(this).val('');
                $(this).removeAttr('item_id');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    }).data("ui-autocomplete")._renderItem = function( ul, item ) {
        console.log(item.install);
        if(item.install=='yes') {
            return $("<li>").append('<a class="green">'+item.label+"</a>").appendTo(ul);
        } else {
            return $("<li>").append("<a>"+item.label+"</a>").appendTo(ul);
        }
    };


    select_sentry_user();
    task_add_Validate();
});


function contract_task_add_Pop(client_id,contract_id,object_id,bind_id) {
    console.log('contract_task_add_Pop, bind_id:'+bind_id);
    task_Clean();
    var ajax_array = {'object':object_id, 'client_user':'true'};
    $.ajax({ url:'/system/client/object/ajax/get/', data:ajax_array, type:'get', dataType:'json',
        success: function(data) {
            var object_title = $('.object__item[object_id='+object_id+'] .object__item__title b.txt').clone();
            $('#task_add__pop')
                .attr('client_id',client_id).attr('contract_id',contract_id)
                .attr('object_id',object_id).attr('bind_id',bind_id);
            $('#task_add__pop a.client_object').html(object_title);
            $('#task_add__pop .address').hide();

            $('#task_add__pop select[name=initiator] option').remove();
            $('#task_add__pop select[name=initiator]').append('<option/>');
            for(var id in data['object']['client_user_list']){
                var client_user = data['object']['client_user_list'][id];
                var option_item = '<option value="'+id+'">'+client_user['full_name'];
                if(client_user['post']){
                    option_item += ' ('+client_user['post__name']+')';
                }
                option_item += '</option>';
                $('#task_add__pop select[name=initiator]').append(option_item);
            }
            check_task_type_select();
            popMenuPosition('#task_add__pop','single');
        }
    });
}


function task_add_Pop(client_id, object_id, bind_id) {
    console.log('task_add_Pop');
    task_Clean();
    $('#object_list div.item').attr('class','item');
    $('#object_list div.item[object_id='+object_id+']').attr('class','item hover');
    $.ajax({ url:'/system/client/search/ajax/search/?object_id='+object_id, type:'get', dataType:'json',
        success: function(data){
            var service_string = contract_string_set(data['object_list'][0]);
            var object_href = '/system/client/'+client_id+'/object/'+object_id+'/';
            $('#task_add__pop a.client_object').attr('href',object_href).attr('object_id',object_id);
            $('#task_add__pop a.client_object').html('<div class="padding left">'+data['object_list'][0]['name']+'</div>');

            $('#task_add__pop a.client_object').append('<div class="service_string"></div>');
            $('#task_add__pop div.service_string').html(service_string);
            $('#task_add__pop .address').html(data['object_list'][0]['address']);

            check_task_type_select();
            popMenuPosition('#task_add__pop','single');
        }
    });
}


function check_initiator() {
    var initiator = $('#task_add__pop select[name=initiator]').val();
    if(initiator==''){
        $('#task_add__pop input[name=initiator_other]').show();
    } else {
        $('#task_add__pop input[name=initiator_other]').val('').hide();
    }
}


function check_task_type_select() {

    var task_type = $('#task_add__pop select[name=task_type]').val();
    console.log('check_task_type_select() '+task_type);
    $('#task_add__pop [name=device]').parents('tr').hide();
    if(task_type==2 || task_type==7){
        $('#task_add__pop [name=device]').parents('tr').show();
        $('#task_add__pop input[name=device]').show();
        $('#task_add__pop select[name=device]').hide();
    }
    else if(task_type==5 || task_type==8){
        $('#task_add__pop [name=device]').parents('tr').show();
        $('#task_add__pop select[name=device]').show();
        $('#task_add__pop input[name=device]').hide();
        var bind_id = $('#task_add__pop').attr('bind_id');
        $.ajax({ url:'/system/directory/device/ajax/search/?bind='+bind_id, type:'get', dataType:'json',
            success: function(data){
                $('#task_add__pop select[name=device] option').remove();
                $('#task_add__pop select[name=device]').append('<option value="" />');
                for(var device in data['device_list']){
                    var option_item = '<option value="'+data['device_list'][device]['id']+'">'+data['device_list'][device]['name']+'</option>';
                    $('#task_add__pop select[name=device]').append(option_item);
                }
            }
        });
    }
}


function task_Clean() {
    $('#task_add__pop input, #task_add__pop textarea').val('');
    $('#task_add__pop input').removeAttr('item_id');
    $('#task_add__pop select').removeAttr('selected');
}


function task_Create() {
    var task_array = get_each_value('#task_add__pop');
    $.ajax({ url:'/task/ajax/create/', type:'post', dataType:'json', data:task_array,
        success: function(data) {
            $('.pop').hide();
            if(data['errors']) {
                message_Pop_array(data['errors'],'red');
            }
            else {
                popMessage('Заявка создана','green');
            }
        },
        error: function(data) {
            popMessage('System error','red');
        }
    });
}


function task_add_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            task_Create();
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

    $("#task_add__pop form").tooltip({ // use custom tooltip; disable animations for now to work around lack of refresh method on tooltip
        show: false,
        hide: false
    });

    $("#task_add__pop form").validate({ // validate the comment form when it is submitted
        rules: {
            complete_date: {
                required: true,
                minlength: 10
            },
            warden: {
                required: true
            },
            doer: {
                required: true
            },
            comment: {
                required: true,
                minlength: 3
            }
        },
        messages: {
            complete_date: {
                required: "Необходима дата",
                minlength: "Некорректный формат, пример: 30.12.1990"
            },
            warden: {
                required: "Необходим ответственный"
            },
            doer: {
                required: "Необходим исполнитель"
            },
            comment: {
                required: "Необходимо описание",
                minlength: "Минимум 3 знака"
            }
        }
    });
}