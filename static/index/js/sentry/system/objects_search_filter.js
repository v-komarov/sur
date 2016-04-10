$(document).ready(function() {

    $('.searchObject').on('click','tr:not(.unfocus)', function() {
        var name = $(this).find('input').attr('name');
        $(this).find('input:first-child').focus();
        ajaxSearch();
    });

    $('.searchObject').on('click','.select:not(select)', function() {
        console.log('click select')
        //$(this).find('select').trigger('click');
    });
/*
    $(".searchObject select").on('change', function(){
        console.log( $('[name=status] :selected').val() );
        ajaxSearch();
    });
    $('.searchObject input').bind('change keyup', function( event ){
        ajaxSearch();
    });
*/
})


function ajaxSearch() {
    var filter = {};
    filter['action'] = 'filter';
    $('.searchObject input').each(function() {
        var input_name = $(this).attr('name');
        var input_var = $(this).val();
        filter[input_name] = input_var;
    });
    $('.searchObject select').each(function() {
        var input_name = $(this).attr('name');
        var input_var = $(this).val();
        filter[input_name] = input_var;
    });
    $.ajax({ url:'/cabinet/mng/objects/filter/', dataType:'json', type:'post', data:filter,
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
            '<p class="client">'+ result[key]['client__name'] +
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