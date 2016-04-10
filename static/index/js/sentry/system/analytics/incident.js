$(document).ready(function() {
    $('#incident_list').hide();

    $('.searchObject').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='incident_search') incident_Ajax();
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    var dates = $('#from, #to').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        showButtonPanel: true,
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        },

        defaultDate: "+1w",
        numberOfMonths: 1,
        onSelect: function(selectedDate){
            var option = this.id == "from" ? "minDate" : "maxDate",
                instance = $( this ).data( "datepicker" ),
                date = $.datepicker.parseDate(
                    instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                    selectedDate, instance.settings);
            dates.not(this).datepicker("option", option, date);
        }
    });

});


function incident_Ajax(){
    $('.loading').show();
    $('.result_count').hide();
    $('#incident_list').hide();
    var ajax_array = {};
    ajax_array['client_id'] = $('select[name=client]').val();
    ajax_array['incident_type_id'] = $('select[name=incident_type]').val();
    ajax_array['begin_date'] = $('input#from').val();
    ajax_array['end_date'] = $('input#to').val();
    ajax_array['arrival_min'] = $('input[name=arrival_min]').val();
    ajax_array['arrival_max'] = $('input[name=arrival_max]').val();
    $.ajax({ url:'/system/analytics/ajax/incident/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['incident_list']!=null){
                $('.loading').hide();
                $('#incident_list tbody tr').remove();
                var count = 0;
                for(key in data['incident_list']){
                    var incident = data['incident_list'][key];
                    var service_string = contract_string_set(incident);
                    var item = '<tr class="row" incident_id="'+incident['incident_id']+'">' +
                        '<td class="cell">'+incident['incident_id']+'</td>' +
                        '<td class="border_left click_2" colspan="3"><a class="inline_block" href="/system/client/'+incident['client_id']+'/object/'+incident['object_id']+'/">' +
                        '<div class="service_string">'+service_string+'</div><div class="clear"></div>' +
                        '<div class="inline_block padding left"><b>'+incident['object__name']+'</b> ('+incident['address']+')</div>' +
                        '<div class="clear"></div>' +
                        '<div class="border_top">' +
                        '<div class="block padding left">'+incident['incident_date']+' ('+incident['arrival_time']+')</div>' +
                        '<div class="block padding left border_left border_right">'+incident['incident_type']+'</div>' +
                        '<div class="block padding left">'+incident['add_user__full_name']+'</div></div></a></td>' +
                        '<td class="padding border_left">'+incident['comment']+'</td></tr>';
                    $('#incident_list tbody').append(item);
                    count++;
                }
                if(count>0){
                    $('.result_count').show().text('Найдено: '+count);
                    $('#incident_list').show();
                }
            }
        }
    });
}