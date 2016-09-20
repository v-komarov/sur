$(document).ready(function(){

    $('#object_cost__pop').find('.header').on('click', '.close', function() {
        cost_Clean();
    });
    $('#object_cost__pop').on('change', 'select[name=cost_type]', function() {
        check_cost_type();
    });

    $("#object_cost__pop").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            var object_cost_id = $('#object_cost__pop').attr('object_cost_id');
            if(object_cost_id=='new') {
                cost_Add();
            } else {
                cost_Edit($('#object_cost__pop').attr('object_id'), $('#object_cost__pop').attr('object_cost_id'));
            }
        }
        else if(action=='object_cost_add') {
            cost_Add();
        }
        else if(action=='remove'){
            if(confirm('Удалить стоимость?')) cost_Delete( $('#object_cost__pop').attr('object_cost_id') );
        }
    });

    $('#object_cost__pop #cost_log tbody').on('click','tr.row:not([index=end])', function(){
        $('#cost_log tbody tr').attr('class','row');
        $('#cost_log tbody [object_cost_id='+$(this).attr('object_cost_id')+']').attr('class','row hover');
        cost_Edit( $(this).attr('client_bind_id'), $(this).attr('object_cost_id') );
    });

    $('#object_cost__pop .datepicker').datepicker({
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

    cost_Validate();
});


function cost_Add(){
    $('#object_cost__pop').removeAttr('object_cost_id');
    var required = '<div class="required">*</div>';
    $('#object_cost__pop input[name=cost_value]').val('').parents('tr').find('td:eq(0)').html(required+'Новая стоимость услуги');
    $('#object_cost__pop input[name=begin_date], #object_cost__pop input[name=end_date]').val( lunchbox['setting']['today'] ).parents('tr').find('td:eq(0)').html(required+'Дата смены стоимости услуги');
    $('#object_cost__pop [name=comment]').val('');
    $('#cost_log tr.hover').attr('class','row');
    //var cost_type_id = $('#object_cost__pop #cost_log [index=0]').attr('cost_type_id');
    //check_cost_type(cost_type_id);
    check_cost_type(6);
}


function cost_Clean(){
    var required = '<div class="required">*</div>';
    $('#object_cost__pop input[name=cost]').val('').parents('tr').find('td:eq(0)').html(required+'Стоимость');
    $('#object_cost__pop input[name=begin_date]').val( lunchbox['setting']['today'] ).parents('tr').find('td:eq(0)').html(required+'Дата');
    $('#object_cost__pop').removeAttr('object_cost_id');
    $('#object_cost__pop [name=cost_type]').val('');
    $('#object_cost__pop input').val('');
    $('#object_cost__pop textarea').val('');
    $('#object_cost__pop #cost_log').hide();
    $('#object_cost__pop #cost_log tbody tr').remove();
}


function cost_Edit(client_bind_id, cost_id, cost_type) {
    console.log(client_bind_id, cost_id, cost_type);
    cost_Clean();
    $('#object_cost__pop').removeAttr('cost_id');
    var ajax_array = {'client_bind_id': client_bind_id};
    if(!cost_id || cost_id==''){ // Стоимость не определена
        $.ajax({ url:'/system/client/object/cost/ajax/cost_null/', type:'post', dataType:'json', data:ajax_array,
            success: function(data){
                $('#object_cost__pop .header b').text(data['object_cost']['object__name']+': стоимость услуги');
                for(var key in data['object_cost']){
                    console.log(key+' : '+data['object_cost'][key]);
                    $('#object_cost__pop [name='+key+']').val(data['object_cost'][key]);
                }
            },
            complete: function(){
                check_cost_type(1);
            }
        });
    }
    else {
        ajax_array['cost'] = cost_id;
        $('#object_cost__pop').attr('object_cost_id',cost_id);
        $.ajax({ url:'/system/client/object/cost/ajax/get/', type:'get', dataType:'json', data:ajax_array,
            success: function(data){
                if(data['error']!=null) alert(data['error']);
                else {
                    $('#object_cost__pop .header b').text(data['object_cost']['object__name']+': стоимость услуги');
                    cost_Render(data, ajax_array['cost']);
                }
            },
            complete: function(){
                if(cost_type=='pause'){
                    cost_Add();
                    check_cost_type(7);
                }
                else if(cost_type=='cost_add'){
                    cost_Add();
                }
                else {
                    check_cost_type();
                }
            }
        });
    }
    popMenuPosition('#object_cost__pop','single');
}


