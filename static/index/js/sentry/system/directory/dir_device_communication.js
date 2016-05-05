$(document).ready(function(){

    $('#device_pop').on('click', 'tr.switch', function(){
        if($(this).attr('checked')=='checked'){
            $(this).removeAttr('checked');
            $('#device_pop tr.switch td.text_right').html('Аренда');
        } else {
            $(this).attr('checked','checked');
            $('#device_pop tr.switch td.text_right').html('Продано');
        }
    });

    $('body').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='device_add'){
            device_Edit();
        }
        else if(action=='install_priority'){
            device_install_Priority( $(this).parents('tr').attr('install_id') );
        }
        else if(action=='delete'){
            if (confirm('Удалить канал связи?')){
                device_Delete();
            }
        } else if(action=='device_reset'){
            var communication_tr = $('#device_communication_list tbody tr.hover');
            device_Edit(communication_tr);
        }
    });

    $('#device_communication_list tbody').on('click', '.row:not(.edit)', function(){
        if(8>0) {
            device_Edit($(this));
        }
    });

    $('#device_communication_list thead input').bind('change keyup', function( event ){
        device_Search();
    });
    $('#device_communication_list thead select').on('change', function(){
        device_Search();
    });
    $('#device_pop .header').on('click', '.close', function(){
        device_Cancel();
    });

    device_Search();
    device_Validate();
});


function device_Search(){
    device_Cancel();
    loading('begin');
    var ajax_array = get_each_value('#device_communication_list thead');
    $.ajax({ url:'/system/directory/device_communication/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            }
            else if(data['device_communication_list']){
                setTable(data);
            }
        }
    });
}


function setTable(data){
    $('#device_communication_list tbody tr').remove();
    var count = 0;
    for(var key in data['device_communication_list']){
        var item = data['device_communication_list'][key];
        var item_tr = '<tr class="row" communication_id="'+item['id']+'" >' +
            '<td class="cell">'+item['communication_type__name']+'</td>' +
            '<td class="cell">'+item['name']+'</td>' +
            '<td class="cell" colspan="2">'+item['description']+'</td>' +
            '</tr>';
        $('#device_communication_list tbody').append(item_tr);
        count ++;
    }
    loading('end');
    $('.result_count').html('Найдено: '+count);
}


function device_Edit(communication_tr){
    device_Cancel();
    if(!!communication_tr){
        var communication_id = communication_tr.attr('communication_id');
        communication_tr.attr('class','row hover');
        if(8>0) {
            $('#device_pop div[action=delete]').show();
        } else {
            $('#device_pop div[action=delete]').hide();
        }
        $.ajax({ url:'/system/directory/device_communication/ajax/search/?communication_id='+communication_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    for(var key in data['device_communication_list'][0]){
                        $('#device_pop [name='+key+']').val(data['device_communication_list'][0][key]);
                    }
                    loading('end');
                }
            }
        });
    } else {
        $('#device_pop div[action=delete]').hide();
        $('#device_pop [name]').val('');
    }
    popMenuPosition('#device_pop','single');
}


function device_Update(){
    var ajax_array = get_each_value('#device_pop');
    ajax_array['communication'] = $('#device_communication_list tbody tr.hover').attr('communication_id');
    $.ajax({ url:'/system/directory/device_communication/ajax/update/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']){
                alert(data['error']);
            } else {
                device_Search();
            }
        }
    });
}


function device_Delete(){
    var communication_id = $('#device_communication_list .hover').attr('communication_id');
    $.ajax({ url:'/system/directory/device_communication/ajax/delete/?communication='+communication_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                device_Search();
            }
        }
    });
}


function device_Cancel(){
    $('#device_communication_list tbody tr.hover').attr('class','row');
    $('#device_pop').hide();
}


function device_Validate(){
    $.validator.setDefaults({
        submitHandler: function(){
            device_Update();
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
    $("form#device_form").tooltip({
        show: false,
        hide: false
    });

    $("form#device_form").validate({ // validate the comment form when it is submitted
        rules: {
            name: {
                required: true
            },
            communication_type: {
                required: true
            },
            description: {
                required: true
            }
        },
        messages: {
            name: {
                required: "Необходимо наименование"
            },
            communication_type: {
                required: "Необходима среда"
            },
            description: {
                required: "Необходимо описание"
            }
        }
    });
}
