$(document).ready(function() {

});

function clickButton(tr,action) {
    console.log(action);
    var ajax_array = {};
    ajax_array['post_id'] = tr.attr('post_id');
    var table_id = tr.parents('.tableInfo').attr('id');
    if(action=='arrival') {
        $.ajax({ url:'/system/post/checkpoint/ajax/shift_by_plan/', type:'post', dataType:'json', data:ajax_array,
            success: function(data){
                ajaxSearch();
            }
        });
    }
    else if(action=='timer' && table_id=='post_arrival') {
        shiftEdit(tr,'shift_begin');
    }
    else if(action=='attention') {
        incidentEdit(tr,'incident');
    }
    else if(action=='back') {
        var post_id = tr.parents('table.tableCheckpoint').attr('id');
        console.log(post_id);
        var action_ = 'shift_cancel';
        if(post_id=='post_completed') {
            action_ = 'shift_uncompleted';
        }
        $.ajax({ url:'/system/post/checkpoint/ajax/'+action_+'/', type:'post', dataType:'json', data:ajax_array,
            success: function(data){
                ajaxSearch();
            }
        });
    }

    else if(action=='shift_user_change') {
        shiftEdit(tr,action);
    }
    else if(action=='timer' && table_id=='post_watch') {
        shiftEdit(tr,'shift_completed');
    }
    else if(action=='edit') {
        shiftEdit(tr,'shift_edit');
    }
}

function clickPopButton(action) {
    var pop_action = $('#pop_shift').attr('action');
    if(action=='shift_user_change') {
        if( $('#pop_shift tr[name=user_change]').is(":visible") ) {
            $('#pop_shift tr[name=user_change]').hide();
        } else {
            userSelect();
        }
    }
    else if(action=='shift_user_change_save') {
        shiftSave('shift_user_change');
    }
    else if(action=='timer' && pop_action=='shift_begin') {
        shiftSave('shift_begin');
    }
    else if(action=='timer' && pop_action=='shift_completed') {
        shiftSave('shift_completed');
    }
    else if(action=='save' && pop_action=='shift_edit') {
        shiftSave('shift_edited_save');
    }
}

function shiftSave(action) {
    var tr = $('table.tableCheckpoint tr.hover');
    var ajax_array = {};
    ajax_array['post_id'] = tr.attr('post_id');
    ajax_array['service_id'] = tr.find('td[name=service]').attr('service_id');
    ajax_array['sentry_user_id'] = $('#pop_shift tr[name=sentry_user]').attr('user_id');
    if(action=='shift_completed') {
        var tr_name = 'end';
    } else {
        var tr_name = 'begin';
    }

    ajax_array['reason_id'] = $('#pop_shift tr[name='+tr_name+'] select[name=reason]').val();
    var date = $('#pop_shift tr[name='+tr_name+']').attr('date');
    var time = $('#pop_shift tr[name='+tr_name+'] select[name=time] :selected').text();
    ajax_array['time'] = date+' '+time;

    if(action=='shift_edited_save') {
        ajax_array['reason_begin_id'] = $('#pop_shift tr[name=begin] select[name=reason]').val();
        ajax_array['reason_end_id'] = $('#pop_shift tr[name=end] select[name=reason]').val();
        var begin_time = $('#pop_shift tr[name=begin] select[name=time] :selected').text();
        var end_time = $('#pop_shift tr[name=end] select[name=time] :selected').text();
        ajax_array['completed_begin_time'] = date+' '+begin_time;
        ajax_array['completed_end_time'] = date+' '+end_time;
    }

    if( $('#pop_shift tr[name=armory]').is(":visible") ) {
        ajax_array['armory_id'] = $('#pop_shift tr[name=armory] select').val();
    }
    ajax_array['comment'] = $('#pop_shift tr[name=comment] textarea').val();
    $.ajax({ url:'/system/post/checkpoint/ajax/'+action+'/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']) {
                alert(data['error']);
            } else {
                ajaxSearch();
            }
        }
    });
}

