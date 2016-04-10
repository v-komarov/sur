$(document).ready(function() {

    $('form').on('click','tr', function() {
        $(this).find('input').focus();
    });

})

//   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   Validator

$().ready(function() {
    $('.request_form').validate({
        rules: {
            user_name: {
                required: true,
                minlength: 4,
                maxlength: 255
            },
            phone: {
                required: true,
                digits: true,
                minlength: 6,
                maxlength: 11
            },
            email: {
                email: true
            }
        },
        messages: {
            user_name: {
                required: "Пожалуйста, представьтесь",
                minlength: "Минимум 4 символа",
                maxlength: "Максимум 255 символов"
            },
            phone: {
                required: "Обязательное поле",
                minlength: "Минимум 6 символов",
                maxlength: "Максимум 11 символов",
                digits: "Только численное значение"
            },
            email: {
                email: "Нужен корректный email адрес"
            }
        }
    });
});