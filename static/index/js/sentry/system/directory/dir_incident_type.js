$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            incident_typeAjax('create');
        } else if(action=='delete'){
            if (confirm('Уверенны, что хотите удалить?')){
                var incident_type_id = $(this).parents('.edit').attr('incident_type_id');
                incident_typeRemove(incident_type_id);
            }
        } else if(action=='cancel'){
            incident_typeCancel();
        } else if(action=='save'){
            var incident_type_id = $(this).parents('.edit').attr('incident_type_id');
            incident_typeSave(incident_type_id);
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        if($.inArray('system.client', lunchbox['permissions'])>=0) {
            var incident_type_id = $(this).attr('incident_type_id');
            incident_typeCancel();
            incident_typeEdit(incident_type_id);
        }
    });


    $('.tableInfo input[name=incident_type_name]').bind('change keyup', function( incident_type ){
        incident_typeAjax('search');
    });

    incident_typeAjax('search');
});

function incident_typeAjax(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/incident_type/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'incident_type_name': $('.tableInfo thead input[name=incident_type_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['incident_type']!=null){
                setTable(data['incident_type']);
            }
        }
    });
}


function setTable(data) {
    $('.tableInfo tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" incident_type_id="'+data[key]['id']+'" >' +
            '<td class="cell" colspan="2">'+data[key]['name']+'</td></tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }

    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function incident_typeEdit(incident_type_id) {
    var tr = $('.tableInfo tbody tr[incident_type_id='+incident_type_id+']');
    var incident_type_name = tr.find('td:eq(0)').text();
    tr.attr('class','row edit').find('td').removeClass('cell');
    tr.attr('old_incident_type',incident_type_name);
    var div_delete = '';
    if($.inArray('system.client', lunchbox['permissions'])>=0) {
        div_delete = '<div class="btn_ui btn_34" action="delete" icon="delete"><div class="icon"></div></div>';
    }
    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px" type="text" value="'+incident_type_name+'"></td>' +
        '<td><div class="btn_ui btn_34" action="save" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="cancel" icon="cancel"><div class="icon"></div></div>' +
        div_delete +
        '</td></tr></table>';
    tr.find('td:eq(0)').html(td_eq1);
}

function incident_typeSave(incident_type_id) {
    var tr = $('.tableInfo tbody tr[incident_type_id='+incident_type_id+']');
    var incident_type_name = tr.find('td:eq(0) input').val();
    if(tr.attr('old_incident_type')==incident_type_name){
        incident_typeCancel();
    } else {
        $.ajax({ url:'/system/directory/incident_type/ajax/update/', type:'get', dataType:'json',
            data:{
                'incident_type_id': incident_type_id,
                'incident_type_name': incident_type_name
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_incident_type',incident_type_name);
                    incident_typeCancel();
                }
            }
        });
    }
}

function incident_typeRemove(incident_type_id) {
    $.ajax({ url:'/system/directory/incident_type/ajax/delete/', type:'get', dataType:'json',
        data:{
            'incident_type_id': incident_type_id
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                incident_typeCancel();
            } else {
                $('.tableInfo tbody tr[incident_type_id='+incident_type_id+']').remove();
            }
        }
    });
}

function incident_typeCancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var incident_type_name = tr.attr('old_incident_type');
    tr.removeAttr('old_incident_type');
    tr.find('td:eq(0)').html(incident_type_name).attr('class','cell');
}

