$(document).ready(function() {

    $('#pop_user_certificate .personal_pop_buttons').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        var certificate_id = $('#pop_user_certificate #certificate_list tbody tr.hover').attr('certificate_id');
        if(action=='reset'){
            userCertificateEdit(user_id,certificate_id);
        }
        else if(action=='remove'){
            if(confirm('Удалить сертификат?')){
                userCertificateRemove(user_id,certificate_id);
            }
        }
    });
    $('#pop_user_certificate #certificate_list').on('click', '[action=object_add]', function(){
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        userCertificateEdit(user_id,'add');
    });
    $('#pop_user_certificate #certificate_list tbody').on('click', 'tr', function(){
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        var certificate_id = $(this).attr('certificate_id');
        userCertificateEdit(user_id,certificate_id);
    });

    $('#pop_user_certificate #check_list tbody').on('click', 'tr.row:not(.edit)', function(){
        var check_id = $(this).attr('check_id');
        userCertificateСheckEdit(check_id);
    });
    $('#pop_user_certificate #check_list').on('click', '[action=object_add]', function(){ userCertificateСheckEdit('add') });

    $("#pop_user_certificate #check_list").on('click', '.ui_button', function(){
        var action = $(this).attr('action');
        if(action=='save'){ userCertificateСheckSave() }
        else if(action=='cancel'){ userCertificateСheckCancel() }
        else if(action=='remove'){
            if (confirm('Удалить проверку?')){
                var check_id = $(this).parents('.edit').attr('check_id');
                userCertificateСheckRemove(check_id);
            }
        }
    });

    validateCertificate();
});

function userCertificateСheckRemove(check_id){
    $.ajax({ url:'/system/post/personal/ajax/certificate_check_remove/', type:'post', dataType:'json', data:{'check_id':check_id},
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                var user_id = $('#user_list tbody tr.hover').attr('user_id');
                var certificate_id = $('#certificate_list tbody tr.hover').attr('certificate_id');
                userCertificateEdit(user_id,certificate_id);
            }
        }
    });
}

function userCertificateСheckSave(){
    var tr = $('#pop_user_certificate #check_list tbody tr.edit');
    var ajax_array = {};
    ajax_array['certificate_id'] = $('#pop_user_certificate #certificate_list tbody tr.hover').attr('certificate_id');
    ajax_array['check_id'] = tr.attr('check_id');
    ajax_array['plan_check_date'] = tr.find('input[name=plan_check_date]').val();
    ajax_array['real_check_date'] = tr.find('input[name=real_check_date]').val();
    ajax_array['comment'] = tr.find('input[name=check_comment]').val();
    console.log(ajax_array);
    $.ajax({ url:'/system/post/personal/ajax/certificate_check_save/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                var user_id = $('#user_list tbody tr.hover').attr('user_id');
                userCertificateEdit(user_id, ajax_array['certificate_id']);
            }
        }
    });
}

function userCertificateСheckEdit(check_id){
    userCertificateСheckCancel();
    //var certificate_id = $('#certificate_list tbody tr.hover').attr('certificate_id');
    $('#pop_user_certificate #check_list tbody').prepend('<tr class="row" check_id="add" />');
    var check_tr = $('#pop_user_certificate #check_list tbody [check_id='+check_id+']');
    if(check_id=='add'){
        var plan_check_date = '';
        var real_check_date = '';
        var check_comment = '';
    }
    else {
        var plan_check_date = check_tr.find('td:eq(0)').text();
        var real_check_date = check_tr.find('td:eq(1)').text();
        var check_comment = check_tr.find('td:eq(2)').text();
    }
    check_tr.attr('class','row edit')
        .attr('plan_check_date',plan_check_date)
        .attr('real_check_date',real_check_date)
        .attr('check_comment',check_comment)
        .find('td').remove();
    check_tr.html('<td colspan="3"/>');
    check_tr.find('td').html( $('.check_table').clone().show() );
    check_tr.find('input[name=plan_check_date]').val(plan_check_date).attr('class','datepicker');
    check_tr.find('input[name=real_check_date]').val(real_check_date).attr('class','datepicker');
    check_tr.find('input[name=check_comment]').val(check_comment);


    $('#pop_user_certificate #check_list .datepicker').datepicker({
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

}

function userCertificateСheckCancel(){
    $('#check_list tbody tr[check_id=add]').remove();
    var check_tr = $('#check_list tbody tr.edit');
    var plan_check_date = check_tr.attr('plan_check_date');
    var real_check_date = check_tr.attr('real_check_date');
    var check_comment = check_tr.attr('check_comment');
    check_tr.removeAttr('plan_check_date').removeAttr('real_check_date').removeAttr('check_comment');
    check_tr.find('td').remove();
    check_tr.html(
        '<td class="cell">'+plan_check_date+'</td>' +
        '<td class="cell">'+real_check_date+'</td>' +
        '<td class="cell">'+check_comment+'</td>');
    check_tr.attr('class','row');
}

function userCertificateEdit(user_id,certificate_id){
    $('#pop_user_certificate input').val('');
    $('#pop_user_certificate textarea').val('');

    var tr = $('#user_list tbody tr[user_id='+user_id+']');
    tr.attr('class', 'row hover');
    if(certificate_id == 'add') {
        $('#pop_user_certificate #certificate_list tbody tr.hover').attr('class', 'row');
        $('#pop_user_certificate #check_list tbody tr').remove();
    } else {
        tr.attr('class','row hover');
        $.ajax({ url:'/system/post/personal/ajax/get_certificate/', type:'get', dataType:'json', data:{'user_id':user_id,'certificate_id':certificate_id},
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                    $('.loading').hide();
                } else {
                    $('#pop_user_certificate #certificate_list tbody tr').remove();
                    $('#pop_user_certificate #check_list tbody tr').remove();
                    for(var key in data['certificate']){
                        $('#pop_user_certificate [name='+key+']').val(data['certificate'][key]);
                    }
                    $('#pop_user select[name=category] option[value='+data['certificate']['category']+']').attr("selected", "selected");

                    for(var key in data['certificate_list']){
                        var certificate = data['certificate_list'][key];
                        var hover = '';
                        if(certificate['id']==data['certificate']['id']){ hover = ' hover';}
                        var check_item = '<tr class="row'+hover+'" certificate_id="'+certificate['id']+'">' +
                            '<td class="cell">'+certificate['series']+'-'+certificate['number']+'</td>' +
                            '<td class="cell">'+certificate['date']+'</td>' +
                            '<td class="cell">'+certificate['expire_date']+'</td>' +
                            '<td class="cell">'+certificate['comment']+'</td></tr>';
                        $('#pop_user_certificate #certificate_list tbody').append(check_item);
                    }

                    for(var key in data['check_list']){
                        var check = data['check_list'][key];
                        var hover = '';
                        //if(check['id']==data['weapon']['id']){ hover = ' hover';}
                        var check_item = '<tr class="row'+hover+'" check_id="'+check['id']+'" last_weapon="true">' +
                            '<td class="cell">'+check['plan_check_date']+'</td>' +
                            '<td class="cell">'+check['real_check_date']+'</td>' +
                            '<td class="cell">'+check['comment']+'</td></tr>';
                        $('#pop_user_certificate #check_list tbody').append(check_item);
                    }
                }
            }
        });
    }
    popMenuPosition('#pop_user_certificate','single');
}

