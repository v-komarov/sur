$(document).ready(function() {
    shifts = {};
    shifts_all = [];
    armory_list = {};

    $('table.searchObject select').change(function() {
        var select_name = $(this).attr('name');
        if(select_name=='service_organization'){
            getServices();
        } else if(select_name=='select_object'){
            refreshTimetable();
        }
    });
    $('.searchObject [name=month]').on('click', '.arrow', function() {
        var action = $(this).attr('action');
        changeMonth(action);
    });
    $('.searchObject').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset') refreshTimetable();
    });

    $(document).on('mousemove1', '.timetable tbody td.cell:not([name=hours]):not([name=salary])', function() {
        var service_id = $(this).parents('table.timetable').attr('service_id');
        var user_id = $(this).parent('tr.row').attr('user_id');
        var monthday = $(this).attr('monthday');
        var weekday = $(this).attr('weekday');
        focusDay(service_id,user_id,monthday,weekday);
    });
    $(document).on('mouseleave', '.timetable', function() {
        //$('#pop_day').hide();
    });

    getServices();
    setTime();
});


function getParams() {
    var params = {};
    var params_search = location.search.replace('?','').split('&');
    for(key in params_search) {
        var param = params_search[key].split('=');
        params[param[0]] = param[1];
    }
    console.log(params);
    if(params['year']){
        $('table.searchObject select.year option').removeAttr('selected');
        $('table.searchObject select.year [value='+params['year']+']').attr('selected','selected');
    }
    if(params['month']){
        $('table.searchObject select.month_list option').removeAttr('selected');
        $('table.searchObject select.month_list [value='+parseInt(params['month'])+']').attr('selected','selected');
    }
    if(params['service_id']){
        $('table.searchObject select[name=select_object] option').removeAttr('selected');
        $('table.searchObject select[name=select_object] [value='+parseInt(params['service_id'])+'][level=service]').attr('selected','selected');
        refreshTimetable();
    }
}


function focusDay(service_id,user_id,monthday,weekday) {
    $('table.timetable tr.hover').attr('class','row');
    var td = $('table.timetable[service_id='+service_id+'] tr[user_id='+user_id+'] td[monthday='+monthday+']');
    var planned_begin_date = td.attr('planned_begin_date');
    console.log(planned_begin_date);
    if(planned_begin_date!=undefined){
        $('#pop_day_focus').hide();
        $('#pop_day').hide();
    }
    else {
        $('#pop_day div').remove();
        for(shift in shifts[service_id][weekday]){
            //console.log(shifts[service_id][weekday]);
            var div = '<div class="end" shift="'+shift+'">' +
                'добавить смену '+shifts[service_id][weekday][shift]['begin_time']+' - '+shifts[service_id][weekday][shift]['end_time']+'</div>';
            $('#pop_day').append(div);
        }
        $('table.timetable[service_id='+service_id+'] tr[user_id='+user_id+']').attr('class','row hover');
        var td_offset = td.offset();
        td_offset['top'] -= 3;
        td_offset['left'] -= 3;
        $('#pop_day_focus').offset(td_offset);
        $('#pop_day_focus').show();
        td_offset['top'] += 28;
        $('#pop_day').offset(td_offset);
        $('#pop_day').show();
    }
}


function getServices() {
    $('select').attr('disabled','disabled');
    $('.loading').show();
    var ajax_array = {};
    var service_organization_id = $('select[name=service_organization]').val();
    if(service_organization_id!='all') ajax_array['service_organization_id'] = service_organization_id;
    $.ajax({ url:'/system/post/timetable/get_services/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            $('select[name=select_object] option').remove();
            var select = '<option value="all" selected>все</option>';
            for(object in data['select']){
                select += '<option value="'+object+'" level="object">объект: '+data['select'][object]['object_name']+'</option>';
                var services = data['select'][object]['services'];
                for(key in services){
                    select += '<option value="'+services[key]['service_id']+'" level="service">&nbsp;&nbsp;&nbsp;&nbsp;'+services[key]['service_name']+'</option>';
                }
            }
            $('table.searchObject select[name=select_object]').append(select);
            $('select').removeAttr('disabled');
            $('.loading').hide();
        },
        complete: function(){
            getParams();
        }
    });
}


