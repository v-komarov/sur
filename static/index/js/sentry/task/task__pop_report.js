$(document).ready(function() {

    $('#task__pop_report').on('click', '.header .close', function() {
        $('#task__pop #log_list div.hover').attr('class','item');
        popMenuClose('#task__pop_report');
    });

    $('#task__pop').on('click', '[action=report_add]', function() {
        popMenuClose('#task__pop_log');
        task_report_Edit('new');
    });

    $('#task__pop_report').on('click', '.btn_ui[action=delete]', function() {
        if(confirm('Удалить отчет?')){
            task_report_Delete();
        }
    });

    $('#task__pop_report div[name=security_squad] select').on('change', function(){
        if($(this).val()==''){
            $('#task__pop_report tr[name=doer] select').removeAttr('disabled');
            var doer_id = $('#task__pop select[name=doer]').val();
            $('#task__pop_report select[name=doer]').val(doer_id);
        } else {
            $('#task__pop_report tr[name=doer] select[name=doer]').val('');
            $('#task__pop_report tr[name=doer] select[name=doer]').attr('disabled','disabled');
        }
    });
/*
    $('#task__pop_report tr[name=doer] input').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/sentry_user/ajax/search/', type:'get', dataType:'json',
                data: {full_name: request.term, limit: 10 },
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
                var user_id = ui.item.user_id
            } else {
                var user_id = 'new';
                $(this).val('');
            }
            $(this).attr('user_id', user_id);
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });
*/
    task_report_Validate();
});


function task_report_Delete() {
    var report_id = $('#task__pop #log_list div.hover').attr('report_id');
    $.ajax({ url:'/task/ajax/delete_report/?report_id='+report_id, type:'get', dataType:'json',
        success: function(data){
            task_Edit( $('#task_list tr.hover').attr('task_id') );
        }
    });
}


function task_report_Edit(report_id) {
    $('#task__pop #log_list div.hover').attr('class','item');
    if(report_id=='new'){
        $('#task__pop_report div.header b').text('Новый отчет');
        $('#task__pop_report td.info').hide();
        $('#task__pop_report td.edit').show();
        $('#task__pop_report tr[name=create_user]').hide();
        $('#task__pop_report tr[name=warden]').hide();
        $('#task__pop_report button[icon=save]').show();
        $('#task__pop_report span[action=delete]').hide();
        var doer_id = $('#task__pop select[name=doer]').val();
        $('#task__pop_report select[name=doer]').val(doer_id);
        popMenuPosition('#task__pop_report','multiple');
    }
    else {
        $('#task__pop #log_list div[report_id='+report_id+']').attr('class','item hover');
        $.ajax({ url:'/task/ajax/get_report/?report_id='+report_id, type:'get', dataType:'json',
            success: function(data){
                var report = data['report'];
                $('#task__pop_report div.header b').text(report['id']);
                $('#task__pop_report td.info').show();
                $('#task__pop_report td.edit').hide();
                $('#task__pop_report tr[name=create_user] td.secondary').text(report['create_user']+' ['+report['create_date']+']');
                $('#task__pop_report tr[name=warden] td.secondary').text(report['warden']);
                $('#task__pop_report tr[name=doer] td.info').text(report['doer']);
                $('#task__pop_report tr[name=status] td.info').text(report['status']);
                $('#task__pop_report div[name=comment]').text(report['comment']);

                $('#task__pop_report button[icon=save]').hide();
                $('#task__pop_report span[action=delete]').show();
                popMenuPosition('#task__pop_report','multiple');
            }
        });
    }
}


function task_report_Update() {
    var report_pack = {};
    report_pack['task_id'] = $('#task_list tr.hover').attr('task_id');
    var security_squad_id = $('#task__pop_report div[name=security_squad] select').val();
    if(security_squad_id){
        report_pack['security_squad_id'] = $('#task__pop_report div[name=security_squad] select').val();
    } else {
        report_pack['doer_id'] = $('#task__pop_report select[name=doer]').val();
    }
    report_pack['status_id'] = $('#task__pop_report tr[name=status] select').val();
    report_pack['comment'] = $('#task__pop_report textarea[name=comment]').val();
    $.ajax({ url:'/task/ajax/create_report/', type:'post', dataType:'json', data:report_pack,
        success: function(data){
            task_Search();
            task_Edit(report_pack['task_id']);
        }
    });
}

function task_report_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            task_report_Update();
        },
        showErrors: function(map, list) { // there's probably a way to simplify this
            var focussed = document.activeElement;
            if (focussed && $(focussed).is("select, textarea")) {
                $(this.currentForm).tooltip("close", {
                    currentTarget: focussed
                }, true)
            }
            this.currentElements.removeAttr("title").removeClass("ui-state-highlight");
            $.each(list, function(index, error) {
                $(error.element).attr("title", error.message).addClass("ui-state-highlight");
            });
            if (focussed && $(focussed).is("select, textarea")) {
                $(this.currentForm).tooltip("open", {
                    target: focussed
                });
            }
        }
    });

    $("#task__pop_report form").tooltip({ // use custom tooltip; disable animations for now to work around lack of refresh method on tooltip
        show: false,
        hide: false
    });

    $("#task__pop_report form").validate({ // validate the comment form when it is submitted
        rules: {
            doer: {
                required: true
            },
            comment: {
                required: true,
                minlength: 3
            }
        },
        messages: {
            doer: {
                required: "Необходим исполнитель"
            },
            comment: {
                required: "Необходим отчет",
                minlength: "Минимум 3 знака"
            }
        }
    });
}