$(document).ready(function() {
    multi_mode = false;

    $('#pop_shift').on('click', '.close', function() {
        $('table.timetable tr.hover').attr('class','row');
    });
    $('#pop_shift').on('change', 'select.timelist', function() {
        var shift = $(this).parents('tr.row').attr('shift');
        shiftRecountHours(shift);
    });
    $('#pop_shift').on('click', 'div[action=set_shift]', function() {
        var shift = $(this).parents('tr[name=shift]').attr('shift');
        if(multi_mode){
            shiftMultipleSave(shift);
        } else {
            shiftSave(shift);
        }
    });
    $('#pop_shift').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        console.log(action);
        shift_Buttons(action);
    });

    $(document).on('click', '.timetable .btn_ui[action=calendar]', function() {
        var service_id = $(this).parents('table.timetable').attr('service_id');
        shiftMultiple('button');
    });
    $('#multi_pick').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        shiftMultiple(action);
    });

    $(document).on('click', '.timetable tbody .cell:not([name=hours]):not([name=salary])', function() {
        var service_id = $(this).parents('.timetable').attr('service_id');
        var user_id = $(this).parents('.row').attr('user_id');
        var post_id = $(this).find('div.one').attr('post_id');
        var monthday = $(this).attr('monthday');
        var wday = $(this).attr('weekday');
        shiftEdit(service_id,user_id,monthday,wday,post_id,'no');
    });
});


function shiftMultiple(action) {
    console.log(action);
    if(action=='button') {
        if(multi_mode) {
            multi_mode = false;
            $('#multi_pick').hide();
            $('.timetable div.pick').remove();
        } else {
            multi_mode = true;
            $('#multi_pick').show();
            $('.pop').hide();
        }
    }
    else if(action=='cancel') {
        multi_mode = false;
        $('#multi_pick').hide();
        $('.timetable div.pick').remove();
        $('table.timetable').each(function() {
            var service_id = $(this).attr('service_id');
            console.log(service_id);
            checkShifts(service_id);
        });
    }
    else if(action=='time') {
        popMenuPosition('#pop_shift','single');
        $('#pop_shift .header b').text('Добавление нескольних смен');
        $('#pop_shift tr[name=title]').hide();
        $('#pop_shift tr[shift=plan]').show();
        $('#pop_shift tr[shift=none]').show();
        $('#pop_shift tr[shift=completed]').hide();
        $('#pop_shift tr[name=armory]').hide();
        $('#pop_shift tr[name=buttons]').hide();
        $('#pop_shift tr[name=comment]').hide();
        $('#pop_shift tr[name=shift]:not([shift=none]):not([shift=plan])').remove();
        $('#pop_shift tr[shift=none] div[action=set_shift]').removeAttr('style');
        shiftRecountHours('none');
        /*
         for(key in shifts_all) {
         var shift = shifts_all[key];
         var key_ = ++key;
         var tr_shift = $('#pop_shift tr[shift=none]').clone().attr('shift',key_).removeAttr('style');
         $('#pop_shift tr[name=comment]').before(tr_shift);
         $('#pop_shift tr[shift='+key_+'] td:eq(0)').text('Смена №'+key_);
         $('#pop_shift tr[shift='+key_+'] select[name=begin_time] :contains('+shift['begin_date']+')').attr('selected', 'selected');
         $('#pop_shift tr[shift='+key_+'] select[name=end_time] :contains('+shift['end_date']+')').attr('selected', 'selected');
         $('#pop_shift tr[shift='+key_+'] div.hours').text(+shift['hours']);
         }
         */
    }
}


