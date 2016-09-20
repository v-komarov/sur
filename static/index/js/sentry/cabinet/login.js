$(document).ready(function() {

    $('form.login').keypress(function(e){
        if(e.keyCode==13){ console.log('click'); authLogin() }
    });

    $('form.login').on('click','[type=button]', function() {
        console.log('click');
        authLogin();
    });



    fucking_center();
});


function fucking_center() {
    console.log('welcome...');
    var top = $(window).height()/2 - 75;
    $('form.login').offset({top:top});
    console.log(top);
}


function authLogin() {
    console.log('authLogin');
    $('form.login div.error').remove();
    var check_array = {};
    check_array['csrfmiddlewaretoken'] = $('form.login [name=csrfmiddlewaretoken]').val();
    check_array['email'] = $('form.login [name=email]').val();
    check_array['passw'] = $('form.login [name=password]').val();
    $.ajax({ url:'/cabinet/auth/', type:'post', dataType:'json', data:check_array,
        success: function(data) {
            //console.log(data['answer']);
            console.log('data');
            console.log(data['url']);
            if(data['url']){
                console.log(data['url']);
                location.href = data['url'];
                //location.href = window.location.href;
            }
            else if(data['errors']){
                popMessage(data['errors'],'red');
            }
            else if(data['answer']=='green'){
                //location.href = data['url'];
                //location.href = window.location.href;
            }
            else if(data['answer']=='red'){
                $('form.login [type=button]').before('<div class="error">Неверный email или пароль</div>');
            }
        }
    });
}


