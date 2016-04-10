$(document).ready(function() {
    $('#pop_incident .header').on('click', '.close', function() { incident_Cancel(); });
    client_id = $('#incident_list').attr('client_id');
    object_id = $('#incident_list').attr('object_id');

    $('body').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='incident_add'){
            incident_Edit('add');
        }
        else if(action=='incident_list_refresh'){
            incident_Refresh();
        }
        else if(action=='incident_save'){
            incident_Update();
        }
        else if(action=='incident_reset'){
            var incident_id = 'add';
            if($('#incident_list tbody tr.row').is(".hover")){
                incident_id = $('#incident_list tbody .hover').attr('incident_id');
            }
            incident_Edit(incident_id);
        }
        else if(action=='incident_delete'){
            if (confirm('Удалить событие?')){
                incident_Delete();
            }
        }
    });

    $(".tableInfo tbody.show").on('click', 'tr.row', function() {
        if($.inArray('system.client', lunchbox['permissions'])>=0) {
            incident_Edit( $(this).attr('incident_id') );
        }
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
/*    $('input[name=incident_date], input[name=arrival_date]').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        yearRange: "2000:2020",
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });
    */
    $('input[name=incident_date], input[name=arrival_date]').datetimepicker({
        dateFormat: "dd.mm.yy",
        changeYear: true,
        buttonImageOnly: true,
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });

    incident_Refresh();
    incident_Validate();
});


function incident_Refresh(){
    $('#incident_list tbody tr.row').remove();
    $('.loading').show();
    $('.pop').hide();
    $.ajax({ url:'/system/client/object/incident/ajax/get/?object_id='+object_id, type:'get', dataType:'json', traditional:true,
        success: function(data){
            for(var key in data['incident_list']){
                var incident = data['incident_list'][key];
                var arrival_time = '';
                if(incident['arrival_time']) arrival_time = incident['arrival_time'];
                var tr = '<tr class="row" incident_id="'+incident['id']+'">' +
                    '<td class="cell" name="incident_date">'+incident['incident_date']+'</td>' +
                    '<td class="cell" name="incident_arrival">'+arrival_time+'</td>' +
                    '<td class="cell" name="incident_type" incident_id="'+incident['incident_type_id']+'">'+incident['incident_type']+'</td>' +
                    '<td class="cell" name="comment">'+incident['comment']+'</td>' +
                    '<td class="cell">'+incident['log'][0]['sentry_user']+'</td></tr>';
                $('#incident_list tbody').append(tr);
            }
            $('.loading').hide();
        }
    });
}


function incident_Update() {
    var ajax_array = {'object_id': object_id};
    if($('#incident_list tbody tr.row').is(".hover")){
        ajax_array['incident_id'] = $('#incident_list tbody .hover').attr('incident_id');
    } else {
        ajax_array['incident_id'] = 'add';
    }
    ajax_array['incident_date'] = $('#pop_incident input[name=incident_date]').val();
    ajax_array['arrival_date'] = $('#pop_incident input[name=arrival_date]').val();
    ajax_array['incident_type_id'] = $('#pop_incident select[name=incident_type]').val();
    var comment = $('#pop_incident textarea[name=comment]').val();
    if(comment) ajax_array['comment'] = comment;
    $.ajax({ url:'/system/client/object/incident/ajax/update/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                incident_Refresh();
                popMessage('Сохранено','green');
            }
        }
    });
}


function incident_Delete() {
    var incident_id = $('#incident_list tbody .hover').attr('incident_id');
    if(!!incident_id){
        $.ajax({ url:'/system/client/object/incident/ajax/delete/?incident_id='+incident_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    incident_Refresh();
                    popMessage('Удалено','green');
                }
            }
        });
    }
}


function incident_Edit(incident_id) {
    incident_Cancel();
    if(incident_id=='add'){
        $('#pop_incident [action=incident_delete]').hide();
        popMenuPosition('#pop_incident','single');
    }
    else {
        $('#pop_incident [action=incident_delete]').show();
        $('#incident_list tbody tr[incident_id='+incident_id+']').attr('class','row hover');
        $.ajax({ url:'/system/client/object/incident/ajax/get/?incident_id='+incident_id, type:'get', dataType:'json', traditional:true,
            success: function(data){
                var incident = data['incident_list'][0];
                $('#pop_incident [name=incident_date]').val( incident['incident_date'] );
                if(incident['arrival_date']){
                    $('#pop_incident [name=arrival_date]').val( incident['arrival_date'] );
                    $('#pop_incident [name=arrival_minute]').text( incident['arrival_time']+' м.');
                }
                $('#pop_incident select[name=incident_type] :contains("'+ incident['incident_type']+'")').attr("selected", "selected");
                $('#pop_incident [name=comment]').val( incident['comment'] );
                var log_txt = '';
                for(key in incident['log']){
                    var log = incident['log'][key];
                    log_txt += '<div class="padding" title="'+log['log_type']+'">' +
                    log['log_type']+' ['+log['create_date']+'] '+log['sentry_user']+'</div>';
                }
                $('#pop_incident [name=log]').html(log_txt);
                popMenuPosition('#pop_incident','single');
            }
        });
    }
}


function incident_Cancel() {
    $('#pop_incident').hide();
    $('#incident_list tbody tr.hover').attr('class','row');
    $('#pop_incident input').val('');
    $('#pop_incident textarea').val('');
    $('#pop_incident [name=arrival_minute]').text('');
    $('#pop_incident [name=log]').text('');

}


function incident_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            incident_Update();
        },
        showErrors: function(map, list) { // there's probably a way to simplify this
            var focussed = document.activeElement;
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("close", {
                    currentTarget: focussed
                }, true)
            }
            this.currentElements.removeAttr("title").removeClass("ui-state-highlight");
            $.each(list, function(index, error) {
                $(error.element).attr("title", error.message).addClass("ui-state-highlight");
            });
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("open", {
                    target: focussed
                });
            }
        }
    });

    // use custom tooltip; disable animations for now to work around lack of refresh method on tooltip
    $("#pop_incident form").tooltip({
        show: false,
        hide: false
    });

    $("#pop_incident form").validate({ // validate the comment form when it is submitted
        rules: {
            incident_date: {
                required: true,
                minlength: 15
            },
            comment: {
                required: true,
                minlength: 5
            }
        },
        messages: {
            incident_date: {
                required: "Необходим контракт",
                minlength: "Неверный формат"
            },
            comment: {
                required: "Необходим комментарий",
                minlength: "Минимум 5 символов"
            }
        }
    });
}