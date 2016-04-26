$(document).ready(function() {

    $('body').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            $('#region_list thead input').val('');
            region_Search();
        }
        else if(action=='region_add'){
            if($('select[name=region]').val()=='') alert('Выберите регион');
            else region_Create();
        }
        else if(action=='region_delete'){
            if (confirm('Вы уверенны, что хотите удалить регион?')){
                region_Delete($(this).parents('.edit').attr('region_id'));
            }
        }
        else if(action=='region_cancel'){
            region_Cancel();
        }
        else if(action=='region_update'){
            region_Update($(this).parents('.edit').attr('region_id'));
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        if($.inArray('main.client', lunchbox['permissions'])>=0){
            var region_id = $(this).attr('region_id');
            region_Edit(region_id);
        }
        else {
            console.log('no permissions');
        }
    });

    $(".tableInfo select[name=region]").on('change', function(){
        region_Search();
    });

    $('.tableInfo input[name=region_name]').bind('change keyup', function( event ){
        region_Search();
    });

    region_Search();
});


function region_Search() {
    loading('begin');
    $.ajax({ url:'/system/directory/region/ajax/search/', type:'get', dataType:'json',
        data:{
            'region_name': $('.tableInfo thead input[name=region_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            } else {
                region_Draw(data);
                loading('end');
            }
        }
    });
}


function region_Edit(region_id) {
    region_Cancel();
    var tr = $('.tableInfo tbody tr[region_id='+region_id+']');
    var region_name = tr.find('td:eq(0)').text().replace(/"/g,'&quot;');
    tr.attr('class','row edit').find('td').removeClass('cell');
    tr.attr('region_old',region_name);
    var div_delete = '';
    if($.inArray('main.client', lunchbox['permissions'])>=0) {
        div_delete = '<div class="btn_ui btn_34" action="region_delete" icon="delete"><div class="icon"></div></div>';
    }
    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px" type="text" value="'+region_name+'"></td>' +
        '<td><div class="btn_ui btn_34" action="region_update" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="region_cancel" icon="cancel"><div class="icon"></div></div>' +
        div_delete + '</td></tr></table>';
    tr.find('td:eq(0)').html(td_eq1);
}

function region_Update(region_id) {
    var tr = $('.tableInfo tbody tr[region_id='+region_id+']');
    var region_name = tr.find('td:eq(0) input').val();
    if(tr.attr('region_old')==region_name) region_Cancel();
    else {
        $.ajax({ url:'/system/directory/region/ajax/update/', type:'post', dataType:'json',
            data:{
                'region_id': region_id,
                'region_name': region_name
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    region_Search()
                }
            }
        });
    }
}

function region_Delete(region_id) {
    $.ajax({ url:'/system/directory/region/ajax/delete/', type:'post', dataType:'json', data:{'region_id':region_id},
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                region_Cancel();
            } else {
                region_Search();
            }
        }
    });
}

function region_Cancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var region_name = tr.attr('region_old');
    tr.removeAttr('region_old');
    tr.find('td:eq(0)').html(region_name).attr('class','cell');
}

function region_Create() {
    loading('begin');
    var region_name = $('.tableInfo thead input[name=region_name]').val();
    $.ajax({ url:'/system/directory/region/ajax/create/?region_name='+region_name, type:'post', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            } else {
                region_Search();
            }
        }
    });
}

function region_Draw(data) {
    $('.tableInfo tbody tr').remove();
    var count = 0;
    if(data['error']!=null) alert(data['error']);
    for(var region_key in data['region_list']){
        var region = data['region_list'][region_key];
        var object_item = '<tr class="row" region_id="'+region['id']+'">' +
            '<td class="cell" colspan="2">'+region['name']+'</td>' +
            '</tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }
    loading('end');
    $('.result_count').html('Найдено: '+count);
}