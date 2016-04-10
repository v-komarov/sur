$(document).ready(function() {
    auth_form = $('.auth_form');

    $('.cabinet').on('click', function() {
        authShow();
    });
    $('.auth_form').on('click','.close', function() {
        authClose();
    });
    $('.auth_form').on('click','[type=button]', function() {
        console.log('click');
        authLogin();
    });

    $('.authenticated').on('click', function() {
        authenticatedShow();
    });

});

jQuery(function() {
    jQuery('.auth_form').keydown(function(e) {
        var code = e.keyCode || e.which;
        if (code == '13') {
            authLogin();
        }
    });
});


function authLogin() {
    auth_form.find('.error').remove();
    var check_array = {};
    check_array['csrfmiddlewaretoken'] = auth_form.find('[name=csrfmiddlewaretoken]').val();
    check_array['email'] = auth_form.find('[name=email]').val();
    check_array['passw'] = auth_form.find('[name=passw]').val();
    $.ajax({ url:'/cabinet/auth/', type:'post', dataType:'json', data:check_array,
        success: function(data){
            //console.log(data['answer']);
            if(data['answer']=='green'){
                location.href = data['url'];
                //location.href = window.location.href;
            }
            else if(data['answer']=='red'){
                auth_form.find('[type=button]').before('<div class="error">Неверный email или пароль</div>');
            }
        }
    });
}

function authLogout() {
    array = {};
    $.ajax({ url:'/ajax/auth/logout/', type:'post', dataType:'json', data:array,
        success: function(data){
            if(data['answer']=='logout'){
                location.href = $('table#wrapper').attr('path');
            }
        }
    });
}

function authShow() {
    var span_pos = $('span.cabinet').offset();
    auth_form.css('top', '1px');
    auth_form.css('left', (span_pos.left)-130+'px');
    auth_form.show();
    auth_form.find('.error').remove();
}

function authClose() {
    auth_form.hide();
}

function authenticatedShow() {

}



function authTest(){
    array = {};
    array['title'] = 'abra';
    $.ajax({ url:'/ajax/auth/test/', type:'post', dataType:'json', data:array,
        success: function(data){

        }
    });
}


