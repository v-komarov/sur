$(document).ready(function() {
    client_id = $(".middleBlock").attr('client_id');
    contract_id = $(".middleBlock").attr('contract_id');
    object_id = $(".middleBlock").attr('object_id');
    client_user_Cancel();
    client_user_Refresh();

    $('#pop_user .header').on('click', '.close', function() { client_user_Cancel() });

    $('.objectsList').on('click', 'div.item', function() {
        if($.inArray('system.client', lunchbox['permissions'])>=0){
            client_user_Cancel();
            client_user_Edit( $(this).attr('client_user_id') );
        }
    });

    $(".tableInfo").on('click', '.ui_remove', function() {
        var delete_tr = $(this).parent().parent();
        var table_id = delete_tr.parent().parent().attr('id');
        if( table_id=='client_user_phone_list' ){
            phone_list_delete.push( delete_tr.attr('phone_id') );
        } else if( table_id=='client_user_emails' ){
            delete_emails.push( delete_tr.attr('email_id') );
        }
        delete_tr.remove();
    });

    $('body').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            var user_id = $('#pop_user').attr('user_id');
            client_user_Cancel();
            if(user_id=='new'){
                client_userAdd();
            } else {
                client_user_Edit( $('#pop_user').attr('client_user_id') );
            }
        }
        else if(action=='user_add'){
            client_userAdd();
        }
        else if(action=='list_refresh'){
            client_user_Refresh();
        }
        else if(action=='remove'){
            if(confirm('Удалить контакт?')){
                client_user_Delete( $('#pop_user').attr('client_user_id') );
                client_user_Cancel();
            }
        }
        else if(action=='phone'){
            var tr_phone = $('#pop_user #client_user_phone_list tr.hide');
            tr_phone.clone().appendTo('#client_user_phone_list').attr('class','row').attr('phone_id','new'+phones_new_cnt);
            phones_new_cnt++;
        }
        else if(action=='email'){
            var tr_email = $('#pop_user #client_user_emails tr.hide');
            tr_email.clone().appendTo('#client_user_emails').attr('class','row').attr('email_id','new'+emails_new_cnt);
            emails_new_cnt++;
        }
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('[name=birthday]').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        yearRange: "1960:2010",
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });

    client_user_Validate();
});


function client_user_Refresh() {
    client_user_Cancel();
    $('.loading').show();
    var client_user_array = {};
    client_user_array['client'] = client_id;
    if(contract_id != 'None') client_user_array['contract'] = contract_id;
    $.ajax({ url:'/system/client/user/ajax/get/', type:'get', dataType:'json', data:client_user_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                setTable(data);
            }
        }
    });
}


function setTable(data) {
    $('#client_user_list .item').remove();
    var client_user_list = data['client_user_list'];
    for(var key in client_user_list){
        var item = client_user_list[key];
        var phone_have = false;
        var email_have = false;
        /* Phone list */
        var phone_list_div = '<div class="block"><div class="client" name="phone_list">';
        for(var phone in item['phone_list']){
            phone_have = true;
            var phone_p = '<p class="contact">'+item['phone_list'][phone]['client_user_phone__phone_type']+': ';
            if(item['phone_list'][phone]['client_user_phone__code']){
                phone_p += '+'+item['phone_list'][phone]['client_user_phone__code'].substring(0,1) +
                '('+item['phone_list'][phone]['client_user_phone__code'].substring(1,4)+') ';
            }
            phone_p += item['phone_list'][phone]['client_user_phone__phone'];
            if(item['phone_list'][phone]['client_user_phone__comment']){
                phone_p += ' ('+item['phone_list'][phone]['client_user_phone__comment']+')';
            }
            phone_list_div += phone_p;
        }
        if(phone_have){
            phone_list_div += '</div></div>';
        } else {
            phone_list_div = '';
        }
        /* Email list */
        var email_list_div = '<div class="block"><div class="client" name="email_list">';
        for(var email in item['email_list']){
            email_have = true;
            email_list_div += '<p class="contact">' +
            '<a href="mailto:'+item['email_list'][email]['client_user_email__email']+'">' +
            item['email_list'][email]['client_user_email__email']+'</a></p>';
        }
        if(email_have){
            email_list_div += '</div></div>';
        } else {
            email_list_div = '';
        }
        /* User post */
        var post_div = '';
        if(item['general']['post']){
            var post_name = $('#pop_user select[name=post] option[value='+item['general']['post']+']').text().toLowerCase();
            post_div = ' ('+post_name+')';
        }
        /* Comment */
        var comment_div = '';
        if(item['general']['comment']){
            comment_div =  '<div class="block"><div class="client" name="comment">Комментарий: ' +
            item['general']['comment']+'</div></div>';
        }
        /* Address */
        var address_div = '';
        if(item['general']['address']){
            address_div =  '<div class="block"><div class="client" name="address">Адрес: '+item['general']['address']+'</div></div>';
        }
        /* Collect divs */
        var item_div = '<div class="item" client_user_id="'+item['general']['client_user']+'">' +
            '<div class="title"><div class="padding_85"><b>'+item['general']['full_name']+'</b>'+post_div+'</div></div>' +
            phone_list_div + email_list_div + comment_div + address_div+'</div>';
        $('#client_user_list').append(item_div);
    }
}


