$(document).ready(function() {

    $(".tableInfo").on('click', '.ui_button', function() {
        var action = $(this).attr('class').replace('ui_button ui_','');
        if(action=='add'){
            ajaxSearch('add');
        } else if(action=='remove'){
            if (confirm('Уверенны, что хотите удалить?')){
                var console_id = $(this).parents('.edit').attr('console_id');
                consoleRemove(console_id);
            }
        } else if(action=='cancel'){
            consoleCancel();
        } else if(action=='save'){
            var console_id = $(this).parents('.edit').attr('console_id');
            consoleSave(console_id);
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        var console_id = $(this).attr('console_id');
        consoleCancel();
        consoleEdit(console_id);
    });


    $('.tableInfo thead input').bind('change keyup', function( event ){
        ajaxSearch('search');
    });

    ajaxSearch('search');
})

function ajaxSearch(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/console/', type:'get', dataType:'json',
        data:{ 'action': action,
            'console_name': $('.tableInfo thead input[name=console_name]').val(),
            'description': $('.tableInfo thead input[name=description]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['console']!=null){
                setTable(data['console']);
            }
        }
    });
}


function setTable(data) {
    console.log('1');
    $('.tableInfo tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" console_id="'+data[key]['id']+'" >' +
            '<td class="cell">'+data[key]['name']+'</td>' +
            '<td class="cell" colspan="2">'+data[key]['description']+'</td></tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }

    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function consoleEdit(console_id) {
    var tr = $('.tableInfo tbody tr[console_id='+console_id+']');
    var console_name = tr.find('td:eq(0)').text();
    var description = tr.find('td:eq(1)').text();
    tr.attr('class','row edit').find('td:eq(1)').removeClass('cell');
    tr.attr('old_console',console_name);
    tr.attr('old_description',description);

    var td_eq1 = '<td colspan="3"><table style="width: 100%"><tr>' +
        '<td><input style="margin:0 0 0 1px; width:60px" console="text" value="'+console_name+'"></td>' +
        '<td><input style="margin:0 0 0 3px" class="wide" console="text" value="'+description+'"></td>' +
        '<td style="width: 100px">' +
            '<div class="ui_button ui_save"></div>' +
            '<div class="ui_button ui_cancel"></div>' +
            '<div class="ui_button ui_remove"></div>' +
        '</td></tr></table></td>';
    tr.html(td_eq1);
}

function consoleSave(console_id) {
    console.log(console_id);
    var tr = $('.tableInfo tbody tr[console_id='+console_id+']');
    var console_name = tr.find('td:eq(0) table tbody tr td:eq(0) input').val();
    var description = tr.find('td:eq(0) table tbody tr td:eq(1) input').val();
    if(tr.attr('old_console')==console_name && tr.attr('old_description')==description){
        consoleCancel();
    } else {
        $.ajax({ url:'/system/directory/console/', type:'get', dataType:'json',
            data:{ 'action': 'save',
                'console_id': console_id,
                'console_name': console_name,
                'description': description
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_console',console_name);
                    tr.attr('old_description',description);
                    consoleCancel();
                }
            }
        });
    }
}

function consoleRemove(console_id) {
    $.ajax({ url:'/system/directory/console/', type:'get', dataType:'json',
        data:{ 'action': 'remove',
            'console_id': console_id
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                consoleCancel();
            } else {
                $('.tableInfo tbody tr[console_id='+console_id+']').remove();
            }
        }
    });
}

function consoleCancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var console_name = tr.attr('old_console');
    var description = tr.attr('old_description');
    tr.removeAttr('old_console');
    tr.removeAttr('old_description');
    tr.find('td:eq(0)').html(console_name).attr('class','cell').removeAttr('colspan');
    tr.append('<td class="cell" colspan="2">'+description+'</td>');
}

