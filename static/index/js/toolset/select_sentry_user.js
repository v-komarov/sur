$(document).ready(function(){
    console.log('select_sentry_user.js');
    //select_sentry_user();
    //select_client_object_user();
});

function select_sentry_user(){
    var ajax_array = {};
    var post_list = [];
    $('select[function=select_sentry_user] optgroup').each(function(){
        var post_id = $(this).attr('post_id');
        post_list.push(post_id);
    });
    //console.log(post_list);
    ajax_array['post_list'] = JSON.stringify(post_list);
    $.ajax({ url:'/system/sentry_user/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            for(key in data['user_list']){
                var user = data['user_list'][key];
                $('select[function=select_sentry_user] optgroup[post_id='+user['post_id']+']').append('<option value="'+user['id']+'">'+user['full_name']+'</option>');
            }
        }
    });
}


function select_client_object_user(object_id){
    var ajax_array = {};
    ajax_array['object_id'] = object_id;
    ajax_array['limit'] = 50;
    $.ajax({ url:'/system/client/user/ajax/get/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('select[function=select_client_object_user] option').remove();
                $('select[function=select_client_object_user]').append('<option value=""></option>');
                for(key in data['client_user_list']){
                    var user = data['client_user_list'][key]['general'];
                    $('select[function=select_client_object_user]').append('<option value="'+user['client_user_id']+'">'+user['full_name']+'</option>');
                }
            }
        }
    });



}