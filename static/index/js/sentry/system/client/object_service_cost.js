$(document).ready(function() {

    $('#service_cost__pop').find('.header').on('click', '.close', function() {
        service_cost_Cancel();
    });

    $("#service_cost__pop").on('change', 'select[name=cost_type_id]', function() {
        check_cost_type();
    });

    $("#service_cost__pop").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            var service_cost_id = $('#service_cost__pop').attr('service_cost_id');
            if(service_cost_id=='new'){
                service_cost_Add();
            } else {
                service_cost_Edit($('#service_cost__pop').attr('service_id'), $('#service_cost__pop').attr('service_cost_id'));
            }
        }
        else if(action=='service_cost_add'){
            service_cost_Add();
        }
        else if(action=='remove'){
            if(confirm('Удалить стоимость?')) service_cost_Delete($('#service_cost__pop').attr('service_cost_id'));
        }
    });

    $('#service_cost__pop #cost_log tbody').on('click','tr.row', function() {
        $('#cost_log tbody tr').attr('class','row');
        $('#cost_log tbody [service_cost_id='+$(this).attr('service_cost_id')+']').attr('class','row hover');
        service_cost_Edit( $(this).attr('service_id'), $(this).attr('service_cost_id') );
    });

    service_cost_Validate();
});


function service_cost_Add() {
    var last_end_date = $('#cost_log [last_cost=true] [name=date_range]').text().slice(-10);
    $('#service_cost__pop').removeAttr('service_cost_id');
    $('#service_cost__pop [name=cost]').val('');
    $('#service_cost__pop [name=cost_begin_date]').val(last_end_date);
    $('#service_cost__pop [name=cost_end_date]').val('');
    $('#service_cost__pop [name=comment]').val('');
    $('#cost_log tr.hover').attr('class','row');
}


function service_cost_Edit(service_id,service_cost_id,cost_type) {
    service_cost_Cancel();
    $('#service_cost__pop').attr('service_id',service_id);
    $('#service_cost__pop').attr('service_cost_id',service_cost_id);
    //$('#service_list tr.hover').attr('class','row');
    //$('#service_list tr[service_id=' +service_id+ ']').attr('class','row hover');
    var get_array = {};
    get_array['service_id'] = service_id;
    get_array['service_cost_id'] = service_cost_id;
    // Стоимость не определена
    if(!service_cost_id){
        //$('#service_list [service_id='+service_id+']').attr('class','row hover');
        var service_name = $('#service_list [service_id='+service_id+'] [name=service_name]').text();
        $('#service_cost__pop .header b').text('Стоимость услуги: '+service_name);
        $('#service_cost__pop').removeAttr('service_cost_id');
        $.ajax({ url:'/system/client/object/service_cost/ajax/cost_null/', type:'post', dataType:'json', data: get_array,
            success: function(data){
                $('#service_cost__pop .header b').text(data['service_cost']['service_string']+': стоимость услуги');
                for(var key in data['service_cost']){
                    $('#service_cost__pop [name='+key+']').val(data['service_cost'][key]);
                }

            }
        });

    }
    else {
        $.ajax({ url:'/system/client/object/service_cost/ajax/get/', type:'get', dataType:'json', data:get_array,
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    $('#service_cost__pop .header b').text(data['service_cost']['service_string']+': стоимость услуги');
                    for(var key in data['service_cost']){
                        $('#service_cost__pop [name='+key+']').val(data['service_cost'][key]);
                    }
                    // История стоимости
                    var service_status = 'close';
                    if(data['service_cost_log_cnt']>0) {
                        $('#service_cost__pop tr#cost_log').show();
                        $('#service_cost__pop tr#cost_log tbody tr').remove();

                        var cost_log_list = '';
                        //$('#service_cost__pop span[action=service_cost_add]').hide();
                        service_status = 'open';

                        for(var key in data['service_cost_log']){
                            var cost_end_date = '';
                            var cost_hover = '';
                            if(data['service_cost_log'][key]['cost_end_date']){
                                cost_end_date = ' - '+data['service_cost_log'][key]['cost_end_date'];
                                /*
                                 if(data['service_cost_log'][key]['last_cost']){
                                 $('#service_cost__pop span[action=service_cost_add]').show();
                                 }
                                 */
                            }
                            if(data['service_cost_log'][key]['service_cost_id']==service_cost_id){
                                cost_hover = ' hover';
                            }
                            var cost = '';
                            if (data['service_cost_log'][key]['cost']) cost = data['service_cost_log'][key]['cost']+' ';
                            cost_log_list += '<tr class="row'+cost_hover+'" service_id="'+service_id+'" ' +
                            'service_cost_id="' +data['service_cost_log'][key]['service_cost_id']+ '" ' +
                            'last_cost=' +data['service_cost_log'][key]['last_cost']+ '>' +
                            '<td class="cell">'+cost+data['service_cost_log'][key]['cost_type']+'</td>' +
                            '<td class="cell" name="date_range">'+data['service_cost_log'][key]['cost_begin_date']+cost_end_date+'</td>' +
                            '</tr>';
                        }
                        $('#service_cost__pop tr#cost_log tbody').append(cost_log_list);
                    }
                }
            },
            complete: function() {
                if(cost_type=='pause'){
                    $('#service_cost__pop select[name=cost_type_id]').val(7);
                    service_cost_Add();
                }
                check_cost_type();
            }
        });
    }
    check_cost_type();
    popMenuPosition('#service_cost__pop','single');
}


