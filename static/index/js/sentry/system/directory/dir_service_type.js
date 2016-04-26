$(document).ready(function() {
    $('#service_subtype').hide();

    $('body').on('click', '.btn_ui, .btn_28', function(){
        var action = $(this).attr('action');
        if(action=='type_add'){
            service_type_Ajax('create');
        } else if(action=='subtype_add'){
            service_subtype_Ajax('subtype_create');
        } else if(action=='type_delete'){
            if(confirm('Удалить тип услуг?')){
                var service_type_id = $(this).parents('.edit').attr('service_type_id');
                service_type_Delete(service_type_id);
            }
        } else if(action=='subtype_delete'){
            if(confirm('Удалить подтип услуг?')){
                service_subtype_Ajax('subtype_delete');
            }
        } else if(action=='type_cancel'){
            service_type_Cancel();
        } else if(action=='subtype_cancel'){
            service_subtype_Cancel();
        } else if(action=='type_update'){
            var service_type_id = $(this).parents('.edit').attr('service_type_id');
            service_type_Update(service_type_id);
        } else if(action=='subtype_update'){
            service_subtype_Ajax('subtype_update');
        }
    });

    $('#service_type thead input').bind('change keyup', function(event){
        service_type_Ajax('search');
    });
    $('#service_type tbody').on('click', '.row:not(.edit)', function(){
        if($.inArray('main.client', lunchbox['permissions'])>=0){
            var service_type_id = $(this).attr('service_type_id');
            service_type_Cancel();
            service_type_Edit(service_type_id);
        }
    });
    $('#service_subtype tbody').on('click', '.row:not(.edit)', function(){
        if($.inArray('main.client', lunchbox['permissions'])>=0){
            var service_subtype_id = $(this).attr('service_subtype_id');
            service_subtype_Cancel();
            service_subtype_Edit(service_subtype_id);
        }
    });

    service_type_Ajax('search');
});


function service_type_Ajax(action){
    $('.loading').show();
    $.ajax({ url:'/system/directory/service_type/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'service_type_id': $('#service_type thead select[name=region]').val(),
            'service_type_name': $('#service_type thead input[name=type_name]').val(),
            'description': $('#service_type thead input[name=description]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['service_type_list']!=null){
                $('#service_type tbody tr').remove();
                $('#service_subtype tbody tr').remove();
                var count = 0;
                for(var key in data['service_type_list']){
                    var service_type = data['service_type_list'][key];
                    var service_type_item = '<tr class="row" service_type_id="'+service_type['id']+'" >' +
                        '<td class="cell">'+service_type['name']+'</td>' +
                        '<td class="cell" colspan="2">'+service_type['description']+'</td></tr>';
                    $('#service_type tbody').append(service_type_item);

                    for(var key in service_type['subtype_list']){
                        var service_subtype = service_type['subtype_list'][key];
                        var service_subtype_item = '<tr service_type_id="'+service_type['id']+'" class="row" service_subtype_id="'+service_subtype['id']+'" >' +
                            '<td class="cell">'+service_subtype['name']+'</td>' +
                            '<td class="cell" colspan="2">'+service_subtype['description']+'</td></tr>';
                        $('#service_subtype tbody').append(service_subtype_item);
                    }
                    count ++;
                }
                $('.loading').hide();
            }
        }
    });
}


function service_subtype_Ajax(action){
    $('.loading').show();
    var ajax_array = {};
    ajax_array['service_type_id'] = $('#service_type tbody tr.edit').attr('service_type_id');
    if(action=='subtype_create'){
        ajax_array['service_subtype_name'] = $('#service_subtype thead input[name=type_name]').val();
        ajax_array['service_subtype_description'] = $('#service_subtype thead input[name=description]').val();
    } else if(action=='subtype_delete'){
        ajax_array['service_subtype_id'] = $('#service_subtype tbody tr.edit').attr('service_subtype_id');
    } else if(action=='subtype_update'){
        ajax_array['service_subtype_id'] = $('#service_subtype tbody tr.edit').attr('service_subtype_id');
        ajax_array['service_subtype_name'] = $('#service_subtype tr.edit input[name=subtype_name]').val();
        ajax_array['service_subtype_description'] = $('#service_subtype tr.edit input[name=subtype_description]').val();
    }
    $.ajax({ url:'/system/directory/service_type/ajax/'+action+'/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['service_subtype_list']!=null){
                $('#service_subtype thead input').val('');
                $('#service_subtype tbody tr.edit').remove();
                $('#service_subtype tbody tr[service_type_id='+ajax_array['service_type_id']+']').remove();
                for(var key in data['service_subtype_list']){
                    var service_subtype = data['service_subtype_list'][key];
                    var service_subtype_item = '<tr service_type_id="'+service_subtype['service_type_id']+'" class="row" service_subtype_id="'+service_subtype['id']+'" >' +
                        '<td class="cell">'+service_subtype['name']+'</td>' +
                        '<td class="cell" colspan="2">'+service_subtype['description']+'</td></tr>';
                    $('#service_subtype tbody').append(service_subtype_item);
                }
                $('.loading').hide();
            }
        }
    });
}

