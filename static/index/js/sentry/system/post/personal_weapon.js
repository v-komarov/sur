$(document).ready(function() {
    $('#pop_user_weapon .personal_pop_buttons').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        var weapon_id = $('#pop_user_weapon #weapon_list tbody tr.hover').attr('weapon_id');
        if(action=='reset'){
            userWeaponEdit(user_id,weapon_id);
        }
        else if(action=='remove'){
            if(confirm('Удалить РСЛа?')){
                userWeaponRemove(user_id,weapon_id);
            }
        }
    });
    $('#pop_user_weapon #weapon_list').on('click', '[action=object_add]', function(){
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        userWeaponEdit(user_id,'add');
    });

    $('#pop_user_weapon #weapon_list tbody').on('click', 'tr', function(){
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        var weapon_id = $(this).attr('weapon_id');
        userWeaponEdit(user_id,weapon_id);
    });

    $('#pop_user_weapon .datepicker').datepicker("destroy");
    var dates = $("#pop_user_weapon #from, #pop_user_weapon #to").datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        defaultDate: "+1w",
        numberOfMonths: 1,
        onSelect: function(selectedDate){
            var option = this.id == "from" ? "minDate" : "maxDate",
                instance = $(this).data( "datepicker" ),
                date = $.datepicker.parseDate(
                    instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                    selectedDate, instance.settings);
            dates.not(this).datepicker("option", option, date);
        }
    });

    validateWeapon();
});


function userWeaponEdit(user_id, weapon_id){
    $('#pop_user_weapon input').val('');
    $('#pop_user_weapon textarea').val('');
    if(weapon_id == 'add') {
        $('#pop_user_weapon #weapon_list tbody tr.hover').attr('class', 'row');
    } else {
        var tr = $('#user_list tbody tr[user_id='+user_id+']');
        tr.attr('class','row hover');

        $.ajax({ url:'/system/post/personal/ajax/get_weapon/', type:'get', dataType:'json', data:{'user_id':user_id,'weapon_id':weapon_id},
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                    $('.loading').hide();
                } else {
                    $('#pop_user_weapon #weapon_list tbody tr').remove();
                    if(data['weapon']){
                        for(var key in data['weapon']){
                            $('#pop_user_weapon [name='+key+']').val(data['weapon'][key]);
                        }
                        $('#pop_user_weapon select[name=weapon] option[value='+data['weapon']['weapon_id']+']').attr("selected", "selected");

                        for(var key in data['weapon_list']){
                            var weapon = data['weapon_list'][key];
                            var hover = '';
                            if(weapon['id']==data['weapon']['id']){ hover = ' hover';}
                            var weapon_item = '<tr class="row'+hover+'" weapon_id="'+weapon['id']+'" last_weapon="true">' +
                                '<td class="cell">'+weapon['number']+'</td>' +
                                '<td class="cell">'+weapon['weapon_name']+'</td>' +
                                '<td class="cell">'+weapon['weapon_series']+' - '+weapon['weapon_number']+'</td>' +
                                '<td class="cell" name="date_range">'+weapon['date']+' - '+weapon['expire_date']+'</td></tr>';
                            $('#pop_user_weapon #weapon_list tbody').append(weapon_item);
                        }
                    }
                }
            }
        });
    }
    popMenuPosition('#pop_user_weapon','single');
}

function userWeaponSave() {
    var user_id = $('#user_list tbody tr.hover').attr('user_id');
    var weapon_id = $('#pop_user_weapon #weapon_list tbody tr.hover').attr('weapon_id');
    if(weapon_id==undefined){ weapon_id = 'add' }
    var ajax_array = {};
    ajax_array['user_id'] = user_id;
    ajax_array['weapon_id'] = weapon_id;
    ajax_array['number'] = $('#pop_user_weapon [name=number]').val();
    ajax_array['date'] = $('#pop_user_weapon [name=date]').val();
    ajax_array['expire_date'] = $('#pop_user_weapon [name=expire_date]').val();
    ajax_array['weapon'] = $('#pop_user_weapon select[name=weapon]').val();
    ajax_array['comment'] = $('#pop_user_weapon [name=comment]').val();
    $.ajax({ url:'/system/post/personal/ajax/weapon_save/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                if(data['weapon_id']){
                    weapon_id = data['weapon_id'];
                }
                userWeaponEdit(user_id,weapon_id);
            }
        }
    });
}

function userWeaponRemove(user_id,weapon_id) {
    var ajax_array = {};
    ajax_array['weapon_id'] = weapon_id;
    $.ajax({ url:'/system/post/personal/ajax/weapon_remove/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                userWeaponEdit(user_id,'none');
            }
        }
    });
}

function validateWeapon() {
    $.validator.setDefaults({
        submitHandler: function() {
            userWeaponSave();
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
    $("#pop_user_weapon form").tooltip({
        show: false,
        hide: false
    });

    $("#pop_user_weapon form").validate({ // validate the comment form when it is submitted
        rules: {
            number: {
                required: true,
                minlength: 1,
                maxlength: 16
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
            number: {
                required: "Необходим номер разрешения",
                minlength: "Минимум 1 символов",
                maxlength: "Максимум 16 символа"
            },
            date: {
                required: "Необходима дата выдачи",
                minlength: "Некорректный формат, пример: 30.12.1990"
            },
            expire_date: {
                required: "Необходима дата окончания",
                minlength: "Некорректный формат, пример: 30.12.1990"
            }
        }
    });
}