function client_userAdd() {
    $('#pop_user').attr('client_user_id','new');
    $('#pop_user #client_user_phone_list tr.row').remove();
    $('#pop_user #client_user_emails tr.row').remove();
    $('#pop_user [name=post] :contains(--)').attr('selected', 'selected');
    $('#pop_user input').each(function(){ $(this).val(''); });
    $('#pop_user textarea').each(function(){ $(this).val(''); });
    $('#pop_user [name=full_name]').attr('action', 'input_new_client_user');
    $('#pop_user input[action=input_new_client_user]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url:'/system/client/user/ajax/search/', dataType:'json', type:'get',
                data: { full_name:request.term, limit:9 },
                success: function(data) {
                    response($.map(data['client_user'], function(item) {
                        return {
                            label: item.full_name,
                            client_user_id: item.id
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            if(ui.item){
                client_user_Edit(ui.item.client_user_id)
            } else {
                $('#pop_user').attr('client_user_id','new');
            }
        },
        change: function(event, ui) {
            if(ui.item){
                client_user_Edit(ui.item.client_user_id)
            } else {
                $('#pop_user').attr('client_user_id','new');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });
    popMenuPosition('#pop_user');
}


function client_user_Delete(client_user_id) {
    var client_user_array = {};
    client_user_array['client'] = client_id;
    if(object_id!='None'){
        client_user_array['object'] = object_id;
    }
    client_user_array['client_user'] = client_user_id;
    $.ajax({ url:'/system/client/user/ajax/delete/', type:'post', dataType:'json', data:client_user_array,
        success: function(data){
            $('.objectsList [client_user_id='+client_user_id+']').remove();
        }
    });
}


function client_user_Edit(client_user_id) {
    $('#pop_user').attr('client_user_id', client_user_id);
    popMenuPosition('#pop_user');
    var post_array = {};
    post_array['client_user'] = client_user_id;
    $.ajax({ url:'/system/client/user/ajax/get/', type:'get', dataType:'json', data: post_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                var client_user = data['client_user_list'][0]['general'];
                var client_user_phone = data['client_user_list'][0]['phone_list'];
                var client_user_email = data['client_user_list'][0]['email_list'];
                for(var key in client_user){
                    if(key=='post_id'){
                        $('#pop_user select[name='+key+'] [value='+client_user[key]+']').attr("selected", "selected");
                    } else {
                        $('#pop_user [name='+key+']').val(client_user[key]);
                    }
                }
                $('#pop_user #client_user_phone_list tr.row').remove();
                $('#pop_user #client_user_emails tr.row').remove();
                for(var key in client_user_phone){
                    var tr_phone = $('#pop_user #client_user_phone_list tr.hide');
                    tr_phone.find('select[name=phone_type] [value='+client_user_phone[key]['client_user_phone__phone_type']+']').attr("selected", "selected");
                    tr_phone.find('[name=code]').val(client_user_phone[key]['client_user_phone__code']);
                    tr_phone.find('[name=phone]').val(client_user_phone[key]['client_user_phone__phone']);
                    tr_phone.find('[name=comment]').val(client_user_phone[key]['client_user_phone__comment']);
                    tr_phone.clone().appendTo('#client_user_phone_list').attr('class','row').attr('phone_id',client_user_phone[key]['client_user_phone']);
                    $('#pop_user #client_user_phone_list tr.hide select option').removeAttr('selected');
                    $('#pop_user #client_user_phone_list tr.hide input').val('');
                }
                for(var key in client_user_email){
                    var tr_email = $('#pop_user #client_user_emails tr.hide');
                    tr_email.find('[name=email]').val(client_user_email[key]['client_user_email__email']);
                    tr_email.clone().appendTo('#client_user_emails').attr('class','row').attr('email_id',client_user_email[key]['client_user_email']);
                    $('#pop_user #client_user_emails tr.hide input').val('');
                }
            }
        }
    });
}


function client_user_Update() {
    var client_user_array = get_each_value('#pop_user');
    client_user_array['comment'] = $('#pop_user textarea[name=comment]').val();
    if(object_id){
        client_user_array['object'] = object_id;
    } else {
        client_user_array['client'] = client_id;
    }
    client_user_array['client_user'] = $('#pop_user').attr('client_user_id');

    client_user_array['phone_list'] = [];
    client_user_array['phone_list_delete'] = JSON.stringify(phone_list_delete);
    $("table#client_user_phone_list tr.row").each(function(){
        var phone = {};
        phone['id'] = $(this).attr('phone_id');
        phone['phone_type'] = $(this).find('select[name=phone_type]').val();
        phone['code'] = $(this).find('input[name=code]').val();
        phone['phone'] = $(this).find('input[name=phone]').val();
        phone['comment'] = $(this).find('input[name=comment]').val();
        client_user_array['phone_list'].push(phone);
    });
    client_user_array['phone_list'] = JSON.stringify(client_user_array['phone_list']);

    client_user_array['emails'] = [];
    client_user_array['emails_deleted'] = JSON.stringify(delete_emails);
    $("table#client_user_emails tr.row").each(function(){
        var email = {};
        email['id'] = $(this).attr('email_id');
        email['email'] = $(this).find('input[name=email]').val();
        client_user_array['emails'].push(email);
    });
    client_user_array['emails'] = JSON.stringify(client_user_array['emails']);

    $.ajax({ url:'/system/client/user/ajax/update/', type:'post', dataType:'json', traditional:true, data:client_user_array,
        success: function(data){
            if(data['errors']) message_Pop_array(data['errors'], 'red');
            else {
                popMessage('Сохранено','green');
                client_user_Refresh(client_user_array['client_id'],client_user_array['object_id'])
            }
        }
    });
}


function client_user_Cancel() {
    $('div[role=tooltip]').remove();
    phone_list_delete = [];
    delete_emails = [];
    phones_new_cnt = 0;
    emails_new_cnt = 0;
    $('#pop_user').hide();
}


function client_user_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            client_user_Update();
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
    $("form#client_user_form").tooltip({
        show: false,
        hide: false
    });

    $("form#client_user_form").validate({ // validate the comment form when it is submitted
        rules: {
            full_name: {
                required: true,
                minlength: 3
            },
            birthday: {
                required: false,
                minlength: 10
            },
            code: {
                required: false,
                minlength: 4,
                number: true
            },
            phone: {
                required: false,
                minlength: 6,
                maxlength: 7,
                number: true
            }
        },
        messages: {
            full_name: {
                required: "Необходимо Ф.И.О.",
                minlength: "Минимум 3 знака"
            },
            birthday: {
                minlength: "Некорректный формат, 30.12.1990"
            },
            code: {
                minlength: "Минимум 4 знаков",
                number: "Только цифры"
            },
            phone: {
                minlength: "Минимум 6 знаков",
                maxlength: "Максимум 7 знаков",
                number: "Только цифры"
            }
        }
    });
}