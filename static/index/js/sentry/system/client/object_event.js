$(document).ready(function(){

    $('body').on('click', 'tr[action=event]', function() {
        object_event_Edit($(this).attr('event_type'), $(this).attr('event_id'));
    });

    $('body').on('click','.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='event_delete'){
            object_event_Update('event_delete');
        }
        else if(action=='bonus_add'){
            object_bonus_Edit(10);
        }
    });

    $('#event_pop').on('change','select[name=bonus_type_id]', function() {
        bonus_select_Switch();
    });

    $('#event_pop_list').on('click','td.data', function() {
        console.log('click');
        $(this).find('input').removeAttr('disabled');
    });
    $('#event_pop_list').on('change','input', function() {
        console.log('был изменен.');
    });
    $('#event_pop_list').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='clean_event'){
            $(this).parents('tr.row').find('input').val('');
        }
    });

    $('#event_pop_list [name=sentry_user], #event_pop [name=sentry_user], #bonus_pop [name=sentry_user]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/sentry_user/ajax/search/', type:'get', dataType:'json',
                data:{full_name:request.term, limit:10},
                success: function(data) {
                    response($.map(data['user_list'], function(item) {
                        return { label:item.full_name, user_id:item.id }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('user_id', ui.item.user_id);
            } else {
                $(this).val('').removeAttr('user_id');
            }
        },
        //select: function(event, ui) { $('tr#holding__name').attr('holding_id', ui.item.holding_id); },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });
    object_event_Validate();
    //object_event_list_Validate();
});


function object_event_Edit(event_type,event_id){
    object_Cancel();
    service_Cancel();
    $('#event_pop').removeAttr('event_type_id');
    $('#event_pop').removeAttr('event_id');
    $('#event_pop textarea').val('');
    //if($.inArray('main.'+event_type, lunchbox['permissions'])>=0){
    //if(8>0){
        var tr = $('tr[event_type='+event_type+']');
        var event_type_id = tr.attr('event_type_id');
        $('#event_pop').attr('event_type_id',event_type_id);
        $('#event_pop select[name=sentry_user] option[name=choosen]').remove();
        if(event_type=='client_object_warden') {
            $('#event_pop select[name=service]').parents('tr').hide();
            $('#event_pop select[name=sentry_user]').removeAttr('disabled');
        } else {
            $('#event_pop select[name=service]').parents('tr').show();
            $('#event_pop select[name=sentry_user]').attr('disabled','disabled');
        }
        $('#event_pop .header b').text(tr.find('td[name=event_type]').text());
        $('#event_pop select[name=bonus_type_id]').parents('tr').hide();
        $('#event_pop input[name=cost]').attr('disabled','disabled').parents('tr').hide();
        $('#event_pop input[name=event_date]').val(lunchbox['setting']['today']);

        if(!!event_id) {
            $('#event_pop').attr('event_id',event_id);
            $('#event_pop div[action=event_delete]').show();
            $.ajax({ url:'/system/client/object/ajax/event_get/?event_id='+event_id, type:'get', dataType:'json',
                success: function(data){
                    if(data['error']) {
                        alert(data['error']);
                    } else {
                        for(key in data['event']) $('#event_pop [name='+key+']').val(data['event'][key]);
                        console.log('sentry_user:',data['event']['sentry_user_id']);
                        if( !$('#event_pop select[name=sentry_user] option[value='+data['event']['sentry_user_id']+']').is('option') ){
                            var item_option = '<option value="'+data['event']['sentry_user_id']+'" name="choosen">'+data['event']['sentry_user_name']+'</option>';
                            $('#event_pop select[name=sentry_user] option:eq(0)').after(item_option);
                        }
                        $('#event_pop select[name=sentry_user]').val(data['event']['sentry_user_id']);
                    }
                }
            });
        }
        else {
            if( !$('#event_pop select[name=sentry_user] option[value='+lunchbox['setting']['sentry_user_id']+']').is('option') ){
                var item_option = '<option value="'+lunchbox['setting']['sentry_user_id']+'" name="choosen">'+lunchbox['setting']['sentry_user_full_name']+'</option>';
                $('#event_pop select[name=sentry_user] option:eq(0)').after(item_option);
            }
            $('#event_pop select[name=sentry_user]').val(lunchbox['setting']['sentry_user_id']);
            $('#event_pop div[action=event_delete]').hide();
        }
        popMenuPosition('#event_pop','single');
    //} else {
        //popMessage('Редактирование запрещено','red');
    //}
}


function object_bonus_Edit(bonus_type_id,bonus_id){
    object_Cancel();
    service_Cancel();
    $('#event_pop').removeAttr('event_type_id');
    $('#event_pop').removeAttr('event_id');
    var tr = $('tr[bonus_id='+bonus_id+']');
    $('#event_pop select[name=sentry_user] option[name=choosen]').remove();
    $('#event_pop select[name=sentry_user]').removeAttr('disabled');
    console.log('bonus_type_id',bonus_type_id);
    $('#event_pop select[name=bonus_type_id] option').removeAttr('selected');

    $('tr[action=bonus]').attr('class','row');
    if(!!bonus_id) {
        $('tr[bonus_id='+bonus_id+']').attr('class','row hover');
        $('#event_pop select[name=bonus_type_id]').val(bonus_type_id);
    }
    bonus_select_Switch();
    $('#event_pop .header b').text('Бонус');
    $('#event_pop select[name=service]').parents('tr').hide();
    $('#event_pop select[name=bonus_type_id]').parents('tr').show();
    $('#event_pop input[name=cost]').removeAttr('disabled').parents('tr').show();

    if(!!bonus_id) {
        $('#event_pop div[action=event_delete]').show();
        $.ajax({ url:'/system/client/object/ajax/event_get/?event_id='+bonus_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']) {
                    alert(data['error']);
                } else {
                    for(key in data['event']) $('#event_pop [name='+key+']').val(data['event'][key]);
                    console.log('sentry_user:',data['event']['sentry_user_id']);
                    if( !$('#event_pop select[name=sentry_user] option[value='+data['event']['sentry_user_id']+']').is('option') ){
                        var item_option = '<option value="'+data['event']['sentry_user_id']+'" name="choosen">'+data['event']['sentry_user_name']+'</option>';
                        $('#event_pop select[name=sentry_user] option:eq(0)').after(item_option);
                    }
                    $('#event_pop select[name=sentry_user]').val(data['event']['sentry_user_id']);
                }
            }
        });
    }
    else {
        if( !$('#event_pop select[name=sentry_user] option[value='+lunchbox['setting']['sentry_user_id']+']').is('option') ){
            var item_option = '<option value="'+lunchbox['setting']['sentry_user_id']+'" name="choosen">'+lunchbox['setting']['sentry_user_full_name']+'</option>';
            $('#event_pop select[name=sentry_user] option:eq(0)').after(item_option);
        }
        $('#event_pop select[name=sentry_user]').val(lunchbox['setting']['sentry_user_id']);
        $('#event_pop div[action=event_delete]').hide();
    }
    popMenuPosition('#event_pop','single');
}


