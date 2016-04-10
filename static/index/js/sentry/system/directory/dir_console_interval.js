$(document).ready(function() {
    $('body').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        console.log(action);
        if(action=='console_interval_add'){
            console_interval_Edit();
        }
        else if(action=='console_interval_delete'){
            if (confirm('Уверенны, что хотите удалить?')){
                console_interval_Delete();
            }
        }
    });

    $('#console_interval_pop').on('click', 'div.close', function() {
        console_interval_Cancel();
    });


    $('#console_interval_pop tbody').on('click', '.row:not(.edit)', function() {
        if($.inArray('system.client', lunchbox['permissions'])>=0) {
            console_interval_Edit($(this).attr('console_interval_id'));
        }
    });

    $('#console_interval_list thead').on('change', 'select', function(){
        console_interval_Search();
    });

    $('#console_interval_list tbody').on('click', 'tr', function(){
        console_interval_Edit($(this).attr('console_interval_id'));
    });

    console_interval_Search();
    console_interval_Validate();
});


function console_interval_Search() {
    loading('begin');
    console_interval_Cancel();
    var interval_array = get_each_value('#console_interval_list');
    $.ajax({ url:'/system/directory/console_interval/ajax/search/', type:'get', dataType:'json', data:interval_array,
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else if(data['console_interval_list']!=null){
                table_Draw(data['console_interval_list']);
            }
            loading('end');
        }
    });
}


function table_Draw(data) {
    $('#console_interval_list tbody tr').remove();
    var count = 0;
    for(var key in data){
        var interval = data[key];
        console.log(interval['id']);
        var object_item = '<tr class="row" console_interval_id="'+interval['id']+'" >' +
            '<td class="cell">'+interval['device_console__name']+'</td>' +
            '<td class="cell">'+interval['service_organization__name']+'</td>' +
            '<td class="cell nowrap" colspan="2">['+interval['begin']+'-'+interval['end']+']</td></tr>';
        $('#console_interval_list tbody').append(object_item);
        count ++;
    }

    loading('end');
    $('.result_count').html('Найдено: '+count);
}


function console_interval_Edit(interval_id) {
    loading('begin');
    console_interval_Cancel();
    $('#console_interval_pop .btn_ui').show();
    if(!!interval_id){
        var tr = $('#console_interval_list tr[console_interval_id='+interval_id+']');
        tr.attr('class','row hover');
        $.ajax({ url:'/system/directory/console_interval/ajax/search/?console_interval_id='+interval_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']!=null) {
                    alert(data['error']);
                }
                else {
                    var interval = data['console_interval_list'][0];
                    $('#console_interval_pop [name=begin]').val(interval['begin']);
                    $('#console_interval_pop [name=end]').val(interval['end']);
                    $('#console_interval_pop select[name=service_organization]').val(interval['service_organization_id']);
                    $('#console_interval_pop select[name=device_console]').val(interval['device_console_id']);
                    if($.inArray('system.client', lunchbox['permissions'])>=0) {
                        $('#console_interval_pop div.ui_remove').show();
                    } else {
                        $('#console_interval_pop div.ui_remove').hide();
                    }
                }
            }
        });
    }
    else {
        $('#console_interval_pop [name=begin]').val('');
        $('#console_interval_pop [name=end]').val('');
        $('#console_interval_pop [action=delete]').hide();
    }
    popMenuPosition('#console_interval_pop','single');
    loading('end');
}


function console_interval_Update() {
    var interval_array = get_each_value('#console_interval_pop');
    var action = '';
    if($('#console_interval_list tbody tr.row').is('.hover')){
        action = 'update';
        interval_array['console_interval'] = $('#console_interval_list tr.hover').attr('console_interval_id');
    }
    else {
        action = 'create';
    }
    $.ajax({ url:'/system/directory/console_interval/ajax/'+action+'/', type:'post', dataType:'json', data:interval_array,
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else {
                console_interval_Search();
            }
        }
    });
}


function console_interval_Delete() {
    var interval_id = $('#console_interval_list .hover').attr('console_interval_id');
    $.ajax({ url:'/system/directory/console_interval/ajax/delete/?console_interval='+interval_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                console_interval_Search();
            }
        }
    });
}


function console_interval_Cancel() {
    var tr = $('#console_interval_list tbody tr.hover').attr('class','row');
    $('#console_interval_pop').hide();
}


function console_interval_Validate(){
    $.validator.setDefaults({
        submitHandler: function(){
            console_interval_Update();
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
    $('#console_interval_pop form').tooltip({
        show: false,
        hide: false
    });
    $('#console_interval_pop form').validate({ // validate the comment form when it is submitted
        rules: {
            begin: {
                required: true,
                maxlength: 11,
                number: true
            },
            end: {
                required: true,
                maxlength: 11,
                number: true
            }
        },
        messages: {
            begin: {
                required: "Необходимо",
                maxlength: "Максимум 11 знаков",
                number: "Максимум 11 знаков"
            },
            end: {
                required: "Необходимо",
                maxlength: "Максимум 11 знаков",
                number: "Максимум 11 знаков"
            }
        }
    });
}