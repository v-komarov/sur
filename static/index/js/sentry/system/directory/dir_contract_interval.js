$(document).ready(function() {
    $(".tableInfo").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            contract_intervalEdit('add');
        } else if(action=='delete'){
            if (confirm('Уверенны, что хотите удалить?')){
                var interval_id = $(this).parents('.edit').attr('interval_id');
                contract_intervalDelete(interval_id);
            }
        } else if(action=='cancel'){
            contract_intervalCancel();
        } else if(action=='save'){
            contract_intervalSave();
        }
    });

    $('#pop_interval .header').on('click', '.close', function() {
        contract_intervalCancel(); });

    $('#interval_list tbody').on('click', '.row:not(.edit)', function() {
        //if(8>0) {
            var interval_id = $(this).attr('interval_id');
            contract_intervalCancel();
            contract_intervalEdit(interval_id);
        //}
    });

    $("#interval_list thead").on('change', 'select', function(){
        contract_intervalAjax('search'); });

    contract_intervalAjax('search');
});


function contract_intervalAjax(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/contract_interval/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'company_id': $('.tableInfo thead select[name=company]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['interval']!=null){
                setTable(data['interval']);
            }
        }
    });
}


function setTable(data) {
    $('#interval_list tbody tr').remove();
    count = 0;
    for(var key in data){
        if(data[key]['prefix']!=null){
            var prefix = '<b>'+data[key]['prefix']+'</b>'; }
        else { var prefix = ''; }

        var object_item = '<tr class="row" interval_id="'+data[key]['id']+'" >' +
            '<td class="cell">'+data[key]['service_organization__name']+'</td>' +
            '<td class="cell nowrap" colspan="2">['+data[key]['begin']+'-'+data[key]['end']+']'+prefix+'</td></tr>';
        $('#interval_list tbody').append(object_item);
        count ++;
    }

    $('.loading').hide();
    $('.result_count').html('Найдено: '+count);
}


function contract_intervalEdit(interval_id) {
    if(interval_id=='add'){
        contract_intervalCancel();
        var head = $('#interval_list thead');
        $('#pop_interval [name=begin]').val( head.find('[name=series]').val() );
        $('#pop_interval [name=end]').val( head.find('[name=number]').val() );
        $('#pop_interval [name=prefix]').val( head.find('[name=comment]').val() );
        $('#pop_interval select[name=company] option[value='+ head.find('[name=company]:selected').val() +']').attr("selected", "selected");
        $('#pop_interval div.ui_remove').hide();
    } else {
        var tr = $('#interval_list tbody tr[interval_id='+interval_id+']');
        tr.attr('class','row hover');
        $.ajax({ url:'/system/directory/contract_interval/ajax/get/?interval_id='+interval_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                    $('.loading').hide();
                } else {
                    data = data['interval'];
                    for(var key in data){
                        $('#pop_interval [name=begin]').val(data[key]['begin']);
                        $('#pop_interval [name=end]').val(data[key]['end']);
                        $('#pop_interval [name=prefix]').val(data[key]['prefix']);
                        $('#pop_interval select[name=company] option[value='+data[key]['service_organization_id']+']').attr("selected", "selected");
                        //if(8>0) {
                            $('#pop_interval div.ui_remove').show();
                        //} else {
                            //$('#pop_interval div.ui_remove').hide();
                        //}
                    }
                }
            }
        });
    }
    popMenuPosition('#pop_interval','single');
}

function contract_intervalSave() {
    if($('#interval_list tbody tr.row').is(".hover")){
        var action = 'update';
        var tr = $('#interval_list .hover');
        var interval_id = tr.attr('interval_id');
    } else {
        var action = 'create';
        $('#interval_list tbody').append('<tr class="row" interval_id="new">' +
            '<td class="cell"></td><td class="cell nowrap" colspan="2"></td></tr>');
        var tr = $('#interval_list [interval_id=new]');
    }
    $.ajax({ url:'/system/directory/contract_interval/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'interval_id': interval_id,
            'begin': $('#pop_interval [name=begin]').val(),
            'end': $('#pop_interval [name=end]').val(),
            'prefix': $('#pop_interval [name=prefix]').val(),
            'company_id': $('#pop_interval select[name=company]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('#interval_list tbody [interval_id=new]').remove();
            } else {
                var interval = '['+$('#pop_interval [name=begin]').val() +
                    '-'+$('#pop_interval [name=end]').val() +
                    ']<b>'+$('#pop_interval [name=prefix]').val()+'</b>';
                tr.attr('interval_id',data['interval'][0]['id']);
                tr.find('td:eq(0)').html($('#pop_interval [name=company] :selected').text());
                tr.find('td:eq(1)').html(interval);
                contract_intervalCancel();
            }
        }
    });
}

function contract_intervalDelete(interval_id) {
    var interval_id = $('#interval_list .hover').attr('interval_id');
    $.ajax({ url:'/system/directory/contract_interval/ajax/delete/?interval_id='+interval_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('#interval_list tbody tr[interval_id='+interval_id+']').remove();
                contract_intervalCancel();
            }
        }
    });
}

function contract_intervalCancel() {
    var tr = $('#interval_list tbody tr.hover').attr('class','row');
    $('#pop_interval').hide();
}
