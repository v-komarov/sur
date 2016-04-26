$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            device_console_Ajax('create');
        } else if(action=='delete'){
            if (confirm('Уверенны, что хотите удалить?')){
                var device_console_id = $(this).parents('.edit').attr('device_console_id');
                device_console_Delete(device_console_id);
            }
        } else if(action=='cancel'){
            device_console_Cancel();
        } else if(action=='save'){
            var device_console_id = $(this).parents('.edit').attr('device_console_id');
            device_console_Update(device_console_id);
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        if($.inArray('main.client', lunchbox['permissions'])>=0) {
            var device_console_id = $(this).attr('device_console_id');
            device_console_Cancel();
            device_console_Edit(device_console_id);
        }
    });


    $('.tableInfo thead input').bind('change keyup', function( event ){
        device_console_Ajax('search');
    });

    device_console_Ajax('search');
});

function device_console_Ajax(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/device_console/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'device_console_name': $('.tableInfo thead input[name=device_console_name]').val(),
            'description': $('.tableInfo thead input[name=description]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['device_console']!=null){
                setTable(data['device_console']);
            }
        }
    });
}


function setTable(data) {
    $('.tableInfo tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" device_console_id="'+data[key]['id']+'" >' +
            '<td class="cell">'+data[key]['name']+'</td>' +
            '<td class="cell" colspan="2">'+data[key]['description']+'</td></tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }

    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function device_console_Edit(device_console_id) {
    var tr = $('.tableInfo tbody tr[device_console_id='+device_console_id+']');
    var device_console_name = tr.find('td:eq(0)').text();
    var description = tr.find('td:eq(1)').text();
    tr.attr('class','row edit').find('td:eq(1)').removeClass('cell');
    tr.attr('old_device_console',device_console_name);
    tr.attr('old_description',description);
    var div_delete = '';
    if($.inArray('main.client', lunchbox['permissions'])>=0) {
        div_delete = '<div class="btn_ui btn_34" action="delete" icon="delete"><div class="icon"></div></div>';
    }
    var td_eq1 = '<td colspan="3"><table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px; width:70px" device_console="text" value="'+device_console_name+'"></td>' +
        '<td><input style="margin: 5px 0 0 5px" class="wide" device_console="text" value="'+description+'"></td>' +
        '<td><div class="btn_ui btn_34" action="save" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="cancel" icon="cancel"><div class="icon"></div></div>' +
        div_delete +
        '</td></tr></table></td>';
    tr.html(td_eq1);
}

function device_console_Update(device_console_id) {
    var tr = $('.tableInfo tbody tr[device_console_id='+device_console_id+']');
    var device_console_name = tr.find('td:eq(0) table tbody tr td:eq(0) input').val();
    var description = tr.find('td:eq(0) table tbody tr td:eq(1) input').val();
    if(tr.attr('old_device_console')==device_console_name && tr.attr('old_description')==description){
        device_console_Cancel();
    } else {
        $.ajax({ url:'/system/directory/device_console/ajax/update/', type:'get', dataType:'json',
            data:{
                'device_console_id': device_console_id,
                'device_console_name': device_console_name,
                'description': description
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_device_console',device_console_name);
                    tr.attr('old_description',description);
                    device_console_Cancel();
                }
            }
        });
    }
}

function device_console_Delete(device_console_id) {
    $.ajax({ url:'/system/directory/device_console/ajax/delete/', type:'get', dataType:'json',
        data:{
            'device_console_id': device_console_id
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                device_console_Cancel();
            } else {
                $('.tableInfo tbody tr[device_console_id='+device_console_id+']').remove();
            }
        }
    });
}

function device_console_Cancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var device_console_name = tr.attr('old_device_console');
    var description = tr.attr('old_description');
    tr.removeAttr('old_device_console');
    tr.removeAttr('old_description');
    tr.find('td:eq(0)').html(device_console_name).attr('class','cell').removeAttr('colspan');
    tr.append('<td class="cell" colspan="2">'+description+'</td>');
}

