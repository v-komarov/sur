$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            holdingAjax('create');
        } else if(action=='delete'){
            if (confirm('Уверенны, что хотите удалить холдинг?')){
                var holding_id = $(this).parents('.edit').attr('holding_id');
                holdingDelete(holding_id);
            }
        } else if(action=='cancel'){
            holdingCancel();
        } else if(action=='save'){
            var holding_id = $(this).parents('.edit').attr('holding_id');
            holdingUpdate(holding_id);
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        if(8>0) {
            var holding_id = $(this).attr('holding_id');
            holdingCancel();
            holding_Edit(holding_id);
        }
    });

    $('.tableInfo input[name=holding_name]').bind('change keyup', function( event ){
        holdingAjax('search');
    });

    holdingAjax('search');
});


function holdingAjax(action) {
    loading('begin');
    $.ajax({ url:'/system/directory/holding/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'holding_id': $('.tableInfo thead select[name=region]').val(),
            'holding_name': $('.tableInfo thead input[name=holding_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            }
            else if(data['holding']!=null){
                holding_Draw(data['holding']);
            }
        }
    });
}


function holding_Draw(data) {
    $('.tableInfo tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" holding_id="'+data[key]['id']+'" >' +
            '<td class="cell" colspan="2">'+data[key]['name']+'</td></tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }
    loading('end');
    $('.result_count').html('Найдено: '+count);
}


function holding_Edit(holding_id) {
    var tr = $('.tableInfo tbody tr[holding_id='+holding_id+']');
    var locality_id = tr.find('td:eq(0)').attr('locality_id');
    var holding_name = tr.find('td:eq(0)').text().replace(/"/g,'&quot;');
    tr.attr('class','row edit').find('td').removeClass('cell');
    tr.attr('old_holding',holding_name);
    var div_delete = '';
    if(8>0) {
        div_delete = '<div class="btn_ui btn_34" action="delete" icon="delete"><div class="icon"></div></div>';
    }
    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px" type="text" value="'+holding_name+'"></td>' +
        '<td><div class="btn_ui btn_34" action="save" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="cancel" icon="cancel"><div class="icon"></div></div>' +
        div_delete +
        '</td></tr></table>';
    tr.find('td:eq(0)').html(td_eq1);
}


function holdingUpdate(holding_id) {
    var tr = $('.tableInfo tbody tr[holding_id='+holding_id+']');
    var holding_name = tr.find('td:eq(0) input').val();
    if(tr.attr('old_holding')==holding_name){
        holdingCancel();
    } else {
        $.ajax({ url:'/system/directory/holding/ajax/update/', type:'get', dataType:'json',
            data:{
                'holding_id': holding_id,
                'holding_name': holding_name
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_holding',holding_name);
                    holdingCancel();
                }
            }
        });
    }
}

function holdingDelete(holding_id) {
    $.ajax({ url:'/system/directory/holding/ajax/delete/?holding_id='+holding_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                holdingCancel();
            } else {
                $('.tableInfo tbody tr[holding_id='+holding_id+']').remove();
            }
        }
    });
}

function holdingCancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var holding_name = tr.attr('old_holding');
    tr.removeAttr('old_holding');
    tr.find('td:eq(0)').html(holding_name).attr('class','cell');
}
