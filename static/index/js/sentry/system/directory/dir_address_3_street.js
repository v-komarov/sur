$(document).ready(function() {
    $('#user_list').hide();

    $(".tableInfo").on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='add'){
            if($('select[name=locality]').val()=='') alert('Выберите город');
            else street_Add();
        }
        else if(action=='delete'){
            if (confirm('Удалить улицу?')) street_Delete($(this).parents('.edit').attr('street_id'));
        }
        else if(action=='cancel'){
            street_Cancel();
        }
        else if(action=='save'){
            street_Update($(this).parents('.edit').attr('street_id'));
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function(){
        if($.inArray('system.client', lunchbox['permissions'])>=0){
            var street_id = $(this).attr('street_id');
            street_Cancel();
            street_Edit(street_id);
        }
    });

    $(".tableInfo").on('change', 'select', function(){
        var selected_level = $(this).attr('name');
        if(selected_level=='region'){
            ajaxSearch('locality');
        }
        else if(selected_level=='locality'){
            ajaxSearch('street');
        }
    });

    $('.tableInfo thead input[name=street_name]').bind('change keyup', function( event ){
        ajaxSearch('street');
    });

    ajaxSearch('locality');
});


function ajaxSearch(action) {
    loading('begin');
    $.ajax({ url:'/system/directory/'+action+'/ajax/search/', type:'get', dataType:'json',
        data:{
            'region_id': $('.tableInfo thead select[name=region]').val(),
            'locality_id': $('.tableInfo thead select[name=locality]').val(),
            'street_name': $('.tableInfo thead input[name=street_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            }
            else if(data['locality']){
                setLocality(data['locality']);
            }
            else if(data['street']){
                setStreet(data['street']);
            }
        }
    });
}


function street_Add() {
    loading('begin');
    $.ajax({ url:'/system/directory/street/ajax/add/', type:'get', dataType:'json',
        data:{
            'region_id': $('.tableInfo thead select[name=region]').val(),
            'locality_id': $('.tableInfo thead select[name=locality]').val(),
            'street_name': $('.tableInfo thead input[name=street_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            }
            else if(data['street']){
                setStreet(data['street']);
            }
        }
    });
}


function setLocality(data) {
    var select_locality = $('.tableInfo select[name=locality]');
    var locality_default_id = $('.tableInfo').attr('locality_default_id');
    select_locality.find('option').remove();
    select_locality.append('<option value="">Город (все)</option>');
    for(var key in data){
        if(data[key]['id']==locality_default_id){
            var selected = ' selected'
        } else {
            var selected = ''
        }
        var option = '<option value="'+data[key]['id']+'"'+selected+'>'+data[key]['name']+'</option>';
        select_locality.append(option);
    }
    ajaxSearch('street');
    loading('end');
}


function setStreet(data) {
    $('.tableInfo tbody:eq(1) tr').remove();
    count = 0;
    if(data['error']!=null){
        alert(data['error']);
    }
    for(var key in data){
        var object_item = '<tr class="row" street_id="'+data[key]['id']+'" locality_id="'+data[key]['locality_id']+'">' +
            '<td class="cell" colspan="2">'+data[key]['name']+'</td>' +
            '</tr>';
        $('.tableInfo tbody:eq(1)').append(object_item);
        count ++;
    }

    loading('end');
    $('.result_count').html('Найдено: '+count);
}


function street_Edit(street_id) {
    var tr = $('.tableInfo tbody tr[street_id='+street_id+']');
    var locality_id = tr.find('td:eq(0)').attr('locality_id');
    var street_name = tr.find('td:eq(0)').text().replace(/"/g,'&quot;');
    tr.attr('class','row edit').find('td').removeClass('cell');
    tr.attr('old_street',street_name);
    var div_delete = '';
    if($.inArray('system.client', lunchbox['permissions'])>=0) {
        div_delete = '<div class="btn_ui btn_34" action="delete" icon="delete"><div class="icon"></div></div>';
    }
    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px" class="wide" type="text" value="'+street_name+'"></td>' +
        '<td><div class="btn_ui btn_34" action="save" icon="save"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_34" action="cancel" icon="cancel"><div class="icon"></div></div>' +
            div_delete +
        '</td></tr></table>';
    tr.find('td:eq(0)').html(td_eq1);
}


function street_Update(street_id){
    var tr = $('.tableInfo tbody tr[street_id='+street_id+']');
    var locality_id = tr.attr('locality_id');
    var street_name = tr.find('td:eq(0) input').val();
    if(tr.attr('old_street')==street_name){
        street_Cancel();
    } else {
        $.ajax({ url:'/system/directory/street/ajax/save/', type:'post', dataType:'json',
            data:{
                'locality_id': locality_id,
                'street_id': street_id,
                'street_name': street_name
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_street',street_name);
                    street_Cancel();
                }
            }
        });
    }
}


function street_Delete(street_id){
    $.ajax({ url:'/system/directory/street/ajax/delete/', type:'get', dataType:'json',
        data:{
            'street_id': street_id
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                street_Cancel();
            } else {
                $('.tableInfo tbody tr[street_id='+street_id+']').remove();
            }
        }
    });
}

function street_Cancel(){
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var street_name = tr.attr('old_street');
    tr.removeAttr('old_street');
    tr.find('td:eq(0)').html(street_name).attr('class','cell');
}