function checkShifts(service_id) {
    var table = $('table.timetable[service_id='+service_id+']');
    table.find('div.one[status=shift]').remove();
    // Просматриваем таблицу вертикально по дням недели
    table.find('thead td.cell').each(function() {
        var monthday = $(this).attr('monthday');
        var weekday = $(this).attr('weekday');
        if(weekday) {
            var hours = 0;
            for(key in shifts[service_id][weekday]){
                var shift = shifts[service_id][weekday][key];
                hours += parseFloat(shift['hours']);
            }
            var td = table.find('tbody td.cell[monthday='+monthday+']');
            td.find('div.one').each(function() {
                hours -= parseFloat( $(this).text() );
            });
            if(hours>0) {
                td.each(function() {
                    if( !$(this).find('div').is('.one') && !$(this).find('div').is('.pick') ) {
                        var td_shift = '<div class="one" status="shift">'+hours+'</div>';
                        $(this).append(td_shift);
                    }
                });
            }
        }
    });
    // Просматриваем таблицу горизонтально по сотрудникам
    table.find('tbody tr.row').each(function() {
        var user_id = $(this).attr('user_id');
        var hours_total = 0;
        var hours_worked = 0;
        var salary_total = 0;
        var salary_worked = 0;
        $(this).find('div.one:not([status=shift])').each(function() {
            var hours = parseFloat( $(this).text() );
            var status = $(this).attr('status');
            var salary = parseFloat( $(this).attr('salary') );
            hours_total += hours;
            salary_total += salary;
            if(status=='worked'){
                hours_worked += hours;
                salary_worked += salary;
            }
        });
        $(this).find('td[name=hours] b.total').text(hours_total);
        $(this).find('td[name=hours] b.worked').text(hours_worked);
        $(this).find('td[name=salary] b.total').text(salary_total.toFixed(2));
        $(this).find('td[name=salary] b.worked').text(salary_worked);
    });
    $('table.timetable tr.hover').attr('class','row');
}


function shiftRecountHours(shift) {
    var begin_date = getHours($('#pop_shift tr[shift='+shift+'] select[name=begin_time]').val());
    var end_date = getHours($('#pop_shift tr[shift='+shift+'] select[name=end_time]').val());
    var hours = getHoursSum(begin_date,end_date);
    $('#pop_shift tr[shift='+shift+'] div.hours').text(hours);
}


function shiftMultipleSave(shift) {
    console.log('in: '+shift);
    var ajax_array = {};
    ajax_array['shifts'] = [];
    var month = $('table.searchObject select.month_list').val(); if(month.length<2){ month = '0'+month }
    var year = $('table.searchObject select.year').val();
    $('.timetable div.pick').each(function() {
        console.log('+++');
        var shifts_array = {};
        shifts_array['service_id'] = $(this).parents('table.timetable').attr('service_id');
        shifts_array['user_id'] = $(this).parents('tr.row').attr('user_id');
        shifts_array['weekday'] = $(this).parent('td.cell').attr('weekday');
        if(shift=='none') {
            var begin_time = $('#pop_shift tr[shift=none] select[name=begin_time]').val();
            shifts_array['hours'] = $('#pop_shift tr[shift=none] div.hours').text();
        }
        else if(shift) {
            if(shifts[shifts_array['service_id']] &&
                shifts[shifts_array['service_id']][shifts_array['weekday']] &&
                shifts[shifts_array['service_id']][shifts_array['weekday']][1]) {
                var shift_plan = shifts[shifts_array['service_id']][shifts_array['weekday']][1];
                var begin_time = shift_plan['begin_time'];
                shifts_array['hours'] = parseInt(shift_plan['hours']);
            }
        }

        if(shifts_array['hours']) {
            var monthday = $(this).parent('td.cell').attr('monthday');
            shifts_array['begin_date'] = monthday+'.'+month+'.'+year+' '+begin_time;
            ajax_array['shifts'].push(shifts_array);
        }
    });
    ajax_array['shifts'] = JSON.stringify(ajax_array['shifts']);
    $.ajax({ url:'/post/timetable/set_multi_shift/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']) {
                alert(data['error']);
            } else {
                refreshTimetable();
            }
        }
    });
}

