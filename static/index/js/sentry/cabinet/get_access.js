$(document).ready(function() {
    var client_name = $('.request_form #id_client_name').val();
    if(client_name=='Физ.лицо'){
        $('.get_access_type .type_1').attr('class','type_1 on');
        $('.get_access_type .type_2').attr('class','type_2');
        $('.type_cust').hide();
    }

    $('form').on('click','tr', function() {
        $(this).find('input').focus();
    });

    $('.get_access_type').on('click','div', function() {
        var dd = $(this).attr('class');
        var num = dd.slice(5, 6);
        var status = dd.slice(7, 9)
        if(dd == 'type_1') {
            var client_name = $('.request_form #id_client_name').val();
            $('.request_form .type_cust').attr('client_name',client_name);
            $('.request_form #id_client_name').val('Физ.лицо');

            $('.get_access_type .type_1').attr('class','type_1 on');
            $('.get_access_type .type_2').attr('class','type_2');
            $('.type_cust').hide();
        } else if(dd == 'type_2') {
            var client_name = $('.request_form .type_cust').attr('client_name');
            $('.request_form #id_client_name').val(client_name);

            $('.get_access_type .type_1').attr('class','type_1');
            $('.get_access_type .type_2').attr('class','type_2 on');
            $('.type_cust').show();
        }
    });

    $('#autocomplete_customers').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/ajax/customers/', dataType: "json",
                data: {
                    type:'customer', company_name: request.term
                },
                success: function(data) {
                    response($.map(data, function(item) {
                        return {
                            label: item.client_name,
                            cust_id: item.cust_id
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            console.log( ui.item.cust_id );
            getObjects(ui.item.cust_id);
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        width: 180, // Ширина списка
        zIndex: 100, // z-index списка
        deferRequestBy: 300 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

})

function getObjects(cust_id) {
    $.ajax({ url:'/ajax/customers/get_objects/', type:'get', dataType:'json', data:{'cust_id':cust_id},
        success: function(data){
            //cust_objects = JSON.parse(data);
            cust_objects = data;
            options = '<input type="hidden" name="cust_id" value="'+cust_id+'" />';
            obj_cnt = 0;
            for(var key in cust_objects){
                //options += cust_objects[key]['obj_name']+'<br/>';
                options +='<label class="object_item"><input type="checkbox" name="obj_'+obj_cnt+'" value="'+cust_objects[key]['obj_id']+'" /> ' +
                    '['+cust_objects[key]['order_num']+'] '+cust_objects[key]['obj_name'] +
                    '<br /><span class="locality">'+cust_objects[key]['locality__name']+', '+cust_objects[key]['street__street_name']+', '+cust_objects[key]['building'] +
                    '</span></label>';
                //console.log(cust_objects[key]['obj_name']);
                obj_cnt ++;
            }
            options += '<input type="hidden" name="obj_cnt" value="'+obj_cnt+'" />';
            $('.tr_cust_objects').show();
            $('.td_cust_objects').html(options);
        }
    });
}

//   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   Validator

$().ready(function() {
    $('.request_form').validate({
        rules: {
            client_name: {
                required: true,
                minlength: 4,
                maxlength: 128
            },
            order_num: {
                required: true,
                digits: true
            },
            full_name: {
                required: true,
                minlength: 4,
                maxlength: 128
            },
            phone: {
                required: true,
                digits: true,
                minlength: 6,
                maxlength: 12
            },
            email: {
                required: true,
                email: true,
                remote: {
                    type: 'get',
                    url: '/cabinet/ajax/check_email/',
                    data: {
                        field: 'email'
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
            client_name: {
                required: "Обязательное поле",
                minlength: "Минимум 4 символа",
                maxlength: "Максимум 128 символов"
            },
            order_num: {
                required: "Обязательное поле",
                digits: "Только численное значение"
            },
            full_name: {
                required: "Пожалуйста, представьтесь",
                minlength: "Минимум 4 символа",
                maxlength: "Максимум 128 символов"
            },
            phone: {
                required: "Обязательное поле",
                digits: "Только численное значение",
                minlength: "Минимум 4 символа",
                maxlength: "Максимум 128 символов"
            },
            email: {
                required: "Обязательное поле",
                email: "Нужен корректный email адрес",
                remote: "Такой email уже зарегистрирован"
            },
            captcha_1: {
                required: "Обязательное поле",
                minlength: "Минимум 4 символа",
                maxlength: "Максимум 4 символа"
            }
        }
    });
});