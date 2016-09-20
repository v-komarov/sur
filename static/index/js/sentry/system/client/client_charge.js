$(document).ready(function() {
    client_id =  $('.middleBlock').attr('client_id');
    console.log( lunchbox['setting']['currency'] );

    contract_id = $('.middleBlock').attr('contract_id');
    if(contract_id) $('#charge_list select#object_select').val(contract_id);
    charge_list = {};
    $('.select_year a.next').hide();
    $('#charge_list select#object_select').clone().appendTo('#charge_pop tr[name=object] td');
    $('#charge_pop tr[name=object] select#object_select option:eq(0)').remove();

    var year = $('.select_year select.year').val();
    if(year){
        charge_Refresh();
    } else {
        $('.tableInfo').hide();
        $('#no_pay').show();
    }

    $('table.tableInfo tbody').delegate(".roll", "click", function(){
        var td_div = $(this).parent().find('.listing');
        if( td_div.is(':hidden') ){
            td_div.show();
            td_div.parent().find('.roll a').text('свернуть');
            td_div.parent().find('.listing_bottom').show();
        } else {
            td_div.hide();
            td_div.parent().find('.roll a').text('развернуть');
            td_div.parent().find('.listing_bottom').hide();
        }
    });

    $('.btn_ui').click(function() {
        var action = $(this).attr('action');
        if(action=='charge_refresh'){
            charge_Refresh();
        }
        else if(action=='recharge'){
            if(confirm('Пересчитать все начисления? Это может занять несколько минут')){
                charge_Recharge();
            }
        }
        else if(action=='reset'){
            var action = $(this).attr('action');
            if($('#charge_pop').attr('item_id')=='add'){
                $('#charge_pop [name=money]').val('');
                $('#charge_pop [name=comment]').val('');
            } else {
                charge_Edit($('#charge_pop').attr('action'), $('#charge_pop').attr('item_id') )
            }
        }
        else if(action=='delete'){
            if(confirm('Удалить начисление?')) charge_Update('delete');
        }
    });

    $(".select_year a.arrow").click(function(){
        var year = $('.select_year select.year').val();
        if($(this).attr('class')=='arrow prev'){
            year--;
        } else {
            year++;
        }
        $('select.year [value='+ year +']').attr("selected", "selected");
        charge_Refresh();
    });

    $('#charge_list select#object_select').change(function() {
        charge_Refresh()
    });

    $(document).on('change', '#charge_pop select#object_select', function(){
        var level = $('#charge_pop select#object_select option:selected').attr('level');
        console.log(level);
        if(!level){
            alert('Выберите объект');
        }
    });

    $('select.year').change(function(){ charge_Refresh() });

    $(document).on('click', '.listing p', function(){
        var action = $(this).attr('name');
        var charge_id = $(this).attr('charge_id');
        var month_number = $(this).parents('tr').attr('month');
        charge_Edit(action, charge_id, month_number);
    });

    $(document).on('click', '#charge_list .result .add', function(){
        var month_number = $(this).parents('tr').attr('month');
        charge_Edit($(this).attr('action'), 'add', month_number);
    });

    $('.pop .header .close').click( function() {
        $('#charge_list .hover').removeAttr('class');
        $('.pop').hide();
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );

    charge_Validate();
});


function charge_Recharge() {
    $('.middleBlock select').attr('disabled','disabled');
    loading('begin');
    $('#charge_pop').hide();
    var ajax_array = {'client':client_id};
    var select = $('#charge_list select#object_select option:selected');
    if(select.attr('level')=='contract'){
        ajax_array['contract'] = select.val();
    } else if(select.attr('level')=='bind'){
        ajax_array['bind'] = select.val();
    }
    $.ajax({ url:'/system/client/charge/ajax/recharge/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['answer']=='done'){
                charge_Refresh();
            }
        },
        error: function(){
            loading('end');
            popMessage('system error','red');
        }
    });
}


