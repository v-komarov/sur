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
            car_number: {
                required: true
            },
            car_address: {
                required: true
            },
            car_name: {
                required: true
            },
            car_model: {
                required: true
            },
            car_color: {
                required: true
            },
            car_gosnumber: {
                required: true
            },
            full_name: {
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
            car_number: { required: "Обязательное поле" },
            car_address: { required: "Обязательное поле" },
            car_name: { required: "Обязательное поле" },
            car_model: { required: "Обязательное поле" },
            car_color: { required: "Обязательное поле" },
            car_gosnumber: { required: "Обязательное поле" },
            full_name: {
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