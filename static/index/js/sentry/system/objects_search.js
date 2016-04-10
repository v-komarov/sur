$(document).ready(function() {

    $('.searchObject').on('click','tr:not(.unfocus)', function() {
        var name = $(this).find('input').attr('name');
        $(this).find('input').focus();

        $('.searchObject input').each(function() {
            //console.log( $(this).attr('name') );
            if( $(this).attr('name') != name ){
                $(this).val('');
            }
        });
    });

    $(".searchObject select").on('change', function(){
        console.log( $('[name=status] :selected').val() );
        ajaxSearch();
    });
    $('.searchObject input').bind('change keyup', function( event ){
        //console.log( 'Обработчик события. event = ', event );
        ajaxSearch();
    });
})


function ajaxSearch() {
    //console.log('ajax');
    $.ajax({ url:'/cabinet/mng/objects/search/', type:'get', dataType:'json',
        data:{
            'action': 'search',
            'status': $('[name=status] :selected').val(),
            'pult_id': $('[name=pult_id]').val(),
            'order_num': $('[name=order_num]').val(),
            'client_name': $('[name=client_name]').val(),
            'object_name': $('[name=object_name]').val(),
            'address': $('[name=address]').val()
        },
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
        if(result[key]['security_type__name']!=null){ order_num += '—'+result[key]['security_type__name']; }
        if(result[key]['security_subtype__name']!=null){ order_num += '—'+result[key]['security_subtype__name']; }

        var object_item = '<a class="item" href="/cabinet/mng/object/info/'+ result[key]['client_id'] +'/'+ result[key]['id'] +'/">' +
            '<div class="order_num">'+ order_num + '<span class="status">'+ result[key]['status'] +'</span></div>' +
            '<p class="name">'+ result[key]['name'] +'</p>' +
            '<p class="client">Плательщик: '+ result[key]['client__name'] +
            '<span class="locality">'+ result[key]['locality__name'] +', '+ result[key]['street__name'] +', '+ result[key]['building'] +'</spam></p>' +
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