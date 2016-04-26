$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            security_squadAjax('create');
        } else if(action=='delete'){
            if (confirm('Уверенны, что хотите удалить группу?')){
                var security_squad_id = $(this).parents('.edit').attr('security_squad_id');
                security_squadDelete(security_squad_id);
            }
        } else if(action=='cancel'){
            security_squadCancel();
        } else if(action=='save'){
            var security_squad_id = $(this).parents('.edit').attr('security_squad_id');
            security_squadUpdate(security_squad_id);
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        if($.inArray('main.client', lunchbox['permissions'])>=0) {
            var security_squad_id = $(this).attr('security_squad_id');
            security_squadCancel();
            security_squad_Edit(security_squad_id);
        }
    });

    $('.tableInfo input[name=security_squad_name]').bind('change keyup', function( event ){
        security_squadAjax('search');
    });

    security_squadAjax('search');
});


function security_squadAjax(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/security_squad/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'security_squad_name': $('.tableInfo thead input[name=security_squad_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['security_squad']!=null){
                setTable(data['security_squad']);
            }
        }
    });
}


function setTable(data) {
    $('.tableInfo tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" security_squad_id="'+data[key]['id']+'" >' +
            '<td class="cell" colspan="2">'+data[key]['name']+'</td></tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }

    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function security_squad_Edit(security_squad_id) {
    var tr = $('.tableInfo tbody tr[security_squad_id='+security_squad_id+']');
    var security_squad_name = tr.find('td:eq(0)').text();
    tr.attr('class','row edit').find('td').removeClass('cell');
    tr.attr('old_security_squad',security_squad_name);
    var div_delete = '';
    if($.inArray('main.client', lunchbox['permissions'])>=0) {
        div_delete = '<div class="btn_ui btn_34" action="delete" icon="delete"><div class="icon"></div></div>';
    }
    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px" type="text" value="'+security_squad_name+'"></td>' +
        '<td><div class="btn_ui btn_34" action="save" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="cancel" icon="cancel"><div class="icon"></div></div>' +
        div_delete +
        '</td></tr></table>';
    tr.find('td:eq(0)').html(td_eq1);
}


function security_squadUpdate(security_squad_id) {
    var tr = $('.tableInfo tbody tr[security_squad_id='+security_squad_id+']');
    var security_squad_name = tr.find('td:eq(0) input').val();
    if(tr.attr('old_security_squad')==security_squad_name){
        security_squadCancel();
    } else {
        $.ajax({ url:'/system/directory/security_squad/ajax/update/', type:'get', dataType:'json',
            data:{
                'security_squad_id': security_squad_id,
                'security_squad_name': security_squad_name
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_security_squad',security_squad_name);
                    security_squadCancel();
                }
            }
        });
    }
}


function security_squadDelete(security_squad_id) {
    $.ajax({ url:'/system/directory/security_squad/ajax/delete/', type:'get', dataType:'json',
        data:{
            'security_squad_id': security_squad_id
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                security_squadCancel();
            } else {
                $('.tableInfo tbody tr[security_squad_id='+security_squad_id+']').remove();
            }
        }
    });
}


function security_squadCancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var security_squad_name = tr.attr('old_security_squad');
    tr.removeAttr('old_security_squad');
    tr.find('td:eq(0)').html(security_squad_name).attr('class','cell');
}