function shiftSave(shift) {
    var ajax_array = {};
    ajax_array['post_id'] = $('#pop_shift').attr('post_id');
    ajax_array['service_id'] = $('#pop_shift').attr('service_id');
    ajax_array['user_id'] = $('#pop_shift').attr('user_id');
    ajax_array['status'] = $('#pop_shift').attr('status');
    ajax_array['weekday'] = $('#pop_shift').attr('weekday');
    if( $('#pop_shift tr[name=armory]').is(":visible") ) {
        ajax_array['armory_id'] = $('#pop_shift tr[name=armory] select').val();
    }
    if(shift!='none'){
        var begin_date = $('#pop_shift tr[shift='+shift+'] select[name=begin_time]').val();
        var end_date = $('#pop_shift tr[shift='+shift+'] select[name=end_time]').val();
        ajax_array['hours'] = $('#pop_shift tr[shift='+shift+'] div.hours').text();
    } else if(ajax_array['status']=='worked') {
        ajax_array['reason_begin'] = $('#pop_shift tr[shift=completed] select[name=reason_begin]').val();
        ajax_array['reason_end'] = $('#pop_shift tr[shift=completed] select[name=reason_end]').val();
        var begin_date = $('#pop_shift tr[shift=completed] select[name=begin_time]').val();
        var end_date = $('#pop_shift tr[shift=completed] select[name=end_time]').val();
        ajax_array['hours'] = $('#pop_shift tr[shift=completed] div.hours').text();
    } else {
        var begin_date = $('#pop_shift tr[shift=none] select[name=begin_time]').val();
        var end_date = $('#pop_shift tr[shift=none] select[name=end_time]').val();
        ajax_array['hours'] = $('#pop_shift tr[shift=none] div.hours').text();
    }
    ajax_array['comment'] = $('#pop_shift textarea').val();
    var year = $('table.searchObject select.year').val();
    var month = $('table.searchObject select.month_list').val(); if(month.length<2){ month = '0'+month }
    var monthday = $('#pop_shift').attr('monthday');
    var monthdays = $('table.month_table').attr('monthdays');

    ajax_array['begin_date'] = monthday+'.'+month+'.'+year+' '+begin_date;
    $.ajax({ url:'/post/timetable/set_shift/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']) {
                alert(data['error']);
            } else {
                var armory = '';
                var comment = '';
                var reason = '';
                if(data['armory_id']) {
                    armory = ' armory_id="'+data['armory_id']+'"';
                }
                if(data['comment']) {
                    armory = ' comment="'+data['comment']+'"';
                }
                if(data['status']=='worked') {
                    reason = ' reason_begin="'+ajax_array['reason_begin']+'" reason_end="'+ajax_array['reason_end']+'"';
                }
                console.log(armory);
                var div = '<div class="one" post_id="'+data['post_id']+'" ' +
                    'status="'+ data['status']+ '"' +reason + armory + comment+ ' plan="' +data['plan']+ '"' +
                    'begin_date="'+ajax_array['begin_date']+'" end_date="'+data['end_date']+'" ' +
                    'salary="'+data['salary']+'">'+ajax_array['hours']+'</div>';
                //console.log(div);
                $('table.timetable[service_id='+ajax_array['service_id']+'] tr[user_id='+ajax_array['user_id']+'] td[monthday='+monthday+']').html(div);
                $('#pop_shift').hide();
                checkShifts(ajax_array['service_id']);
            }
        }
    });
}

function setArmory(service_id,user_id,monthday,armed) {
    $('#pop_shift tr[name=armory] select option').removeAttr('style');
    $('#pop_shift tr[name=armory] select option').removeAttr('selected');
    $('#pop_shift tr[name=armory] select [value=none]').attr('selected','selected');
    if(armed==1) {
        var selected = 0;
        $('#pop_shift tr[name=armory] select option:not([value=none])').each(function() {
            var armory_id = parseInt($(this).val());
            if( $.inArray(armory_id,armory_list['services'][service_id])>=0 && $.inArray(armory_id,armory_list['users'][user_id])>=0 ) {
                if(selected==0){
                    selected++;
                    console.log('select',armory_id);
                    $('#pop_shift tr[name=armory] select option').removeAttr('selected');
                    $(this).attr('selected','selected');
                }
            }
            else {
                $(this).hide();
            }
        });
        var armory_id = $('table.timetable[service_id='+service_id+'] tr[user_id='+user_id+'] td[monthday='+monthday+'] div.one').attr('armory_id');
        if( armory_id ) {
            $('#pop_shift tr[name=armory] select option').removeAttr('selected');
            $('#pop_shift tr[name=armory] select option[value='+armory_id+']').attr('selected','selected');
        }
    }
    else {
        $('#pop_shift tr[name=armory]').hide();
    }
}

