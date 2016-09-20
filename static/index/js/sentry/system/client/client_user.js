$(document).ready(function() {
    client_id = $(".middleBlock").attr('client_id');
    contract_id = $(".middleBlock").attr('contract_id');
    object_id = $(".middleBlock").attr('object_id');
    clientUserCancel();
    clientUserRefresh();

    $('#pop_user .header').on('click', '.close', function() { clientUserCancel() });

    $('.objectsList').on('click', 'div.item', function() {
        //if(8>0){
        var object_id = $(this).parents('[object_id]').attr('object_id');
        clientUserCancel();
        clientUserEdit($(this).attr('client_user_id'), object_id);
        //}
    });

    $("#client_user_form").on('click', '.ui_remove', function() {
        var delete_tr = $(this).parent().parent();
        var table_id = delete_tr.parent().parent().attr('id');
        if(table_id=='client_user_phone_list'){
            phone_list_delete.push( delete_tr.attr('phone_id') );
        } else if(table_id=='client_user_emails'){
            delete_emails.push( delete_tr.attr('email_id') );
        }
        delete_tr.remove();
        clientUserPhone('check');
    });

    $('body').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        var object_id = $(this).parents('[object_id]').attr('object_id');
        if(action=='reset') {
            var user_id = $('#pop_user').attr('user_id');
            clientUserCancel();
            if(user_id=='new'){
                clientUserAdd();
            } else {
                clientUserEdit($('#pop_user').attr('client_user_id'), object_id);
            }
        }
        else if(action=='user_add'){
            clientUserAdd(object_id);
        }

        else if(action == 'user_unlink'){
            var client_user_id = $(this).parents('[client_user_id]').attr('client_user_id');
            clientUserUnlink(client_user_id, object_id);
        }

        else if(action=='list_refresh'){
            clientUserRefresh(object_id);
        }
        else if(action=='remove'){
            if(confirm('Удалить контакт?')){
                var client_user_id = $(this).parents('[client_user_id]').attr('client_user_id');
                clientUserDelete(object_id, client_user_id);
                clientUserCancel();
            }
        }
        else if(action=='phone'){
            var tr_phone = $('#pop_user #client_user_phone_list tr.hide');
            tr_phone.find('input[name=phone]').val('');
            tr_phone.find('input[name=comment]').val('');
            tr_phone.clone().appendTo('#client_user_phone_list').attr('class','row').attr('phone_id','new'+phones_new_cnt);
            phones_new_cnt++;
            clientUserPhone('check');
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


    $('#pop_user').on('change', 'select[name=address_region]', function() {
        address_locality_Search('change');
    });

    $('#pop_user input[name=address_street]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/street/ajax/search/', type:'get', dataType:'json', data: {
                    locality_id: $('#pop_user select[name=address_locality]').val(),
                    street_name: $('#pop_user input[name=address_street]').val(),
                    limit: 19 },
                success: function(data) {
                    response($.map(data['street'], function(item) {
                        return {
                            label: item.name,
                            street_id: item.id
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            if(ui.item){
                var street_id = ui.item.street_id
            } else {
                $(this).removeAttr('item_id');
                $('input[name=address_street]').val('');
            }
            $('#pop_user input[name=address_street]').attr('item_id',street_id);
            $('#pop_user input[name=address_building]').val('');
        },
        change: function(event, ui) { // change duplicate select
            if(ui.item){
                $(this).attr('item_id',ui.item.street_id);
                $('#pop_user input[name=address_building]').autocomplete('enable');
            } else {
                $(this).removeAttr('item_id');
                $('input[name=address_street]').val('');
                $('#pop_user input[name=address_building]').autocomplete('disable');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('#pop_user input[name=address_building]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/building/ajax/search/', type:'get', dataType:'json', data: {
                    street_id: $('#pop_user input[name=address_street]').attr('item_id'),
                    building_name: request.term ,
                    limit: 9 },
                success: function(data) {
                    response($.map(data['buildings'], function(item) {
                        return {
                            label: item.name,
                            building_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id',ui.item.building_id);
            } else {
                $(this).removeAttr('item_id')
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });


    clientUserValidate();
});


function address_locality_Search(action, data_address) {
    console.log('address_locality_Search:', action);
    console.log(data_address);
    var region_id = '';
    if(action=='change') {
        region_id = $('#pop_user [name=address_region]').val();
    }
    else if(data_address && data_address['region']) {
        region_id = data_address['region'];
    }
    else {
        region_id = lunchbox['setting']['region'];
    }
    $('[name=address_region]').val(region_id);
    $.ajax({ url:'/system/directory/locality/ajax/search/?region_id='+region_id, type:'get', dataType:'json',
        success: function(data) {
            if(data['error']!=null) alert(data['error']);
            else if(data['locality']) {
                var locality_select = $('#pop_user select[name=address_locality]');
                locality_select.find('option').remove();
                for(var key in data['locality']) {
                    var selected = '';
                    if(data['locality'][key]['id']==lunchbox['setting']['locality']) selected = 'selected';
                    var option = '<option value="'+data['locality'][key]['id']+'" '+selected+'>'+data['locality'][key]['name']+'</option>';
                    locality_select.append(option);
                }
            }
        },
        complete: function() {
            address_street_Clear();
            if(data_address) {
                $('#pop_user [name=address_locality] [value=' +data_address['locality']+ ']').attr('selected', 'selected');
                $('#pop_user [name=address_street]').attr('item_id',data_address['street']);
                $('#pop_user [name=address_street]').val(data_address['street__name']);
                $('#pop_user [name=address_building]').attr('item_id',data_address['building']);
                $('#pop_user [name=address_building]').val(data_address['building__name']);
                $('#pop_user [name=address_placement]').val(data_address['placement']);
            }
        }
    });
}


function address_street_Clear() {
    $('#pop_user [name=address_street]').val('').removeAttr('item_id');
    $('#pop_user [name=address_building]').val('').removeAttr('item_id');
    $('#pop_user [name=address_placement]').val('');
}


function clientUserRefresh(object_id) {
    clientUserCancel();
    loading('begin');
    var client_user_array = {};
    client_user_array['client'] = client_id;
    if(contract_id) client_user_array['contract'] = contract_id;
    if(object_id) client_user_array['object'] = object_id;
    $.ajax({ url:'/system/client/user/ajax/get/', type:'get', dataType:'json', data:client_user_array,
        success: function(data){
            loading('end');
            if(data['error']!=null){
                alert(data['error']);
            } else {
                setTable(data, object_id);
            }
        }
    });
}


function setTable(data, object_id) {
    if(object_id) {
        var div_list = $('[object_id='+object_id+'] .objectsList');
        console.log(object_id);
    } else {
        var div_list = $('.objectsList');
    }

    $('.objectsList .item').remove();

    var client_user_list = data['client_user_list'];
    for(var key in client_user_list) {
        var item = client_user_list[key];
        var phone_have = false;
        var email_have = false;
        /* Phone list */
        var phone_list_div = '<div class="block"><div class="client" name="phone_list">';
        for(var phone in item['phone_list']){
            phone_have = true;
            var phone_p = '<p class="contact">'+item['phone_list'][phone]['client_user_phone__phone_type']+': ';
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
        for(var email in item['email_list']) {
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
        if(item['get_address']){
            address_div =  '<div class="block"><div class="client" name="address">Адрес: '+item['get_address']+'</div></div>';
        }


        var object_key = '';
        if('object_key' in client_user_list[key]['data']
            && client_user_list[key]['object'] in client_user_list[key]['data']['object_key']){
            console.log('object_key',client_user_list[key]['data']['object_key'][client_user_list[key]['object']]);
            object_key = client_user_list[key]['data']['object_key'][client_user_list[key]['object']];
            if(object_key != '') {
                object_key += '. ';
            }
        }

        /* Collect divs */
        var object_key_attr = ' object_key="999999999"';
        if(object_key != '') {
            object_key_attr = ' object_key="'+object_key+'"';
        }

        var item_div = '<div class="item" client_user_id="'+item['general']['client_user']+'"'+object_key_attr+'>' +
            '<div class="title"><div class="padding_85"><b>'+object_key+item['general']['full_name']+'</b>'+post_div+'</div></div>' +
            address_div + phone_list_div + email_list_div + comment_div + '</div>';


        if(client_user_list[key]['object']){
            $('[object_id='+client_user_list[key]['object']+'] .objectsList').append(item_div);
        } else {
            div_list.append(item_div);
        }

        /* Сортировка по object_key */
        console.log(client_user_list[key]['object']);
        var mylist = $('div[object_id='+client_user_list[key]['object']+'] .objectsList');
        var listitems = mylist.children('.item').get();
        listitems.sort(function(a, b){
            var distA = parseInt($(a).attr('object_key'));
            var distB = parseInt($(b).attr('object_key'));
            return (distA < distB) ? -1 : (distA > distB) ? 1 : 0;
        });
        $.each(listitems, function(idx, itm){
            mylist.append(itm);
        });
    }



}


function clientUserUnlink(client_user_id, object_id) {
    var ajax_array = {'client_user_id':client_user_id, 'object':object_id };
    $.ajax({ url:'/system/client/user/ajax/unlink/', type:'post', dataType:'json', data:ajax_array,
        success: function(data) {
            $('[object_id='+object_id+'] .objectsList [client_user_id='+client_user_id+']').remove();
        }
    });
}


function clientUserAdd(object_id) {
    $('#pop_user').removeAttr('client_user_id');
    if(object_id) {
        $('#pop_user').attr('object_id', object_id);
        $('#pop_user input[name=object_key]').parents('tr').show();
    } else {
        $('#pop_user').removeAttr('object_id');
        $('#pop_user input[name=object_key]').parents('tr').hide();
    }
    $('#pop_user #client_user_phone_list tr.row').remove();
    clientUserPhone('check');
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
                clientUserEdit(ui.item.client_user_id, object_id)
            } else {
                $('#pop_user').removeAttr('client_user_id');
            }
        },
        change: function(event, ui) {
            if(ui.item){
                clientUserEdit(ui.item.client_user_id, object_id)
            } else {
                $('#pop_user').removeAttr('client_user_id');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });
    popMenuPosition('#pop_user');
}


function clientUserDelete(object_id, client_user_id) {
    var client_user_array = {};
    client_user_array['client'] = client_id;
    if(object_id) client_user_array['object'] = object_id;
    client_user_array['client_user'] = client_user_id;
    $.ajax({ url:'/system/client/user/ajax/delete/', type:'post', dataType:'json', data:client_user_array,
        success: function(data){
            if(object_id) {
                $('[object_id='+object_id+'] .objectsList [client_user_id='+client_user_id+']').remove();
            } else {
                $('.objectsList [client_user_id='+client_user_id+']').remove();
            }
        }
    });
}


function clientUserEdit(client_user_id, object_id) {
    clientUserCancel();
    var post_array = {'client_user': client_user_id};
    $('#pop_user').attr('client_user_id', client_user_id);
    if(object_id){
        post_array['object'] = object_id;
        $('#pop_user').attr('object_id', object_id);
        $('#pop_user input[name=object_key]').parents('tr').show();
    } else {
        $('#pop_user').removeAttr('object_id');
        $('#pop_user input[name=object_key]').parents('tr').hide();
    }
    popMenuPosition('#pop_user');
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
                clientUserPhone('set', client_user_phone);
                for(var key in client_user_email){
                    var tr_email = $('#pop_user #client_user_emails tr.hide');
                    tr_email.find('[name=email]').val(client_user_email[key]['client_user_email__email']);
                    tr_email.clone().appendTo('#client_user_emails').attr('class','row').attr('email_id',client_user_email[key]['client_user_email']);
                    $('#pop_user #client_user_emails tr.hide input').val('');
                }

                if('address' in data['client_user_list'][0]) {
                    address_locality_Search('set', data['client_user_list'][0]['address']);
                }
                else {
                    address_locality_Search();
                }

                var client_user_data = data['client_user_list'][0]['data'];
                $('#pop_user input[name=object_key]').val(data['client_user_list'][0]['data']['object_key'][object_id]);
            }
        }
    });
}


function clientUserPhone(action, client_user_phone) {
    console.log('client_user_Phone: '+action+', '+client_user_phone);
    if(action=='set') {
        for(var key in client_user_phone) {
            var tr_phone = $('#pop_user #client_user_phone_list tr.hide');
            tr_phone.find('select[name=phone_type] [value='+client_user_phone[key]['client_user_phone__phone_type']+']').attr("selected", "selected");
            //tr_phone.find('[name=code]').val(client_user_phone[key]['client_user_phone__code']);
            tr_phone.find('[name=phone]').val(client_user_phone[key]['client_user_phone__phone']);
            tr_phone.find('[name=comment]').val(client_user_phone[key]['client_user_phone__comment']);
            tr_phone.clone().appendTo('#client_user_phone_list').attr('class','row').attr('phone_id',client_user_phone[key]['client_user_phone']);
            $('#pop_user #client_user_phone_list tr.hide select option').removeAttr('selected');
            $('#pop_user #client_user_phone_list tr.hide input').val('');
        }
    }
    if(action=='check' || action=='set') {
        console.log('check');
        var count = $('#pop_user #client_user_phone_list tbody tr:visible').length;
        if(count > 0) {
            $('#pop_user #client_user_phone_list thead').show();
        } else {
            $('#pop_user #client_user_phone_list thead').hide();
        }
    }
}


function clientUserUpdate() {
    var client_user_array = get_each_value('#pop_user');
    client_user_array['client'] = client_id;
    client_user_array['comment'] = $('#pop_user textarea[name=comment]').val();

    client_user_array['phone_list'] = [];
    client_user_array['phone_list_delete'] = JSON.stringify(phone_list_delete);
    $("table#client_user_phone_list tr.row").each(function(){
        var phone = {};
        phone['id'] = $(this).attr('phone_id');
        phone['phone_type'] = $(this).find('select[name=phone_type]').val();
        //phone['code'] = $(this).find('input[name=code]').val();
        phone['phone'] = $(this).find('input[name=phone]').val();
        phone['comment'] = $(this).find('input[name=comment]').val();
        if(phone['phone']!='') client_user_array['phone_list'].push(phone);
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
                clientUserRefresh(client_user_array['client_id'],client_user_array['object_id'])
            }
        }
    });
}


function clientUserCancel() {
    $('div[role=tooltip]').remove();
    phone_list_delete = [];
    delete_emails = [];
    phones_new_cnt = 0;
    emails_new_cnt = 0;
    $('#pop_user input').val('');
    $('#pop_user').hide();
}


function clientUserValidate() {
    $.validator.setDefaults({
        submitHandler: function() {
            clientUserUpdate();
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
            object_key: {
                required: false,
                number: true,
                maxlength: 6
            },
            full_name: {
                required: true,
                minlength: 3
            },
            birthday: {
                required: false,
                minlength: 10
            },
            phone: {
                required: false,
                minlength: 6,
                maxlength: 13,
                number: true
            }
        },
        messages: {
            object_key: {
                number: "Только цифры",
                maxlength: "Максимум 6 знаков"
            },
            full_name: {
                required: "Необходимо Ф.И.О.",
                minlength: "Минимум 3 знака"
            },
            birthday: {
                minlength: "Некорректный формат, 30.12.1990"
            },
            phone: {
                minlength: "Минимум 6 знаков",
                maxlength: "Максимум 13 знаков",
                number: "Только цифры"
            }
        }
    });
}