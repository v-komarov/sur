$(document).ready(function() {
    var eventsRefreshInterval = 5000;
    event_filter = 'all';
    object_filter = 'all';
    object_id = 0;
    gbr_select = $('div.hidden select.gbr_select').html();
    alarm_report_select = $('div.hidden select.alarm_report').html();
    object_status_list = ['alarm','alarm_action','alarm_completed','lock','unlock'];

    $('select.event_filter').change(function() {
        event_filter = $(this).val();
        eventsRefresh('new');
    });

    $('.tableInfo tbody').on('click','tr.row', function(){
        var tbody_id = $(this).parent().attr('id').replace('sBody','');
        var click_id = $(this).attr('id');
        var info_id = $('#'+tbody_id+'sBody .blockInfo').attr('id');
        if(info_id==click_id){
            buttonCloseInfo(tbody_id);
        } else {
            clickRow(tbody_id,click_id);
        }
    });

    $('body').on('click','.button', function(){
        var action = $(this).attr('action');
        //console.log('button: '+action);
        if(action=='closeInfo'){
            var tbody_id = $(this).parent().parent().parent('tbody').attr('id').replace('sBody','');
            buttonCloseInfo(tbody_id);
        }
        else if(action=='gbr_started'){
            var tbody_id = $(this).parent().parent().parent().parent('tbody').attr('id').replace('sBody','');
            var event_id = $(this).parent().parent().parent().attr('id');
            button_gbr_started(tbody_id,event_id);
        }
        else if(action=='gbr_arrived'){
            var tbody_id = $(this).parent().parent().parent().parent('tbody').attr('id').replace('sBody','');
            var event_id = $(this).parent().parent().parent().attr('id');
            button_gbr_arrived(tbody_id,event_id);
        }
        else if(action=='alarm_report'){
            var tbody_id = $(this).parent().parent().parent().parent('tbody').attr('id').replace('sBody','');
            var event_id = $(this).parent().parent().parent().attr('id');
            console.log(tbody_id+', '+event_id)
            button_alarm_report(tbody_id,event_id);
        }
        else if(action=='alarm_cancel'){
            var tbody_id = $(this).parent().parent().parent('tbody').attr('id').replace('sBody','');
            var event_id = $(this).parent().parent().attr('id');
            button_alarm_cancel(tbody_id,event_id);
        }
    });

    $('body #buttons_objects_status').on('click','.button2', function(){
        var action = $(this).attr('action');
        console.log('button2: '+action);
        object_filter = action;
        objectsRefresh('new');
    });

    $('#autocomplete_object').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/monitor/get/search_object/', dataType: "json",
                data: {
                    type: 'object', search: request.term
                },
                success: function(data) {
                    response($.map(data, function(item) {
                        return {
                            id: item.id, value: item.name
                        }
                    }));
                }
            });
        },
        select: function(event, ui) { //alert(ui.item.id+': '+ui.item.value);
            objectOpenSearch(ui.item.id);
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        width: 200, // Ширина списка
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

    eventsRefresh();
    objectsRefresh('new');
    setInterval(function() {
        eventsRefresh();
    }, eventsRefreshInterval);
})

function clickRow(tbody_id,click_id){
    $.ajax({ url:'/monitor/get/'+tbody_id+'/', type:'get', dataType:'json', data:{'id': click_id},
        success: function(data){
            if(data['error']){
                alert('System error');
            }
            else if(tbody_id=='event' || tbody_id=='alarm'){
                eventOpenInfo(tbody_id,data);
            }
            else if(tbody_id=='object'){
                objectOpenInfo(tbody_id,data);
            }
            resizeTable(tbody_id);
        }
    });
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

function resizeTable(tbody_id){
    //console.log('resizeTable: '+tbody_id);
    var thead = $('#'+tbody_id+'sHead tr:eq(1)').width();
    var tbody = $('#'+tbody_id+'sBody tr:eq(0)').width();
    if( thead < tbody ){
        console.log('thead < tbody : '+thead+' < '+tbody);
        $('#'+tbody_id+'sHead tr:eq(1) td').width(function(i,val){
            var td = $('#'+tbody_id+'sBody tr:eq(0) td:eq('+i+')');
            var td_with = td.width()-1;
            return td_with;
        });
    }
    else if( thead > tbody ){
        console.log('thead tr > tbody tr : '+thead+' > '+tbody);
        $('#'+tbody_id+'sBody tr:eq(0) td').width(function(i,val){
            var td_with = $('#'+tbody_id+'sHead tr:eq(1) td:eq('+i+')').width();
            return td_with;
        });
    }

    $('.content_events .content_scroll').width(
        $('#eventsHead').width()+20
    );
    $('.content_objects .content_scroll').width(
        $('#objectsHead').width()+20
    );
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