function bonus_select_Switch(){
    console.log( lunchbox['bonus'] );
    var label = $('#event_pop select[name=bonus_type_id] option:selected').attr('name');
    var event_date = $('#event_pop input[name=event_date]').val();
    if(!event_date) $('#event_pop input[name=event_date]').val(lunchbox['setting']['today']);
    $('#event_pop input[name=cost]').val(lunchbox['bonus'][label]['cost']);
    //$('#event_pop input[name=sentry_user]').val(lunchbox['bonus'][label]['sentry_user_full_name']).attr('user_id',lunchbox['bonus'][label]['sentry_user_id']);
    console.log( lunchbox['bonus'][label]['sentry_user_id'] );
    $('#event_pop select[name=sentry_user]').val( lunchbox['bonus'][label]['sentry_user_id'] );
}


function object_event_Update(action,event_type){
    var tr = $('[event_type='+event_type+']');
    var event_array = {};
    event_array['object_id'] = object_id;
    event_array['event_date'] = $('#event_pop input[name=event_date]').val();
    event_array['sentry_user_id'] = $('#event_pop select[name=sentry_user]').val();
    //event_array['sentry_user_id'] = $('#event_pop select[name=warden]').val();
    var event_id = $('#event_pop').attr('event_id');
    if(!!event_id) event_array['event_id'] = event_id;
    var comment = $('#event_pop textarea[name=comment]').val();
    if(!!comment) event_array['comment'] = comment;
    event_array['service_id'] = $('.service__item:eq(0)').attr('service_id');
    var event_type_id = $('#event_pop').attr('event_type_id');
    if(!!event_type_id){
        event_array['event_type_id'] = event_type_id;
    }
    else {
        event_array['event_type_id'] = $('#event_pop select[name=bonus_type_id]').val();
        event_array['cost'] = $('#event_pop input[name=cost]').val();
        event_array['event_id'] = $('tr.hover[action=bonus]').attr('bonus_id');
    }
    $.ajax({ url:'/system/client/object/ajax/'+action+'/', type:'post', dataType:'json', data:event_array,
        success: function(data){
            if(data['error']){
                alert(data['error']);
            } else if(data['answer']=='done'){
                client_object_Reset();
                object_service_Get_list();
                popMessage('Сохранено','green');
                $('#event_pop').hide();
            }
        }
    });

}

