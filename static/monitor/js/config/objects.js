$(document).ready(function() {
    object_menu = $('#object_menu');
    wires_select = $('div.hidden select.wires_select').html();
    object_status_list = ['alarm','alarm_action','alarm_completed','lock','unlock'];

    $('.tableInfo tbody').on('click','tr.row', function(){
        var tbody_id = $(this).parent().attr('id').replace('sBody','');
        var click_id = $(this).attr('id');
        var info_id = $('#'+tbody_id+'sBody .blockInfo').attr('id');
        if(info_id==click_id){
            buttonCloseInfo(tbody_id);
        } else {
            clickObject(tbody_id,click_id);
        }
    });

    $('body').on('click','.gui_close', function(){
        buttonCloseInfo();
    });

    $('body').on('click','.button', function(){
        var action = $(this).attr('action');
        //console.log('button: '+action);
        if(action=='closeInfo'){
            var tbody_id = $(this).parent().parent().parent('tbody').attr('id').replace('sBody','');
            buttonCloseInfo(tbody_id);
        }
        else if(action=='removeWire'){
            $(this).parent().parent().remove();
        }
        else if(action=='saveWire'){

        }
    });
})


function clickObject(tbody_id,click_id){
    $.ajax({ url:'/sentry/get/'+tbody_id+'/', type:'get', dataType:'json', data:{'id': click_id},
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

function objectOpenInfo(tbody_id,data){
    var clicked_tr = $('#'+tbody_id+'sBody tr#'+data['object_id']);
    object_id = data['object_id'];
    if(data['contacts'].length>0){
        var contacts_string = collectContacts(data['contacts']);
    }
    object_menu.draggable({
        handle: ".header",
        cursor: 'move',
        stack: ".pop",
        containment: $('.container')
    });
    object_menu.attr('object_id',data['object_id']);
    object_menu.find('[key=order_num]').html(data['order_num']);
    object_menu.find('[key=object_name]').html(data['object_name']);
    object_menu.find('[key=address]').html(data['address']);
    object_menu.find('[key=gbr]').html(data['gbr_name']);
    object_menu.find('[key=contacts]').html(contacts_string);

    object_menu.find('[key=wires]').html('');
    var wires = data['wires'];
    for(var key in data['wires']){
        var wire = '<tr class="wire" wire_id="'+wires[key]['id']+'"><td><select>'+wires_select+'</select></td>' +
            '<td><input type="text" value="'+wires[key]['description']+'"></td>' +
            '<td><div class="button button_03" action="removeWire">X</div></td></tr>';
        object_menu.find('[key=wires]').append(wire);
        //object_menu.find('[key=wires] [value='+wires[key]['dir_event_id']+']').attr('disabled', 'disabled');
        object_menu.find('[key=wires] [wire_id='+wires[key]['id']+'] select [value='+wires[key]['dir_event_id']+']').attr('selected', 'selected');
    }
    object_menu.show();
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


function addWire(){
    var wire = '<tr class="wire" wire_id="new">' +
        '<td><select>'+wires_select+'</select></td>' +
        '<td><input type="text" value=""></td>' +
        '<td><div class="button button_03" action="removeWire">X</div></td></tr>';
    object_menu.find('[key=wires]').append(wire);
}


function collectContacts(contacts){
    var contacts_string = '<hr><ul class="field list_01">Контакты:';
    for(var key in contacts){
        contacts_string += '<li>'+contacts[key]['full_name']+': ';
        if(contacts[key]['phone_mobile'] != ''){
            contacts_string += ' '+contacts[key]['phone_mobile'];
        }
        if(contacts[key]['phone_city'] != ''){
            contacts_string += ' '+contacts[key]['phone_city'];
        }
        if(contacts[key]['phone_other'] != ''){
            contacts_string += ' '+contacts[key]['phone_other'];
        }
        contacts_string += '</li>';
    }
    contacts_string += '</ul>';
    return contacts_string;
}

function menuPosition(menu_name){
    pop_menu = $(menu_name);
    pop_menu.draggable({
        handle: ".header",
        cursor: 'move',
        stack: ".pop",
        containment: $('.container')
    });

    // позиция Pop окна
    win_w = $(window).width();
    win_h = $(window).height();
    win_scroll = $(window).scrollTop();
    win_buttom = win_scroll + win_h;
    pop_menu_h = pop_menu.height();
    pop_menu_top = parseInt(pop_menu.css('top'));
    //console.log(pop_menu_h+', '+pop_menu.css('top'));

    if( pop_menu.css('top')=='0px' && pop_menu.css('left')=='0px' ){
        pop_menu.css('top', (win_scroll+win_h/2-pop_menu_h/2)+'px');
        pop_menu.css('left', (win_w/2-pop_menu.width()/2)+'px');

    } else if( pop_menu_top < $(window).scrollTop() ){
        pop_menu.css('top', $(window).scrollTop()+'px');
    } else if( (pop_menu_top+pop_menu_h) > (win_scroll+win_h) ){
        pop_menu.css('top', win_buttom-pop_menu_h+'px');
    }
    pop_menu.show();
}

function buttonCloseInfo(){
    object_menu.hide();
}