function shiftEdit(service_id,user_id,monthday,weekday,post_id,close_shift) {
    var tr = $('.tableInfo[service_id='+service_id+'] tr[user_id='+user_id+']');
    var td = tr.find('td:eq('+monthday+')');
    if(multi_mode) {
        var div_class = td.find('div').attr('class');
        var status = td.find('div').attr('status');
        if(div_class=='one' && status!='shift') {
            console.log('one');
        } else if (div_class=='pick') {
            td.html('');
            checkShifts(service_id);
        } else {
            var div = '<div class="pick"></div>';
            td.html(div);
        }
    }
    else {
        tr.attr('class','row hover');
        popMenuPosition('#pop_shift','single');
        $('#pop_shift').attr('service_id',service_id).attr('user_id',user_id).attr('monthday',monthday).attr('weekday',weekday);
        $('#pop_shift tr[shift=plan]').hide();
        $('#pop_shift tr[shift=none] div[action=set_shift]').removeAttr('style');
        $('#pop_shift tr[name=comment] textarea').val('');
        $('.timetable tr.hover').attr('class','row');
        var armed = $('.tableInfo[service_id='+service_id+']').attr('armed');
        setArmory(service_id,user_id,monthday,armed);
        if(post_id==undefined){
            $('#pop_shift').attr('post_id','none');
        } else {
            $('#pop_shift').attr('post_id',post_id);
        }
        if(close_shift=='yes') {
            var status = 'worked';
            var reason_begin = 1;
            var reason_end = 1;
        } else {
            var status = td.find('div.one').attr('status');
            var reason_begin = td.find('div.one').attr('reason_begin');
            var reason_end = td.find('div.one').attr('reason_end');
        }
        var comment = td.find('div.one').attr('comment');
        if(comment) {
            $('#pop_shift [name=comment] textarea').val(comment);
        }
        $('#pop_shift tr[name=comment]').show();
        var full_name = tr.find('td:eq(0) a').text();
        var year = $('table.searchObject select.year').val();
        var month = $('table.searchObject select.month_list').val(); if(month.length<2){ month = '0'+month }
        if(monthday.length<2){ monthday = '0'+monthday }
        var today = monthday+'.'+month+'.'+year;

        $('#pop_shift [name=today]').text(today);
        $('#pop_shift [name=full_name]').text(full_name);
        $('#pop_shift tr[name=shift]:not([shift=none]):not([shift=plan])').remove();
        var plan = td.find('div.one').attr('plan');
        $('#pop_shift tr[name=title]').show();
        $('#pop_shift tr[name=armory]').hide();
        if(status=='worked') {
            $('#pop_shift .header b').text('Редактирование завершенной смены');
            $('#pop_shift tr[shift=none]').hide();
            $('#pop_shift tr[shift=completed]').show();
            if(armed==1) {
                $('#pop_shift tr[name=armory]').show();
            }
            $('#pop_shift tr[name=buttons]').show();
            $('#pop_shift tr[name=buttons] span[action=shift_end]').hide();
            var begin_date = td.find('div.one').attr('begin_date').slice(11,16);
            var end_date = td.find('div.one').attr('end_date').slice(11,16);
            var hours = td.find('div.one').text();
            console.log(end_date);
            $('#pop_shift tr[shift=completed] select[name=begin_time] :contains('+begin_date+')').attr('selected', 'selected');
            $('#pop_shift tr[shift=completed] select[name=end_time] :contains('+end_date+')').attr('selected', 'selected');
            $('#pop_shift tr[shift=completed] select[name=reason_begin] [value='+reason_begin+']').attr('selected', 'selected');
            $('#pop_shift tr[shift=completed] select[name=reason_end] [value='+reason_end+']').attr('selected', 'selected');
            $('#pop_shift tr[shift=completed] div.hours').text(hours);
        }
        else if(status=='planned') {
            $('#pop_shift .header b').text('Редактирование смены');
            $('#pop_shift tr[shift=none]').show();
            $('#pop_shift tr[shift=none] div[action=set_shift]').hide();
            $('#pop_shift tr[shift=completed]').hide();
            $('#pop_shift tr[name=buttons]').show();
            $('#pop_shift tr[name=buttons] span[action=shift_end]').show();
            var begin_date = td.find('div.one').attr('begin_date').slice(11,16);
            var end_date = td.find('div.one').attr('end_date').slice(11,16);
            var hours = td.find('div.one').text();
            $('#pop_shift tr[shift=none] select[name=begin_time] :contains('+begin_date+')').attr('selected', 'selected');
            $('#pop_shift tr[shift=none] select[name=end_time] :contains('+end_date+')').attr('selected', 'selected');
            $('#pop_shift tr[shift=none] div.hours').text(hours);
        }
        else if(status=='shift') {
            $('#pop_shift .header b').text('Добавление плановой смены');
            $('#pop_shift tr[shift=none]').hide();
            $('#pop_shift tr[shift=completed]').hide();
            $('#pop_shift tr[name=buttons]').hide();
            for(key in shifts[service_id][weekday]) {
                var shift = shifts[service_id][weekday][key];
                var tr_shift = $('#pop_shift tr[shift=none]').clone().attr('shift',key).removeAttr('style');
                $('#pop_shift tr[name=comment]').before(tr_shift);
                $('#pop_shift tr[shift='+key+'] td:eq(0)').text('Смена №'+key);
                $('#pop_shift tr[shift='+key+'] select[name=begin_time] :contains('+shift['begin_date']+')').attr('selected', 'selected');
                $('#pop_shift tr[shift='+key+'] select[name=end_time] :contains('+shift['end_date']+')').attr('selected', 'selected');
                $('#pop_shift tr[shift='+key+'] div.hours').text(+shift['hours']);
            }
        }
        else {
            var status = 'none';
            $('#pop_shift .header b').text('Добавление внеплановой смены');
            $('#pop_shift tr[shift=none]').removeAttr('style');
            $('#pop_shift tr[shift=completed]').hide();
            $('#pop_shift tr[name=buttons]').hide();
            $('#pop_shift tr[shift=none] select[name=begin_time] :contains("09:00")').attr('selected', 'selected');
            $('#pop_shift tr[shift=none] select[name=end_time] :contains("18:00")').attr('selected', 'selected');
            $('#pop_shift tr[shift=none] div.hours').text('9');
        }
        $('#pop_shift').attr('status',status);
        $('#pop_shift').attr('plan',plan);
    }
}

