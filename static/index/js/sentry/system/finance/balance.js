$(document).ready(function() {
    $('#finance_list').hide();

    $('.searchObject').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='finance_search') finance_Ajax();
    });

    $('div[name=service_filter] .drop_list').on('click', 'li', function(){
        $(this).parents('.drop_list').attr('changed','changed');
        if( $(this).attr('checked')=='checked' ){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
        service_list('check');
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

    manager_select();
    service_list('check');
});


function manager_select(){
    var ajax_array = {};
    ajax_array['post_list'] = JSON.stringify([12,14,21]);
    $.ajax({ url:'/system/sentry_user/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['user_list']!=null){
                for(key in data['user_list']){
                    var user = data['user_list'][key];
                    if(!$('.tableInfo select[name=manager] optgroup').is('[label="'+user['post__name']+'"]')){
                        $('.tableInfo select[name=manager]').append('<optgroup label="'+user['post__name']+'">');
                    }
                    var item = '<option value="'+user['id']+'">'+user['full_name']+'</option>';
                    $('.tableInfo select[name=manager] optgroup[label="'+user['post__name']+'"]').append(item);
                }
            }
        }
    });
}


function service_list(action){
    if(action=='check'){
        var list_txt = '';
        $("div[name=service_filter] .drop_list [checked=checked] .txt").each(function(){
            list_txt += $(this).text()+', ';
        });
        $('[name=service_list]').text( list_txt.substr(0,list_txt.length-2) );
    }
    else if('get_list'){
        var service_list = [];
        $("div[name=service_filter] .drop_list [checked=checked]").each(function(){
            service_list.push( $(this).attr('service_type_id') );
        });
        return JSON.stringify(service_list);
    }
}


function finance_Ajax(){
    $('.loading').show();
    $('.result_count').hide();
    $('#finance_list').hide();
    var ajax_array = {};
    ajax_array['client'] = $('select[name=client]').val();
    ajax_array['warden_id'] = $('select[name=manager]').val();
    ajax_array['locality_id'] = $('select[name=locality]').val();
    ajax_array['service_list'] = service_list('get_list');
    ajax_array['begin_date'] = $('input#from').val();
    ajax_array['end_date'] = $('input#to').val();
    ajax_array['view_list'] = $('select[name=view_list]').val();
    $.ajax({ url:'/system/finance/ajax/balance/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['object_list']!=null){
                $('.loading').hide();
                $('#finance_list tbody tr').remove();
                var count = 0;
                for(key in data['object_list']){
                    var object = data['object_list'][key];
                    var show = false;
                    if(ajax_array['view_list']=='debt' && object['balance']<0){
                        show = true;
                    } else if(ajax_array['view_list']=='payment' && object['balance']>0){
                        show = true;
                    } else if(ajax_array['view_list']=='null'){
                        show = true;
                    }

                    if(show){
                        var service_string = contract_string_set(object);
                        var balance_bg = '';
                        if(object['balance']<0) balance_bg = ' bg_red';
                        else if(object['balance']>0) balance_bg = ' bg_green';
                        var item = '<tr class="row"><td><a class="item_td" href="/system/client/'+object['client_id']+'/object/'+object['object_id']+'/">' +
                            service_string+'<div class="clear"></div>' +
                            '<div class="block padding"><b>'+object['object__name']+'</b> ('+object['address']+')</div>' +
                            '<div class="block padding_bottom">Плательщик: '+object['client__name']+'</div>' +
                            '</a></td>' +
                            '<td class="padding">'+object['charge'].toFixed(2)+'</td>' +
                            '<td class="padding">'+object['payment'].toFixed(2)+'</td>' +
                            '<td class="padding'+balance_bg+'">'+object['balance'].toFixed(2)+'</td></tr>';
                        $('#finance_list tbody').append(item);
                        count++;
                    }
                }
                if(count>0){
                    $('.result_count').show().text('Найдено: '+count);
                    $('#finance_list').show();
                }
            }
        }
    });
}