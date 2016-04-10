$(document).ready(function() {
    $('#user_list [name=user_status]').clone().appendTo('#pop_user_card .status_table td:eq(0)');
    $('#pop_user_card .status_table [name=user_status] option[value=all]').remove();
    $('#pop_user_card .status_table [name=user_status]').removeAttr('class');
    $('#pop_user_card .status_table [name=user_status]').attr('name','status');

    $('#pop_user_card .personal_pop_buttons').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        var card_id = $('#pop_user_card #card_list tbody tr.hover').attr('card_id');
        if(action=='reset'){
            userCardEdit(user_id,card_id);
        }
        else if(action=='remove'){
            if(confirm('Удалить карточку?')){
                userCardRemove(user_id,card_id);
            }
        }
    });

    $('#pop_user_card #card_list').on('click', '[action=object_add]', function(){
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        userCardEdit(user_id,'add');
    });
    $('#pop_user_card #card_list tbody').on('click', 'tr', function(){
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        var card_id = $(this).attr('card_id');
        userCardEdit(user_id,card_id);
    });

    $('#pop_user_card #status_list tbody').on('click', 'tr.row:not(.edit)', function(){
        var status_id = $(this).attr('status_id');
        userCardStatusEdit(status_id);
    });
    $('#pop_user_card #status_list').on('click', '[action=object_add]', function(){ userCardStatusEdit('add') });

    $("#pop_user_card #status_list").on('click', '.ui_button', function(){
        var action = $(this).attr('action');
        if(action=='save'){ userCardStatusSave() }
        else if(action=='cancel'){ userCardStatusCancel() }
        else if(action=='remove'){
            if (confirm('Удалить статус?')){
                var status_id = $(this).parents('.edit').attr('status_id');
                userCardStatusRemove(status_id);
            }
        }
    });

    validateCard();
});

function userCardStatusRemove(status_id){
    $.ajax({ url:'/system/post/personal/ajax/card_status_remove/', type:'post', dataType:'json', data:{'status_id':status_id},
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                var user_id = $('#user_list tbody tr.hover').attr('user_id');
                var card_id = $('#card_list tbody tr.hover').attr('card_id');
                userCardEdit(user_id,card_id);
            }
        }
    });
}

function userCardStatusSave(){
    var tr = $('#status_list tbody tr.edit');
    var ajax_array = {};
    ajax_array['card_id'] = $('#card_list tbody tr.hover').attr('card_id');
    ajax_array['status_id'] = tr.attr('status_id');
    ajax_array['status'] = tr.find('select[name=status]').val();
    ajax_array['date'] = tr.find('input[name=status_date]').val();
    ajax_array['comment'] = tr.find('input[name=status_comment]').val();
    $.ajax({ url:'/system/post/personal/ajax/card_status_save/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                var user_id = $('#user_list tbody tr.hover').attr('user_id');
                userCardEdit(user_id, ajax_array['card_id']);
            }
        }
    });
}

