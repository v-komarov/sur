$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            weaponEdit('create');
        } else if(action=='delete'){
            if (confirm('Уверенны, что хотите удалить оружие?')){
                weaponDelete();
            }
        } else if(action=='save'){
            weaponUpdate();
        }
    });

    $('#pop_weapon .header').on('click', '.close', function() {
        weaponCancel(); });

    $('#weapon_list tbody').on('click', '.row:not(.edit)', function() {
        //if($.inArray('system.directory_weapon_change', lunchbox['permissions'])>=0) {
        var weapon_id = $(this).attr('weapon_id');
        weaponCancel();
        weaponEdit(weapon_id);
        //}
    });


    $('#weapon_list thead input').bind('change keyup', function( event ){
        weaponAjax('search'); });
    $('#weapon_list thead select').on('change', function(){
        weaponAjax('search'); });

    weaponAjax('search');
});


function weaponAjax(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/weapon/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'series': $('#weapon_list thead input[name=series]').val(),
            'number': $('#weapon_list thead input[name=number]').val(),
            'weapon_type_id': $('#weapon_list thead select[name=weapon_type]').val(),
            'company_id': $('#weapon_list thead select[name=company]').val(),
            'comment': $('#weapon_list thead input[name=comment]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['weapon']!=null){
                setTable(data['weapon']);
            }
        }
    });
}


function setTable(data) {
    $('#weapon_list tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" weapon_id="'+data[key]['id']+'" >' +
            '<td class="cell">'+data[key]['service_organization__name']+'</td>' +
            '<td class="cell">'+data[key]['series']+'</td>' +
            '<td class="cell">'+data[key]['number']+'</td>' +
            '<td class="cell">'+data[key]['weapon_type__name']+'</td>' +
            '<td class="cell" colspan="2">'+data[key]['comment']+'</td>' +
            '</tr>';
        $('#weapon_list tbody').append(object_item);
        count ++;
    }
    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function weaponEdit(weapon_id) {
    if(weapon_id=='create'){
        weaponCancel();
        var head = $('#weapon_list thead');
        $('#pop_weapon [name=series]').val( head.find('[name=series]').val() );
        $('#pop_weapon [name=number]').val( head.find('[name=number]').val() );
        $('#pop_weapon select[name=weapon_type] option[value='+ head.find('[name=weapon_type]').val() +']').attr("selected", "selected");
        $('#pop_weapon select[name=company] option[value='+ head.find('[name=company]').val() +']').attr("selected", "selected");
        $('#pop_weapon [name=comment]').val( head.find('[name=comment]').val() );
        $('#pop_weapon div.ui_remove').hide();
    } else {
        var tr = $('#weapon_list tbody tr[weapon_id='+weapon_id+']');
        tr.attr('class','row hover');
        $.ajax({ url:'/system/directory/weapon/ajax/get/?weapon_id='+weapon_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                    $('.loading').hide();
                } else {
                    data = data['weapon'];
                    for(var key in data){
                        $('#pop_weapon [name=series]').val(data[key]['series']);
                        $('#pop_weapon [name=number]').val(data[key]['number']);
                        $('#pop_weapon select[name=weapon_type] option[value='+data[key]['weapon_type_id']+']').attr("selected", "selected");
                        $('#pop_weapon select[name=company] option[value='+data[key]['service_organization_id']+']').attr("selected", "selected");
                        $('#pop_weapon [name=comment]').val(data[key]['comment']);
                        //if($.inArray('system.directory_weapon_delete', lunchbox['permissions'])>=0) {
                        $('#pop_weapon div.ui_remove').show();
                        //} else {
                        //$('#pop_weapon div.ui_remove').hide();
                        //}
                    }
                }
            }
        });
    }
    popMenuPosition('#pop_weapon','single');
}

function weaponUpdate() {
    if($(".row").is(".hover")){
        var action = 'update';
        var tr = $('#weapon_list .hover');
        var weapon_id = tr.attr('weapon_id');
    } else {
        var action = 'create';
        $('#weapon_list tbody').append('<tr class="row" weapon_id="new">' +
        '<td class="cell"></td>' +
        '<td class="cell"></td>' +
        '<td class="cell"></td>' +
        '<td class="cell"></td>' +
        '<td class="cell" colspan="2"></td></tr>');
        var tr = $('#weapon_list [weapon_id=new]');
    }
    $.ajax({ url:'/system/directory/weapon/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'weapon_id': weapon_id,
            'series': $('#pop_weapon [name=series]').val(),
            'number': $('#pop_weapon [name=number]').val(),
            'weapon_type_id': $('#pop_weapon select[name=weapon_type]').val(),
            'company_id': $('#pop_weapon select[name=company]').val(),
            'comment': $('#pop_weapon [name=comment]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('#weapon_list tbody [weapon_id=new]').remove();
            } else {
                tr.attr('weapon_id',data['weapon_id']);
                tr.find('td:eq(0)').html($('#pop_weapon [name=company] :selected').text());
                tr.find('td:eq(1)').html($('#pop_weapon [name=series]').val());
                tr.find('td:eq(2)').html($('#pop_weapon [name=number]').val());
                tr.find('td:eq(3)').html($('#pop_weapon [name=weapon_type] :selected').text());
                tr.find('td:eq(4)').html($('#pop_weapon [name=comment]').val());
                weaponCancel();
            }
        }
    });
}

function weaponDelete() {
    var weapon_id = $('#weapon_list .hover').attr('weapon_id');
    $.ajax({ url:'/system/directory/weapon/ajax/delete/?weapon_id='+weapon_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('.tableInfo tbody tr[weapon_id='+weapon_id+']').remove();
                weaponCancel();
            }
        }
    });
}


function weaponCancel() {
    var tr = $('#weapon_list tbody tr.hover').attr('class','row');
    $('#pop_weapon').hide();
}