function charge_Update(action) {
    var error = 'null';
    var ajax_array = {'client_id':client_id};
    ajax_array['charge_id'] = $('#charge_list p.hover').attr('charge_id');
    ajax_array['action'] = $('#charge_pop').attr('action');
    if(!ajax_array['charge_id']){
        ajax_array['charge_id'] = 'add';
    }
    if(action=='update'){
        console.log( $('#charge_pop select#object_select option:selected').attr('level') );
        if($('#charge_pop select#object_select option:selected').attr('level')!='bind'){
            alert('Выберите объект');
            error = 'true';
        } else {
            ajax_array['bind_id'] = $('#charge_pop select#object_select').val();
        }
    }
    $('#charge_pop input, #charge_pop select, #charge_pop textarea').each(function(){
        if($(this).is(":visible")){
            var input_name = $(this).attr('name');
            var input_value = $(this).val();
            if(!!input_value) ajax_array[input_name] = input_value;
        }
    });
    if(error=='null'){
        loading('begin');
        $.ajax({ url:'/system/client/charge/ajax/'+action+'/', type:'post', dataType:'json', data:ajax_array,
            success: function(data) {
                if(data['error']){
                    loading('end');
                    popMessage(data['error'], 'red');
                }
                else {
                    loading('end');
                    popMessage('Сохранено','green');
                    charge_Refresh();
                }
            }
        });
    }
}


function charge_Edit(action, charge_id, month) {
    var list_select = $('#charge_list select#object_select');
    var pop_select = $('#charge_pop select#object_select');
    //pop_select.val(list_select.val()).attr("disabled","disabled");
    if(charge_id!='add' && charge_list[month]['list'][charge_id]) {
        pop_select.val(charge_list[month]['list'][charge_id]['bind_id']);
        var charge = charge_list[month]['list'][charge_id];
    }
    else if(list_select.find(':selected').attr('level')=='bind') {
        console.log('bind');
        pop_select.val(list_select.val());
    }
    else if(contract_id) {
        console.log('contract');
        var bind_first = list_select.find('[contract_id='+contract_id+'][level=bind]').attr('value');
        console.log(bind_first);
        pop_select.val(bind_first);
    }
    else {
        var bind_first = list_select.find('[level=bind]:eq(0)').attr('value');
        console.log(bind_first);
        pop_select.val(bind_first);
    }

    $('#charge_pop .datepicker').datepicker("destroy");
    $('.datepicker').datepicker({
        showOn: "both",
        //buttonImage: "/static/admin/img/icon_calendar.gif",
        //buttonImageOnly: true,
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        showButtonPanel: true,
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ){
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });
    $('#charge_list .hover').removeAttr('class');
    $('#charge_list p[charge_id='+charge_id+']').attr('class','hover');
    var month_name = $('#charge_list .month[month='+month+'] td:eq(0)').text();
    if(month=='0') { month = '01' }
    else if(month<10){ month = '0'+month }

    if(charge_id=='add') {
        $('#charge_pop .datepicker').datepicker( "option", "disabled", false );
        var year = $('select.year').val();
        $('#charge_pop input[name=begin_date]').val('01.'+month+'.'+year);
        $('#charge_pop input[name=value]').val('');
        $('#charge_pop textarea[name=comment]').val('');
        if(action=='cost') {
            $('#charge_pop .datepicker').datepicker("destroy");
            var dates = $("#charge_pop #from, #charge_pop #to").datepicker({
                showOn: "both",
                changeMonth: true,
                changeYear: true,
                showButtonPanel: true,
                defaultDate: "+1w",
                numberOfMonths: 1,
                onSelect: function(selectedDate){
                    var option = this.id == "from" ? "minDate" : "maxDate",
                        instance = $( this ).data( "datepicker" ),
                        date = $.datepicker.parseDate(
                            instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                            selectedDate, instance.settings);
                    dates.not(this).datepicker("option", option, date);
                }
            });
            $('#charge_pop .header b').html('Новое начисление за '+month_name);
            $('#charge_pop span[name=begin_date_]').text('Начало периода');
            $('#charge_pop span[name=end_date_]').text('Конец периода');
            $('#charge_pop input[name=end_date]').val('01.'+month+'.'+year);
        }
        else if(action=='pay') {
            $('#charge_pop .header b').html('Новая оплата за '+month_name);
            $('#charge_pop span[name=begin_date_]').text('За какой период');
            $('#charge_pop span[name=end_date_]').text('Когда оплачено');
            $('#charge_pop [name=end_date]').val(lunchbox['setting']['today']);
        }
    }
    else {
        if(action=='cost') {
            $('#charge_pop .header b').html('Начисление №'+charge_id);
            $('#charge_pop span[name=begin_date_]').text('Начало периода');
            $('#charge_pop span[name=end_date_]').text('Конец периода');
            $('#charge_pop input[name=begin_date]').attr("disabled","disabled");
            $('#charge_pop input[name=end_date]').attr("disabled","disabled");
            $('#charge_pop .datepicker').datepicker("destroy");
            var dates = $("#charge_pop #from, #charge_pop #to").datepicker({
                showOn: "both",
                changeMonth: true,
                changeYear: true,
                showButtonPanel: true,
                defaultDate: "+1w",
                numberOfMonths: 2,
                onSelect: function(selectedDate){
                    var option = this.id == "from" ? "minDate" : "maxDate",
                        instance = $( this ).data( "datepicker" ),
                        date = $.datepicker.parseDate(
                            instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                            selectedDate, instance.settings);
                    dates.not(this).datepicker("option", option, date);
                }
            });
        }
        else if(action=='pay'){
            $('#charge_pop .header b').html('Оплата №'+charge_id);
            $('#charge_pop span[name=begin_date_]').text('За какой период');
            $('#charge_pop span[name=end_date_]').text('Когда оплачено');
            $('#charge_pop input[name=begin_date]').removeAttr('disabled');
            $('#charge_pop input[name=end_date]').removeAttr('disabled');
            $('#charge_pop .datepicker').datepicker( "option", "disabled", false );
        }
        $('#charge_pop [name=begin_date]').val(charge['begin_date']);
        $('#charge_pop [name=end_date]').val(charge['end_date']);
        $('#charge_pop [name=value]').val(charge['value'].replace('-',''));
        $('#charge_pop [name=comment]').val(charge['comment']);
    }

    popMenuPosition('#charge_pop', 'single');
    $('#charge_pop').attr('action', action);
}


