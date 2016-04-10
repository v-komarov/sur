function eventsRefresh(action){
    var events_data = {};
    events_data['event_id'] = $('#eventsBody tr:eq(0)').attr('id');
    events_data['log_id'] = $('#eventsBody').attr('log_id');
    events_data['filter'] = event_filter;
    if(object_id>0){
        events_data['object_id'] = object_id;
    }
    events_data['alarms'] = [];
    $('#alarmsBody tr').each(function(){
        events_data['alarms'].push( $(this).attr('id') );
    });
    events_data['alarms'] = JSON.stringify( events_data['alarms'] );


    $.ajax({ url:'/monitor/operator/refresh/events/', type:'post', dataType:'json', data:events_data,
        success: function(data){
            eventsRefreshTable(data,action);
            if(data['count_objects']){
                buttonsObjectsStatus(data['count_objects']);
            }
            if(data['alarms']){
                alarmsRefreshTable(data['alarms']);
            }
            if(data['logs']){
                logsRefreshTable(data['logs']);
            }
        }
    });
}

function eventsRefreshTable(data,action) {
    if(action=='new'){
        $('#eventsHead tr:eq(1) td').removeAttr('style');
        $('#eventsBody tr').remove();
    }
    $('div.server_time').html(data['time']);
    var result = data['events'];
    for(var key in result){
        // Event rows
        var tr_event =
            '<tr class="row '+result[key]['event_group']+'" id="'+result[key]['event_id']+'">' +
                '<td class="cell" key="event_time"><div class="date">'+result[key]['event_time'].slice(0,5)+'</div>' +
                    result[key]['event_time'].slice(6,14)+'</td>' +
                '<td class="cell" key="object_num">'+result[key]['object_num']+'</td>' +
                '<td class="cell" key="object_name">'+result[key]['object_name'] +
                '<div class="address">'+result[key]['object_address']+'</div>' +
                '</td>' +
                '<td class="cell" key="description">'+result[key]['description']+'</td>' +
            '</tr>';
        var scroll_top = $('.content_scroll').scrollTop();
        $('#eventsBody').prepend(tr_event);
        if(scroll_top>0){
            var tr_height = $('#eventsBody tr:eq(0)').height();
            $('.content_scroll').scrollTop(scroll_top+tr_height+2);
        }
        // Object status
        objectSetStatus(result[key]);
    }
    $('#eventsBody').attr('log_id',data['log_id']);
    resizeTable('event');
}

function alarmsRefreshTable(data){
    for(var key in data){
        if( $('#alarmsBody tr#'+data[key]['event_id']).length==0 ){ // Отсекаем случайное дублирование
            var tr_alarm =
                '<tr class="row '+data[key]['event_group']+'" id="'+data[key]['event_id']+'">' +
                    '<td class="cell" key="event_time">'+data[key]['event_time']+'</td>' +
                    '<td class="cell" key="object_num">'+data[key]['object_num']+'</td>' +
                    '<td class="cell" key="object_name">'+data[key]['object_name']+'</td>' +
                    '<td class="cell" key="description">'+data[key]['description']+'</td>' +
                    '</tr>';
            $('#alarmsBody').prepend(tr_alarm);
        }
    }
    resizeTable('event');
    menuPosition('#alarm_menu');
}

function logsRefreshTable(data){
    for(var key in data){
        $('#eventsBody').attr('log_id',data[key]['log_id']);

        $('tr').each(function(){
            var tr_id = $(this).attr('id');
            if(tr_id == data[key]['event_id'] || tr_id == data[key]['object_id']){
                if($(this).attr('class')=='blockInfo'){
                    $(this).remove();
                } else {
                    $(this).attr('class','row '+data[key]['event_group_name']);
                    $(this).find('td[key=description]').html(data[key]['event_description']);
                }
            }
            //console.log( $(this).attr('id') );
        });

        if(data[key]['event_group_name']=='alarm_completed'){
            $('#alarmsBody tr#'+data[key]['event_id']).remove();
        }
    }
}

