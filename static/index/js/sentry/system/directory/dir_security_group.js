$(document).ready(function() {

    $(".tableInfo").on('click', '.ui_button', function() {
        var action = $(this).attr('class').replace('ui_button ui_','');
        if(action=='add'){
            ajaxSearch('add');
        } else if(action=='remove'){
            if (confirm('Уверенны, что хотите удалить группу?')){
                var group_id = $(this).parents('.edit').attr('group_id');
                groupRemove(group_id);
            }
        } else if(action=='cancel'){
            groupCancel();
        } else if(action=='save'){
            var group_id = $(this).parents('.edit').attr('group_id');
            groupSave(group_id);
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        var group_id = $(this).attr('group_id');
        groupCancel();
        groupEdit(group_id);
    });


    $('.tableInfo input[name=group_name]').bind('change keyup', function( event ){
        ajaxSearch('search');
    });

    ajaxSearch('search');
})

function ajaxSearch(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/group/', type:'get', dataType:'json',
        data:{ 'action': action,
            'group_name': $('.tableInfo thead input[name=group_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['group']!=null){
                setTable(data['group']);
            }
        }
    });
}


function setTable(data) {
    $('.tableInfo tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" group_id="'+data[key]['id']+'" >' +
            '<td class="cell" colspan="2">'+data[key]['name']+'</td></tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }

    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function groupEdit(group_id) {
    var tr = $('.tableInfo tbody tr[group_id='+group_id+']');
    var group_name = tr.find('td:eq(0)').text();
    tr.attr('class','row edit').find('td').removeClass('cell');
    tr.attr('old_group',group_name);

    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td><input style="margin: 0 0 0 3px" class="wide" type="text" value="'+group_name+'"></td>' +
        '<td style="width: 100px">' +
            '<div class="ui_button ui_save"></div>' +
            '<div class="ui_button ui_cancel"></div>' +
            '<div class="ui_button ui_remove"></div>' +
        '</td></tr></table>';
    tr.find('td:eq(0)').html(td_eq1);
}

function groupSave(group_id) {
    var tr = $('.tableInfo tbody tr[group_id='+group_id+']');
    var group_name = tr.find('td:eq(0) input').val();
    if(tr.attr('old_group')==group_name){
        groupCancel();
    } else {
        $.ajax({ url:'/system/directory/group/', type:'get', dataType:'json',
            data:{ 'action': 'save',
                'group_id': group_id,
                'group_name': group_name
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_group',group_name);
                    groupCancel();
                }
            }
        });
    }
}

function groupRemove(group_id) {
    $.ajax({ url:'/system/directory/group/', type:'get', dataType:'json',
        data:{ 'action': 'remove',
            'group_id': group_id
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                groupCancel();
            } else {
                $('.tableInfo tbody tr[group_id='+group_id+']').remove();
            }
        }
    });
}

function groupCancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var group_name = tr.attr('old_group');
    tr.removeAttr('old_group');
    tr.find('td:eq(0)').html(group_name).attr('class','cell');
}

