$(document).ready(function() {
    object_id = $('.tableInfo').attr('object_id');

    $('table.searchObject select[name=service_organization]').change(function(){
        ajaxSearch()
    });
    $('table.searchObject').on('click', '.switch', function() {
        if( $(this).attr('checked')=='checked' ){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
    });
    $('table.searchObject').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset') ajaxSearch();
    });

    $('table.tableCheckpoint').on('click', '.btn_ui', function() {
        shiftCancel();
        var action = $(this).attr('action');
        var tr = $(this).parents('tr.row');
        clickButton(tr,action);
    });

    $('#pop_shift').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        clickPopButton(action);
    });
    $('#pop_shift').on('change', 'select[name=service_organization]', function() {
        userSelect();
    });
    $('.pop').on('click', '.close', function() {
        shiftCancel();
    });
    $('#users_filter').hover(
        function() {

        },
        function() {
            if( $(this).attr('changed')=='changed' ){
                userSelect();
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
    $('#pop_shift tr[name=user_change] div.scrolling').on('click', '.item', function() {
        userChange(this);
    });

    ajaxSearch();
    setTime();
});

function ajaxSearch() {
    shiftCancel();
    $('select.selectObject').attr('disabled','disabled');
    $('.loading').show();
    $('#user_list').hide();
    var ajax_array = {};
    ajax_array['service_id'] =  $('select.selectObject :selected').attr('service_id');
    ajax_array['service_organization_id'] = $('select[name=service_organization]').val();
    ajax_array['status_list'] = [];
    $('table.tableCheckpoint').hide();
    $('table.searchObject tr.status td[checked=checked]').each(function() {
        var name_ = $(this).attr('name');
        ajax_array['status_list'].push( name_ );
        $('table#post_'+name_).show();
    });
    ajax_array['status_list'] = JSON.stringify( ajax_array['status_list'] );
    $.ajax({ url:'/post/checkpoint/ajax/get/', type:'get', dataType:'json', data:ajax_array ,
        success: function(data){
            setTable(data);
        }
    });
}

function setTable(data) {
    $('table.tableCheckpoint tbody tr').remove();
    var arrival = data['post_arrival'];
    var watch = data['post_watch'];
    var completed = data['post_completed'];
    for(var key in arrival){
        var tr = '<tr class="row" post_id="'+ arrival[key]['post_id'] +'" armed="'+ arrival[key]['armed'] +'">' +
            '<td name="service" service_id="'+ arrival[key]['service_id'] +'" service_organization_id="'+ arrival[key]['service_organization_id'] +'">' +
            '<div class="hide" name="object">'+ arrival[key]['object_name'] +'</div>' +
            '<a class="href_block" href="/system/client/'+ arrival[key]['client_id'] +'/object/'+ arrival[key]['object_id'] +'/">' +
            '<span name="service_name">'+ arrival[key]['service__short_name'] +'</span><div class="small nowrap">'+ arrival[key]['service__name'] +'</div></a></td>' +
            '<td name="shift_date" begin_date="'+ arrival[key]['begin_date'].substr(0,10) +'" end_date="'+ arrival[key]['end_date'].substr(0,10) +'">' +
            '<a class="href_block" href="/post/timetable/?year='+arrival[key]['year']+'&month='+arrival[key]['begin_date'].slice(3,5)+'&service_id='+arrival[key]['service_id']+'">' +
            '<div class="small small_top nowrap">'+ arrival[key]['begin_date'].substr(0,5) +' '+ arrival[key]['begin_date'].substr(-5) +'</div>' +
            '<div class="small nowrap">'+ arrival[key]['end_date'].substr(0,5) +' '+ arrival[key]['end_date'].substr(-5) +'</div></a></td>' +
            '<td class="cell hours">'+ parseFloat(arrival[key]['hours']) +'</td>' +
            '<td name="sentry_user" user_id="'+ arrival[key]['user_id'] +'">' +
            '<a class="href_block" href="/post/personal/?user_id='+arrival[key]['user_id']+'">' +
            '<span class="nowrap" name="user_full_name">'+ arrival[key]['user__full_name'] +'</span><div class="small nowrap">'+ arrival[key]['user__post'] +'</div></a></td>' +
            '<td class="cell" name="comment">'+ arrival[key]['comment'] +'</td>' +
            '<td><div class="btn_ui btn_38" action="arrival" icon="done" action="arrival" title="Согласно графику"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_38" action="timer" icon="timer" title="Заступление"><div class="icon"></div></div>' +
            '</td></tr>';
        $('table#post_arrival tbody.points').append(tr);
    }
    for(var key in watch){
        var tr = '<tr class="row" post_id="'+ watch[key]['post_id'] +'" armed="'+ watch[key]['armed'] +'" ' +
            'reason_begin_id="'+ watch[key]['reason_begin_id'] +'">' +
            '<td name="service" service_id="'+ watch[key]['service_id'] +'" service_organization_id="'+ watch[key]['service_organization_id'] +'">' +
            '<div class="hide" name="object">'+ watch[key]['object_name'] +'</div>' +
            '<a class="href_block" href="/system/client/'+ watch[key]['client_id'] +'/object/'+ watch[key]['object_id'] +'/info/">' +
            '<span name="service_name">'+ watch[key]['service__short_name'] +'</span><div class="small nowrap">'+ watch[key]['service__name'] +'</div></a></td>' +
            '<td name="shift_date" begin_date="'+ watch[key]['begin_date'].substr(0,10) +'" end_date="'+ watch[key]['end_date'].substr(0,10) +'">' +
            '<a class="href_block" href="/post/timetable/?year='+watch[key]['year']+'&month='+watch[key]['begin_date'].slice(3,5)+'&service_id='+watch[key]['service_id']+'">' +
            '<div class="small small_top nowrap">'+ watch[key]['begin_date'].substr(0,5) +' '+ watch[key]['begin_date'].substr(-5) +'</div>' +
            '<div class="small nowrap">'+ watch[key]['end_date'].substr(0,5) +' '+ watch[key]['end_date'].substr(-5) +'</div></a></td>' +
            '<td class="cell hours">'+ parseFloat(watch[key]['hours']) +'</td>' +
            '<td name="sentry_user" user_id="'+ watch[key]['user_id'] +'">' +
            '<a class="href_block" href="/post/personal/?user_id='+watch[key]['user_id']+'">' +
            '<span class="nowrap" name="user_full_name">'+ watch[key]['user__full_name'] +'</span><div class="small nowrap">'+ watch[key]['user__post'] +'</div></a></td>' +
            '<td class="cell" name="comment">'+ watch[key]['comment'] +'</td>' +
            '<td class="nowrap"><div class="btn_ui btn_38" action="timer" icon="timer" title="Закрыть смену"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_38" action="attention" icon="attention" title="Событие на посту"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_38" action="shift_user_change" icon="user_shift" title="Сменить сотрудника на посту"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_38" action="back" icon="back" title="Отменить заступление"><div class="icon"></div></div>' +
            '</td></tr>';
        $('table#post_watch tbody.points').append(tr);
    }
    for(var key in completed){
        var tr = '<tr class="row" post_id="'+ completed[key]['post_id'] +'" armed="'+ completed[key]['armed'] +'" ' +
            'reason_begin_id="'+ completed[key]['reason_begin_id'] +'" reason_end_id="'+ completed[key]['reason_end_id'] +'">' +
            '<td name="service" service_id="'+ completed[key]['service_id'] +'" service_organization_id="'+ completed[key]['service_organization_id'] +'">' +
            '<div class="hide" name="object">'+ completed[key]['object_name'] +'</div>' +
            '<a class="href_block" href="/system/client/'+ completed[key]['client_id'] +'/object/'+ completed[key]['object_id'] +'/info/">' +
            '<span name="service_name">'+ completed[key]['service__short_name'] +'</span><div class="small nowrap">'+ completed[key]['service__name'] +'</div></a></td>' +
            '<td name="shift_date" begin_date="'+ completed[key]['begin_date'].substr(0,10) +'" end_date="'+ completed[key]['end_date'].substr(0,10) +'">' +
            '<a class="href_block" href="/post/timetable/?year='+completed[key]['year']+'&month='+completed[key]['begin_date'].slice(3,5)+'&service_id='+completed[key]['service_id']+'">' +
            '<div class="small small_top nowrap">'+ completed[key]['begin_date'].substr(0,5) +' '+ completed[key]['begin_date'].substr(-5) +'</div>' +
            '<div class="small nowrap">'+ completed[key]['end_date'].substr(0,5) +' '+ completed[key]['end_date'].substr(-5) +'</div></a></td>' +
            '<td class="cell hours">'+ parseFloat(completed[key]['hours']) +'</td>' +
            '<td name="sentry_user" user_id="'+ completed[key]['user_id'] +'">' +
            '<a class="href_block" href="/post/personal/?user_id='+completed[key]['user_id']+'">' +
            '<span class="nowrap" name="user_full_name">'+ completed[key]['user__full_name'] +'</span><div class="small nowrap">'+ completed[key]['user__post'] +'</div></a></td>' +
            '<td class="cell" name="comment">'+ completed[key]['comment'] +'</td>' +
            '<td class="nowrap"><div class="btn_ui btn_38" action="edit" icon="edit" title="Редактировать смену"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_38" action="back" icon="back" title="Отменить заступление"><div class="icon"></div></div>' +
            '</td></tr>';
        $('table#post_completed tbody.points').append(tr);
    }

    $('select.selectObject').removeAttr('disabled');
    $('.loading').hide();
    $('#user_list').show();
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