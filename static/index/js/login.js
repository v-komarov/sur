$(document).ready(function() {

    $('form.login').on('click','[type=button]', function() {
        console.log('click');
        authLogin();
    });

});


function authLogin() {
    $('form.login div.error').remove();
    var check_array = {};
    check_array['csrfmiddlewaretoken'] = $('form.login [name=csrfmiddlewaretoken]').val();
    check_array['email'] = $('form.login [name=email]').val();
    check_array['passw'] = $('form.login [name=password]').val();
    $.ajax({ url:'/cabinet/auth/', type:'post', dataType:'json', data:check_array,
        success: function(data){
            //console.log(data['answer']);
            if(data['answer']=='green'){
                location.href = data['url'];
                //location.href = window.location.href;
            }
            else if(data['answer']=='red'){
                $('form.login [type=button]').before('<div class="error">Неверный email или пароль</div>');
            }
        }
    });
}