function cost_Render(data, cost_id) {
    console.log('cost_Render, cost_id: '+cost_id);
    $('#object_cost__pop').attr('client_bind_id',data['cost_list']['client_bind']);
    if(data['cost_list']['list'].length > 0) {
        $('#object_cost__pop #cost_log').show();
        var cost_log_list = '';
        for(var key in data['cost_list']['list']) {
            var cost = data['cost_list']['list'][key];
            if(cost['id']==cost_id) {
                for(var item_key in data['cost_list']['list'][key]) {
                    $('#object_cost__pop [name='+item_key+']').val(data['cost_list']['list'][key][item_key]);
                }
                $('#object_cost__pop [name=cost_type]').val(cost['cost_type_id']);
            }
            var cost_hover = '';
            if(cost['id']==cost_id) {
                cost_hover = ' hover';
                $('#object_cost__pop').attr('object_cost_id',cost['id']);
            }
            var cost_string = '';
            var cost_date_string = '';
            if(cost['cost_type']=='pause') {
                cost_string += cost['cost_type__name'];
                cost_date_string = cost['begin_date']+' - '+cost['end_date'];
            }
            else {
                if(cost['cost_value']) cost_string += cost['cost_value'] +' '+lunchbox['setting']['currency']+' / ';
                if(cost['cost_type']) cost_string += ' '+cost['cost_type__name'];
                cost_date_string = '<span name="date">'+cost['begin_date']+'</span>';
            }
            if(cost['index']==0 && cost_date_string!='') {
                cost_date_string += ' подключение';
            }
            else if(cost['index']=='end') {
                cost_date_string = cost['end_date'];
                cost_date_string += ' отключение';
            }

            var comment = '';
            if(cost['comment']) comment = cost['comment'];

            cost_log_list += '<tr class="row'+cost_hover+'" ' +
            'cost_type_id="'+cost['cost_type_id']+'" ' +
            'object_cost_id="'+cost['id']+'" ' +
            'index='+cost['index']+'>' +
            '<td class="cell">'+cost_string+'</td>' +
            '<td class="cell" name="begin_date">'+cost_date_string+'</td>' +
            '<td class="cell" name="comment">'+comment+'</td></tr>';
        }
        $('#object_cost__pop #cost_log tbody').append(cost_log_list);
    }
}


function check_cost_type(cost_type_id) {
    console.log('check_cost_type '+cost_type_id);
    if(!!cost_type_id) {
        var cost_type_label = $('#object_cost__pop [name=cost_type] option[value='+cost_type_id+']').attr('cost_type_label');
        $('#object_cost__pop [name=cost_type]').val(cost_type_id);
    } else {
        var cost_type_label = $('#object_cost__pop select[name=cost_type] :selected').attr('cost_type_label');
    }

    $('#object_cost__pop input, #object_cost__pop select').removeAttr('disabled');
    $('#object_cost__pop div[name=div_end_date]').hide();
    $('#object_cost__pop tr:not(#cost_log)').show();
    $('#object_cost__pop input[name=charge_month_day]').parents('tr').hide();

    console.log(cost_type_label);
    if(!cost_type_label) {
        $('#object_cost__pop [name=cost_value]').parents('tr').hide();
        $('#object_cost__pop [name=begin_date]').parents('tr').hide();
        $('#object_cost__pop [name=comment]').parents('tr').hide();
        $('#object_cost__pop [type=submit]').parents('tr').hide();
    }
    else if(cost_type_label=='free' || cost_type_label=='pause'){
        $('#object_cost__pop [name=cost_value]').parents('tr').hide();
        if(cost_type_label=='pause') {
            $('#object_cost__pop div[name=div_end_date]').show();
        }
    }
    else {
        console.log(lunchbox['setting']['today']);
        $('#object_cost__pop [name=cost_value]').parents('tr').show();
    }

    var index = $('#object_cost__pop #cost_log tr.hover').attr('index');
    if(index==0) {
        $('#object_cost__pop [name=begin_date]').attr('disabled','disabled');
    } else {
//        $('#object_cost__pop [name=begin_date]').removeAttr('disabled');
    }

    /* begin_date */
    var begin_date = $('#object_cost__pop #cost_log [index=0] [name=begin_date] [name=date]').text();
    if(!!begin_date) {
        console.log('begin_date yes '+begin_date);
        $('#object_cost__pop .datepicker').datepicker("option", "minDate", begin_date);
    } else {
        console.log('begin_date no '+begin_date);
    }
}


function cost_Delete(object_cost_id){
    console.log('object_cost_id '+object_cost_id);
    var tr = $('#object_cost__pop #cost_log [object_cost_id='+object_cost_id+']');
    var cost_array = {};
    cost_array['client_object_cost'] = object_cost_id;
    cost_array['object_cost_id_last'] = $('#object_cost__pop [index=0]').attr('object_cost_id');
    cost_array['index'] = tr.attr('index');
    $.ajax({ url:'/system/client/object/cost/ajax/delete/', type:'post', dataType:'json', traditional:true, data:cost_array,
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else {
                popMessage('Удалено','green');
                contract_Reset();
            }
        }
    });
}


function cost_Update(){
    var cost_array = get_each_value('#object_cost__pop');
    cost_array['client_bind'] = $('#object_cost__pop').attr('client_bind_id');
    cost_array['client_object_cost'] = $('#object_cost__pop').attr('object_cost_id');
    $.ajax({ url:'/system/client/object/cost/ajax/update/', type:'post', dataType:'json', traditional:true, data:cost_array,
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else {
                popMessage('Сохранено','green');
                contract_Reset();
            }
        }
    });
}


function cost_Validate(){
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
            cost_Update();
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
    $("#object_cost__pop form").tooltip({
        show: false,
        hide: false
    });

    $("#object_cost__pop form").validate({ // validate the comment form when it is submitted
        rules: {
            cost_type: {
                required: true
            },
            cost_value: {
                required: true,
                number: true
            },
            charge_month_day: {
                required: true
            },
            begin_date: {
                required: true,
                regexp: '^[0-9]{2}.[0-9]{2}.[0-9]{4}'
            },
            end_date: {
                required: true,
                regexp: '^[0-9]{2}.[0-9]{2}.[0-9]{4}'
            }
        },
        messages: {
            cost_type: {
                required: "Необходима тип начисления"
            },
            cost_value: {
                required: "Необходима стоимость",
                number: "Должно быть число"
            },
            charge_month_day: {
                required: "Необходим день начисления"
            },
            begin_date: {
                required: "Необходима дата",
                regexp: "Неверный формат даты"
            },
            end_date: {
                required: "Необходима дата",
                regexp: "Неверный формат даты"
            }
        }
    });
}