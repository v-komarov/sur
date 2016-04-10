$(document).ready(function() {
    request_id = $('.tableInfo').attr('request_id');
    $('#peoples').hide();

    $('.client_objects_list').on('click','.item', function() {
        var client_id = $(this).attr('client_id');
        $('.client_objects_list .selected').attr('class','item');
        $(this).attr('class','item selected');

        clickObject(client_id);
    });

})


function clickObject(client_id){
    $('.blockButtons .allowed').show();
    console.log(client_id);
    $.ajax({ url:'/cabinet/get_peoples/', type:'get', dataType:'json', data:{'client_id':client_id},
        success: function(data){
            client_persons = data;
            if(client_persons!=''){
                var tr = '<thead><tr class="row">' +
                        '<td class="cell">Контактные лица:</td>' +
                        '<td class="cell">Телефон</td>' +
                        '<td class="cell">e-mail</td>' +
                        '<td class="cell">Комментарий</td></tr></thead>';
                for(var key in client_persons){
                    if(client_persons[key]['position__name']!=null){
                        var post = ' ('+client_persons[key]['position__name']+') ';
                    } else {
                        var post = '';
                    }

                    tr +='<tr class="row">' +
                        '<td class="cell">'+client_persons[key]['full_name']+post+'</td>' +
                        '<td class="cell"><p>'+client_persons[key]['phone_mobile']+'</p><p>'+client_persons[key]['phone_city']+'</p></p><p>'+client_persons[key]['phone_other']+'</p></td>' +
                        '<td class="cell">'+client_persons[key]['email']+'</td>' +
                        '<td class="cell">'+client_persons[key]['comment']+'</td></tr>';
                }
                $('#peoples').html(tr);
                $('#peoples').show();
                $('.blockButtons .allowed').attr('href','allowed/'+client_id+'/');
            }
            else {
                $('#peoples').hide();
            }
        }
    });


}