$(document).ready(function() {

    $('body').on('click', '.switch', function() {
        if( $(this).attr('checked')=='checked' ){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
    });

    $('.searchObject').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='finance_search') financeAjax();
        else if(action=='finance_reset') financeReset();
    });

    $('div[name=service_filter] .drop_list').on('click', 'li', function(){
        $(this).parents('.drop_list').attr('changed','changed');
        if( $(this).attr('checked')=='checked' ){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
        serviceList('check');
    });

    $('.searchObject [name=client]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/client/ajax/search/', type:'get', dataType:'json',
                data:{name:request.term, limit:10},
                success: function(data) {
                    response($.map(data['client_list'], function(item) {
                        return { label:item.name, id:item.id }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id', ui.item.id);
            } else {
                $(this).val('').removeAttr('item_id');
            }
        },
        //select: function(event, ui) { $('tr#holding__name').attr('holding_id', ui.item.holding_id); },
        minChars: 2, zIndex: 100, deferRequestBy: 200
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

    managerSelect();
    serviceList('check');
});


function financeReset() {
    $('.searchObject select, .searchObject input:not(.datepicker)').val('');
    $('#charge_list tbody tr[name=row-warden]:not(.hide)').remove();
    $('#charge_list tbody tr[name=row-service_organization]:not(.hide)').remove();
    $('#charge_list tbody tr[name=row-total] td[name]').text('');
    $('#charge_list [name=period],' +
    '#charge_list [name=connected_count], ' +
    '#charge_list [name=connected_total], ' +
    '#charge_list [name=disconnected_count], ' +
    '#charge_list [name=connected_disconnected]').text('');

    $('#finance_list tbody tr').remove();
}


function managerSelect() {
    var ajax_array = {};
    ajax_array['post_list'] = JSON.stringify([8,12,14,21]);
    $.ajax({ url:'/system/sentry_user/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            }
            else if(data['user_list']!=null){
                for(key in data['user_list']){
                    var user = data['user_list'][key];
                    if(!$('.tableInfo select[name=warden] optgroup').is('[label="'+user['post__name']+'"]')){
                        $('.tableInfo select[name=warden]').append('<optgroup label="'+user['post__name']+'">');
                    }
                    var item = '<option value="'+user['id']+'">'+user['full_name']+'</option>';
                    $('.tableInfo select[name=warden] optgroup[label="'+user['post__name']+'"]').append(item);
                }
            }
        }
    });
}


function serviceList(action) {
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


function financeAjax() {
    loading('begin');
    $('.result_count').hide();
    $('#finance_list').hide();
    var ajax_array = get_each_value('.searchObject');
    if($('.searchObject [name=other]').is('[checked=checked]')) {
        ajax_array['other'] = 'true';
    }
    ajax_array['service_list'] = serviceList('get_list');
    ajax_array['begin_date'] = $('input#from').val();
    ajax_array['end_date'] = $('input#to').val();
    $.ajax({ url:'/system/finance/ajax/balance/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                loading('begin');
            }
            else {
                financeRender(ajax_array, data);
            }
        },
        error: function() {
            loading('end');
            popMessage('system error','red');
        }
    });
}