function shift_Buttons(action) {
    var service_id = $('#pop_shift').attr('service_id');
    var post_id = $('#pop_shift').attr('post_id');
    if(action=='shift_save') {
        shiftSave('none')
    }
    else if(action=='shift_delete') {
        var ajax_array = {};
        ajax_array['shifts'] = JSON.stringify([ post_id ]);
        $.ajax({ url:'/post/timetable/remove_shift/', type:'post', dataType:'json', data:ajax_array,
            success: function(data) {
                $('table.timetable div.one[post_id='+post_id+']').remove();
                $('#pop_shift').hide();
                checkShifts(service_id);
            }
        });
    }
    else if(action=='shift_end') {
        var user_id = $('#pop_shift').attr('user_id');
        var monthday = $('#pop_shift').attr('monthday');
        var weekday = $('#pop_shift').attr('weekday');
        shiftEdit(service_id,user_id,monthday,weekday,post_id,'yes');
    }
}

function sortTable(service_id) {
    var table = $('table[service_id='+service_id+'] tbody');
    var table_rows = table.children('tr').get();
    table_rows.sort(function(a, b) {
        var compA = $(a).text().toUpperCase();
        var compB = $(b).text().toUpperCase();
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    });
    $.each(table_rows, function(idx, itm) { table.append(itm); });
}


/*
 function getPlan(service_id,user_id,monthday,begin_date,end_date) {
 var plan = 'unplanned';
 var td = $('table.timetable[service_id='+service_id+'] tr[user_id='+user_id+'] td[monthday='+monthday+']');
 td.find('div.one').removeAttr('plan');
 var weekday = td.attr('weekday');
 var planned = true;
 $('table.timetable[service_id='+service_id+'] td[monthday='+monthday+'] div.one[plan=planned]').each(function() {
 var planned_begin_date = $(this).attr('begin_date');
 if(planned_begin_date.length<16){ planned_begin_date = '0'+planned_begin_date }
 if(begin_date==planned_begin_date.substring(11, 17)) {
 planned = false;
 }
 });
 for(key in shifts[service_id][weekday]) {
 var shift = shifts[service_id][weekday][key];
 if(planned && begin_date==shift['begin_date'] && end_date==shift['end_date']) {
 plan = 'planned';
 }
 }
 console.log(plan);
 return plan;
 }
 */