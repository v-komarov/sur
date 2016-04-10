$(document).ready(function() {

    $('body').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='contract_task_add') {
            var client_id = $('.middleBlock').attr('client_id');
            var contract_id = $('#contract').attr('contract_id');
            var object_id = $(this).parents('.object__item').attr('object_id');
            contract_task_add_Pop(client_id,contract_id,object_id);
        }
    });

    $('#object_list').on('click', 'div.item', function() {
        var client_id = $(this).attr('client_id');
        var object_id = $(this).attr('object_id');
        task_add_Pop(client_id,object_id);
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

    $('#task_add__pop input[name=initiator]').autocomplete({
        source: function(request, response) {
            $.ajax({ url:'/system/sentry_user/ajax/search/', type:'get', dataType:'json',
                data:{ full_name:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['user_list'], function(item) {
                        return { label:item.full_name, user_id:item.id }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                var user_id = ui.item.user_id
            } else {
                var user_id = 'other';
            }
            $(this).attr('user_id', user_id);
        },
        //select: function(event, ui) { $('tr#holding__name').attr('holding_id', ui.item.holding_id); },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('#task_add__pop input[name=warden], #task_add__pop input[name=doer]').autocomplete({
        source: function(request, response) {
            $.ajax({ url:'/system/sentry_user/ajax/search/', type:'get', dataType:'json',
                data: {
                    full_name:request.term,
                    limit: 10
                },
                success: function(data) {
                    response($.map(data['user_list'], function(item) {
                        return {
                            label:item.full_name, user_id:item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                var user_id = ui.item.user_id
            } else {
                var user_id = 'new';
                $(this).val('');
            }
            $(this).attr('user_id', user_id);
        },
        //select: function(event, ui) { $('tr#holding__name').attr('holding_id', ui.item.holding_id); },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    select_sentry_user();
    task_add_Validate();
});


function contract_task_add_Pop(client_id,contract_id,object_id) {
    console.log('contract_task_add_Pop');
    $.ajax({ url:'/system/client/object/ajax/get_object/?object='+object_id, type:'get', dataType:'json',
        success: function(data){
            var object_title = $('.object__item[object_id='+object_id+'] .object__item__title b.txt').clone();
            //var service_string = contract_string_set(data['object_list'][0]);
            //var object_href = '/system/client/'+client_id+'/object/'+object_id+'/';
            //$('#task_add__pop a.client_object').attr('href',object_href).attr('object_id',object_id);
            //$('#task_add__pop a.client_object').html('<div class="padding left">'+data['object_list'][0]['name']+'</div>');
            $('#task_add__pop').attr('client_id', client_id);
            $('#task_add__pop').attr('contract_id', contract_id);
            $('#task_add__pop').attr('object_id', object_id);
            $('#task_add__pop a.client_object').html(object_title);
            $('#task_add__pop .address').hide();
            popMenuPosition('#task_add__pop','single');
        }
    });
}


function task_add_Pop(client_id, object_id) {
    console.log('task_add_Pop');
    //select_client_object_user(object_id);
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

            popMenuPosition('#task_add__pop','single');
        }
    });
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