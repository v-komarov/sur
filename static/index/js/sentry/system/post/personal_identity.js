$(document).ready(function() {
    $('#pop_user_identity .personal_pop_buttons').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        var identity_id = $('#pop_user_identity #identity_list tbody tr.hover').attr('identity_id');
        if(action=='reset'){
            userIdentityEdit(user_id,identity_id);
        }
        else if(action=='remove'){
            if(confirm('Удалить удостоверение?')){
                userIdentityRemove(user_id,identity_id);
            }
        }
    });
    $('#pop_user_identity #identity_list').on('click', '[action=object_add]', function(){
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        userIdentityEdit(user_id,'add');
    });

    $('#pop_user_identity #identity_list tbody').on('click', 'tr', function(){
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        var identity_id = $(this).attr('identity_id');
        userIdentityEdit(user_id,identity_id);
    });

    validateIdentity();
});


function userIdentityEdit(user_id,identity_id) {
    $('#pop_user_identity input').val('');
    $('#pop_user_identity textarea').val('');
    if(identity_id == 'add') {
        $('#pop_user_identity #identity_list tbody tr.hover').attr('class', 'row');
    } else {
        var tr = $('#user_list tbody tr[user_id=' + user_id + ']');
        tr.attr('class', 'row hover');
        $.ajax({ url: '/system/post/personal/ajax/get_identity/', type: 'get', dataType: 'json',
            data: {'user_id': user_id, 'identity_id': identity_id},
            success: function (data) {
                if (data['error'] != null) {
                    alert(data['error']);
                    $('.loading').hide();
                } else {
                    $('#pop_user_identity #identity_list tbody tr').remove();
                    for (var key in data['identity']) {
                        $('#pop_user_identity [name=' + key + ']').val(data['identity'][key]);
                    }
                    for (var key in data['identity_list']) {
                        var identity = data['identity_list'][key];
                        var hover = '';
                        if (identity['id'] == data['identity']['id']) {
                            hover = ' hover';
                        }
                        var identity_item = '<tr class="row' + hover + '" identity_id="' + identity['id'] + '">' +
                            '<td class="cell">' + identity['series'] + '-' + identity['number'] + '</td>' +
                            '<td class="cell">' + identity['date'] + '-' + identity['expire_date'] + '</td>' +
                            '<td class="cell">' + identity['comment'] + '</td></tr>';
                        $('#pop_user_identity #identity_list tbody').append(identity_item);
                    }
                }
            }
        });
    }
    popMenuPosition('#pop_user_identity', 'single');
}

function user_identity_Update() {
    var user_id = $('#user_list tbody tr.hover').attr('user_id');
    var identity_id = $('#pop_user_identity #identity_list tbody tr.hover').attr('identity_id');
    if(identity_id==undefined){ identity_id = 'add' }
    var ajax_array = {};
    ajax_array['user_id'] = user_id;
    ajax_array['identity_id'] = identity_id;
    ajax_array['series'] = $('#pop_user_identity [name=series]').val();
    ajax_array['number'] = $('#pop_user_identity [name=number]').val();
    ajax_array['date'] = $('#pop_user_identity [name=date]').val();
    var extended_date = $('#pop_user_identity [name=extended_date]').val();
    if(extended_date) ajax_array['extended_date'] = extended_date;
    ajax_array['expire_date'] = $('#pop_user_identity [name=expire_date]').val();
    ajax_array['check_date'] = $('#pop_user_identity [name=check_date]').val();
    ajax_array['comment'] = $('#pop_user_identity [name=comment]').val();
    $.ajax({ url:'/system/post/personal/ajax/identity_update/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                if(data['identity_id']){
                    identity_id = data['identity_id'];
                }
                userIdentityEdit(user_id,identity_id);
            }
        }
    });
}

function userIdentityRemove(user_id,identity_id) {
    var ajax_array = {};
    ajax_array['identity_id'] = identity_id;
    $.ajax({ url:'/system/post/personal/ajax/identity_remove', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                userIdentityEdit(user_id,'none');
            }
        }
    });
}

function validateIdentity() {
    $.validator.setDefaults({
        submitHandler: function() {
            user_identity_Update();
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
    $("#pop_user_identity form").tooltip({
        show: false,
        hide: false
    });

    $("#pop_user_identity form").validate({ // validate the comment form when it is submitted
        rules: {
            series: {
                required: true,
                minlength: 1,
                maxlength: 8
            },
            number: {
                required: true,
                minlength: 1,
                maxlength: 32
            },
            date: {
                required: true,
                minlength: 10
            },
            expire_date: {
                required: true,
                minlength: 10
            },
            check_date: {
                required: true,
                minlength: 10
            }
        },
        messages: {
            series: {
                required: "Необходима серия удостоверения",
                minlength: "Минимум 1 символов",
                maxlength: "Максимум 8 символа"
            },
            number: {
                required: "Необходим номер удостоверения",
                minlength: "Минимум 1 символов",
                maxlength: "Максимум 32 символа"
            },
            date: {
                required: "Необходима дата выдачи",
                minlength: "Некорректный формат, пример: 30.12.1990"
            },
            expire_date: {
                required: "Необходима дата продления",
                minlength: "Некорректный формат, пример: 30.12.1990"
            },
            check_date: {
                required: "Необходима дата продления",
                minlength: "Некорректный формат, пример: 30.12.1990"
            }

        }
    });
}
