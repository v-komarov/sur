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
            text: {
                required: true,
                minlength: 4,
                maxlength: 320
            },
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
            text: {
                required: "Обязательное поле",
                minlength: "Минимум 4 символа",
                maxlength: "Максимум 320 символов"
            },
            user_name: {
                required: "Пожалуйста, представьтесь",
                minlength: "Минимум 4 символа",
                maxlength: "Максимум 255 символов"
            },
            phone: {
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