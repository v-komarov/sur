$(document).ready(function() {
    $('#bonus_list').hide();
    $('.searchObject').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='bonus_ajax') bonus_Ajax();
    });

    $('#bonus_list tbody').on('click', '.click', function(){
        var sentry_user_id = $(this).parent('tr').find('td[label=sentry_user]').attr('sentry_user_id');
        var bonus_label = $(this).attr('label');
        bonus_click(sentry_user_id,bonus_label);
    });

    $('div[name=bonus_filter] .drop_list').on('click', 'li', function(){
        $(this).parents('.drop_list').attr('changed','changed');
        if( $(this).attr('checked')=='checked' ){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
        bonus_list('check');
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
    bonus_list('check');
});


function bonus_click(sentry_user_id,bonus_label){
    $('#object_count').hide();
    var ajax_array = {
        'sentry_user_id': sentry_user_id,
        'bonus_label': bonus_label,
        'begin_date': $('input#from').val(),
        'end_date': $('input#to').val() };
    $.ajax({ url:'/system/finance/ajax/bonus_click/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['object_list']!=null){
                $('.loading').hide();
                $('#object_list a.item').remove();
                var count = 0;
                for(key in data['object_list']){
                    var object = data['object_list'][key];
                    var device_width = 0;
                    var device_string = '';
                    for(var key in object['device_list']){
                        device_width += 36;
                        device_string += '<div class="btn_ui right" ' +
                        'icon="'+object['device_list'][key]['priority']+'" title="'+object['device_list'][key]['device__name']+'"><div class="icon"></div></div>';
                    }
                    var service_string = contract_string_set(object);
                    var item = '<a class="item" href="/system/client/'+object['client_id']+'/object/'+object['object_id']+'/"><table><tbody>' +
                        '<tr class="title"><td class="inline_block">' +
                        '<div class="service left">'+service_string+'</div>' +
                        '</td><td rowspan="2" style="width:'+device_width+'px">'+device_string+'</td></tr>' +
                        '<tr class="border_bottom"><td>' +
                        '<div class="inline_block padding bold left">'+object['object__name']+'</div>' +
                        '<div class="inline_block padding right">'+object['bonus_type_name']+': '+object['bonus_cost']+'</div>' +
                        '</td></tr>' +
                        '<tr><td colspan="2"><div class="inline_block padding left">Плательщик: '+object['client__name']+'</div><div class="inline_block padding right">'+object['address']+'</div></td></tr>' +
                        '</tbody></table></a>';
                    $('#object_list').append(item);
                    count++;
                }
                if(count>0){
                    $('#object_count').show().text('Объектов: '+count);
                    $('#object_list').show();
                }
            }
        }
    });
}


function bonus_list(action){
    if(action=='check'){
        var list_txt = '';
        $("div[name=bonus_filter] .drop_list [checked=checked] .txt").each(function(){
            list_txt += $(this).text()+', ';
        });
        $('[name=bonus_list]').text( list_txt.substr(0,list_txt.length-2) );
    }
    else if('get_list'){
        var bonus_list = [];
        $("div[name=bonus_filter] .drop_list [checked=checked]").each(function(){
            bonus_list.push( $(this).attr('bonus_id') );
        });
        return JSON.stringify(bonus_list);
    }
}


function manager_select(){
    var ajax_array = {};
    ajax_array['post_list'] = JSON.stringify([12,8,25]);
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


function bonus_Ajax(){
    $('#object_count').hide();
    $('#object_list').hide();
    $('.loading').show();
    $('#bonus_count').hide();
    $('#bonus_list').hide();
    var ajax_array = {};
    ajax_array['sentry_user_id'] = $('select[name=manager]').val();
    ajax_array['bonus_list'] = bonus_list('get_list');
    ajax_array['begin_date'] = $('input#from').val();
    ajax_array['end_date'] = $('input#to').val();
    $.ajax({ url:'/system/finance/ajax/bonus/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['bonus_list']!=null){
                $('.loading').hide();
                $('#bonus_list tbody tr').remove();
                var count = 0;
                var total_list = {'total':0};
                for(key in data['bonus_type_list']) total_list[data['bonus_type_list'][key]['label']] = 0;
                for(key in data['bonus_list']){
                    var bonus = data['bonus_list'][key];
                    var total = 0;
                    var tr = $('#bonus_list thead tr.title').clone().attr('class','row');
                    tr.find('td:not(:eq(0))').attr('class','border_left padding');
                    tr.find('td[label=sentry_user]').attr('sentry_user_id',key);
                    tr.find('td[label=sentry_user]').html(bonus['sentry_user__full_name']+' ('+bonus['sentry_user__post']+')');
                    // Перебераем все типы бонусов
                    for(key in data['bonus_type_list']){
                        var type = data['bonus_type_list'][key]['label'];
                        if(parseInt(bonus[type])>0){
                            total += parseFloat(bonus[type]);
                            total_list[type] += total;
                            total_list['total'] += total;
                            tr.find('td[label='+type+']').attr('class','border_left padding click');
                            tr.find('td[label='+type+']').html(bonus[type].toFixed(2));
                        } else {
                            tr.find('td[label='+type+']').html('');
                        }
                    }
                    tr.find('td[label=total]').html(total.toFixed(2));
                    $('#bonus_list tbody').append(tr);
                    count++;
                }
                var tr = $('#bonus_list thead tr.title').clone().attr('class','row');
                tr.find('td:eq(0)').text('Итого');
                for(key in total_list){
                    tr.find('td[label='+key+']')
                        .attr('class','border_left padding')
                        .text(total_list[key].toFixed(2));
                }
                $('#bonus_list tbody').append(tr);

                if(count>0){
                    $('#bonus_count').show().text('Найдено: '+count);
                    $('#bonus_list').show();
                }
            }
        }
    });
}