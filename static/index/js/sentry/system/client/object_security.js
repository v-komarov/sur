$(document).ready(function() {
    object_id = $('.tableInfo').attr('object_id');
    $('select.selectObject').change(function(){ ajaxSearch() });

    ajaxSearch();
})

function ajaxSearch() {
    $('select.selectObject').attr('disabled','disabled');
    $('.loading').show();
    $('.tableInfo').hide();

    $.ajax({ url:'/system/client/object/'+object_id+'/security/', type:'get', dataType:'json',
        data:{ 'service_id': $('select.selectObject :selected').attr('service_id') },
        success: function(data){
            setTable(data);
        }
    });
}

function setTable(data) {
    $('.tableInfo thead tr:eq(0) td:eq(0)').html( data['name'] +'<b class="spacer">'+ data['status'] +'</b>');
    for(var key in data){
        $('.tableInfo [tag='+ key +'] td:eq(1)').text( data[key] );
    }

    $('select.selectObject').removeAttr('disabled');
    $('.loading').hide();
    $('.tableInfo').show();
}