function charge_Refresh() {
    $('.middleBlock select').attr('disabled','disabled');
    loading('begin');
    $('#charge_pop').hide();
    var ajax_array = {'client': client_id, 'year': $('select.year').val()};
    var select = $('#charge_list select#object_select option:selected');
    if(select.attr('level')=='contract'){
        ajax_array['contract'] = select.val();
    } else if(select.attr('level')=='bind'){
        ajax_array['bind'] = select.val();
    }
    $.ajax({ url:'/system/client/charge/ajax/get/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            charge_Draw(data, ajax_array['year']);
            loading('end');
        },
        complete: function() {
            $('.middleBlock select').removeAttr('disabled');
        },
        error: function() {
            loading('end');
        }
    });
}


function charge_Draw(data, year) {
    charge_list = data['charge'];
    $('table#charge_list div.balance').text('Баланс: '+data['balance']);
    $('table#charge_list tbody tr').remove();
    if(data['charge']){
        var total_cost = 0;
        var total_pay = 0;

        if(data['year_list'].length>0){
            $('select.year option').remove();
            for(var key in data['year_list']){
                $('select.year').append('<option class="item" value="'+data['year_list'][key]+'">'+data['year_list'][key]+'</option>');
            }
            $('select.year [value='+year+']').attr("selected", "selected");
        }

        if($('select.year :first').val()==year){ $('.select_year a.prev').hide() }
        else{ $('.select_year a.prev').show() }

        if($('select.year :last').val() == year){ $('.select_year a.next').hide() }
        else{ $('.select_year a.next').show() }

        for(var key in data['charge']){
            var charge = data['charge'][key];
            var cost_title = ''; var cost_bottom = '';
            var pay_title = ''; var pay_bottom = '';
            if(charge['cost_count']>3){
                cost_title = '<div class="listing_title roll">'+charge['cost_count']+' начислений <a>развернуть</a></div><div class="listing hide"></div>';
                cost_bottom = '<a class="listing_bottom roll">свернуть</a>';
            } else {
                cost_title = '<div class="listing"></div>';
                cost_bottom = '';
            }
            if(charge['pay_count']>3){
                pay_title = '<div class="listing_title roll">'+charge['pay_count']+' оплат(ы) <a>развернуть</a></div><div class="listing hide"></div>';
                pay_bottom = '<a class="listing_bottom roll">свернуть</a>';
            } else {
                pay_title = '<div class="listing"></div>';
                pay_bottom = '';
            }
            $('table#charge_list tbody').append(
                '<tr class="row month" month="'+ key +'">' +
                '<td class="cell">'+ charge['month_name'] +'</td>' +
                '<td name="cost">'+ cost_title + cost_bottom + '</td>' +
                '<td name="pay">'+ pay_title + pay_bottom + '</td></tr>' +
                '<tr class="row result" month="'+ key +'"><td></td>' +
                '<td><div class="total">Всего: '+ format_number(charge['cost_total']) + ' '+lunchbox['setting']['currency']+'</div><div class="add" action="cost">Добавить</div></td>' +
                '<td><div class="total">Всего: '+ format_number(charge['pay_total']) + ' '+lunchbox['setting']['currency']+'</div><div class="add" action="pay">Добавить</div></td></tr>'
            );

            for(var key in charge['list']){
                var item = charge['list'][key];
                var item_p = '';

                if(parseInt(item['value']) < 0){
                    var cost_count = 0;
                    total_cost += parseFloat(item['value']);
                    cost_count++;

                    var text = '<span class="text">';
                    if(item['user']) {
                        text += ''+item['user__full_name']+' ['+item['log_date']+']';
                    }
                    if(item['comment']) {
                        text += ' '+item['comment'];
                    }
                    text += '</span>';

                    var console_number = '';
                    if(item['console_number']) {
                        console_number = ' ['+item['console_number']+'] ';
                    }
                    var address = '';
                    if(item['object__address']) {
                        address = item['object__address']+' > ';
                    }

                    item_p +=
                        '<p name="cost" charge_id="'+ item['id'] +'" bind_id="'+ item['bind_id'] +'">' +
                        '<span class="text">' +
                        'Объект: ' + item['object__name'] + ' > ' +
                        address +
                        'Пульт: ' + item['console__name'] + console_number + '</span>' +
                        '<span class="values">';
                    if(item['charge_type']=='manual'){
                        var date_range = ' [<span class="interval">';
                        if(item['begin_date']==item['end_date']){
                            date_range += item['begin_date'] +'</span>]';
                        } else {
                            date_range += item['begin_date'] +' - '+ item['end_date'] +'</span>]';
                        }
                        item_p += '<b>другое'+date_range+' = '+format_number(item['value'])+' '+lunchbox['setting']['currency']+'</b></p>';
                    } else {
                        item_p += '[<span class="interval">'+ item['begin_date'] +' - '+ item['end_date'] +'</span>] = ' +
                        format_number(item['value']) +' '+lunchbox['setting']['currency']+'</span></p>';
                    }
                    $('#charge_list tr[month=' + item['month'] + '] td[name=cost] div.listing').append(item_p);
                }
                else {
                    var pay_count = 0;
                    total_pay += parseFloat(item['value']);
                    pay_count++;
                    var text = '<span class="text">';
                    if(item['user']) {
                        text += ''+item['user__full_name']+' ['+item['log_date']+']';
                    }
                    if(item['comment']) {
                        text += ' '+item['comment'];
                    }
                    text += '</span>';
                    item_p +=
                        '<p name="pay" charge_id="'+ item['id'] +'">' + text +
                        '<span class="values">' +
                        '<span class="interval">'+ item['end_date'] +'</span> : ' +
                        format_number(item['value']) +' '+lunchbox['setting']['currency']+'</span></p>';
                    $('#charge_list tr[month='+item['month']+'] td[name=pay] div.listing').append(item_p);
                }
            }
        }
    }
    //var charge_month = month['line']['charge_month'].replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ");

    var balance = total_pay + total_cost;
    if(balance < 0 ){
        balance = 'Долг: <b class="red">'+ format_number(balance) +' '+lunchbox['setting']['currency']+'</b>'
    } else if(balance > 0 ){
        balance = 'Переплата: <b class="green">'+ format_number(balance) +' '+lunchbox['setting']['currency']+'</b>'
    } else {
        balance = '<b class="green">Всё оплачено</b>';
    }
    var row_total = '<tr class="row total">' +
        '<td class="cell text_right" colspan="2">Начислено: <b>'+ format_number(total_cost) +' '+lunchbox['setting']['currency']+'</b></td>' +
        '<td class="cell">Оплачено: <b>'+ format_number(total_pay) +'  '+lunchbox['setting']['currency']+'</b>' +
        '<p class="saldo">'+ balance +'</p></td></tr>';
    $('table#charge_list tbody').append(row_total);

    //if(select.attr('level') != 'bind'){
    //   $('#charge_list div.add').hide();
    //}
}


function format_number(number) {
    var num = Math.round(number*100)/100;
    num = num.toFixed(2);
    num = num.replace('.',',').replace('-','');
    return num
}


function charge_Validate(){
    $.validator.setDefaults({
        submitHandler: function() {
            charge_Update('update');
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
    $('#charge_pop form').tooltip({
        show: false,
        hide: false
    });

    $('#charge_pop form').validate({ // validate the comment form when it is submitted
        rules: {
            value: {
                number: true,
                required: true
            },
            begin_date: {
                required: true
            },
            end_date: {
                required: true
            }
        },
        messages: {
            value: {
                number: "Десятичная часть через точку",
                required: "Необходима сумма"
            },
            begin_date: {
                required: "Необходима дата"
            },
            end_date: {
                required: "Необходима дата"
            }
        }
    });
}