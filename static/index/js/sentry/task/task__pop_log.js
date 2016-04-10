$(document).ready(function() {

    $('#task__pop').on('click', '[action=change_complete_date]', function() {
        popMenuClose('#task__pop_report');
        task_log_Edit('new');
    });

    $('#task__pop_log').on('click', '.header .close', function() {
        $('#task__pop #log_list div.hover').attr('class','item');
        popMenuClose('#task__pop_log');
    });

    $('#task__pop_log').on('click', '.btn_ui[action=delete]', function() {
        if(confirm('Удалить перенос?')){
            task_log_Delete();
        }
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('#task__pop_log [name=new_date]').datepicker({
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

    task_log_Validate();
});


function task_log_Delete() {
    var log_id = $('#task__pop #log_list div.hover').attr('log_id');
    $.ajax({ url:'/task/ajax/delete_log/?log_id='+log_id, type:'get', dataType:'json',
        success: function(data){
            task_Edit( $('#task_list tr.hover').attr('task_id') );
        }
    });
}


function task_log_Edit(log_id) {
    $('#task__pop #log_list div.hover').attr('class','item');
    if(log_id=='new'){
        $('#task__pop_log div.header b').text('Перенос заявки');
        $('#task__pop_log td.info').hide();
        $('#task__pop_log td.edit').show();
        $('#task__pop_log [name=new_date]').val( $('#task__pop td[name=complete_date] div.text').text() );
        $('#task__pop_log textarea[name=comment]').val('');
        $('#task__pop_log button[icon=save]').show();
        $('#task__pop_log span[action=delete]').hide();
        popMenuPosition('#task__pop_log','multiple');
    }
    else {
        $('#task__pop #log_list div[log_id='+log_id+']').attr('class','item hover');
        $.ajax({ url:'/task/ajax/get_log/?log_id='+log_id, type:'get', dataType:'json',
            success: function(data){
                var log = data['log'];
                $('#task__pop_log div.header b').text(log['id']);
                $('#task__pop_log td.info').show();
                $('#task__pop_log td.edit').hide();

                var info = '<div>['+log['create_date']+'] '+log['create_user']+'</div>' +
                    '<div class="move">Перенос заявки с '+log['old_date']+' на '+log['new_date']+'</div>';
                $('#task__pop_log tr[name=new_date] td.info').html(info);
                $('#task__pop_log div[name=comment]').text(log['comment']);

                $('#task__pop_log button[icon=save]').hide();
                $('#task__pop_log span[action=delete]').show();
                popMenuPosition('#task__pop_log','multiple');
            }
        });
    }
}


function task_log_Update() {
    var log_pack = {};
    log_pack['task_id'] = $('#task_list tr.hover').attr('task_id');
    log_pack['new_date'] = $('#task__pop_log input[name=new_date]').val();
    log_pack['comment'] = $('#task__pop_log textarea[name=comment]').val();
    $.ajax({ url:'/task/ajax/change_complete_date/', type:'post', dataType:'json', data:log_pack,
        success: function(data){
            task_Search();
            task_Edit(log_pack['task_id']);
        }
    });
}


function task_log_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            task_log_Update();
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

    $("#task__pop_log form").tooltip({ // use custom tooltip; disable animations for now to work around lack of refresh method on tooltip
        show: false,
        hide: false
    });

    $("#task__pop_log form").validate({ // validate the comment form when it is submitted
        rules: {
            new_date: {
                required: true,
                minlength: 10
            },
            comment: {
                required: true,
                minlength: 3
            }
        },
        messages: {
            new_date: {
                required: "Необходима дата",
                minlength: "Некорректный формат, пример: 30.12.1990"
            },
            comment: {
                required: "Необходим отчет",
                minlength: "Минимум 3 знака"
            }
        }
    });
}