function eventOpenInfo(tbody_id,data){
    var clicked_tr = $('#'+tbody_id+'sBody tr#'+data['event_id']);
    var event_group_list = ['alarm', 'alarm_action', 'alarm_completed']
    if(data['contacts'].length>0){
        var contacts_string = collectContacts(data['contacts']);
    }
    if( $.inArray(data['event_group'], event_group_list)>=0 ){
        var button_cancel = '';
        var start_gbr = '';
        var arrival_gbr = '';
        var alarm_report = '';
        if(data['event_group']=='alarm'){
            button_cancel = '<div class="button" action="alarm_cancel">Отмена тревоги</div>';
            start_gbr = '<select class="gbr_select" id="gbr_started">'+gbr_select+'</select><div class="button left" action="gbr_started">Вызов</div>';
        }
        else if(data['event_name']=='gbr_started'){
            start_gbr = '<div class="field gbr">'+data['gbr_started_name']+' выехал: '+data['gbr_started_time']+'</div>';
            arrival_gbr = '<select class="gbr_select" id="gbr_arrived">'+gbr_select+'</select><div class="button left" action="gbr_arrived">Прибыл</div></div>';
        }
        else if(data['event_name']=='gbr_arrived'){
            start_gbr = '<div class="field gbr">'+data['gbr_started_name']+' выехал: '+data['gbr_started_time']+'</div>';
            arrival_gbr = '<div class="field gbr">'+data['gbr_arrived_name']+' прибыл: '+data['gbr_arrived_time']+'</div>';
            alarm_report = '<select class="gbr_select" id="alarm_report">'+alarm_report_select+'</select>' +
                '<div class="button left" action="alarm_report">Выбрать</div>';
        }
        else if(data['event_name']=='gbr_reported'){
            start_gbr = '<div class="field gbr">'+data['gbr_started_name']+' выехал: '+data['gbr_started_time']+'</div>';
            arrival_gbr = '<div class="field gbr">'+data['gbr_arrived_name']+' прибыл: '+data['gbr_arrived_time']+'</div>';
            alarm_report = '<div class="txt">Причина: '+data['alarm_report_name']+'</div>';
        }
        else if(data['event_name']=='alarm_canceled'){
            alarm_report = '<div class="txt">Причина: '+data['alarm_report_name']+'</div>';
        }

        var tr_info =
            '<tr class="blockInfo" id="'+data['event_id']+'"><td colspan="4">' +
                '<div class="field">Адрес: '+data['address']+'</div>' +
                '<div class="field">Группа: '+data['gbr_name']+'</div>' +
                    contacts_string + '<hr>' +
                '<div class="click">Отклик: '+data['response_time']+'</div>' +
                '<div class="start_gbr">'+ start_gbr +'</div>' +
                '<div class="arrival_gbr">'+ arrival_gbr +'</div>' +
                '<div class="clear"></div>' +
                '<div class="alarm_report">'+ alarm_report +'</div>' +
                '<hr>' +
                '<div class="button up" action="closeInfo"></div>' +
                    button_cancel +
                '</td></tr>';
        buttonCloseInfo(tbody_id);

        clicked_tr.after(tr_info);

        var blockInfo = $('#'+tbody_id+'sBody .blockInfo');
        blockInfo.find('.gbr_select [value='+data['gbr_id']+']').attr("selected", "selected");
    }
    else {
        var tr_info =
            '<tr class="blockInfo" id="'+data['event_id']+'"><td colspan="4">' +
                '<div class="field">Адрес: '+data['address']+'</div>'+
                '<div class="field">Группа: '+data['gbr_name']+'</div>'+
                contacts_string + '<hr>' +
                '<div class="button up" action="closeInfo"></div>'+
                '</td></tr>';
        buttonCloseInfo(tbody_id);
        clicked_tr.after(tr_info);
    }
}

function buttonsObjectsStatus(data){
    for(var key in data){
        var button = $('#buttons_objects_status div[action='+key+']');
        button.html(data[key]);
        if(data[key]<1){
            button.hide();
        } else {
            button.show();
        }
    }
}