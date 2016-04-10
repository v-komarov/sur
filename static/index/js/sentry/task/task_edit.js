$(document).ready(function() {

    $(".searchObject select").on('change', function(){
        console.log( $('[name=status] :selected').val() );
        ajaxSearch();
    });

    $('.searchObject input').bind('change keyup', function( event ){
        ajaxSearch();
    });

    $('.objectsList').delegate("a.item", "mouseenter", function(){
        console.log('mouseenter');
        $(this).focus();
    });

});


function ajaxSearch() {
    var filter = {};
    filter['action'] = 'filter';
    $('.searchObject select').each(function() {
        var input_name = $(this).attr('name');
        var input_var = $(this).val();
        filter[input_name] = input_var;
    });
    $.ajax({ url:'/cabinet/mng/requests/application/', type:'post', dataType:'json', data:filter,
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

        var object_item =
            '<a class="item" href="/cabinet/mng/requests/application/'+result[key]['id']+'/">' +
                '<div class="title">' +
                    '<div class="id">'+ result[key]['id'] +'</div>' +
                    '<div class="order_num">'+ result[key]['num_type'] +'</div>' +
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
}