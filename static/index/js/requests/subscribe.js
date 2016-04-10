$(document).ready(function() {

    $('form').on('click','tr', function() {
        $(this).find('input').focus();
    });

})

//   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   Validator
/*
 $.validator.setDefaults({
 submitHandler: function() {
 //Save_transmit(); // alert("submitted!");
 }
 });
 */
$().ready(function() {
    $('.request_form').validate({
        rules: {
            email: {
                required: true,
                email: true,
                remote: {
                    type: 'get',
                    url: '/request/subscribe/check/',
                    data: {
                        field: 'email'
                    }
                }
            }
        },
        messages: {
            email: {
                email: "Нужен корректный email адрес",
                remote: "Такой email уже зарегистрирован"
            }
        }
    });
});