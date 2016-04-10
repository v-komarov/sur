$(document).ready(function() {

    $('form').on('click','tr', function() {
        $(this).find('input').focus();
    });

})

//   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   Validator

$().ready(function() {
    $('.request_form').validate({
        rules: {
            password1: {
                required: true,
                minlength: 6
            },
            password2: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            password1: {
                required: "Обязательное поле",
                minlength: "Минимум 6 символов"
            },
            password2: {
                required: "Обязательное поле",
                minlength: "Минимум 6 символов"
            }
        }
    });
});