function financeRender(ajax_array, data) {
    loading('end');

    var data_begin = $('table.searchObject input[name=from]').val();
    var data_end = $('table.searchObject input[name=to]').val();
    $('#charge_list td[name=period]').text(data_begin+' - '+data_end);

    $('table#charge_list tr[name=row-warden]:not(.hide)').remove();
    $('table#charge_list tr[name=row-service_organization]:not(.hide)').remove();

    $('table#charge_list td[name=connected_count]').text(data['connected']['count']);
    $('table#charge_list td[name=connected_total]').text(data['connected']['total']+' '+lunchbox['setting']['currency']);

    $('table#charge_list td[name=disconnected_count]').text(data['disconnected']);
    var connected_disconnected = data['connected']['count']-data['disconnected'];
    $('table#charge_list td[name=connected_disconnected]').text('Прирост: '+connected_disconnected);


    for(var charge_key in data['charge_list']) {
        var charge = data['charge_list'][charge_key];

        // Warden
        if(charge['warden']) {
            var tr_warden = $('table#charge_list tr[warden='+charge['warden']+']');
            if(tr_warden.length > 0) {
                if(charge['value'] > 0) {
                    var now = parseInt(tr_warden.find('[name=plus]').text());
                    if(!now) now = 0;
                    tr_warden.find('[name=plus]').text(now + charge['value']);
                } else {
                    var now = parseInt(tr_warden.find('[name=minus]').text());
                    if(!now) now = 0;
                    tr_warden.find('[name=minus]').text(now + charge['value']*-1);
                }
            }
            else {
                var tr_warden = $('table#charge_list tr[name=row-warden].hide').clone()
                    .attr('warden', charge['warden'])
                    .removeClass('hide');
                tr_warden.find('[name=full_name]').text(charge['warden__full_name']);
                if(charge['value'] > 0) {
                    tr_warden.find('[name=plus]').text(charge['value']);
                } else {
                    tr_warden.find('[name=minus]').text(charge['value']*-1);
                }
                $('table#charge_list tr[name=row-warden].hide').after(tr_warden);
            }
        }

        else {
            var tr_bind = $('table#charge_list tr[bind='+charge['bind']+']');
            if(tr_bind.length > 0) {
                if(charge['value'] > 0) {
                    var now = parseInt(tr_bind.find('[name=plus]').text());
                    if(!now) now = 0;
                    tr_bind.find('[name=plus]').text(now + charge['value']);
                } else {
                    var now = parseInt(tr_bind.find('[name=minus]').text());
                    if(!now) now = 0;
                    tr_bind.find('[name=minus]').text(now + charge['value']*-1);
                }
            }
            else {
                var tr_bind = $('table#charge_list tr[name=row-warden].hide').clone()
                    .attr('bind', charge['bind'])
                    .removeClass('hide');
                tr_bind.find('[name=full_name]').html('Объект:'+charge['object__name']+' (без отв.менеджера)');
                if(charge['value'] > 0) {
                    tr_bind.find('[name=plus]').text(charge['value']);
                } else {
                    tr_bind.find('[name=minus]').text(charge['value']*-1);
                }
                $('table#charge_list tr[name=row-warden].hide').after(tr_bind);
            }
        }




        // Service organization
        var tr_service_organization = $('table#charge_list tr[service_organization='+charge['service_organization']+']');
        if(tr_service_organization.length > 0) {
            if(charge['value'] > 0) {
                var now = parseInt(tr_service_organization.find('[name=plus]').text());
                if(!now) now = 0;
                tr_service_organization.find('[name=plus]').text(now + charge['value']);
            } else {
                var now = parseInt(tr_service_organization.find('[name=minus]').text());
                if(!now) now = 0;
                tr_service_organization.find('[name=minus]').text(now + charge['value']*-1);
            }
        }
        else {
            var tr_service_organization = $('table#charge_list tr[name=row-service_organization].hide').clone()
                .attr('service_organization', charge['service_organization'])
                .removeClass('hide');
            tr_service_organization.find('[name=name]').text(charge['service_organization__name']);
            if(charge['value'] > 0) {
                tr_service_organization.find('[name=plus]').text(charge['value']);
            } else {
                tr_service_organization.find('[name=minus]').text(charge['value']*-1);
            }
            $('table#charge_list tr[name=row-service_organization].hide').after(tr_service_organization);
        }

    }

    $('table#charge_list tr[name=row-warden]').each(function(indx){
        var plus = parseInt($(this).find('[name=plus]').text());
        var minus = parseInt($(this).find('[name=minus]').text());
        if(!plus) plus = 0;
        if(!minus) minus = 0;
        $(this).find('[name=total]').text(plus-minus);
    });

    $('table#charge_list tr[name=row-service_organization]').each(function(indx){
        var plus = parseInt($(this).find('[name=plus]').text());
        var minus = parseInt($(this).find('[name=minus]').text());
        if(!plus) plus = 0;
        if(!minus) minus = 0;
        $(this).find('[name=total]').text(plus-minus);
    });


    var total_plus = 0;
    var total_minus = 0;
    $('table#charge_list tr[name=row-service_organization]').each(function(indx){
        var plus = parseInt($(this).find('[name=plus]').text());
        var minus = parseInt($(this).find('[name=minus]').text());
        if(plus) total_plus += plus;
        if(minus) total_minus += minus;
    });
    $('table#charge_list tr[name=row-total] td[name=plus]').text(total_plus);
    $('table#charge_list tr[name=row-total] td[name=minus]').text(total_minus);
    $('table#charge_list tr[name=row-total] td[name=total]').text(total_plus - total_minus);


    for(var payment_key in data['payment_list']) {
        var payment = data['payment_list'][payment_key];
        var tr = $('table#charge_list tr[name=row-payment-type-pay]');
        if(payment['payment_type'] == 'Банк') {
            var td = tr.find('td[name=bank]');
        } else {
            var td = tr.find('td[name=cash]');
        }
        var plus = parseInt(td.text());
        if(!plus) plus = 0;
        plus += payment['value'];
        td.text(plus);
    }

    var cash = parseInt($('table#charge_list tr[name=row-payment-type-charge] td[name=cash]').text());
    var bank = parseInt($('table#charge_list tr[name=row-payment-type-charge] td[name=bank]').text());
    var offset = parseInt($('table#charge_list tr[name=row-payment-type-charge] td[name=offset]').text());
    if(!cash) cash = 0;
    if(!bank) bank = 0;
    if(!offset) offset = 0;
    var total = cash+bank+offset;
    $('table#charge_list tr[name=row-payment-type-charge] td[name=total]').text(total);

    var cash = parseInt($('table#charge_list tr[name=row-payment-type-pay] td[name=cash]').text());
    var bank = parseInt($('table#charge_list tr[name=row-payment-type-pay] td[name=bank]').text());
    var offset = parseInt($('table#charge_list tr[name=row-payment-type-pay] td[name=offset]').text());
    if(!cash) cash = 0;
    if(!bank) bank = 0;
    if(!offset) offset = 0;
    var total = cash+bank+offset;
    $('table#charge_list tr[name=row-payment-type-pay] td[name=total]').text(total);




    $('#finance_list tbody tr').remove();
    var bind_count = 0;
    for(var bind_key in data['bind_list']){
        var object = data['bind_list'][bind_key];
        var show = false;
        if(ajax_array['view_list']=='debt' && object['balance']<0){
            show = true;
        } else if(ajax_array['view_list']=='payment' && object['balance']>0){
            show = true;
        } else if(ajax_array['view_list']=='null'){
            show = true;
        }

        if(show){
            var subtype_string = object['contract']+'-'+object['service_type__name']+'[';
            var subtype_string_count = 0;
            for(var subtype_key in object['subtype_list']){
                var subtype_item = object['subtype_list'][subtype_key];
                subtype_string += subtype_item['name']+'+';
                subtype_string_count++;
            }
            if(subtype_string_count > 0) subtype_string = subtype_string.slice(1,-1)+']';
            else subtype_string += ']</span>';
            subtype_string = '<div class="service_string" status="'+object['status']+'">' + subtype_string + '</div>';
            if(object['begin_date']) {
                subtype_string += '<div class="service_string" class="service_string" status="'+object['ovd_status']+'">'+object['begin_date']+'</div>';
            }


            var balance_bg = '';
            if(object['balance']<0) balance_bg = ' bg_red';
            else if(object['balance']>0) balance_bg = ' bg_green';
            var item = '<tr class="row">' +
                '<td>' +
                '<a class="item_td" href="/system/client/'+object['client']+'/charge/">' +
                subtype_string+'<div class="clear"></div>' +
                '<div class="block padding"><b>'+object['object__name']+'</b> ('+object['address']+')</div>' +
                '<div class="block padding_bottom">Плательщик: '+object['client__name']+'</div>' +
                '</a></td>' +
                '<td class="padding">'+object['charge'].toFixed(2)+'</td>' +
                '<td class="padding">'+object['payment'].toFixed(2)+'</td>' +
                '<td class="padding'+balance_bg+'">'+object['balance'].toFixed(2) +
                '</td></tr>';
            $('#finance_list tbody').append(item);
            bind_count++;
        }
    }
    if(bind_count>0){
        $('#finance_list').show();
    }

}