$(document).ready(function() {
    client_id = $(".middleBlock").attr('client_id');
    object_id = $(".middleBlock").attr('object_id');

    $('select[name=service_select]').change(function(){
        weaponGet();
    });
    $('#weapon_list').on('click', 'span[action=object_add]', function(){
        $('div#pop_weapon select[name=weapon_select] option:selected').removeAttr('selected');
        weaponEdit('add');
    });
    $('#weapon_list').on('click', 'span[action=reset]', function(){
        weaponGet();
    });

    $('#weapon_list tbody').on('click', 'tr.row', function() {
        if($.inArray('system.client', lunchbox['permissions'])>=0) {
            console.log('edit');
            var service_weapon_id = $(this).attr('service_weapon_id');
            weaponEdit(service_weapon_id);
        }
    });

    $('div#pop_weapon').on('click', '.close', function() {
        $('table#weapon_list tbody tr.hover').attr('class','row');
    });
    $('div#pop_weapon').on('click', 'span.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='save'){
            weaponUpdate();
        } else if(action=='delete'){
            weaponDelete();
        }
    });
    $('select[name=service_select] option[level=service]:first').attr('selected','selected');
    weaponGet();
});


function weaponUpdate() {
    var ajax_array = {};
    ajax_array['service_id'] = $('select[name=service_select]').val();
    ajax_array['service_weapon_id'] = $('div#pop_weapon').attr('service_weapon_id');
    ajax_array['weapon_id'] = $('div#pop_weapon select[name=weapon] :selected').val();
    ajax_array['comment'] = $('div#pop_weapon tr[name=comment] textarea').val();
    $.ajax({ url:'/system/client/object/weapon/ajax/update/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']) {
                alert(data['error']);
            } else {
                weaponGet();
            }
        }
    });
}


function weaponDelete() {
    var service_weapon_id = $('div#pop_weapon').attr('service_weapon_id');
    $.ajax({ url:'/system/client/object/weapon/ajax/delete/?service_weapon_id='+service_weapon_id,
        type:'get', dataType:'json',
        success: function(data){
            if(data['error']) {
                alert(data['error']);
            } else {
                weaponGet();
            }
        }
    });
}


function weaponEdit(service_weapon_id) {
    popMenuPosition('#pop_weapon','single');
    $('div#pop_weapon').attr('service_weapon_id',service_weapon_id);
    $('table#weapon_list tbody tr.hover').attr('class','row');
    var weapon_id = '0';
    var comment = '';

    $('div#pop_weapon select[name=weapon] option').removeAttr('class');
    $('div#pop_weapon select[name=weapon] option[selected=selected]').removeAttr('selected');
    $('table#weapon_list tbody tr.row:not([weapon_id='+weapon_id+'])').each(function() {
        var weapon_id = $(this).attr('weapon_id');
        $('div#pop_weapon select[name=weapon] [value='+weapon_id+']').attr('class','hide');
    });

    if(service_weapon_id=='add') {
        $('div#pop_weapon select[name=weapon] option:not(.hide):eq(0)').attr('selected','selected');
        $('#pop_weapon span.btn_ui[action=delete]').hide();
    } else {
        var tr = $('table#weapon_list tbody tr[service_weapon_id='+service_weapon_id+']');
        tr.attr('class','row hover');
        var weapon_id = tr.attr('weapon_id');
        var comment = tr.find('td[name=comment]').text();
        $('div#pop_weapon select[name=weapon] [value='+weapon_id+']').attr('selected','selected');
        if($.inArray('system.client', lunchbox['permissions'])>=0) {
            $('#pop_weapon span.btn_ui[action=delete]').show();
        } else {
            $('#pop_weapon span.btn_ui[action=delete]').hide();
        }
    }
    $('div#pop_weapon tr[name=comment] textarea').val(comment);
}


function weaponGet() {
    $('#pop_weapon').hide();
    $('select').attr('disabled','disabled');
    $('.loading').show();
    var ajax_array = {};
    ajax_array['select_level'] = $('select[name=service_select] :selected').attr('level');
    ajax_array['select_id'] = $('select[name=service_select]').val();
    $.ajax({ url:'/system/client/object/weapon/ajax/get/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            $('table#weapon_list tbody tr.row').remove();
            $('div#pop_weapon select[name=weapon] option').remove();
            for(key in data['weapon_list']) {
                var weapon = data['weapon_list'][key];
                var weapon_tr = '<tr class="row" service_weapon_id="'+weapon['id']+'" weapon_id="'+key+'">' +
                    '<td class="cell" name="name">'+weapon['name']+'</td>' +
                    '<td class="cell" name="series">'+weapon['series']+' - '+weapon['number']+'</td>' +
                    '<td class="cell" name="comment">'+weapon['comment']+'</td></tr>';
                $('table#weapon_list tbody').append(weapon_tr);
            }
            for(key in data['dir_weapon_list']) {
                var weapon = data['dir_weapon_list'][key];
                var weapon_option = '<option value="'+key+'" ' +
                    'name="'+weapon['name']+'" series="'+weapon['series']+'" number="'+weapon['number']+'">' +
                    weapon['name']+', '+weapon['series']+' - '+weapon['number']+'</option>';
                $('div#pop_weapon select[name=weapon]').append(weapon_option);
            }
            $('select').removeAttr('disabled');
            $('.loading').hide();
        }
    });
}