function check_cost_type() {
    console.log('check_cost_type');
    $('#service_cost__pop tr.row2').show();
    $('#service_cost__pop input, #service_cost__pop select').removeAttr('disabled');
    var cost_type_id = $('#service_cost__pop select[name=cost_type_id]').val();
    if(cost_type_id==4){
        $('#service_cost__pop input[name=cost]').parents('tr.row2').hide();
        $('#service_cost__pop input[name=calculation_month_day]').parents('tr.row2').hide();
    }
    else if(cost_type_id==6){
        $('#service_cost__pop input[name=calculation_month_day]').val('');
        $('#service_cost__pop input[name=calculation_month_day]').parents('tr.row2').hide();
        $('#service_cost__pop input[name=cost_end_date]').parents('tr.row2').hide();
    }
    else if(cost_type_id==7){ // pause
        console.log(lunchbox['setting']['today']);
        $('#service_cost__pop input[name=cost]').val('');
        $('#service_cost__pop input[name=cost]').parents('tr.row2').hide();
        $('#service_cost__pop input[name=cost_begin_date]').val(lunchbox['setting']['today']);
        $('#service_cost__pop input[name=calculation_month_day]').val('');
        $('#service_cost__pop input[name=calculation_month_day]').parents('tr.row2').hide();
    }
}


function service_cost_Delete(service_cost_id) {
    var tr = $('#service_cost__pop #cost_log [service_cost_id='+service_cost_id+']');
    var cost_array = {};
    cost_array['service_id'] = tr.attr('service_id');
    cost_array['service_cost_id_last'] = $('#service_cost__pop [last_cost=true]').attr('service_cost_id');
    cost_array['service_cost_id'] = service_cost_id;
    cost_array['last_cost'] = tr.attr('last_cost');
    $.ajax({ url:'/system/client/object/service_cost/ajax/delete/', type:'post', dataType:'json', traditional:true, data:cost_array,
        success: function(data){
            var cost_tr = '';
            if(data['error']!=null){
                alert(data['error']);
            }
            else if(cost_array['last_cost']!='true'){
                console.log('last_cost = null');
                $('#service_cost__pop #cost_log [service_cost_id='+service_cost_id+']').remove();
                //service_cost_Edit(cost_array['service_id'], cost_array['service_cost_id_last']);
            }
            else if(cost_array['last_cost']=='true') {
                object_service_Get_list();
                /*setTimeout(function () {
                 var service_cost_id = $('#service_list [service_id='+cost_array['service_id']+'] [name=service_cost]').attr('service_cost_id');
                 service_cost_Edit(cost_array['service_id'], service_cost_id);
                 }, 300); */
            }
            client_object_Reset();
            object_service_Get_list();
            popMessage('Удалено','green');
        }
    });
}


function service_cost_Update() {
    var cost_array = {};
    var cost_array_clean = {};
    cost_array['service_id'] = $('#service_cost__pop').attr('service_id');
    cost_array['service_cost_id'] = $('#service_cost__pop').attr('service_cost_id');
    cost_array['cost_type_id'] = $('#service_cost__pop select[name=cost_type_id] :selected').val();
    cost_array['cost'] = $('#service_cost__pop input[name=cost]').val();
    cost_array['calculation_month_day'] = $('#service_cost__pop input[name=calculation_month_day]').val();
    cost_array['calculation_month_id'] = $('#service_cost__pop select[name=calculation_month_id] :selected').val();
    cost_array['cost_begin_date'] = $('#service_cost__pop input[name=cost_begin_date]').val();
    cost_array['cost_end_date'] = $('#service_cost__pop input[name=cost_end_date]').val();
    cost_array['comment'] = $('#service_cost__pop textarea[name=comment]').val();
    for(key in cost_array){
        if(!!cost_array[key]) cost_array_clean[key] = cost_array[key];
    }
    $.ajax({ url:'/system/client/object/service_cost/ajax/update/', type:'post', dataType:'json', traditional:true, data:cost_array_clean,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            }
            else {
                client_object_Reset();
                object_service_Get_list();
                popMessage('Сохранено','green');
            }
        }
    });
}


function service_cost_Cancel() {
    //$('#service_list tbody .row').attr('class','row');
    $('#service_cost__pop input').val('');
    $('#service_cost__pop textarea').val('');
    $('#service_cost__pop #cost_log').hide();
}


function service_cost_Validate() {
    jQuery.validator.addMethod(
        'regexp',
        function(value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        },
        "Please check your input."
    );

    $.validator.setDefaults({
        submitHandler: function() {
            service_cost_Update();
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
    $("#service_cost__pop form").tooltip({
        show: false,
        hide: false
    });

    $("#service_cost__pop form").validate({ // validate the comment form when it is submitted
        rules: {
            cost: {
                required: true,
                number: true
            },
            calculation_month_day: {
                required: true
            },
            cost_begin_date: {
                required: true,
                regexp: '^[0-9]{2}.[0-9]{2}.[0-9]{4}'
            },
            cost_end_date: {

            }
        },
        messages: {
            cost: {
                required: "Необходима стоимость",
                number: "Должно быть число"
            },
            calculation_month_day: {
                required: "Необходим день начисления"
            },
            cost_begin_date: {
                required: "Необходима дата",
                regexp: "Неверный формат даты"
            },
            cost_end_date: {

            }
        }
    });
}