function userCertificateSave() {
    var user_id = $('#user_list tbody tr.hover').attr('user_id');
    var certificate_id = $('#pop_user_certificate #certificate_list tbody tr.hover').attr('certificate_id');
    if(certificate_id==undefined){ certificate_id = 'add' }
    var ajax_array = {};
    ajax_array['user_id'] = user_id;
    ajax_array['certificate_id'] = certificate_id;
    ajax_array['series'] = $('#pop_user_certificate [name=series]').val();
    ajax_array['number'] = $('#pop_user_certificate [name=number]').val();
    ajax_array['date'] = $('#pop_user_certificate [name=date]').val();
    ajax_array['expire_date'] = $('#pop_user_certificate [name=expire_date]').val();
    ajax_array['check_date'] = $('#pop_user_certificate [name=check_date]').val();
    ajax_array['category'] = $('#pop_user_certificate select[name=category]').val();
    ajax_array['comment'] = $('#pop_user_certificate [name=comment]').val();
    $.ajax({ url:'/system/post/personal/ajax/certificate_save/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                if(data['certificate_id']){
                    certificate_id = data['certificate_id'];
                }
                userCertificateEdit(user_id,certificate_id);
            }
        }
    });
}

function userCertificateRemove(user_id,certificate_id) {
    console.log(certificate_id);
    var ajax_array = {};
    ajax_array['certificate_id'] = certificate_id;
    $.ajax({ url:'/system/post/personal/ajax/certificate_remove/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                userCertificateEdit(user_id,'none');
            }
        }
    });
}

function validateCertificate() {
    $.validator.setDefaults({
        submitHandler: function() {
            userCertificateSave();
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
    $("#pop_user_certificate form").tooltip({
        show: false,
        hide: false
    });

    $("#pop_user_certificate form").validate({ // validate the comment form when it is submitted
        rules: {
            series: {
                required: true,
                minlength: 1,
                maxlength: 8
            },
            number: {
                required: true,
                minlength: 1,
                maxlength: 32
            },
            date: {
                required: true,
                minlength: 10
            },
            expire_date: {
                required: true,
                minlength: 10
            },
            check_date: {
                required: true,
                minlength: 10
            }
        },
        messages: {
            series: {
                required: "Необходима серия удостоверения",
                minlength: "Минимум 1 символов",
                maxlength: "Максимум 8 символа"
            },
            number: {
                required: "Необходим номер удостоверения",
                minlength: "Минимум 1 символов",
                maxlength: "Максимум 32 символа"
            },
            date: {
                required: "Необходима дата выдачи",
                minlength: "Некорректный формат, пример: 30.12.1990"
            },
            expire_date: {
                required: "Необходима дата продления",
                minlength: "Некорректный формат, пример: 30.12.1990"
            },
            check_date: {
                required: "Необходима дата продления",
                minlength: "Некорректный формат, пример: 30.12.1990"
            }

        }
    });
}