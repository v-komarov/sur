$(document).ready(function() {
    client_id = $(".middleBlock").attr('client_id');

    $('#payment_pop .header').on('click', '.close', function(){
        payment_Reset();
    });

    $("select.year").change(function(){
        payment_Search();
    });
    $(".select_year a.arrow").click(function(){
        var year = $('select.year').val();
        if($(this).attr('class')=='arrow prev'){
            payment_Search('prev');
        } else {
            payment_Search('next');
        }
    });

    $(".middleBlock").on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='list_reset'){
            payment_Search();
        }
        else if(action=='payment_add'){
            payment_Edit();
        }
        else if(action=='payment_reset'){
            payment_Edit( $('#payment_pop').attr('payment_id') );
        }
        else if(action=='payment_delete'){
            if(confirm('Удалить платеж?')){
                payment_Update('delete');
            }
        }
    });

    $('#payment_list tbody').on('click', 'tr.row', function(){
        if($.inArray('system.client', lunchbox['permissions'])>=0) {
            payment_Edit( $(this).attr('payment_id') );
        }
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('input[name=payment_date]').datepicker({
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

    payment_Search();
    payment_Validate();
});


function payment_Search(arrow){
    var ajax_array = {'client_id':client_id};
    $('#payment_pop').hide();
    $('.loading').show();
    $('#payment_list tbody tr').remove();

    var year = $('.select_year select.year').val();
    if(arrow=='prev'){
        year--;
    } else if(arrow=='next'){
        year++;
    }
    $('select.year [value='+year+']').attr("selected", "selected");
    $('.select_year a').show();
    if(year!='all'){
        ajax_array['year'] = year;
        if(year == $('select.year :eq(1)').val() ){
            $('.select_year a.prev').hide(); }
        if(year == $('select.year :last').val() ) {
            $('.select_year a.next').hide(); }
    } else {
        $('.select_year a.prev').hide();
        $('.select_year a.next').hide();
    }
    $.ajax({ url:'/system/client/payment/ajax/get/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            $('table#payment_list div.balance').text('Баланс: '+data['balance']);
            for(var key in data['payment_list']){
                var payment = data['payment_list'][key];
                var payment_tr =
                    '<tr class="row" payment_id="'+ payment['id'] +'">' +
                    '<td class="cell date_transaction" name="payment_date">'+ payment['payment_date'] +'</span></td>' +
                    '<td class="cell" name="payment_type">'+ payment['payment_type'] +'</td>' +
                    '<td class="cell" name="mount">'+ payment['mount'] +'</td>' +
                    '<td class="cell" name="user_name">'+ payment['user_name'] +'</td>' +
                    '<td class="cell" name="comment"><i>'+ payment['comment'] +'</i></td>' +
                    '</tr>';
                $('#payment_list tbody').append(payment_tr);
            }
            $('.loading').hide();
        }
    });
}


function payment_Reset(){
    $('#payment_list tbody tr.hover').attr('class','row');
    $('#payment_pop').removeAttr('payment_id');
    $('#payment_pop input, #payment_pop textarea').val('');
    $('#payment_pop [name=payment_type] :contains(Банк)').attr('selected', 'selected');
}

function payment_Edit(payment_id){
    payment_Reset();
    if(!!payment_id){
        $('#payment_pop').attr('payment_id',payment_id);
        var payment_tr = $('#payment_list [payment_id='+payment_id+']');
        payment_tr.attr('class','row hover');
        var payment_type = payment_tr.find('[name=payment_type]').text();
        $('#payment_pop [name=payment_type] :contains('+payment_type+')').attr('selected', 'selected');
        $('#payment_pop [name=mount]').val( payment_tr.find('[name=mount]').text() );
        $('#payment_pop [name=payment_date]').val( payment_tr.find('[name=payment_date]').text() );
        $('#payment_pop [name=comment]').val( payment_tr.find('[name=comment]').text() );
    }
    else {

    }
    popMenuPosition('#payment_pop','single');
}

function payment_Update(action) {
    var ajax_array = {'client_id': client_id};
    ajax_array['payment_id'] = $('#payment_pop').attr('payment_id');
    $('#payment_pop input, #payment_pop select, #payment_pop textarea').each(function(){
        var input_name = $(this).attr('name');
        var input_value = $(this).val();
        if(!!input_value) ajax_array[input_name] = input_value;
    });
    $.ajax({ url:'/system/client/payment/ajax/'+action+'/',
        type:'post', dataType:'json', traditional:true, data:ajax_array,
        success: function(data){
            if(data['error']){
                alert(data['error']);
            }
            else {
                payment_Search();
            }
        }
    });
}


function payment_Validate(){
    $.validator.setDefaults({
        submitHandler: function() {
            payment_Update('update');
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
    $('#payment_pop form').tooltip({
        show: false,
        hide: false
    });

    $('#payment_pop form').validate({ // validate the comment form when it is submitted
        rules: {
            mount: {
                required: true
            },
            payment_date: {
                required: true
            }
        },
        messages: {
            mount: {
                required: "Необходима сумма"
            },
            payment_date: {
                required: "Необходима дата"
            }
        }
    });
}