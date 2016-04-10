$(document).ready(function() {

    $('#users_filter').hover(
        function() {

        },
        function() {
            if( $(this).attr('changed')=='changed' ){
                var service_id = $('#pop_users').attr('service_id');
                var service_organization_id = $('#pop_users #service_organization p.hover').attr('service_organization_id');
                userSelect(service_id,service_organization_id)
            }
        }
    );

    $('#users_filter').on('click', 'li', function() {
        $(this).parents('#users_filter').attr('changed', 'changed');
        if ($(this).attr('checked') == 'checked') {
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked', 'checked');
        }
    });

    $(document).on('click', '.timetable .btn_ui[action=user_add]', function() {
        var service_id = $(this).parents('table.timetable').attr('service_id');
        userSelect(service_id,'none');
    });
    $(document).on('click', '.timetable tbody [action=user_drop]', function() {
        var service_id = $(this).parents('table.timetable').attr('service_id');
        var user_id = $(this).parents('tr.row').attr('user_id');
        userTime(service_id,user_id);
    });
    $('#pop_users #service_organization').on('click', '.item', function() {
        var service_id = $('#pop_users').attr('service_id');
        var service_organization_id = $(this).attr('service_organization_id');
        userSelect(service_id,service_organization_id);
    });
    $('#pop_users #users').on('click', '.item', function() {
        var service_id = $(this).parents('#pop_users').attr('service_id');
        var user_id = $(this).attr('user_id');
        var full_name = $(this).text();
        var user_class = 'none';
        if( $(this).hasClass('red') ) user_class = 'red';
        userAdd(service_id,user_id,full_name,user_class);
    });
    $('#pop_user_time').on('click', '.button', function() {
        var action = $(this).attr('action');
        var service_id = $(this).parents('#pop_user_time').attr('service_id');
        var user_id = $(this).parents('#pop_user_time').attr('user_id');
        userShifts(action,service_id,user_id);
    });
});


function userSelect(service_id,service_organization_id) {
    console.log('userSelect');
    var ajax_array = {};
    ajax_array['service_id'] = service_id;
    ajax_array['service_organization_id'] = service_organization_id;
    ajax_array['users_exist'] = [];
    ajax_array['users_filter'] = [];
    $('table.timetable[service_id='+service_id+'] tbody tr.row').each(function() {
        var user_id = $(this).attr('user_id');
        ajax_array['users_exist'].push(user_id);
    });
    $('#pop_users #users_filter li[checked=checked]').each(function() {
        var filter = $(this).attr('filter');
        ajax_array['users_filter'].push(filter);
    });
    ajax_array['users_exist'] = JSON.stringify(ajax_array['users_exist']);
    ajax_array['users_filter'] = JSON.stringify(ajax_array['users_filter']);
    $.ajax({ url:'/system/post/timetable/get_users/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            $('#pop_users').attr('service_id',data['service']['id']);
            $('#pop_users #object td:eq(0)').text(data['service']['object_name']);
            $('#pop_users #object td:eq(1)').text(data['service']['service_name']);
            $('#pop_users div.scrolling p').remove();
            if(service_organization_id=='none'){
                service_organization_id = data['service']['service_organization_id'];
            } else {
                $('#pop_users #service_organization p.hover').attr('class','item');
            }
            for(service_organization_key in data['user_list']) {
                var hover = '';
                var user_class = 'item';
                if(service_organization_key!=data['service']['service_organization_id']) {
                    user_class += ' red';
                }
                //if(service_organization_key==service_organization_id) {
                hover = ' hover';
                var users = data['user_list'][service_organization_key]['list'];
                for(key in users) {
                    var user = '<p class="'+user_class+'" user_id="'+users[key]['user_id']+'">'+users[key]['full_name']+'</p>';
                    $('#pop_users #users div.scrolling').append(user);
                }
                //}
                var service_organization = '<p service_organization_id="'+service_organization_key+'" class="item'+hover+'">'+data['user_list'][service_organization_key]['service_organization']+'</p>';
                $('#pop_users #service_organization div.scrolling').append(service_organization);
            }
            popMenuPosition('#pop_users','single');
        }
    });
}


function userTime(service_id,user_id) {
    var tr = $('table.timetable[service_id='+service_id+'] tr.row[user_id='+user_id+']');
    var worked = 0;
    var total = 0;
    tr.find('td').each(function() {
        if($(this).hasClass('planned')) {
            total += parseFloat($(this).text());
        } else if($(this).hasClass('worked')) {
            worked += parseFloat($(this).text());
            total += parseFloat($(this).text());
        }
    });
    popMenuPosition('#pop_user_time','single');
    $('#pop_user_time').attr('service_id',service_id).attr('user_id',user_id);
    var full_name = tr.find('[name=full_name] a').text();
    $('#pop_user_time .header b').text(full_name);
    var td_offset = tr.find('.btn_ui[action=user_drop]').offset();
    var pop_width = $('#pop_user_time').width();
    td_offset['top'] -= 29;
    td_offset['left'] -= pop_width+3;
    $('#pop_user_time').offset(td_offset);
}


function userShifts(action,service_id,user_id) {
    var tr = $('table.timetable[service_id='+service_id+'] tr.row[user_id='+user_id+']');
    if(action=='delete_user') {
        var ajax_array = {};
        ajax_array['shifts'] = [];
        tr.find('div.one').each(function() {
            var post_id = $(this).attr('post_id');
            if(post_id){ ajax_array['shifts'].push(post_id) }
        });
        ajax_array['shifts'] = JSON.stringify(ajax_array['shifts']);
        $.ajax({ url:'/system/post/timetable/remove_shift/', type:'post', dataType:'json', data:ajax_array,
            success: function(data) {
                tr.remove();
                $('#pop_user_time').hide();
                checkShifts(service_id);
            }
        });
    }
    else if(action=='delete_unworked') {
        var ajax_array = {};
        ajax_array['shifts'] = [];
        tr.find('div.one:not([status=worked])').each(function() {
            var post_id = $(this).attr('post_id');
            if(post_id){ ajax_array['shifts'].push(post_id) }
        });
        ajax_array['shifts'] = JSON.stringify(ajax_array['shifts']);
        $.ajax({ url:'/system/post/timetable/remove_shift/', type:'post', dataType:'json', data:ajax_array,
            success: function(data) {
                tr.find('td div.one:not([status=worked])').remove();
                $('#pop_user_time').hide();
                checkShifts(service_id);
            }
        });
    }
}


function userAdd(service_id,user_id,full_name,user_class) {
    var user_class_ = '';
    if(user_class=='red') user_class_ = ' class="red"';
    $('#pop_users #users p[user_id='+user_id+']').remove();
    var tr = $('table.month_table thead tr').clone();
    tr.attr('class','row').attr('user_id',user_id);
    tr.find('td').text('');
    var td = '<div class="nowrap right">' +
        '<a href="/system/post/personal/'+user_id+'/"'+user_class_+'>'+full_name+'</a>' +
        '<div class="btn_ui btn_28" action="user_drop" icon="time" title="Удалить неотработанные смены"><div class="icon"></div></div>' +
        '</div>';
    tr.find('td[name=full_name]').html(td);
    tr.find('td[name=hours]').html('<b class="worked">0</b> / <b class="total">0</b>');
    tr.find('td[name=salary]').html('<b class="worked">0</b> / <b class="total">0</b>');

    $('table.timetable[service_id='+service_id+'] tbody').prepend(tr);
    checkShifts(service_id);
    sortTable(service_id);
}