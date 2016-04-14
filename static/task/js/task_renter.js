$(document).ready(function() {
    $('#renter_object .btn_ui[action=cancel_object]').hide();
    $('#renter_client .btn_ui[action=cancel_client]').hide();
    $('#renter_client .btn_ui[action=change]').hide();

    $('.renter_board').on('click','.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='cancel_object'){
            $('#renter_object .btn_ui[action=cancel_object]').hide();
            $('#renter_client .btn_ui[action=change]').hide();
            $('#renter_object .item').remove();
            $('#renter_object .slot').hide();
        }
        else if(action=='cancel_client'){
            $('#renter_client .btn_ui[action=cancel_client]').hide();
            $('#renter_client .btn_ui[action=change]').hide();
            $('#renter_client .item').remove();
            $('#renter_client .slot').hide();
        }
        else if(action=='change'){
            renter_Change();
        }
    });

    $('#object_list').on('click', 'div.item', function() {
        var client_id = $(this).attr('client_id');
        var object_id = $(this).attr('object_id');
        renter_Choice(client_id,object_id);
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


function renter_Choice(client_id, object_id) {
    var focus_client_id = $('#renter_object .item').attr('client_id');
    if(!focus_client_id){
        focus_client_id = $('#renter_client .item').attr('client_id');
    }
    if(focus_client_id==client_id){
        popMessage('Один арендатор','yellow');
    } else {
        var div = $('#object_list div[object_id='+object_id+']');
        if($('#renter_object div').is('.item')){
            $('#renter_client .slot .item').remove();
            var client_name = div.find('div[name=client]').text().substr(12);
            var div_string = '<div class="item" client_id="'+client_id+'"><div class="name">'+client_name+'</div></div>';
            $('#renter_client .slot').prepend(div_string);
            $('#renter_client .slot').show();
        }
        else if(object_id){
            $('#renter_object .slot .item').remove();
            $('#renter_object .slot').prepend(div.clone());
            $('#renter_object .slot').show();
        }
    }

    if($('#renter_object div').is('.item')){
        $('#renter_object .btn_ui[action=cancel_object]').show();
    }
    if( ($('#renter_object div').is('.item')) && ($('#renter_client div').is('.item')) ){
        $('#renter_client .btn_ui[action=cancel_client]').show();
        $('#renter_client .btn_ui[action=change]').show();
    }
}

function renter_Change() {
    var renter_array = {};
    renter_array['object_id'] = $('#renter_object .item').attr('object_id');
    renter_array['client_id'] = $('#renter_client .item').attr('client_id');
    renter_array['end_date'] = $('#renter_object input[name=end_date]').val();
    renter_array['begin_date'] = $('#renter_client input[name=begin_date]').val();
    $.ajax({ url:'/task/renter/ajax/change/', type:'post', dataType:'json', data:renter_array,
        success: function(data){
            if(data['answer']=='done'){
                $('.renter_board .item').remove();
                $('.renter_board .slot').hide();
                $('#renter_object .btn_ui[action=cancel_object]').hide();
                $('#renter_client .btn_ui[action=cancel_client]').hide();
                $('#renter_client .btn_ui[action=change]').hide();
                client_object_Search();
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