function setArmory(service_id,user_id,monthday,armed) {
    $('#pop_shift tr[name=armory] select option').removeAttr('style');
    $('#pop_shift tr[name=armory] select option').removeAttr('selected');
    $('#pop_shift tr[name=armory] select option[value=none]').attr('selected','selected');
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

function userSelect() {
    $('#pop_shift tr[name=user_change]').show();
    var ajax_array = {};
    ajax_array['service_id'] = $('table.tableCheckpoint tr.hover td[name=service]').attr('service_id');
    ajax_array['users_exist'] = JSON.stringify([]);
    ajax_array['service_organization_id'] = $('#pop_shift tr[name=user_change] select[name=service_organization]').val();
    ajax_array['users_filter'] = [];
    $('#pop_shift #users_filter li[checked=checked]').each(function() {
        var filter = $(this).attr('filter');
        ajax_array['users_filter'].push(filter);
    });
    ajax_array['users_filter'] = JSON.stringify(ajax_array['users_filter']);
    $.ajax({ url:'/system/post/timetable/get_users/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            $('#pop_shift tr[name=user_change] div.scrolling p').remove();

            for(service_organization_key in data['users']) {
                var hover = '';
                var user_class = 'item';
                if(service_organization_key!=data['service']['service_organization_id']) {
                    user_class += ' red';
                }
                if(service_organization_key==ajax_array['service_organization_id']) {
                    hover = ' hover';
                    var users = data['users'][service_organization_key]['users'];
                    for(key in users) {
                        var user = '<p class="'+user_class+'" user_id="'+users[key]['user_id']+'">'+users[key]['full_name']+'</p>';
                        $('#pop_shift tr[name=user_change] div.scrolling').append(user);
                    }
                }
                var service_organization = '<p service_organization_id="'+service_organization_key+'" class="item'+hover+'">'+data['users'][service_organization_key]['service_organization']+'</p>';
                $('#pop_users #service_organization div.scrolling').append(service_organization);
            }
        }
    });
}

function userChange(this_) {
    var user_id = $(this_).attr('user_id');
    var full_name = $(this_).text();
    $('#pop_shift tr[name=sentry_user] td:eq(0)').text('Сотрудник');
    $('#pop_shift tr[name=sentry_user]').attr('user_id',user_id);
    $('#pop_shift tr[name=sentry_user] span[name=fullname]').text(full_name);
    $('#pop_shift tr[name=user_change]').hide();
}

function userShift(this_) {
    var user_id = $(this_).attr('user_id');
    var full_name = $(this_).text();
    $('#pop_shift tr[name=sentry_user]').attr('user_id',user_id);
    $('#pop_shift tr[name=sentry_user] span[name=fullname]').text(full_name);
    $('#pop_shift tr[name=user_change]').hide();
}

