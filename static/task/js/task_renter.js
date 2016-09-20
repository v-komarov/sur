$(document).ready(function() {
    $('#renter_object .btn_ui[action=cancel_object]').hide();
    $('#renter_contract .btn_ui[action=cancel_client]').hide();
    $('#renter_contract .btn_ui[action=change]').hide();

    $(document).on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action == 'search'){
            renterObjectSearch();
        }
        else if(action == 'cancel_object'){
            $('#renter_object .btn_ui[action=cancel_object]').hide();
            $('#renter_contract .btn_ui[action=change]').hide();
            $('#renter_object .item').remove();
            $('#renter_object .slot').hide();
        }
        else if(action == 'cancel_client'){
            $('#renter_contract .btn_ui[action=cancel_client]').hide();
            $('#renter_contract .btn_ui[action=change]').hide();
            $('#renter_contract .item').remove();
            $('#renter_contract .slot').hide();
        }
        else if(action == 'reset'){
            $('table.search input').val('');
            $('#renter_object .slot .item__object').remove();
            $('#renter_contract [action=change]').hide();
            $('#renter_contract .slot .item').remove();
            $('.renter_board .slot').removeAttr('style');
            $('.result_count').hide();
            $('#renter_object_list .item').remove();
        }
        else if(action == 'change'){
            renter_Change();
        }
    });


    $('#renter_object_list').on('click', 'div.item__contract, div.item__object', function() {
        var contract_id = $(this).parents('.item').find('[contract_id]').attr('contract_id');
        var bind_id = $(this).attr('bind_id');
        renterChoice(contract_id, bind_id);
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('.renter_board .datepicker').datepicker({
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

    renter_Validate();
});


function renterObjectSearch() {
    loading('begin');
    var ajax_array = get_each_value('table.search');
    console.log(ajax_array);
    $.ajax({ url: '/system/client/search/ajax/search/', type: 'get', dataType: 'json', data: ajax_array,
        success: function (data) {
            renterObjectDraw('#renter_object_list', data);
            loading('end');
        }
    });
}


function renterObjectDraw(block_id,data) {
    $('.result_count').hide();
    $(block_id+' div.item').remove();
    var client_block = '';
    var count = 0;
    for(var client_id in data['client_list']){
        var client = data['client_list'][client_id];
        var contract_count = 0;
        for(var contract_id in client['contract_list']) {
            var contract = client['contract_list'][contract_id];
            var contract_string = get_contract_string(contract);
            var object_item = '';
            for(object_id__ in contract['object_list']){
                var object = contract['object_list'][object_id__];
                object_item += '<div class="padding_5 right item__object" bind_id="'+object['bind']+'">объект: <b>'+object['name']+'</b>';
                if(object['console']){
                    object_item += ' ('+object['console']+', №'+object['console_number']+')';
                }
                if(object['address_string']){
                    object_item += ', адрес: '+object['address_string'];
                }
                object_item += '</div><div class="clear" />';
            }
            var item = '<div class="item" client_id="'+client_id+'">' +
                '<div class="left">' +
                '<div class="service left item__contract" contract_id="'+contract_id+'">'+contract_string+'</div>' +
                '<div class="clear" />' +
                '<div class="padding_5 left item__client">клиент: <b>'+client['name']+'</b></div>' +
                '</div>' +
                '<div class="right">' +
                '<div class="left">'+object_item+'</div></div>' +
                '</div>';
            $(block_id).append(item);
            count ++;
            contract_count++;
        }
        if(contract_count==0) {
            client_block += '<a class="item" href="/system/client/'+client_id+'/"><div class="padding_5 left">клиент: <b>'+client['name']+'</b></div></a>';
        }
    }
    $(block_id).prepend(client_block);
    $('.result_count').html('Найдено договоров: '+count);
    $('.result_count').show();
    if(count > 0) {
        $(block_id).show();
    } else {
        $(block_id).hide();
    }
}


function renterChoice(contract_id, bind_id) {
    console.log('renterChoice', contract_id, bind_id);
    if(bind_id){
        $('#renter_object').attr('contract_id', contract_id).attr('bind_id', bind_id);
        var div__bind = $('#renter_object_list [bind_id='+bind_id+']');
        $('#renter_object .slot .item__object').remove();
        $('#renter_object .slot').prepend(div__bind.clone());
        $('#renter_object .slot').show();
    }
    else if(contract_id) {
        $('#renter_contract').attr('contract_id', contract_id);
        $('#renter_contract .slot .item').remove();
        var contract_string = $('#renter_object_list [contract_id='+contract_id+']').html();
        var div_string = '<div class="item" contract_id="' + contract_id + '">' + contract_string + '</div>';
        $('#renter_contract .slot').prepend(div_string);
        $('#renter_contract .slot').show();
    }

    if( $('#renter_contract').attr('contract_id') && $('#renter_object').attr('bind_id')) {
        $('#renter_contract [action=change]').show();
    } else {
        $('#renter_contract [action=change]').hide();
    }
}


function renter_Change() {
    var renter_array = {};
    renter_array['bind_id'] = $('#renter_object').attr('bind_id');
    renter_array['contract_id'] = $('#renter_object').attr('contract_id');
    renter_array['contract_new_id'] = $('#renter_contract').attr('contract_id');
    renter_array['end_date'] = $('#renter_object input[name=end_date]').val();
    renter_array['begin_date'] = $('#renter_contract input[name=begin_date]').val();
    $.ajax({ url:'/task/renter/ajax/change/', type:'post', dataType:'json', data:renter_array,
        success: function(data){
            if(data['answer'] == 'done'){
                $('.renter_board .item__object, .renter_board .item__contract').remove();
                $('.renter_board .slot').hide();
                $('#renter_object .btn_ui[action=cancel_object]').hide();
                $('#renter_contract .btn_ui[action=cancel_contract]').hide();
                $('#renter_contract .btn_ui[action=change]').hide();
                renterObjectSearch();
            }
        }
    });
}


function renter_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            renter_Change();
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
    $("form.renter_board").tooltip({
        show: false,
        hide: false
    });

    $("form.renter_board").validate({ // validate the comment form when it is submitted
        rules: {
            end_date: {
                required: true
            },
            begin_date: {
                required: true
            }
        },
        messages: {
            end_date: {
                required: "Необходима дата отключения"
            },
            begin_date: {
                required: "Необходима дата подключения"
            }
        }
    });
}