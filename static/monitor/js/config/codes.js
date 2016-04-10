$(document).ready(function() {
    object_menu = $('#object_menu');
    wires_select = $('div.hidden .wires_select').html();
    object_status_list = ['alarm','alarm_action','alarm_completed','lock','unlock'];

    $('.tableInfo tbody').on('click','tr.row', function(){
    });

    $('body').on('click','.ui_button', function(){
        var action = $(this).attr('action');
        var tbody_id = $(this).parent().parent().attr('id').replace('sBody','');
        var code_id = $(this).parent().attr('code_id');
        if(action=='codeEdit'){
            codeEdit(tbody_id,code_id);
        }
        else if(action=='codeSave'){
            codeSave(tbody_id,code_id);
        }
    });

    $('body').on('click','.button', function(){
        var action = $(this).attr('action');
        var tbody_id = $(this).parent().parent().parent().attr('id').replace('sBody','');
        if(action=='codeAdd'){
            codeAdd(tbody_id);
            //console.log(tbody_id+', '+action);
        }
    });

})

function codeAdd(tbody_id){
    if( $('#'+tbody_id+'sBody tr').is("[code_id=new]") ){
        console.log('code_new');
        codeSave(tbody_id,'new');
    } else {
        var code_tr = '<tr class="row" code_id="new" action="edit">' +
            '<td class="cell_slim code"><input value=""></td>'+
            '<td class="cell_slim dir_event">'+wires_select+'</td>' +
            '<td class="ui_button gui_save" action="codeSave"></td></tr>';
        var code_tr = $('#'+tbody_id+'sBody tr:last').before(code_tr);
    }

/*
    var code = code_tr.find('td.code .txt').html();
    var dir_event_id = code_tr.attr('dir_event_id');
    code_tr.find('td.code').html('<input value="'+code+'"/>');
    code_tr.find('td.dir_event').html(wires_select);
    code_tr.find('select option[value='+dir_event_id+']').attr('selected', 'selected');
    //code_tr.find('td.dir_event').append('<div class="ui_button gui_close">');
    code_tr.find('td.ui_button').attr('class','ui_button gui_save').attr('action','codeSave');
    code_tr.attr('action','edit');
*/
}

function codeEdit(tbody_id,code_id){
    var code_tr = $('#'+tbody_id+'sBody tr[code_id='+code_id+']');
    var code = code_tr.find('td.code .txt').html();
    var dir_event_id = code_tr.attr('dir_event_id');
    code_tr.find('td.code').html('<input value="'+code+'"/>');
    code_tr.find('td.dir_event').html(wires_select);
    code_tr.find('select option[value='+dir_event_id+']').attr('selected', 'selected');
    //code_tr.find('td.dir_event').append('<div class="ui_button gui_close">');
    code_tr.find('td.ui_button').attr('class','ui_button gui_save').attr('action','codeSave');
    code_tr.attr('action','edit');
}

function codeSave(tbody_id,code_id){
    var code_tr = $('#'+tbody_id+'sBody tr[code_id='+code_id+']');
    var code = code_tr.find('td.code input').val();
    var dir_event_id = code_tr.find('select').val();
    var dir_event_name = code_tr.find('select :selected').html();
    console.log(dir_event_name);
    code_tr.attr('dir_event_id',dir_event_id);
    code_tr.find('td.code').html('<div class="txt">'+code+'</div>');
    code_tr.find('td.dir_event').html('<div class="txt">'+dir_event_name+'</div>');
    code_tr.find('td.ui_button').attr('class','ui_button gui_edit').attr('action','codeEdit');
    $.ajax({ url:'/sentry/codes/save/', type:'post', dataType:'json', data:{
        'code': code, 'code_id': code_id,
        'dir_event_id': dir_event_id
    },
        success: function(data){
            if(data['code_id']=='deleted'){
                code_tr.remove();
            } else {
                code_tr.attr('code_id',data['code_id']);
            }
        }
    });
}

function saveWire(){
    var wires = [];
    object_menu.find('tr.wire').each(function(){
        var wire = {};
        wire['wire_id'] = $(this).attr('wire_id');
        wire['dir_event_id'] = $(this).find('select option:selected').val();
        wire['description'] = $(this).find('input').val();
        wires.push( wire );
    });
    console.log(wires);
    wires = JSON.stringify(wires)

    $.ajax({ url:'/sentry/objects/save_wires/', type:'post', dataType:'json', data:{
            'object_id': object_menu.attr('object_id'),
            'wires': wires
        },
        success: function(data){
            if(data['error']){
                alert('System error');
            }
            if(tbody_id=='object'){
                objectOpenInfo(tbody_id,data);
            }
        }
    });
}


