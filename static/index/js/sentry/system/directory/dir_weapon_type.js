$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            weapon_typeAjax('create');
        }
        else if(action=='delete'){
            if(confirm('Уверенны, что хотите тип оружия?')){
                var weapon_type_id = $(this).parents('.edit').attr('weapon_type_id');
                weapon_typeDelete(weapon_type_id);
            }
        }
        else if(action=='cancel'){
            weapon_typeCancel();
        }
        else if(action=='save'){
            var weapon_type_id = $(this).parents('.edit').attr('weapon_type_id');
            weapon_typeUpdate(weapon_type_id);
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        //if($.inArray('main.directory_weapon_type_change', lunchbox['permissions'])>=0) {
            var weapon_type_id = $(this).attr('weapon_type_id');
            weapon_typeCancel();
            weapon_typeEdit(weapon_type_id);
        //}
    });

    $('.tableInfo input[name=weapon_type_name]').bind('change keyup', function( event ){
        weapon_typeAjax('search');
    });

    weapon_typeAjax('search');
});


function weapon_typeAjax(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/weapon_type/ajax/'+action+'/', type:'get', dataType:'json',
        data:{ 'name':$('.tableInfo thead input[name=weapon_type_name]').val() },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['weapon_type']!=null){
                setTable(data['weapon_type']);
            }
        }
    });
}


function setTable(data) {
    $('.tableInfo tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" weapon_type_id="'+data[key]['id']+'" >' +
            '<td class="cell" colspan="2">'+data[key]['name']+'</td></tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }
    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function weapon_typeEdit(weapon_type_id) {
    var tr = $('.tableInfo tbody tr[weapon_type_id='+weapon_type_id+']');
    var weapon_type_name = tr.find('td:eq(0)').text();
    tr.attr('class','row edit').find('td').removeClass('cell');
    tr.attr('old_weapon_type',weapon_type_name);
    var div_delete = '';
    //if($.inArray('main.directory_weapon_type_delete', lunchbox['permissions'])>=0) {
        div_delete = '<div class="btn_ui btn_34" action="delete" icon="delete"><div class="icon"></div></div>';
    //}
    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px" type="text" value="'+weapon_type_name+'"></td>' +
        '<td><div class="btn_ui btn_34" action="save" icon="save"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_34" action="cancel" icon="cancel"><div class="icon"></div></div>' +
            div_delete +
        '</td></tr></table>';
    tr.find('td:eq(0)').html(td_eq1);
}


function weapon_typeUpdate(weapon_type_id) {
    var tr = $('.tableInfo tbody tr[weapon_type_id='+weapon_type_id+']');
    var weapon_type_name = tr.find('td:eq(0) input').val();
    if(tr.attr('old_weapon_type')==weapon_type_name){
        weapon_typeCancel();
    } else {
        $.ajax({ url:'/system/directory/weapon_type/ajax/update/', type:'get', dataType:'json',
            data:{ 'weapon_type_id':weapon_type_id, 'name':weapon_type_name },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_weapon_type',weapon_type_name);
                    weapon_typeCancel();
                }
            }
        });
    }
}


function weapon_typeDelete(weapon_type_id) {
    $.ajax({ url:'/system/directory/weapon_type/ajax/delete/?weapon_type_id='+weapon_type_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                weapon_typeCancel();
            } else {
                $('.tableInfo tbody tr[weapon_type_id='+weapon_type_id+']').remove();
            }
        }
    });
}


function weapon_typeCancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var weapon_type_name = tr.attr('old_weapon_type');
    tr.removeAttr('old_weapon_type');
    tr.find('td:eq(0)').html(weapon_type_name).attr('class','cell');
}