function service_type_Edit(service_type_id){
    var tr = $('#service_type tbody tr[service_type_id='+service_type_id+']');
    var type_name = tr.find('td:eq(0)').text();
    var description = tr.find('td:eq(1)').text();
    tr.attr('class','row edit').find('td:eq(1)').removeClass('cell');
    tr.attr('old_type',type_name);
    tr.attr('old_description',description);
    var div_delete = '';
    if($.inArray('main.client', lunchbox['permissions'])>=0){
        div_delete = '<div class="btn_ui btn_34" action="type_delete" icon="delete"><div class="icon"></div></div>';
    }
    var td_eq1 = '<td colspan="3"><table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px; width:70px" type="text" value="'+type_name+'"></td>' +
        '<td><input class="wide margin_5" type="text" value="'+description+'"></td>' +
        '<td><div class="btn_ui btn_34" action="type_update" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="type_cancel" icon="cancel"><div class="icon"></div></div>' +
        div_delete +
        '</td></tr></table></td>';
    tr.html(td_eq1);

    $('#service_subtype tbody tr').hide();
    $('#service_subtype tbody tr[service_type_id='+service_type_id+']').show();
    $('#service_subtype').show();
}


function service_subtype_Edit(service_subtype_id){
    var tr = $('#service_subtype tbody tr[service_subtype_id='+service_subtype_id+']');
    var type_name = tr.find('td:eq(0)').text();
    var description = tr.find('td:eq(1)').text();
    tr.attr('class','row edit').find('td:eq(1)').removeClass('cell');
    tr.attr('old_type',type_name);
    tr.attr('old_description',description);
    var div_delete = '';
    if($.inArray('main.client', lunchbox['permissions'])>=0){
        div_delete = '<div class="btn_ui btn_34" action="subtype_delete" icon="delete"><div class="icon"></div></div>';
    }
    var td_eq1 = '<td colspan="3"><table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px; width:70px" type="text" name="subtype_name" value="'+type_name+'"></td>' +
        '<td><input class="wide margin_5" type="text" name="subtype_description" value="'+description+'"></td>' +
        '<td><div class="btn_ui btn_34" action="subtype_update" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="subtype_cancel" icon="cancel"><div class="icon"></div></div>' +
        div_delete +
        '</td></tr></table></td>';
    tr.html(td_eq1);
}


function service_type_Update(service_type_id){
    console.log(service_type_id);
    var tr = $('.tableInfo tbody tr[service_type_id='+service_type_id+']');
    var type_name = tr.find('td:eq(0) table tbody tr td:eq(0) input').val();
    var description = tr.find('td:eq(0) table tbody tr td:eq(1) input').val();
    if(tr.attr('old_type')==type_name && tr.attr('old_description')==description){
        service_type_Cancel();
    } else {
        $.ajax({ url:'/system/directory/service_type/ajax/update/', type:'get', dataType:'json',
            data:{
                'service_type_id': service_type_id,
                'service_type_name': type_name,
                'description': description
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_type',type_name);
                    tr.attr('old_description',description);
                    service_type_Cancel();
                }
            }
        });
    }
}


function service_type_Delete(service_type_id){
    $.ajax({ url:'/system/directory/service_type/ajax/delete/', type:'get', dataType:'json',
        data:{
            'service_type_id': service_type_id
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                service_type_Cancel();
            } else {
                $('.tableInfo tbody tr[service_type_id='+service_type_id+']').remove();
            }
        }
    });
}


function service_type_Cancel(){
    $('#service_subtype').hide();
    var tr = $('#service_type tbody tr.edit').attr('class','row');
    var type_name = tr.attr('old_type');
    var description = tr.attr('old_description');
    tr.removeAttr('old_type');
    tr.removeAttr('old_description');
    tr.find('td:eq(0)').html(type_name).attr('class','cell').removeAttr('colspan');
    tr.append('<td class="cell" colspan="2">'+description+'</td>');
    service_subtype_Cancel();
}

function service_subtype_Cancel(){
    var tr = $('#service_subtype tbody tr.edit').attr('class','row');
    var type_name = tr.attr('old_type');
    var description = tr.attr('old_description');
    tr.removeAttr('old_type');
    tr.removeAttr('old_description');
    tr.find('td:eq(0)').html(type_name).attr('class','cell').removeAttr('colspan');
    tr.append('<td class="cell" colspan="2">'+description+'</td>');
}