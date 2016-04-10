$(document).ready(function() {
    $('.searchObject').on('click','.search', function() {
        ajaxSearch();
    });
/*
    $('.objectsList').delegate("a.item", "mouseenter", function(){
        console.log('mouseenter');
        $(this).focus();
    });
*/
    $('[name=order_num]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/cabinet/ajax/get_order_num/', dataType: "json",
                data: { id: request.term },
                success: function(data) {
                    response($.map(data, function(item) {
                        return {
                            label: item.order_num
                        }
                    }));
                }
            });
        },
        minChars: 1, // Минимальная длина запроса для срабатывания автозаполнения
        width: 200, // Ширина списка
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });
})

function ajaxLoading(action) {
    if( action == 'start') {
        $('.loading').show();
        $('.resultCount').hide();
        $('.searchObject .search').hide();
        $('.objectsList .item').remove();
    } else {
        $('.loading').hide();
        $('.searchObject .search').show();
    }
}

function ajaxSearch() {
    ajaxLoading('start');
    var filter = {};
    filter['action'] = 'filter';
    $('.searchObject input').each(function() {
        var input_name = $(this).attr('name');
        var input_var = $(this).val();
        filter[input_name] = input_var;
    });
    //filter['date_start'] = $('#startValue').val();
    //filter['date_stop'] = $('#stopValue').val();
    $('.searchObject select').each(function() {
        var input_name = $(this).attr('name');
        var input_var = $(this).val();
        filter[input_name] = input_var;
    });
    $.ajax({ url:'/task/archive/', type:'post', dataType:'json', data:filter,
        success: function(data){
            setTable(data);
        }
    });
}

function setTable(data) {
    var result = data;
    $('.objectsList .item').remove();
    count = 0;
    for(var key in result){
        order_num = result[key]['order_num'];
        if(result[key]['status']==0){
            var status = 'bg_red';
        } else {
            var status = 'bg_green';
        }
        var object_item =
            '<a class="item" href="/task/archive/'+result[key]['id']+'/">' +
                '<div class="title">' +
                    '<div class="id">'+ result[key]['id'] +'</div>' +
                    '<div class="order_num '+status+'">'+ result[key]['num_type'] +'</div>' +
                    '<div class="title_name">'+ result[key]['object_name'] +'</div>' +
                    '<div class="time">'+ result[key]['time'] +'</div>' +
                    '<div class="datetime">'+ result[key]['datetime'] +'</div>' +
                    '<div class="status">'+ result[key]['type'] +'</div>' +
                '</div>' +
                '<div class="block"><p>Причина: '+ result[key]['reason'] +'</p></div>' +
                '<div class="client">Исполнитель: '+ result[key]['master'] +'</div>' +
                '<div class="locality">'+ result[key]['address'] +'</div>' +
            '</a>';
        $('.objectsList').append(object_item);
        count ++;
    }


    $('.resultCount').html('Найдено: '+count);
    $('.resultCount').show();
    if(count > 0){
        $('.objectsList').show();
    } else {
        $('.objectsList').hide();
    }
    ajaxLoading();
}

$(function() {
    $.datepicker.setDefaults(
        $.extend($.datepicker.regional["ru"])
    );
    $('#startValue').datepicker({
        showOn: "button",
        buttonImage: "/static/admin/img/icon_calendar.gif",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });

    $('#stopValue').datepicker({
        showOn: "button",
        buttonImage: "/static/admin/img/icon_calendar.gif",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#startValue" ).datepicker( "option", "maxDate", selectedDate );
        }
    });
});