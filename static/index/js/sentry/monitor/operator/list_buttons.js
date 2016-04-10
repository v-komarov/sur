function button_gbr_started(tbody_id,event_id){
    var gbr_started_id = $('#'+tbody_id+'sBody tr#'+event_id+' #gbr_started :selected').val();
    $.ajax({ url:'/monitor/operator/alarm/', type:'get', dataType:'json',
        data: {
            'action': 'gbr_started',
            'event_id': event_id,
            'gbr_started_id': gbr_started_id
        },
        success: function(data){
            $('tr.alarm').each(function(){
                var tr_id = $(this).attr('id');
                if(tr_id==event_id){
                    $(this).attr('class','row alarm_action');
                    $(this).find('[key=description]').text(data['description']);
                }
            });
            $('tr.blockInfo').each(function(){
                var tr_id = $(this).attr('id');
                if(tr_id==event_id){
                    var start_gbr = '<div class="field gbr">'+data['gbr_started_name']+' выехал: '+data['gbr_started_time']+'</div>';
                    $(this).find('div.start_gbr').html(start_gbr);

                    var arriaval_gbr = '<select class="gbr_select left" id="gbr_arrived">'+gbr_select+'</select><div class="button left" action="gbr_arrived">Прибыл</div></div>';
                    $(this).find('div.arrival_gbr').html(arriaval_gbr);
                    $(this).find('select#gbr_arrived [value='+gbr_started_id+']').attr("selected", "selected");
                    $(this).find('div[action=alarm_cancel]').remove();
                }
            });
            $('#objectsBody tr#'+data['object_id']+':not(.blockInfo)').attr('class','row alarm_action');
        }
    });
}

function button_gbr_arrived(tbody_id,event_id){
    var gbr_arrived_id = $('#'+tbody_id+'sBody tr#'+event_id+' #gbr_arrived :selected').val();
    $.ajax({ url:'/monitor/operator/alarm/', type:'get', dataType:'json',
        data: {
            'action': 'gbr_arrived',
            'event_id': event_id,
            'gbr_arrived_id': gbr_arrived_id
        },
        success: function(data){
            $('tr.blockInfo').each(function(){
                var tr_id = $(this).attr('id');
                if(tr_id==event_id){
                    var arrival_gbr = '<div class="field gbr">'+data['gbr_arrived_name']+' прибыл: '+data['gbr_arrived_time']+'</div>';
                    var alarm_report = '<select class="gbr_select" id="alarm_report">'+alarm_report_select+'</select>' +
                        '<div class="button left" action="alarm_report">Выбрать</div>';
                    $(this).find('div.arrival_gbr').html(arrival_gbr);
                    $(this).find('div.alarm_report').html(alarm_report);
                }
            });
            $('tr.alarm_action').each(function(){
                var tr_id = $(this).attr('id');
                if(tr_id==event_id){
                    $(this).attr('class','row alarm_action');
                    $(this).find('[key=description]').text(data['description']);
                }
            });
            // Objects body
            $('#objectsBody tr#'+data['object_id']+':not(.blockInfo)').attr('class','row alarm_action');
        }
    });
}

function button_alarm_report(tbody_id,event_id){
    var alarm_report_id = $('#'+tbody_id+'sBody tr#'+event_id+' #alarm_report :selected').val();
    $.ajax({ url:'/monitor/operator/alarm/', type:'get', dataType:'json',
        data: {
            'action': 'alarm_report',
            'event_id': event_id,
            'alarm_report_id': alarm_report_id
        },
        success: function(data){
            $('tr.blockInfo').each(function(){
                var tr_id = $(this).attr('id');
                if(tr_id==event_id){
                    var this_tbody_id = $(this).parent().attr('id').replace('sBody','');
                    var alarm_report = '<div class="txt">Причина: '+data['alarm_report_name']+'</div>';
                    if(this_tbody_id=='alarm'){
                        $(this).remove();
                    } else {
                        $(this).find('div.alarm_report').html(alarm_report);
                    }
                }
            });
            $('tr.alarm_action').each(function(){
                var tr_id = $(this).attr('id');
                if(tr_id==event_id){
                    var this_tbody_id = $(this).parent().attr('id').replace('sBody','');
                    if(this_tbody_id=='alarm'){
                        $(this).remove();
                    } else {
                        $(this).attr('class','row alarm_completed');
                        $(this).find('[key=description]').text(data['description']);
                    }
                }
            });
            // Objects body
            $('#objectsBody tr#'+data['object_id']+':not(.blockInfo)').attr('class','row alarm_completed');
        }
    });
}

function button_alarm_cancel(tbody_id,event_id){
    $.ajax({ url:'/monitor/operator/alarm/', type:'get', dataType:'json',
        data: {
            'action': 'alarm_cancel',
            'event_id': event_id
        },
        success: function(data){
            $('tr.blockInfo').each(function(){
                var tr_id = $(this).attr('id');
                if(tr_id==event_id){
                    var this_tbody_id = $(this).parent().attr('id').replace('sBody','');
                    var alarm_report = '<div class="txt">Отменено оператором</div>';
                    if(this_tbody_id=='alarm'){
                        $(this).remove();
                    } else {
                        $(this).find('div.start_gbr').html('');
                        $(this).find('div.alarm_report').html(alarm_report);
                    }
                }
            });
            $('tr.alarm').each(function(){
                var tr_id = $(this).attr('id');
                if(tr_id==event_id){
                    var this_tbody_id = $(this).parent().attr('id').replace('sBody','');
                    if(this_tbody_id=='alarm'){
                        $(this).remove();
                    } else {
                        $(this).attr('class','row alarm_completed');
                        $(this).find('[key=description]').text(data['description']);
                    }
                }
            });
            // Objects body
            $('#objectsBody tr#'+data['object_id']+':not(.blockInfo)').attr('class','row alarm_completed');
        }
    });
}

function buttonCloseInfo(tbody_id) {
    //console.log('close: '+tbody_id);
    $('#'+tbody_id+'sBody tr.blockInfo').remove();
    $('#'+tbody_id+'sHead tr:eq(1) td').removeAttr('style');
    $('#'+tbody_id+'sBody tr:eq(0) td').removeAttr('style');
    resizeTable(tbody_id);
}
