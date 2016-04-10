$(document).ready(function() {
    client_id = $('div.middleBlock').attr('client_id');
    object_id = $('div.middleBlock').attr('object_id');
    shifts_valid = true;

    $('div.middleBlock').on('change', 'select.selectObject', function(){
        var level = $(this).find(':selected').attr('level');
        var selected_id = $(this).val();
        if(level=='service'){
            timetableGet(selected_id);
        }
    });

    $('.middleBlock .buttons').on('click', '.btn_txt', function() {
        var action = $(this).attr('action');
        clickTopButton(action);
    });
    $('.middleBlock .ui').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        clickBottomButton(action);
    });
    $(document).on('click', '.checkbox_left', function() {
        var disabled = $(this).parent('td').attr('disabled');
        var shift = $(this).parent('td').attr('shift');
        var weekday = $(this).parents('tr.row').find('.weekday').text();
        clickCheckbox(disabled,weekday,shift);
    });
    $(document).on('change', '#time_table select.timelist', function() {
        $(this).parent('td').removeAttr('hours');
        var disabled = $(this).parent('td').attr('disabled');
        var shift = $(this).parent('td').attr('shift');
        var weekday = $(this).parents('tr.row').find('.weekday').text();
        var name = $(this).attr('name');
        var time = $(this).val();
        changeTime(disabled,weekday,shift,name,time);
    });

    newTimeTable();
    checkShifts();
});

function clickTopButton(action) {
    var shifts = [];
    $("#time_table tbody tr:eq(0) td.day").each(function() {
        if( $(this).attr('disabled')==undefined ){
            shifts.push($(this).attr('shift'));
        }
    });
    var weekdays = [];
    if(action=='workday') {
        weekdays = [0,1,2,3,4];
    } else if(action=='weekend') {
        weekdays = [5,6,7];
    } else if(action=='everyday') {
        weekdays = [0,1,2,3,4,5,6,7];
    } else if(action=='clear') {
        weekdays = [];
    }

    if (weekdays.length == 0) {
        $("#time_table tbody tr.row:not(:eq(0)) td.day").attr('disabled','disabled').removeAttr('hours');
    } else {
        $("#time_table tbody td.day").each(function() {
            var shift = $(this).attr('shift');
            if( $.inArray(shift, shifts)>=0 ) {
                var weekday = parseInt( $(this).parent('.row').attr('weekday') );
                if( $.inArray(weekday, weekdays)>=0 ) {
                    $(this).removeAttr('disabled');
                }
            }
        });
    }
    checkShifts();
}

function clickBottomButton(action) {
    if(action=='reset') {
        var level = $('div.middleBlock select.selectObject :selected').attr('level');
        var selected_id = $('div.middleBlock select.selectObject :selected').val();
        timetableGet(selected_id);
    } else if(action=='save') {
        timetableUpdate();
    }
}

function changeTime(disabled,weekday,shift,name,time) {
    //console.log(disabled+', '+weekday+', '+shift+', '+name+', '+time);
    var click_shift = false;
    if(weekday==''){
        click_shift = true;
        var tr = $('#time_table tr.row:eq(0)');
    } else {
        var tr = $('#time_table tr.row td.weekday:contains(' + weekday + ')').parent('tr.row');
    }
    var td = tr.find('td[shift='+shift+']');

    if(disabled=='disabled'){
        td.removeAttr('disabled');
        $('#time_table tr.row:eq(0) td[shift='+shift+']').removeAttr('disabled');
    }
    if(click_shift){
        $('#time_table tr.row td[shift='+shift+']').removeAttr('hours');
        $('#time_table tr.row td[shift='+shift+'] select[name='+name+'] :contains('+time+')').attr('selected', 'selected');
        //$('#time_table tr.row td[shift='+shift+']').attr('disabled','disabled');
    }
    checkShifts();
}

