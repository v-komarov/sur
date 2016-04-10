$(document).ready(function() {
    client_id = $('.middleBlock').attr('client_id');
    object_id = $('.middleBlock').attr('object_id');
    ajax_url = '/system/client/'+client_id+'/object/'+object_id+'/salary/';

    $(".tableInfo").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        console.log(action);
        if(action=='save'){
            salaryUpdate();
        }
        else if(action=='reset'){
            var service_salary_id = $('#pop_salary').attr('service_salary_id');
            salaryCancel();
            if(service_salary_id=='new'){
                salaryAdd();
            } else {
                salaryEdit( $('#pop_salary').attr('service_id'), $('#pop_salary').attr('service_salary_id'), false );
            }
        }
        else if(action=='object_add'){
            var name = $(this).attr('name');
            if(name=='objects'){
                salaryAdd();
            } else if(name=='subtypes'){
                subtypesAdd();
            }
        }
        else if(action=='remove'){
            if (confirm('Удалить?')){
                salaryRemove( $('#pop_salary').attr('service_salary_id') );
                salaryCancel();
            }
        }
    });

    $('#salary_list').on('click', 'tr.row', function() {
        salaryEdit( $(this).attr('service_id'), $(this).attr('service_salary_id'), false );
    });

    $('#pop_salary #show_log tbody').on('click', 'tr.row', function() {
        $('#show_log tbody tr').attr('class','row');
        $('#show_log tbody [service_salary_id='+$(this).attr('service_salary_id')+']').attr('class','row hover');
        salaryEdit( $(this).attr('service_id'), $(this).attr('service_salary_id'), true );
    });

    $('#pop_salary .header').on('click', '.close', function() { salaryCancel() });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('.datepicker').datepicker( {
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        yearRange: "1990:2015",
        monthNamesShort: $.datepicker.regional["ru"].monthNames,
        onClose: function(selectedDate) {
            $("#stopValue").datepicker( "option", "minDate", selectedDate );
        }
    });

});



function salaryEdit(service_id, service_salary_id, from_log) {
    if(from_log==false){
        salaryCancel();
        $('#salary_list [service_id='+service_id+']').attr('class','row hover');
    } else {

    }
    $('#pop_salary').attr('service_id',service_id);
    $('#pop_salary').attr('service_salary_id',service_salary_id);
    popMenuPosition('#pop_salary');
    if(service_salary_id=='None'){
        var service__name = $('#salary_list [service_id='+service_id+'] td:eq(0)').text().slice(0,-1);
        $('#pop_salary [name=service__name]').val(service__name);
    } else {
        var post_array = {};
        post_array['client_id'] = client_id;
        post_array['object_id'] = object_id;
        post_array['from_log'] = from_log;
        post_array['service_id'] = service_id;
        post_array['service_salary_id'] = service_salary_id;
        $.ajax({ url:'/system/client/salary/ajax/get/', type:'post', dataType:'json', data: post_array,
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    var service_salary = data['service_salary'];
                    for(var key in service_salary){
                        if(key=='service__name'){
                            $('#pop_salary .header b').text(service_salary[key]);
                        } else {
                            $('#pop_salary [name='+key+']').val(service_salary[key]);
                        }
                    }
                    // История измений ЗП
                    if(data['service_salary_log_cnt']>0 && from_log==false) {
                        $('#pop_salary tr#show_log tbody tr').remove();
                        $('#pop_salary tr#show_log td:eq(0) thead').html('<tr class="row"><td class="cell" colspan="2">История изменений ('+data['service_salary_log_cnt']+')</td></tr>');
                        $('#pop_salary tr#show_log').show();
                        var salary_log_table = '';
                        for(var key in data['service_salary_log']){
                            if(key==0){
                                var tr_class = 'row hover';
                            } else {
                                var tr_class = 'row';
                            }
                            salary_log_table += '<tr class="'+tr_class+'" service_id="'+service_id+'"'+' service_salary_id="'+data['service_salary_log'][key]['service_salary_id']+'">' +
                                '<td class="cell">'+data['service_salary_log'][key]['salary']+' '+data['service_salary_log'][key]['salary_type']+'</td>' +
                                '<td class="cell">'+data['service_salary_log'][key]['begin_date']+'</td>' +
                                '</tr>';
                        }
                        $('#pop_salary tr#show_log tbody').append(salary_log_table);

                    } else if(from_log==false) {
                        $('#pop_salary tr#show_log').hide();
                    }
                }
            }
        });
    }
}

function salaryUpdate() {
    var salary_array = {};
    salary_array['client_id'] = client_id;
    salary_array['object_id'] = object_id;
    salary_array['service_id'] = $('#pop_salary').attr('service_id');
    salary_array['service_salary_id'] = $('#pop_salary').attr('service_salary_id');
    salary_array['salary'] = $('#pop_salary input[name=salary]').val();
    salary_array['salary_type'] = $('#pop_salary select[name=salary_type] :selected').text();
    salary_array['begin_date'] = $('#pop_salary input[name=begin_date]').val();

    $.ajax({ url:'/system/client/salary/ajax/update/', type:'post', dataType:'json', traditional:true, data:salary_array,
        success: function(data){
            var salary_tr = '';
            if(data['error']!=null){
                var data_error = data['error'];
                for(var key in data_error){
                    console.log(key+': '+data_error[key]);
                    var tr_title = $('#id_'+key).parents('.row').find('td:eq(0)').text();
                    alert(tr_title+' '+data_error[key]);
                }
            }
            else if( $('#pop_salary tr#show_log tr').is('.hover') ) {
                salary_tr = $('#pop_salary [service_salary_id='+salary_array['service_salary_id']+']');
                salary_tr.find('td:eq(0)').html(salary_array['salary']+' '+salary_array['salary_type']);
                salary_tr.find('td:eq(1)').html(salary_array['begin_date']);
            }
            else if(data['service_salary_new_id']){
                salary_array['service_salary_id'] = data['service_salary_new_id'];
                var new_tr = $('#salarys tr[service_id='+salary_array['service_id']+']');
                new_tr.attr('service_salary_id',salary_array['service_salary_id']);
                new_tr.attr('class','row');
                //salaryCancel();
            }
            salary_tr = $('#salary_list [service_salary_id='+salary_array['service_salary_id']+']');
            salary_tr.find('td:eq(1)').html(salary_array['salary_type']);
            salary_tr.find('td:eq(2)').html(salary_array['salary']);
        }
    });
}

function setTable(data) {
    $('.tableInfo thead tr:eq(0) td:eq(0)').html( data['name'] +'<b class="spacer">'+ data['status'] +'</b>');
    $('.tableInfo tbody tr:eq(0) td:eq(1)').text( data['salary']+' '+data['rate'] );
    $('.tableInfo tbody tr:eq(1) td:eq(1)').text( data['calculation_month_day']+' числа, '+data['calculation_month'] );

    $('select.selectObject').removeAttr('disabled');
    $('.loading').hide();
    $('.tableInfo').show();
}

function salaryCancel() {
    $('#salary_list tr').attr('class','row');
    $('#pop_salary input').val('');
    $('#pop_salary').hide();
}