function userCardStatusEdit(status_id){
    userCardStatusCancel();
    //var card_id = $('#card_list tbody tr.hover').attr('card_id');
    $('#pop_user_card #status_list tbody').prepend('<tr class="row" status_id="add" />');
    var status_tr = $('#status_list tbody [status_id='+status_id+']');
    if(status_id=='add'){
        var status_name = '';
        var status_date = '';
        var status_comment = '';
    }
    else {
        var status_name = status_tr.find('td:eq(0)').text();
        var status_date = status_tr.find('td:eq(1)').text();
        var status_comment = status_tr.find('td:eq(2)').text();
    }
    status_tr.attr('class','row edit')
        .attr('status_name',status_name)
        .attr('status_date',status_date)
        .attr('status_comment',status_comment)
        .find('td').remove();
    status_tr.html('<td colspan="3"/>');
    status_tr.find('td').html( $('.status_table').clone().show() );
    status_tr.find('select[name=status] :contains('+status_name+')').attr('selected', 'selected');
    status_tr.find('input[name=status_date]').val(status_date).attr('class','datepicker');
    status_tr.find('input[name=status_comment]').val(status_comment);


    $('#status_list [name=status_date]').datepicker({
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

function userCardStatusCancel(){
    $('#status_list tbody tr[status_id=add]').remove();
    var status_tr = $('#status_list tbody tr.edit');
    var status_name = status_tr.attr('status_name');
    var status_date = status_tr.attr('status_date');
    var status_comment = status_tr.attr('status_comment');
    status_tr.removeAttr('status_name').removeAttr('status_date').removeAttr('status_comment');
    status_tr.find('td').remove();
    status_tr.html(
        '<td class="cell">'+status_name+'</td>' +
        '<td class="cell">'+status_date+'</td>' +
        '<td class="cell">'+status_comment+'</td>');
    status_tr.attr('class','row');
}

function userCardEdit(user_id,card_id){
    $('#pop_user_card input').val('');
    $('#pop_user_card textarea').val('');
    $('#pop_user_card #status_list tbody tr').remove();
    var tr = $('#user_list tbody tr[user_id='+user_id+']');
    tr.attr('class','row hover');
    if(card_id=='add'){
        $('#pop_user_card #card_list tbody tr.hover').attr('class','row');
    } else {
        $('#pop_user_card #card_list tbody tr').remove();

        $.ajax({ url:'/system/post/personal/ajax/get_card/', type:'get', dataType:'json', data:{'user_id':user_id,'card_id':card_id},
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                    $('.loading').hide();
                } else {
                    for(var key in data['card']){
                        $('#pop_user_card [name='+key+']').val(data['card'][key]);
                    }

                    for(var key in data['card_list']){
                        var card = data['card_list'][key];
                        var hover = '';
                        if(card['id']==data['card']['id']){ hover = ' hover';}
                        var check_item = '<tr class="row'+hover+'" card_id="'+card['id']+'">' +
                            '<td class="cell">'+card['series']+'-'+card['number']+'</td>' +
                            '<td class="cell">'+card['service_organization_license']+'</td>' +
                            '<td class="cell">'+card['date']+'</td>' +
                            '<td class="cell">'+card['status']+'</td>' +
                            '<td class="cell">'+card['comment']+'</td></tr>';
                        $('#pop_user_card #card_list tbody').append(check_item);
                    }

                    for(var key in data['status_list']){
                        var status = data['status_list'][key];
                        var hover = '';
                        //if(check['id']==data['weapon']['id']){ hover = ' hover';}
                        var status_item = '<tr class="row'+hover+'" status_id="'+status['id']+'">' +
                            '<td class="cell">'+status['status']+'</td>' +
                            '<td class="cell">'+status['date']+'</td>' +
                            '<td class="cell">'+status['comment']+'</td></tr>';
                        $('#pop_user_card #status_list tbody').append(status_item);
                    }

                    popMenuPosition('#pop_user_card','single');
                    $('#pop_user_card select[name=service_organization] option[value='+data['card']['service_organization_id']+']').attr("selected", "selected");
                }
            }
        });
    }
}

function userCardRemove(user_id,card_id) {
    var ajax_array = {};
    ajax_array['card_id'] = card_id;
    $.ajax({ url:'/system/post/personal/ajax/card_remove/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                userCardEdit(user_id,'none');
            }
        }
    });
}

function userCardSave() {
    var user_id = $('#user_list tbody tr.hover').attr('user_id');
    var card_id = $('#pop_user_card #card_list tbody tr.hover').attr('card_id');
    if(card_id==undefined){ card_id = 'add' }
    var ajax_array = {};
    ajax_array['user_id'] = user_id;
    ajax_array['card_id'] = card_id;
    ajax_array['service_organization'] = $('#pop_user_card select[name=service_organization]').val();
    ajax_array['date'] = $('#pop_user_card [name=date]').val();
    ajax_array['series'] = $('#pop_user_card [name=series]').val();
    ajax_array['number'] = $('#pop_user_card [name=number]').val();
    ajax_array['comment'] = $('#pop_user_card [name=comment]').val();
    $.ajax({ url:'/system/post/personal/ajax/card_save/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                if(data['card_id']){
                    card_id = data['card_id'];
                }
                userCardEdit(user_id,card_id);
            }
        }
    });
}

function validateCard() {
    $.validator.setDefaults({
        submitHandler: function() {
            userCardSave();
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
    $("#pop_user_card form").tooltip({
        show: false,
        hide: false
    });

    $("#pop_user_card form").validate({ // validate the comment form when it is submitted
        rules: {
            date: {
                required: true,
                minlength: 10
            },
            series: {
                required: true,
                minlength: 1,
                maxlength: 8
            },
            number: {
                required: true,
                minlength: 1,
                maxlength: 16
            }
        },
        messages: {
            date: {
                required: "Необходима дата выдачи",
                minlength: "Некорректный формат, 30.12.1990"
            },
            series: {
                required: "Необходима серия карточки",
                minlength: "Минимум 1 символов",
                maxlength: "Максимум 8 символа"
            },
            number: {
                required: "Необходим номер карточки",
                minlength: "Минимум 1 символов",
                maxlength: "Максимум 16 символа"
            }
        }
    });
}