/*
 function object_event_list_Update(){
 var event_array = {};
 event_array['object_id'] = object_id;
 event_array['event_list'] = {};
 $('#event_pop_list tbody tr.row').each(function(){
 var event_type = $(this).attr('event_type');
 if(!!event_type){
 var sentry_user_id = $(this).find('input[name=sentry_user]').attr('user_id');
 var event_date = $(this).find('[name=event_date]').val();
 if(!!sentry_user_id && !!event_date){
 event_array['event_list'][event_type] = {
 'sentry_user_id': sentry_user_id,
 'event_date': event_date
 };
 } else {
 event_array['event_list'][event_type] = 'null';
 }
 }
 });
 event_array['event_list'] = JSON.stringify( event_array['event_list'] );
 $.ajax({ url:'/system/client/object/ajax/event_list_update/', type:'post', dataType:'json', data:event_array,
 success: function(data){
 if(data['error']!=null){
 alert(data['error']);
 } else if(data['answer']=='done'){
 client_object_Reset();
 popMessage('Сохранено','green');
 }
 }
 });
 }
 */


function object_event_Validate(){
    $.validator.setDefaults({
        submitHandler: function() {
            object_event_Update('event_update');
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
    $('#event_pop form').tooltip({
        show: false,
        hide: false
    });

    $('#event_pop form').validate({ // validate the comment form when it is submitted
        rules: {
            cost: {
                required: true
            },
            event_date: {
                required: true
            },
            sentry_user: {
                required: true
            },
            comment: {
                required: false
            }
        },
        messages: {
            cost: {
                required: "Необходима сумма"
            },
            event_date: {
                required: "Необходима дата"
            },
            sentry_user: {
                required: "Необходим сотрудник"
            },
            comment: {
                required: "Комментарий"
            }
        }
    });
}


function check_event(){
    $('#event_pop_list tbody tr.row').each(function(){
        var begin_date = $(this).find('input[name=begin_date]').val();
        var sentry_user = $(this).find('input[name=sentry_user]').val();
        //console.log(begin_date+' '+sentry_user);
        if(!!begin_date || !!sentry_user){
            $(this).find('input').removeAttr('disabled');
        } else {
            $(this).find('input').attr('disabled','disabled');
        }
    });

    $('#event_pop_list form').validate().resetForm();
    //object_event_Validate();
}