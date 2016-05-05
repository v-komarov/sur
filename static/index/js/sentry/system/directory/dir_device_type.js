$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            device_type_Search();
        }
        else if(action=='add'){
            device_type_Edit();
        }
        else if(action=='communication_add'){
            device_type_communication('add');
        }
        else if(action=='delete'){
            if (confirm('Удалить?')){
                var device_type_id = $('#device_type_list tbody tr.hover').attr('device_type_id');
                device_type_Delete(device_type_id);
            }
        }
        else if(action=='save'){
            var device_type_id = $(this).parents('.edit').attr('device_type_id');
            device_type_Update(device_type_id);
        }
    });

    $('#device_pop .in_pop_sublist').on('click', '.close', function(){
        var communication_id = $(this).parent().attr('communication_id');
        device_type_communication('delete',communication_id)
    });

    $('#device_pop .header').on('click', '.close', function() { device_type_Cancel() });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        if(8>0) {
            device_type_Edit($(this));
        }
    });


    $('.tableInfo thead input').bind('change keyup', function( event ){
        device_type_Search();
    });

    device_type_Search();
    device_Validate();
});


function device_type_Search() {
    loading('begin');
    device_type_Cancel();
    var ajax_array = get_each_value('#device_type_list thead');
    $.ajax({ url:'/system/directory/device_type/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else if(data['device_type_list']!=null){
                $('#device_type_list tbody tr').remove();
                count = 0;
                for(var key in data['device_type_list']){
                    var item = data['device_type_list'][key];
                    var communication_list = '';
                    for(var key2 in item['communication_list']){
                        communication_list += item['communication_list'][key2]['name']+', ';
                    }
                    communication_list = communication_list.slice(0,-2);
                    var object_item = '<tr class="row" device_type_id="'+item['id']+'" >' +
                        '<td class="cell">'+item['name']+'</td>' +
                        '<td class="cell">'+item['description']+'</td>' +
                        '<td class="cell" colspan="2">'+communication_list+'</td></tr>';
                    $('#device_type_list tbody').append(object_item);
                    count ++;
                }
                $('.result_count').html('Найдено: '+count);

            }
        },
        complete: function () {
            loading('end');
        }
    });
}


function device_type_Edit(device_type_tr) {
    device_type_Cancel();
    if(!!device_type_tr){
        var device_type_id = device_type_tr.attr('device_type_id');
        device_type_tr.attr('class','row hover');
        if(8>0) {
            $('#device_pop div[action=delete]').show();
        } else {
            $('#device_pop div[action=delete]').hide();
        }
        $.ajax({ url:'/system/directory/device_type/ajax/search/?device_type_id='+device_type_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    for(var key in data['device_type_list'][0]){
                        $('#device_pop [name='+key+']').val(data['device_type_list'][0][key]);
                    }
                    device_type_communication('set',data['device_type_list'][0]['communication_list']);
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


function device_type_communication(action,data) {
    if(action=='add'){
        var communication_id = parseInt( $('#device_pop select[name=device_communication]').val() );
        var communication_txt = $('#device_pop select[name=device_communication] :selected').text();
        var span = '<span class="item" communication_id="'+communication_id+'">' +
            '<span class="txt">'+communication_txt+'</span>' +
            '<span class="close" title="Удалить"></span></span>';
        $('#device_pop div.in_pop_sublist').append(span);
    }
    else if(action=='delete'){
        $('#device_pop .in_pop_sublist .item[communication_id='+data+']').remove();
    }
    else if(action=='get'){
        var communication_list = [];
        $('#device_pop .in_pop_sublist .item').each(function(){
            communication_list.push( $(this).attr('communication_id') );
        });
        return JSON.stringify(communication_list);
    }
    else if(action=='set'){
        $('#device_pop .in_pop_sublist .item').remove();
        for(var key in data){
            var span = '<span class="item" communication_id="'+data[key]['id']+'">' +
                '<span class="txt">'+data[key]['name']+'</span>' +
                '<span class="close" title="Удалить"></span></span>';
            $('#device_pop .in_pop_sublist').append(span);
        }
    }

    $('#device_pop select[name=device_communication] option').removeAttr('class').removeAttr('selected');
    $('#device_pop .in_pop_sublist .item').each(function(){
        var communication_id = $(this).attr('communication_id') ;
        $('#device_pop select[name=device_communication] option[value='+communication_id+']').attr('class','hide');
    });

    if($('#device_pop select[name=device_communication] option:not(.hide)').length>0){
        $('#device_pop select[name=device_communication]').show();
        $('#device_pop div.btn_ui[name=subtypes]').show();
        $('#device_pop select[name=device_communication] option:not(.hide):first').attr("selected", "selected");
    } else {
        $('#device_pop select[name=device_communication]').hide();
        $('#device_pop div.btn_ui[name=subtypes]').hide();
    }
}


function device_type_Update() {
    var ajax_array = get_each_value('#device_pop');
    ajax_array['device_type_id'] = $('#device_type_list tbody tr.hover').attr('device_type_id');
    ajax_array['communication_list'] = device_type_communication('get');
    var action = 'create';
    if(!!ajax_array['device_type_id']) action = 'update';
    $.ajax({ url:'/system/directory/device_type/ajax/'+action+'/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else {
                device_type_Search();
            }
        }
    });
}


function device_type_Delete(device_type_id) {
    $.ajax({ url:'/system/directory/device_type/ajax/delete/?device_type_id='+device_type_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else {
                device_type_Search();
            }
        }
    });
}


function device_type_Cancel() {
    $('.tableInfo tbody tr.hover').attr('class','row');
    $('#device_pop').hide();
}


function device_Validate(){
    $.validator.setDefaults({
        submitHandler: function(){
            device_type_Update();
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
            }
        },
        messages: {
            name: {
                required: "Необходимо наименование"
            }
        }
    });
}