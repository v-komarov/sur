$(document).ready(function() {

    $('form').on('click','tr', function() {
        $(this).find('input').focus();
    });

})

//   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   Validator

$().ready(function() {
    $('.request_form').validate({
        rules: {
            email: {
                required: true,
                email: true,
                remote: {
                    type: 'get',
                    url: '/cabinet/ajax/check_email/',
                    data: {
                        field: 'email',
                        action: 'restore'
                    }
                }
            },
            captcha_1: {
                required: true,
                minlength: 4,
                maxlength: 4
            }
        },
        messages: {
            email: {
                required: "Обязательное поле",
                email: "Нужен корректный email адрес",
                remote: "Пользователя с таким email нет"
            },
            captcha_1: {
                required: "Обязательное поле",
                minlength: "Минимум 4 символа",
                maxlength: "Максимум 4 символа"
            }
        }
    });
});