$(document).ready(function() {
    //$('#statistics_list').hide();
    statistics_list = {};

    $('.searchObject').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='statistics_search') statistics_Ajax();
    });

    $('#statistics_list').on('click', '.click', function() {
        var cell_type = $(this).attr('cell_type');
        var row_id = $(this).parent('tr').attr('row_id');
        statistics_click(row_id,cell_type);
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
        onSelect: function(selectedDate) {
            var option = this.id == "from" ? "minDate" : "maxDate",
                instance = $( this ).data( "datepicker" ),
                date = $.datepicker.parseDate(
                    instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                    selectedDate, instance.settings);
            dates.not(this).datepicker("option", option, date);
        }
    });
});


function statistics_click(row_id,cell_type) {
    loading('begin');
    $('.result_count').hide();
    $('#object_list').hide();
    var ajax_array = {};
    ajax_array['object_list'] = JSON.stringify(statistics_list[row_id][cell_type+'_list']);
    $.ajax({ url:'/system/client/search/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data) {
            loading('end');
            if(data['error']!=null) {
                alert(data['error']);
            }
            else {
                $('.result_count').hide();
                $('#object_list a.item').remove();
                var count = 0;
                for(var key in data['object_list']) {
                    var object = data['object_list'][key];
                    var device_width = 0;
                    var device_string = '';
                    for(var key in object['device']) {
                        device_width += 36;
                        device_string += '<div class="btn_ui right" ' +
                        'icon="'+object['device'][key]['priority']+'" title="'+object['device'][key]['device__name']+'"><div class="icon"></div></div>';
                    }
                    var service_string = contract_string_set(object);
                    var item = '<a class="item" href="/system/client/'+object['client']+'/object/'+object['id']+'/"><table><tbody>' +
                        '<tr class="title"><td class="inline_block">' +
                        '<div class="service left">'+service_string+'</div>' +
                        '</td><td rowspan="2" style="width:'+device_width+'px">'+device_string+'</td></tr>' +
                        '<tr class="border_bottom"><td><div class="inline_block padding bold left">'+object['name']+'</div></td></tr>' +
                        '<tr><td colspan="2"><div class="inline_block padding left">Плательщик: '+object['client__name']+'</div><div class="inline_block padding right">'+object['address']+'</div></td></tr>' +
                        '</tbody></table></a>';
                    $('#object_list').append(item);
                    count ++;
                }
                $('.result_count').html('Найдено: '+count);
                $('.result_count').show();
                $('#object_list').show();
                if(count > 0) {
                    $('#object_list').show();
                } else {
                    $('#object_list').hide();
                }
            }
        }
    });
}


function statistics_Ajax() {
    loading('begin');
    $('#statistics_list').hide();
    $('#object_list').hide();
    $('.result_count').hide();
    var ajax_array = {};
    ajax_array['statistics_type'] = $('select[name=statistics_type]').val();
    ajax_array['begin_date'] = $('input#from').val();
    ajax_array['end_date'] = $('input#to').val();
    $.ajax({ url:'/system/analytics/statistics/ajax/get/', type:'get', dataType:'json', data:ajax_array,
        success: function(data) {
            loading('end');
            if(data['error']!=null) {
                alert(data['error']);
            }
            else if(data['statistics']!=null) {
                statistics_list = data['statistics']['list'];
                $('#statistics_list tbody tr').remove();
                $('#statistics_list thead td[name=head_title]').html(data['head_title']);
                var count = 0;
                var item_tr = '';
                for(key in data['statistics']['list']) {
                    if(key!='total'){
                        var item = data['statistics']['list'][key];
                        item_tr = '<tr class="row" row_id="'+key+'">' +
                        '<td class="padding right">'+item['full_name']+'</td>' +
                        '<td class="padding border_left click" cell_type="total_pay">'+item['total_pay_list'].length+'</td>' +
                        '<td class="padding border_left click" cell_type="total_free">'+item['total_free_list'].length+'</td>' +
                        '<td class="padding border_left click" cell_type="connected_pay">'+item['connected_pay_list'].length+'</td>' +
                        '<td class="padding border_left click" cell_type="connected_free">'+item['connected_free_list'].length+'</td>' +
                        '<td class="padding border_left click" cell_type="disconnected_pay">'+item['disconnected_pay_list'].length+'</td>' +
                        '<td class="padding border_left click" cell_type="disconnected_free">'+item['disconnected_free_list'].length+'</td>' +
                        '<td class="padding border_left click" cell_type="paused_pay">'+item['paused_pay_list'].length+'</td>' +
                        '<td class="padding border_left click" cell_type="paused_free">'+item['paused_free_list'].length+'</td></tr>';
                        $('#statistics_list tbody').append(item_tr);
                        count++;
                    }
                }
                if(count>=1){
                    $('#statistics_list').show();
                }

                item_tr = '<tr class="row" row_id="total">' +
                '<td class="padding right">Итого</td>' +
                '<td class="padding border_left click" cell_type="total_pay">'+data['statistics']['list']['total']['total_pay_list'].length+'</td>' +
                '<td class="padding border_left click" cell_type="total_free">'+data['statistics']['list']['total']['total_free_list'].length+'</td>' +
                '<td class="padding border_left click" cell_type="connected_pay">'+data['statistics']['list']['total']['connected_pay_list'].length+'</td>' +
                '<td class="padding border_left click" cell_type="connected_free">'+data['statistics']['list']['total']['connected_free_list'].length+'</td>' +
                '<td class="padding border_left click" cell_type="disconnected_pay">'+data['statistics']['list']['total']['disconnected_pay_list'].length+'</td>' +
                '<td class="padding border_left click" cell_type="disconnected_free">'+data['statistics']['list']['total']['disconnected_free_list'].length+'</td>' +
                '<td class="padding border_left click" cell_type="paused_pay">'+data['statistics']['list']['total']['paused_pay_list'].length+'</td>' +
                '<td class="padding border_left click" cell_type="paused_free">'+data['statistics']['list']['total']['paused_free_list'].length+'</td></tr>';
                $('#statistics_list tbody').append(item_tr);
            }
        }
    });
}