function shiftEdit(tr,action) {
    popMenuPosition('#pop_shift','single');
    tr.attr('class','row hover');
    var table_id = tr.parents('.tableInfo').attr('id');
    var post_id = tr.attr('post_id');
    var object_name = tr.find('div[name=object]').text();
    var service_id = tr.find('td[name=service]').attr('service_id');
    var service_organization_id = tr.find('td[name=service]').attr('service_organization_id');
    var service_name = tr.find('td[name=service] span[name=service_name]').text();
    var user_id = tr.find('td[name=sentry_user]').attr('user_id');
    var user__full_name = tr.find('td[name=sentry_user] span[name=user_full_name]').text();
    var armed = tr.attr('armed');
    var begin_date = tr.find('td[name=shift_date]').attr('begin_date');
    var end_date = tr.find('td[name=shift_date]').attr('end_date');
    var planned_begin_date = tr.find('td[name=shift_date] div.small_top').text().substr(-5);
    var planned_end_date = tr.find('td[name=shift_date] div.small').text().substr(-5);
    var comment = tr.find('td[name=comment]').text();

    $('#pop_shift').attr('action',action);
    $('#pop_shift div.header b').text('Объект: '+object_name);
    $('#pop_shift tr[name=service] td[name=service_name] b').text(service_name);
    $('#pop_shift tr[name=sentry_user]').attr('user_id', user_id);
    $('#pop_shift tr[name=sentry_user] span[name=fullname]').text(user__full_name);
    $('#pop_shift select[name=service_organization] [value='+service_organization_id+']').attr('selected','selected');
    $('#pop_shift select[name=reason]').removeAttr('selected');
    $('#pop_shift div[action=shift_user_change]').show();
    $('#pop_shift tr[name=begin]').show();
    $('#pop_shift tr[name=end]').show();
    $('#pop_shift tr[name=buttons] span[action=save]').hide();
    if(action=='shift_begin') {
        $('#pop_shift tr[name=end]').hide();
        $('#pop_shift tr[name=sentry_user] td:eq(0)').text('Сотрудник');
        $('#pop_shift tr[name=begin] td:eq(0)').text('Заступление');
        $('#pop_shift tr[name=user_change]').hide();
        $('#pop_shift tr[name=buttons] span[action=shift_user_change_save]').hide();
        $('#pop_shift tr[name=buttons] span[action=timer]').show();
        $('#pop_shift tr[name=buttons] span[action=timer] .txt').text('Заступил');
    }
    else if(action=='shift_user_change') {
        $('#pop_shift tr[name=end]').hide();
        $('#pop_shift tr[name=sentry_user] td:eq(0)').text('Сейчас на посту');
        $('#pop_shift tr[name=begin] td:eq(0)').text('Сменил');
        $('#pop_shift select[name=reason] [value="2"]').attr('selected','selected');
        $('#pop_shift tr[name=buttons] span[action=shift_user_change_save]').show();
        $('#pop_shift tr[name=buttons] span[action=timer]').hide();
        userSelect();
    }
    else if(action=='shift_completed') {
        $('#pop_shift tr[name=begin]').hide();
        $('#pop_shift div[action=shift_user_change]').hide();
        $('#pop_shift tr[name=sentry_user] td:eq(0)').text('Сотрудник');
        $('#pop_shift tr[name=end] td:eq(0)').text('Закрытие смены');
        $('#pop_shift tr[name=user_change]').hide();
        $('#pop_shift select[name=reason] [value="1"]').attr('selected','selected');
        $('#pop_shift tr[name=buttons] span[action=shift_user_change_save]').hide();
        $('#pop_shift tr[name=buttons] span[action=timer]').show();
        $('#pop_shift tr[name=buttons] span[action=timer] .txt').text('Закрыть смену');
    }
    else if(action=='shift_edit') {
        var reason_begin_id = tr.attr('reason_begin_id');
        var reason_end_id = tr.attr('reason_end_id');
        $('#pop_shift tr[name=begin]').show();
        $('#pop_shift div[action=shift_user_change]').hide();
        $('#pop_shift tr[name=sentry_user] td:eq(0)').text('Сотрудник');
        $('#pop_shift tr[name=end] td:eq(0)').text('Закрытие смены');
        $('#pop_shift tr[name=user_change]').hide();
        $('#pop_shift tr[name=begin] select[name=reason] [value='+reason_begin_id+']').attr('selected','selected');
        $('#pop_shift tr[name=end] select[name=reason] [value='+reason_end_id+']').attr('selected','selected');
        $('#pop_shift tr[name=buttons] span[action=shift_user_change_save]').hide();
        $('#pop_shift tr[name=buttons] span[action=timer]').hide();
        $('#pop_shift tr[name=buttons] span[action=save]').show();
    }

    $('#pop_shift tr[name=begin]').attr('date',begin_date);
    $('#pop_shift tr[name=begin] select[name=time] :contains('+planned_begin_date+')').attr('selected','selected');
    $('#pop_shift tr[name=end]').attr('date',end_date);
    $('#pop_shift tr[name=end] select[name=time] :contains('+planned_end_date+')').attr('selected','selected');
    if(armed==1) {
        $('#pop_shift tr[name=armory]').show();
    } else {
        $('#pop_shift tr[name=armory]').hide();
        $('#pop_shift tr[name=armory] select [value=none]').attr('selected','selected');
    }
    $('#pop_shift tr[name=comment] textarea').val(comment);
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

function shiftCancel(){
    var tr = $('table.tableCheckpoint tbody tr.hover').attr('class','row');
    $('.pop').hide();
}