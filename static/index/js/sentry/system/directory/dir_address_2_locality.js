$(document).ready(function() {

    $('body').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            locality_Search();
        }
        else if(action=='locality_add'){
            if($('select[name=region]').val()=='') alert('Выберите регион');
            else locality_Add();
        }
        else if(action=='locality_delete'){
            if (confirm('Вы уверенны, что хотите удалить регион?')){
                locality_Delete($(this).parents('.edit').attr('locality_id'));
            }
        }
        else if(action=='locality_cancel') locality_Cancel();
        else if(action=='locality_update'){
            locality_Update($(this).parents('.edit').attr('locality_id'));
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        if($.inArray('main.client', lunchbox['permissions'])>=0){
            var locality_id = $(this).attr('locality_id');
            locality_Cancel();
            locality_Edit(locality_id);
        }
    });

    $(".tableInfo select[name=region]").on('change', function(){
        locality_Search();
    });

    $('.tableInfo input[name=locality_name]').bind('change keyup', function( event ){
        locality_Search();
    });

    locality_Search();
});


function locality_Search() {
    loading('begin');
    $.ajax({ url:'/system/directory/locality/ajax/search/', type:'get', dataType:'json',
        data:{
            'region_id': $('.tableInfo thead select[name=region]').val(),
            'locality_name': $('.tableInfo thead input[name=locality_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            } else {
                setTable(data);
            }
        }
    });
}


function locality_Edit(locality_id) {
    var tr = $('.tableInfo tbody tr[locality_id='+locality_id+']');
    var region_id = tr.find('td:eq(0)').attr('region_id');
    var region_select = $('.tableInfo thead select[name=region]').clone();
    var region_name = tr.find('td:eq(0)').text().replace(/"/g,'&quot;');
    var locality_name = tr.find('td:eq(1)').attr('class','').text().replace(/"/g,'&quot;');
    tr.attr('class','row edit');
    tr.find('td:eq(0)').html(region_select);
    tr.find('select [value='+region_id+']').attr('selected', 'selected');
    tr.attr('old_region',region_name).attr('old_locality',locality_name);
    var div_delete = '';
    if($.inArray('main.client', lunchbox['permissions'])>=0){
        div_delete = '<div class="btn_ui btn_32" action="locality_delete" icon="delete"><div class="icon"></div></div>';
    }
    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td style="width:72%"><input style="margin: 5px 0 0 5px" class="wide" type="text" value="'+locality_name+'"></td>' +
        '<td>' +
            '<div class="btn_ui btn_32" action="locality_update" icon="save"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_32" action="locality_cancel" icon="cancel"><div class="icon"></div></div>' +
            div_delete +
        '</td></tr></table>';
    tr.find('td:eq(1)').html(td_eq1);
}


function locality_Update(locality_id) {
    var tr = $('.tableInfo tbody tr[locality_id='+locality_id+']');
    var region_id = tr.find('select[name=region] :selected').val();
    var region_name = tr.find('select[name=region] :selected').text();
    var locality_name = tr.find('td:eq(1) input').val();
    if(tr.attr('old_region')==region_name && tr.attr('old_locality')==locality_name){
        locality_Cancel();
    } else {
        $.ajax({ url:'/system/directory/locality/ajax/save/', type:'post', dataType:'json',
            data:{
                'locality_id': locality_id,
                'locality_name': locality_name,
                'region_id': region_id
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.find('td:eq(0)').attr('region_id',region_id);
                    tr.attr('old_region',region_name);
                    tr.attr('old_locality',locality_name);
                    locality_Cancel();
                }
            }
        });
    }
}

function locality_Delete(locality_id) {
    $.ajax({ url:'/system/directory/locality/ajax/delete/', type:'post', dataType:'json',
        data:{ 'locality_id': locality_id },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                locality_Cancel();
            } else {
                $('.tableInfo tbody tr[locality_id='+locality_id+']').remove();
            }
        }
    });
}

function locality_Cancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var region_name = tr.attr('old_region');
    var locality_name = tr.attr('old_locality');
    tr.removeAttr('old_region'); tr.removeAttr('old_locality');
    tr.find('td:eq(0)').html(region_name);
    tr.find('td:eq(1)').html(locality_name).attr('class','cell');
}


function locality_Add() {
    loading('begin');
    $.ajax({ url:'/system/directory/locality/ajax/add/', type:'post', dataType:'json',
        data:{
            'region_id': $('.tableInfo thead select[name=region]').val(),
            'locality_name': $('.tableInfo thead input[name=locality_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            } else {
                setTable(data);
            }
        }
    });
}

function setTable(data) {
    $('.tableInfo tbody tr').remove();
    var count = 0;
    if(data['error']!=null) alert(data['error']);
    for(var key in data['locality']){
        var item = data['locality'][key];
        var object_item = '<tr class="row" locality_id="'+item['id']+'">' +
            '<td class="cell" region_id="'+item['region_id']+'">'+item['region__name']+'</td>' +
            '<td class="cell" colspan="2">'+item['name']+'</td>' +
            '</tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }
    loading('end');
    $('.result_count').html('Найдено: '+count);
}