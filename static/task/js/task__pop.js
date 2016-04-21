$(document).ready(function() {

    $('#task__pop').on('click', '.header .close', function() {
        popMenuClose('all');
        $('#task_list tbody tr:not(.caution)').attr('class','row');
    });

    $('#task_list tbody').on('click', 'tr:not(.caution)', function() {
        var task_id = $(this).attr('task_id');
        task_Edit(task_id);
    });

    $('#task__pop').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if (action=='delete') {
            if (confirm('Удалить заявку?')) {
                task_Delete();
            }
        } else if (action=='reset') {
            task_Edit( $('#task_list tr.hover').attr('task_id') );
        }
    });

    $('#task__pop #log_list').on('click', '.item', function() {
        var log_id = $(this).attr('log_id');
        var report_id = $(this).attr('report_id');
        if(report_id){
            popMenuClose('#task__pop_log');
            task_report_Edit(report_id);
        } else if(log_id){
            popMenuClose('#task__pop_report');
            task_log_Edit(log_id);
        }
    });

    $('#task__pop').on('change', 'select[name=task_type]', function() {
        check_task_type_select();
    });

    $('#task__pop').on('change', 'select[name=initiator]', function() {
        check_initiator();
    });

    $('#task__pop input[name=initiator]').autocomplete({
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

    $('#task__pop input[name=warden], #task_add__pop input[name=doer]').autocomplete({
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

    task_Validate();
    select_sentry_user();
});


function task_Delete() {
    var tr = $('#task_list tbody tr.hover');
    $.ajax({ url:'/task/ajax/delete/?task='+tr.attr('task_id'), type:'get', dataType:'json',
        success: function (data) {
            if(data['error']){
                alert(data['error']);
            } else if(data['answer']=='done'){
                task_Search();
            }
        }
    });
}


function check_task_type_select() {
    var task_type = $('#task__pop select[name=task_type]').val();
    if(task_type==2 || task_type ==7 || task_type ==8){
        $('#task__pop input[name=device]').parents('tr').show();
    } else {
        $('#task__pop input[name=device]').parents('tr').hide();
    }
}

function check_initiator() {
    var initiator = $('#task__pop select[name=initiator]').val();
    if(initiator==''){
        $('#task__pop input[name=initiator_other]').show();
    } else {
        $('#task__pop input[name=initiator_other]').val('').hide();
    }
}

function task_Clean() {
    $('#task__pop input, #task__pop textarea').val('');
    $('#task__pop input').removeAttr('item_id');
    $('#task__pop select').removeAttr('selected');
}


function task_Edit(task_id) {
    var object_id = $('#task_list tr[task_id='+task_id+']').attr('object_id');
    task_Clean();
    $('#task_list tbody tr:not(.caution)').attr('class','row');
    $('#task_list tbody tr[task_id='+task_id+']').attr('class','row hover');

    $.ajax({ url:'/task/ajax/get/?task='+task_id, type:'get', dataType:'json',
        success: function(data){
            var task = data['task'];
            $('#task__pop div.header b').text(task['id']);
            for(var key in data['task']){
                $('#task__pop [name='+key+']').val(data['task'][key]);
            }
            if(task['device']){
                $('#task__pop [name=device]').val(task['device__name']).attr('item_id',task['device']);
            }

            $('#task__pop [name=create_user]').text(task['create_user']+' ('+task['create_date']+')');
            $('#task__pop [name=complete_date]').parent('tr').attr('task_status',task['status__label']);
            $('#task__pop [name=complete_date] div.text').text(task['complete_date']);
            var object_href = '/system/client/'+task['client']+'/contract/'+task['contract']+'/';
            $('#task__pop a.client_object').attr('href',object_href);
            $('#task__pop a.client_object div.txt4').text(task['object__name']);
            $('#task__pop div.service_list').remove();
            if(task['service_list']){
                $('#task__pop a.client_object').prepend('<div class="service_list"></div>');
                $('#task__pop div.service_list').html( contract_string_set(task) );
                $('#task__pop div.service_list').attr('status',task['service_status']);
            }
            $('#task__pop .address').html(task['address']+' '+task['object_map_yandex']);

            /*
             if(task['initiator_other']){
             $('#task__pop input[name=initiator]').val(task['initiator_other']);
             } else if(task['initiator']){
             $('#task__pop input[name=initiator]').val(task['initiator__full_name'])
             .attr('item_id',task['initiator']).attr('disabled','disabled');
             }
             */

            $('#task__pop select[name=initiator] option:not([value=""])').remove();
            for(var id in data['task']['client_user_list']){
                var client_user = data['task']['client_user_list'][id];
                var option_item = '<option value="'+id+'">'+client_user['full_name'];
                if(client_user['post']){
                    option_item += ' ('+client_user['post__name']+')';
                }
                option_item += '</option>';
                $('#task__pop select[name=initiator]').append(option_item);
            }
            $('#task__pop select[name=initiator]').val(data['task']['initiator']);


            $('#task__pop #log_list div.item').remove();
            for(key in data['task']['log_list']){
                var log = data['task']['log_list'][key];
                var log_div = '<div class="item" log_id="'+log['id']+'" time="'+log['time']+'">' +
                    '<div class="title">['+log['create_date']+'] '+log['user'] +
                    '<div class="move">Перенос заявки с '+log['old_date']+' на '+log['new_date']+'</div></div>' +
                    '<div class="comment">'+log['comment']+'</div></div>';
                $('#task__pop #log_list').append(log_div);
            }

            for(key in data['task']['report_list']){
                var report = data['task']['report_list'][key];
                var doer_string = '';
                if(report['doer']) {
                    doer_string = '<div class="title">['+report['create_date']+'] '+report['doer__full_name'];
                }
                else if(report['security_squad']) {
                    doer_string = '<div class="title">['+report['create_date']+'] '+report['security_squad__name'];
                }
                doer_string += '<div class="right">'+report['status__name']+'</div></div>';
                var report_div = '<div class="item" report_id="'+report['id']+'" time="'+report['time']+'">' +
                    doer_string +
                    '<div class="comment">'+report['comment']+'</div></div>';
                $('#task__pop #log_list').append(report_div);
            }

            log_listSort();
            check_task_type_select();
            popMenuPosition('#task__pop','single');
        }
    });
}


function log_listSort() {
    var $elements = $('#task__pop #log_list .item');
    var $target = $('#task__pop #log_list');

    $elements.sort(function (a, b) {
        var an = $(a).attr('time'),
            bn = $(b).attr('time');
        if(an && bn) {
            return bn.localeCompare(an);
        }
        return 0;
    });
    $elements.detach().appendTo($target);
}


function task_Update() {
    var task_array = get_each_value('#task__pop');
    task_array['task'] = $('#task_list tbody tr.hover').attr('task_id');
    task_array['complete_date'] = $('#task__pop td[name=complete_date] .text').text();
    $.ajax({ url:'/task/ajax/update/', type:'post', dataType:'json', data:task_array,
        success: function(data){
            $('.pop').hide();
            if(data['errors']) {
                message_Pop_array(data['errors'],'red');
            }
            else {
                popMessage('Заявка изменена','green');
                task_Search();
            }
        },
        error: function(data) {
            $('.pop').hide();
            popMessage('System error','red');
        }
    });

}


function task_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            task_Update();
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

    $("#task__pop form").tooltip({ // use custom tooltip; disable animations for now to work around lack of refresh method on tooltip
        show: false,
        hide: false
    });

    $("#task__pop form").validate({ // validate the comment form when it is submitted
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