function changeMonth(action) {
    var month = $('.searchObject [name=month] select.month_list').val();
    var year = $('.searchObject [name=month] select.year').val();
    if(action=='next') {
        if(month<12){
            month++
        } else {
            year++;
            month = 1;
        }
    }
    else if(action=='prev') {
        if(month>1){
            month--
        } else {
            year--;
            month = 12;
        }
    }
    $('.searchObject [name=month] select.year [value='+year+']').attr('selected', 'selected');
    $('.searchObject [name=month] select.month_list [value='+month+']').attr('selected', 'selected');
    refreshTimetable();
}


function setTime() {
    for(var h=0; h<=23; h++){ if(h<10){ h='0'+h }
        for(var m=0; m<=45; m+=15){ if(m<10){ m='0'+m }
            if(h=='09' && m=='00'){ var selected = 'selected' }
            else{ var selected = '' }
            $('select.timelist').append('<option '+selected+'>'+h+':'+m+'</option>');
            m = parseInt(m);
        }
    }
    $('select.timelist').append('<option>00:00</option>');
}


function refreshTimetable() {
    $('.pop').hide();
    $('table.searchObject select').attr('disabled','disabled');
    $('table.timetable').remove();
    $('.loading').show();
    var ajax_array = {};
    ajax_array['year'] = $('[name=month] .year').val();
    ajax_array['month'] = $('[name=month] .month_list').val();
    var service_organization_id = $('select[name=service_organization]').val();
    if(service_organization_id!='all') ajax_array['service_organization_id'] = service_organization_id;
    ajax_array['select_level'] = $('select[name=select_object] :selected').attr('level');
    var select_id = $('select[name=select_object]').val();
    var sentry_user = $('input[name=sentry_user]').val();
    if(sentry_user) ajax_array['sentry_user'] = sentry_user;
    if(select_id!='all') ajax_array['select_id'] = select_id;
    $.ajax({ url:'/system/post/timetable/get_timetable/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            shifts = data['shifts'];
            shifts_all = data['shifts_all'];
            armory_list = data['armory_list'];
            createMonth(data);
            setTable(data);
        }
    });
}


function createMonth(data) {
    $('table.month_table').remove();
    var table = '<table class="tableInfo month_table">' +
        '<thead><tr class="row title"><td name="full_name"><div class="nowrap right"><a></a>' +
        '<div class="btn_ui btn_38" action="user_add" icon="user_add" title="Добавить сотрудника"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_38" action="calendar" icon="calendar" title="Отметить дни для смен"><div class="icon"></div></div>' +
        '</div></td>';
    var monthdays = 0;
    for(var monthday in data['month']){
        var weekday = data['month'][monthday];
        var attr_monthday = monthday; if(attr_monthday.length<2){ attr_monthday = '0'+attr_monthday }
        table += '<td class="cell" monthday="'+attr_monthday+'" weekday="'+weekday+'">'+monthday+'</td>';
        monthdays++;
    }
    table += '<td class="cell" name="hours">Часы</td><td class="cell" name="salary">ЗП</td></tr></thead></table>';
    $('div.middleBlock').append(table);
    $('div.middleBlock table.month_table').attr('monthdays',monthdays);
    $('div.middleBlock table.month_table').hide();
}


