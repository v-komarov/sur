$(document).ready(function() {

    $('#pop_user_details .personal_pop_buttons').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        if(action=='reset'){
            userDetailsEdit(user_id);
        }
        else if(action=='remove'){
            if(confirm('Удалить сотрудника?')){
                userDetailsRemove(user_id);
            }
        }
    });

    validateDetails();
});


function userDetailsEdit(user_id){
    console.log(user_id);
    if(user_id=='add'){
        $('#user_list tbody tr.hover').attr('class','row');
        $('#pop_user_details .personal_pop_navigation').hide();
        $('#pop_user_details .header b').text('Новый сотрудник');
        $('#pop_user_details input').val('');
        $('#pop_user_details input').val('');
        $('#pop_user_details textarea').val('');
        popMenuPosition('#pop_user_details','single');
    }
    else {
        $('#user_list tbody tr[user_id='+user_id+']').attr('class','row hover');
        $('#pop_user_details .personal_pop_navigation').show();
        $.ajax({ url:'/post/personal/ajax/get/', type:'get', dataType:'json',
            data:{ 'user_id': user_id },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                    $('.loading').hide();
                } else {
                    for(var key in data['user']){
                        //console.log(key+': '+data['user'][key]);
                        $('#pop_user_details [name='+key+']').val(data['user'][key]);
                    }
                    $('.pop .header b').text(data['user']['full_name']);
                    $('#pop_user_details select[name=user_post] option[value='+data['user']['post_id']+']').attr("selected", "selected");

                    popMenuPosition('#pop_user_details','single');
                }
            }
        });
    }
}

function userDetailsSave() {
    var user_id = $('#user_list tbody tr.hover').attr('user_id');
    if(user_id==undefined){ user_id = 'add' }
    var ajax_array = {};
    ajax_array['user_id'] = user_id;
    ajax_array['full_name'] = $('#pop_user_details [name=full_name]').val();
    ajax_array['user_post_id'] = $('#pop_user_details select[name=user_post]').val();
    ajax_array['birthday'] = $('#pop_user_details [name=birthday]').val();
    ajax_array['mobile_phone'] = $('#pop_user_details [name=mobile_phone]').val();
    ajax_array['city_phone'] = $('#pop_user_details [name=city_phone]').val();
    ajax_array['other_phone'] = $('#pop_user_details [name=other_phone]').val();
    ajax_array['passport_series'] = $('#pop_user_details [name=passport_series]').val();
    ajax_array['passport_number'] = $('#pop_user_details [name=passport_number]').val();
    ajax_array['passport_data'] = $('#pop_user_details [name=passport_data]').val();
    ajax_array['address'] = $('#pop_user_details [name=address]').val();
    ajax_array['address2'] = $('#pop_user_details [name=address2]').val();
    ajax_array['comment'] = $('#pop_user_details [name=comment]').val();
    $.ajax({ url:'/post/personal/ajax/save/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                if(user_id=='add'){
                    $('#user_list thead [name=full_name]').val(ajax_array['full_name']);
                    $('#user_list thead select[name=user_post] [value=all]').attr("selected", "selected");
                    $('#user_list thead select[name=user_status] [value=all]').attr("selected", "selected");
                }
                personalAjax('search');
            }
        }
    });
}

function userDetailsRemove(user_id) {
    $.ajax({ url:'/post/personal/ajax/remove/', type:'post', dataType:'json', data:{ 'user_id':user_id },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('#user_list tbody tr[user_id='+user_id+']').remove();
                userCancel();
            }
        }
    });
}

function validateDetails() {
    $.validator.setDefaults({
        submitHandler: function() {
            userDetailsSave();
        },
        showErrors: function(map, list) { // there's probably a way to simplify this
            var focussed = document.activeElement;
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("close", {
                    currentTarget: focussed
                }, true)
            }
            this.currentElements.removeAttr("title").removeClass("ui-state-highlight");
            $.each(list, function(index, error) {
                $(error.element).attr("title", error.message).addClass("ui-state-highlight");
            });
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("open", {
                    target: focussed
                });
            }
        }
    });

    // use custom tooltip; disable animations for now to work around lack of refresh method on tooltip
    $("#pop_user_details form").tooltip({
        show: false,
        hide: false
    });

    $("#pop_user_details form").validate({ // validate the comment form when it is submitted
        rules: {
            full_name: {
                required: true,
                minlength: 5
            },
            birthday: {
                required: true,
                minlength: 10
            },
            mobile_phone: {
                required: true,
                minlength: 5,
                maxlength: 24
            },
            city_phone: {
                minlength: 5,
                maxlength: 24
            },
            other_phone: {
                minlength: 5,
                maxlength: 24
            },
            passport_series: {
                minlength: 4,
                maxlength: 4
            },
            passport_number: {
                minlength: 6,
                maxlength: 6
            },
            passport_data: {
                maxlength: 64
            },
            address: {
                required: true,
                minlength: 10
            }
        },
        messages: {
            full_name: {
                required: "",
                minlength: "Минимум 5 символов"
            },
            birthday: {
                required: "Необходима дата рождения",
                minlength: "Некорректный формат, 30.12.1990"
            },
            mobile_phone: {
                required: "Необходим телефон",
                minlength: "Минимум 5 символов",
                maxlength: "Максимум 24 символа"
            },
            city_phone: {
                minlength: "Минимум 5 символов",
                maxlength: "Максимум 24 символа"
            },
            other_phone: {
                minlength: "Минимум 5 символов",
                maxlength: "Максимум 24 символа"
            },
            passport_series: {
                minlength: "Минимум 4 символов",
                maxlength: "Максимум 4 символа"
            },
            passport_number: {
                minlength: "Минимум 6 символов",
                maxlength: "Максимум 6 символа"
            },
            passport_data: {
                maxlength: "Минимум 64 символов"
            },
            address: {
                required: "Необходим адрес",
                minlength: "Минимум 10 символов"
            }
        }
    });
}