function clickCheckbox(disabled,weekday,shift) {
    var click_shift = false;
    if(weekday==''){
        click_shift = true;
        var tr = $('#time_table tr.row:eq(0)');
    } else {
        var tr = $('#time_table tr.row td.weekday:contains(' + weekday + ')').parent('tr.row');
    }
    var td = tr.find('td[shift='+shift+']');
    if(disabled=='disabled'){
        td.removeAttr('disabled');
        $('#time_table tr.row:eq(0) td[shift='+shift+']').removeAttr('disabled');
    } else {
        td.attr('disabled','disabled').removeAttr('hours');
        if(click_shift){
            $('#time_table tr.row td[shift='+shift+']').attr('disabled','disabled');
        }
    }
    checkShifts();
}

function checkShifts() { // После проверки у ячейки появляется атрибут "hours"
    shifts_valid = true;
    $('#time_table tr.row td.error').attr('class','day');
    $('#time_table tr.shift_error').attr('class','row');

    var shifts = {};
    $("#time_table tbody tr:not(:eq(0))").each(function(){
        var weekday = $(this).attr('weekday');
        var weekday_hours = 0;

        $('#time_table tbody tr.row[weekday='+weekday+'] td.day:not([disabled=disabled])').each(function(){
            var shift = $(this).attr('shift');
            if(shifts[shift]==undefined){
                shifts[shift] = {};
            }

            var td_hours = parseFloat( $(this).attr('hours') );
            var midnight = 0; // Замута с периодом захватывающим полночь
            if(!td_hours) {
                var begin = getHours( $(this).find('select[name=begin_time]').val() );
                var end = getHours( $(this).find('select[name=end_time]').val() );
                if(begin>end){ invert = 1 }

                $('#time_table tbody tr.row[weekday='+weekday+'] td.day:not([disabled=disabled]):not([shift='+shift+'])').each(function(){
                    var begin_2 = getHours( $(this).find('select[name=begin_time]').val() );
                    var end_2 = getHours( $(this).find('select[name=end_time]').val() );
                    if(begin_2>end_2){ invert = 2 }

                    if(midnight==0){
                        if( (begin>begin_2 && begin<end_2) || (end>begin_2 && end<end_2) ) {
                            shifts_valid = false;
                            console.log('error0');
                        }
                    }
                    else if(midnight==1){
                        if( (begin<begin_2 && begin>end_2) || (end<begin_2 && end>end_2) ) {
                            shifts_valid = false;
                            console.log('error1');
                        }
                    }
                    else if(midnight==2){
                        if( (begin_2<begin && begin_2>end) || (end_2<begin && end_2>end) ) {
                            shifts_valid = false;
                            console.log('error2');
                        }
                    }

                    if(shifts_valid==false){
                        $(this).attr('class','day error');
                        $('#time_table tr.row[weekday='+ weekday +']').find('td.day[shift='+shift+']').attr('class','day error');
                    }
                });


                td_hours = getHoursSum(begin,end);
                $(this).attr('hours',td_hours);
            }

            weekday_hours += td_hours;
        });

        $(this).attr('hours',weekday_hours);
        if(weekday_hours>24){
            shifts_valid = false;
            $(this).attr('class','row shift_error');
        }
    });



}

function getShifts() {
    var shifts = {};
    $("#time_table tbody tr:not(:eq(0)) td.day:not([disabled=disabled])").each(function(){
        var shift = $(this).attr('shift');
        var weekday = $(this).parent('.row').attr('weekday');
        if( shifts[shift]==undefined ){
            shifts[shift] = {};
        }
        if( shifts[shift][weekday]==undefined ){
            shifts[shift][weekday] = {};
        }
        shifts[shift][weekday] = {
            'begin': $(this).find('select[name=begin_time]').val(),
            'end': $(this).find('select[name=end_time]').val()
        };
    });
    return JSON.stringify(shifts);
}

