$(document).ready(function() {

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('.datepicker').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        showButtonPanel: true,
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });

});


function incidentEdit(tr) {
    popMenuPosition('#pop_incident','single');
    tr.attr('class','row hover');
    var object_name = tr.find('div[name=object]').text();
    var service_id = tr.find('td[name=service]').attr('service_id');
    var service_organization_id = tr.find('td[name=service]').attr('service_organization_id');
    var begin_date = tr.find('td[name=shift_date]').attr('begin_date');

    $('#pop_incident div.header b').text('Добавление события');
    $('#pop_incident tr[name=service] [name=object_name] b').text(object_name);
    $('#pop_incident tr[name=begin]').attr('date',begin_date);
    $('#pop_incident tr[name=end]').attr('date',begin_date);
    $('#pop_incident tr[name=comment] textarea').val('');
}


function incidentSave(action) {
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
    ajax_array['reason'] = $('#pop_shift tr[name='+tr_name+'] select[name=reason]').val();
    var date = $('#pop_shift tr[name='+tr_name+']').attr('date');
    var time = $('#pop_shift tr[name='+tr_name+'] select[name=time] :selected').text();
    ajax_array['time'] = date+' '+time;

    if( $('#pop_shift tr[name=armory]').is(":visible") ) {
        ajax_array['armory_id'] = $('#pop_shift tr[name=armory] select').val();
    }
    ajax_array['comment'] = $('#pop_shift tr[name=comment] textarea').val();
    $.ajax({ url:'/post/checkpoint/ajax/'+action+'/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']) {
                alert(data['error']);
            } else {
                ajaxSearch();
            }
        }
    });
}
