$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            ajaxSearch('add');
        } else if(action=='remove'){
            if (confirm('Уверенны, что хотите удалить?')){
                var type_id = $(this).parents('.edit').attr('type_id');
                typeRemove(type_id);
            }
        } else if(action=='cancel'){
            typeCancel();
        } else if(action=='save'){
            var type_id = $(this).parents('.edit').attr('type_id');
            typeSave(type_id);
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        var type_id = $(this).attr('type_id');
        typeCancel();
        typeEdit(type_id);
    });


    $('.tableInfo thead input').bind('change keyup', function( event ){
        ajaxSearch('search');
    });

    ajaxSearch('search');
})

function ajaxSearch(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/security_type/', type:'get', dataType:'json',
        data:{ 'action': action,
            'type_id': $('.tableInfo thead select[name=region]').val(),
            'type_name': $('.tableInfo thead input[name=type_name]').val(),
            'description': $('.tableInfo thead input[name=description]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['type']!=null){
                setTable(data['type']);
            }
        }
    });
}


function setTable(data) {
    $('.tableInfo tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" type_id="'+data[key]['id']+'" >' +
            '<td class="cell">'+data[key]['name']+'</td>' +
            '<td class="cell" colspan="2">'+data[key]['description']+'</td></tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }

    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function typeEdit(type_id) {
    var tr = $('.tableInfo tbody tr[type_id='+type_id+']');
    var type_name = tr.find('td:eq(0)').text();
    var description = tr.find('td:eq(1)').text();
    tr.attr('class','row edit').find('td:eq(1)').removeClass('cell');
    tr.attr('old_type',type_name);
    tr.attr('old_description',description);
    var div_delete = '';
    if(8>0) {
        div_delete = '<div class="btn_ui btn_34" action="delete" icon="delete"><div class="icon"></div></div>';
    }

    var td_eq1 = '<td colspan="3"><table style="width: 100%"><tr>' +
        '<td><input style="margin:0 0 0 1px; width:60px" type="text" value="'+type_name+'"></td>' +
        '<td><input style="margin:0 0 0 3px" type="text" value="'+description+'"></td>' +
        '<td style="width: 100px">' +
        '<div class="btn_ui btn_34" action="save" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="cancel" icon="cancel"><div class="icon"></div></div>' +
        div_delete +
        '</td></tr></table></td>';
    tr.html(td_eq1);
}

function typeSave(type_id) {
    console.log(type_id);
    var tr = $('.tableInfo tbody tr[type_id='+type_id+']');
    var type_name = tr.find('td:eq(0) table tbody tr td:eq(0) input').val();
    var description = tr.find('td:eq(0) table tbody tr td:eq(1) input').val();
    if(tr.attr('old_type')==type_name && tr.attr('old_description')==description){
        typeCancel();
    } else {
        $.ajax({ url:'/system/directory/security_type/', type:'get', dataType:'json',
            data:{ 'action': 'save',
                'type_id': type_id,
                'type_name': type_name,
                'description': description
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_type',type_name);
                    tr.attr('old_description',description);
                    typeCancel();
                }
            }
        });
    }
}

function typeRemove(type_id) {
    $.ajax({ url:'/system/directory/security_type/', type:'get', dataType:'json',
        data:{ 'action': 'remove',
            'type_id': type_id
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                typeCancel();
            } else {
                $('.tableInfo tbody tr[type_id='+type_id+']').remove();
            }
        }
    });
}

function typeCancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var type_name = tr.attr('old_type');
    var description = tr.attr('old_description');
    tr.removeAttr('old_type');
    tr.removeAttr('old_description');
    tr.find('td:eq(0)').html(type_name).attr('class','cell').removeAttr('colspan');
    tr.append('<td class="cell" colspan="2">'+description+'</td>');
}