function timetableUpdate() {
    var ajax_array = {};
    ajax_array['level'] = $('div.middleBlock select.selectObject :selected').attr('level');
    ajax_array['selected_id'] = $('div.middleBlock select.selectObject :selected').val();
    ajax_array['shifts'] = getShifts();
    console.log( ajax_array['shifts'] );
    if(shifts_valid){
        $.ajax({ url:'/system/client/object/timetable/ajax/update/', type:'post', dataType:'json', data:ajax_array,
            success: function(data){
                //setTable(data['timetable']);
                popMessage('Сохранено','green');
            }
        });
    }
}

function timetableGet(selected_id) {
    $('.loading').show();
    $('.tableInfo').hide();

    var service_id =  $('select.selectObject :selected').attr('service_id');
    $.ajax({ url:'/system/client/object/timetable/ajax/get/?service_id='+selected_id, type:'get', dataType:'json',
        success: function(data){
            setTable(data['timetable']);
        }
    });
}

function setTable(data) {
    $('#time_table tbody tr.shift_error').attr('class','row');
    $('#time_table tbody td.day').attr('disabled','disabled').removeAttr('hours');
    for(var key in data){
        //console.log(data[key]['weekday']);
        $('#time_table tr.row:eq(0) td.day[shift='+ data[key]['shift'] +']').removeAttr('disabled');
        var td = $('#time_table tr.row[weekday='+data[key]['weekday']+'] td.day[shift='+ data[key]['shift'] +']');
        td.removeAttr('disabled');
        td.attr('hours',data[key]['hours']);
        console.log(data[key]['begin_time']+'-'+data[key]['end_time']);
        td.find('select[name=begin_time] :contains('+data[key]['begin_time']+')').attr('selected', 'selected');
        td.find('select[name=end_time] :contains('+data[key]['end_time']+')').attr('selected', 'selected');
    }
    $('select.selectObject').removeAttr('disabled');
    $('.loading').hide();
    $('.tableInfo').show();
}

function newTimeTable() {
    var begin_time = '<select class="timelist" name="begin_time">';
    for(var h=0; h<=23; h++){ if(h<10){ h='0'+h }
        for(var m=0; m<=45; m+=15){ if(m<10){ m='0'+m }
            if(h=='09' && m=='00'){ var selected = 'selected' }
            else{ var selected = '' }
            begin_time += '<option '+selected+'>'+h+':'+m+'</option>';
            m = parseInt(m);
        }
    }
    begin_time += '</select>';
    var end_time = begin_time.replace('begin_time', 'end_time');

    var tds =
        '<td class="day" shift="1" disabled="disabled"><div class="checkbox_left"></div>'+begin_time+'<div class="txt4"> - </div>'+end_time+'</td>' +
        '<td class="day" shift="2" disabled="disabled"><div class="checkbox_left"></div>'+begin_time+'<div class="txt4"> - </div>'+end_time+'</td>' +
        '<td class="day" shift="3" disabled="disabled"><div class="checkbox_left"></div>'+begin_time+'<div class="txt4"> - </div>'+end_time+'</td></tr>';

    $('#time_table tbody tr.row').each(function(){
        $(this).append(tds);
    });
    var cnt_shift = 1;
    $('#time_table tbody .row:eq(0) td:not(:eq(0))').each(function(){
        var shift_txt = '';
        if(cnt_shift==1){ shift_txt = 'Первая смена' }
        if(cnt_shift==2){ shift_txt = 'Вторая смена' }
        if(cnt_shift==3){ shift_txt = 'Третья смена' }
        $(this).prepend('<p class="txt_top">'+shift_txt+'</p>');
        cnt_shift++;
    });
}

function getHours(string) {
    var hh = parseFloat( string.slice(0,2) );
    var mm = parseFloat( string.slice(3,5) )/60;
    var hours = hh+mm;
    return hours;
}

function getHoursSum(begin,end) {
    var hours = 0;
    if(begin==end){
        hours = 24;
    }
    else if(begin > end){
        hours = 24-(begin-end);
    }
    else {
        hours = end-begin;
    }
    return hours;
}