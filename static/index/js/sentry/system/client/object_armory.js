$(document).ready(function() {
    client_id = $(".middleBlock").attr('client_id');
    object_id = $(".middleBlock").attr('object_id');

    $('select[name=service_select]').change(function(){
        getArmory();
    });
    $('#armory_list').on('click', 'span[action=object_add]', function(){
        $('div#pop_armory select[name=armory_select] option:selected').removeAttr('selected');
        editArmory('add');
    });

    $('#armory_list').on('click', 'span[action=reset]', function(){
        getArmory();
    });
    $('#armory_list tbody').on('click', 'tr.row', function() {
        var service_armory_id = $(this).attr('service_armory_id');
        editArmory(service_armory_id);
    });
    $('div#pop_armory').on('click', '.close', function() {
        $('table#armory_list tbody tr.hover').attr('class','row');
    });
    $('div#pop_armory').on('click', 'span.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='save'){
            saveArmory();
        } else if(action=='remove'){
            removeArmory();
        }
    });
    $('select[name=service_select] option[level=service]:first').attr('selected','selected');
    getArmory();
});

function saveArmory() {
    var ajax_array = {};
    ajax_array['service_id'] = $('select[name=service_select]').val();
    ajax_array['service_armory_id'] = $('div#pop_armory').attr('service_armory_id');
    ajax_array['armory_id'] = $('div#pop_armory select[name=armory_select] :selected').val();
    ajax_array['comment'] = $('div#pop_armory tr[name=comment] textarea').val();
    $.ajax({ url:'/system/client/'+client_id+'/object/'+object_id+'/armory/save_armory/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']) {

            } else {
                getArmory();
            }
        }
    });
}

function removeArmory() {
    var ajax_array = {};
    ajax_array['service_id'] = $('select[name=service_select]').val();
    ajax_array['service_armory_id'] = $('div#pop_armory').attr('service_armory_id');
    $.ajax({ url:'/system/client/'+client_id+'/object/'+object_id+'/armory/remove_armory/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']) {

            } else {
                getArmory();
            }
        }
    });
}

function editArmory(service_armory_id) {
    popMenuPosition('#pop_armory','single');
    $('div#pop_armory').attr('service_armory_id',service_armory_id);
    $('div#pop_armory select[name=armory_select] option:selected').removeAttr('selected');
    $('table#armory_list tbody tr.hover').attr('class','row');
    var armory_id = '';
    var comment = '';
    $('table#armory_list tbody tr.row:not([armory_id='+armory_id+'])').each(function() {
        var armory_id = $(this).attr('armory_id');
        $('div#pop_armory select[name=armory_select] [value='+armory_id+']').attr('class','hide');
    });
    if(service_armory_id=='add') {
        $('div#pop_armory select[name=armory_select] option:not(.hide):eq(0)').attr('selected','selected');
    } else {
        var tr = $('table#armory_list tbody tr[service_armory_id='+service_armory_id+']').attr('class','row hover');
        var armory_id = tr.attr('armory_id');
        var comment = tr.find('td[name=comment]').text();
        $('div#pop_armory select[name=armory_select] [value='+armory_id+']').attr('selected','selected');
    }
    $('div#pop_armory tr[name=comment] textarea').val(comment);
    $('div#pop_armory select[name=armory_select] option').removeAttr('class');
}

function getArmory() {
    $('#pop_armory').hide();
    $('select').attr('disabled','disabled');
    $('.loading').show();
    var ajax_array = {};
    ajax_array['select_level'] = $('select[name=service_select] :selected').attr('level');
    ajax_array['select_id'] = $('select[name=service_select]').val();
    $.ajax({ url:'/system/client/'+client_id+'/object/'+object_id+'/armory/get_armory', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            $('table#armory_list tbody tr.row').remove();
            $('div#pop_armory select[name=armory_select] option').remove();
            for(key in data['armory']) {
                var armory = data['armory'][key];
                var armory_tr = '<tr class="row" service_armory_id="'+armory['id']+'" armory_id="'+key+'">' +
                    '<td class="cell" name="name">'+armory['name']+'</td>' +
                    '<td class="cell" name="series">'+armory['series']+' - '+armory['number']+'</td>' +
                    '<td class="cell" name="comment">'+armory['comment']+'</td></tr>';
                $('table#armory_list tbody').append(armory_tr);
            }
            for(key in data['armory_select']) {
                var armory = data['armory_select'][key];
                var armory_option = '<option value="'+key+'" ' +
                    'name="'+armory['name']+'" series="'+armory['series']+'" number="'+armory['number']+'">' +
                    armory['name']+', '+armory['series']+' - '+armory['number']+'</option>';
                $('div#pop_armory select[name=armory_select]').append(armory_option);
            }
            $('select').removeAttr('disabled');
            $('.loading').hide();
        }
    });
}