function setTable(data) {
    for(var service_id in data['post']) {
        // Пост
        var service = data['post'][service_id];
        $('.middleBlock').append('<table class="tableInfo timetable" service_id="'+service_id+'" ' +
        'armed="'+service['armed']+'" />');
        var newtable = $('table[service_id='+service_id+']');
        $('table.month_table thead').clone().prependTo(newtable);
        newtable.find('td:eq(0) a').html(service['service__short_name']);
        newtable.find('td:eq(0) a').append('<div class="small">'+service['service_name']+'</div>');
        var href = '/system/client/'+service['client_id']+'/object/'+service['object_id']+'/';
        newtable.find('td:eq(0) a').attr('href',href);
        newtable.append('<tbody class="show" />');

        // Охранники
        for(var user_id in service['users']) {
            var user = service['users'][user_id];
            $('table.month_table thead tr').clone().appendTo( $('table[service_id='+service_id+']'))
                .attr('user_id',user_id).attr('class','row');
            var tr = $('table[service_id='+service_id+'] tbody tr[user_id='+user_id+']');
            tr.find('td:not(:first-child)').text('');
            var user_class = '';
            if($.inArray(service['service_organization'], user['service_organization_list'])<0) {
                user_class = 'class="red"';
            }
            tr.find('td:eq(0)').html('<div class="nowrap right"><a '+user_class+'>'+user['full_name']+'</a></div>');
            tr.find('td:eq(0) a').attr('href', '/system/post/personal/?user_id='+user['user_id']);
            tr.find('td:eq(0) .nowrap').append('<div class="btn_ui btn_28" action="user_drop" icon="time" title="Удалить неотработанные смены"><div class="icon"></div></div>');
            tr.find('[name=hours]').html('<b class="worked">0</b> / <b class="total">0</b>');
            tr.find('[name=salary]').html('<b class="worked">0</b> / <b class="total">0</b>');

            // Смены за месяц
            var hours_total = 0;
            var hours_worked = 0;
            var salary_total = 0;
            var salary_worked = 0;
            for(var monthday in user['month']) {
                var one = user['month'][monthday];
                var hours = +one['hours'];
                hours_total += hours;
                salary_total += parseInt(one['salary']);
                if(one['reason_end']==null) {
                    var div = '<div class="one" status="planned" ' +
                        'salary="'+one['salary']+'" ' +
                        'begin_date="'+one['planned_begin_date']+'" ' +
                        'end_date="'+one['planned_end_date']+'">'+hours+'</div>';
                    tr.find('td:eq('+monthday+')').html(div);
                } else {
                    var div = '<div class="one" status="worked" ' +
                        'salary="'+one['salary']+'" ' +
                        'reason_begin="'+one['reason_begin']+'" ' +
                        'reason_end="'+one['reason_end']+'" ' +
                        'begin_date="'+one['completed_begin_date']+'" ' +
                        'end_date="'+one['completed_end_date']+'">'+hours+'</div>';
                    tr.find('td:eq('+monthday+')').html(div);
                    hours_worked += hours;
                    salary_worked += parseInt(one['salary']);
                }
                if(one['armory_id']!='null') tr.find('td:eq('+monthday+') div.one').attr('armory_id',one['armory_id']);
                tr.find('td:eq('+monthday+') div.one').attr('post_id',one['post_id']);
                tr.find('td:eq('+monthday+') div.one').attr('plan',one['plan']);
                if(one['comment']!='null'){
                    tr.find('td:eq('+monthday+') div.one').attr('comment',one['comment']);
                }
            }
            //console.log('+++',salary_worked, salary_total);
            tr.find('td[name=hours] .total').text(hours_total);
            tr.find('td[name=hours] .worked').text(hours_worked);
            tr.find('td[name=salary] b.total').text(salary_total);
            tr.find('td[name=salary] b.worked').text(salary_worked);
        }
        checkShifts(service_id);
        sortTable(service_id);
    }

    /*
    var td_width_max = 0;
    $('table.timetable thead td[name=full_name]').each(function(){
        var td_width = $(this).width();
        if(td_width>td_width_max) td_width_max=td_width;
        console.log(td_width);
    });
    console.log(td_width_max);
    $('table.timetable thead td[name=full_name]').css('min-width',td_width_max+'px');
    */

    $('table.searchObject select').removeAttr('disabled');
    $('.loading').hide();
    $('.timetable').show();
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