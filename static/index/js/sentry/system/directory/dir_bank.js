$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            bank_Edit('add');
        } else if(action=='delete'){
            if(confirm('Вы уверенны, что хотите удалить банк?')) {
                var bank_id = $('#bank_list .hover').attr('bank_id');
                bank_Delete(bank_id);
            }
        } else if(action=='save'){
            var bank_id = $('#bank_list .hover').attr('bank_id');
            bank_Update(bank_id);
        }
    });

    $('#pop_bank .header').on('click', '.close', function(){
        bankCancel();
    });

    $('#bank_list').on('click', '.row:not(.edit)', function(){
        if($.inArray('system.client', lunchbox['permissions'])>=0){
            bank_Edit($(this).attr('bank_id'));
        }
    });

    $('.tableInfo thead input, .tableInfo select').bind('change keyup', function( event ) {
        bank_Search();
    });

    bank_Search();
});


function bank_Edit(bank_id) {
    bankCancel();
    if(bank_id=='add'){
        $('#pop_bank input').val('');
    }
    else {
        loading('begin');
        var tr = $('.tableInfo tbody tr[bank_id='+bank_id+']');
        $.ajax({ url:'/system/directory/bank/ajax/search/?id='+bank_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']!=null) alert(data['error']);
                else {
                    $('#pop_bank [name=bik]').val(data['bank_list'][0]['bik']);
                    $('#pop_bank [name=name]').val(data['bank_list'][0]['name']);
                    $('#pop_bank [name=correspondent_account]').val(data['bank_list'][0]['correspondent_account']);
                    $('#pop_bank [name=locality]').val(data['bank_list'][0]['locality']);
                    if($.inArray('system.client', lunchbox['permissions'])>=0) {
                        $('#pop_bank div.ui_remove').show();
                    } else {
                        $('#pop_bank div.ui_remove').hide();
                    }
                    tr.attr('class','row hover');
                }
            },
            complete: function() {
                loading('end');
            }
        });
    }
    popMenuPosition('#pop_bank','single');
}


function bank_Update(bank_id) {
    loading('begin');
    var tr = $('#bank_list tr[bank_id='+bank_id+']');
    var bank_array = get_each_value('#pop_bank');
    bank_array['bank_id'] = bank_id;
    $.ajax({ url:'/system/directory/bank/ajax/update/', type:'post', dataType:'json', data:bank_array,
        success: function(data) {
            if(data['error']!=null) {
                alert(data['error']);
            } else {
                popMessage('Сохранено','green');
            }
        },
        complete: function() {
            bankCancel();
            bank_Search();
            loading('end');
        }
    });
}

function bank_Delete(bank_id) {
    $.ajax({ url:'/system/directory/bank/ajax/delete/?id='+bank_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('#bank_list tr[bank_id='+bank_id+']').remove();
                bankCancel();
            }
        }
    });
}

function bankCancel() {
    var tr = $('.tableInfo tbody tr.hover').attr('class','row');
    $('#pop_bank').hide();
}


function bank_Search() {
    loading('begin');
    $('.pop').hide();
    var bank_ajax = get_each_value('#search_values');
    $.ajax({ url:'/system/directory/bank/ajax/search/', type:'get', dataType:'json', data:bank_ajax,
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else {
                bank_Draw(data);
            }
        },
        complete: function(){
            loading('end');
        }
    });
}


function bank_Draw(data) {
    $('#bank_list tr').remove();
    var count = 0;
    if(data['error']!=null) alert(data['error']);
    for(var key in data['bank_list']){
        var bank = data['bank_list'][key];
        var object_item = '<tr class="row" bank_id="'+bank['id']+'">' +
            '<td class="cell">'+bank['bik']+'</td>' +
            '<td class="cell">'+bank['name']+'</td>' +
            '<td class="cell" colspan="2">'+bank['locality']+'</td>' +
            '</tr>';
        $('#bank_list').append(object_item);
        count ++;
    }
    $('.result_count').html('Найдено: '+count);
}

