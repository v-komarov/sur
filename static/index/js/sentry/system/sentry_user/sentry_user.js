$(document).ready(function() {
    $(".searchObject select").on('change', function() {
        sentry_user_Search();
    });
    $('#users_list thead input').bind('change keyup', function( event ) {
        sentry_user_Search();
    });
    $("#users_list thead").on('change', 'select', function() {
        sentry_user_Search();
    });

    // Choice user
    $('#users_list tbody').on('click', '.row', function() {
        var sentry_user_id = $(this).attr('sentry_user_id');
        sentry_user_Choice(sentry_user_id);
        $('body').animate({"scrollTop":0},'fast');
    });

    $('[stage=user_access]').on('click', 'td.switch', function() {
        if($(this).attr('checked')=='checked') {
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
    });

    // .btn_ui
    $('body').on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add') {
            sentry_user_Choice('add');
        }
        else if(action=='cancel') {
            sentry_user_Cancel();
        }
        else if(action=='back') {
            sentry_user_Search();
            $('#wellcome').show();
            $('#user_edit').hide();
            $("body").animate({"scrollTop":0},'fast');
        }
        else if(action=='delete') {
            if (confirm('Уверенны, что хотите удалить?')) {
                var sentry_user_id = $('table#user_form').attr('sentry_user_id');
                sentry_user_Delete(sentry_user_id);
            }
        }
        else if(action=='reset') {
            var sentry_user_id = $('#user_form').attr('sentry_user_id');
            sentry_user_Choice(sentry_user_id);
            $("body").animate({"scrollTop":0},'fast');
        }
    });

    $('#group_list').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        var group_id = $('#group_list select :selected').val();
        var group_name = $('#group_list select :selected').text();
        if(group_name!='') permissionGroup('add',group_id,group_name);
    });
    $('#group_list').on('click', '.close', function() {
        var group_id = $(this).parent('.item').attr('group_id');
        permissionGroup('delete',group_id);
    });

    $('#permission_list tbody').on('click', '.permission', function() {
        var app_label = $(this).attr('app_label');
        var permission_id = $(this).attr('permission_id');
        var choice = $(this).find('[choice]').attr('choice');
        if(choice=='yes') {
            $(this).find('[choice]').attr('choice','no');
        } else {
            $(this).find('[choice]').attr('choice','yes');
        }
        permissionsIconChoice();
    });
    $('#permission_list tbody').on('click', '.header .choice', function() {
        var app_label = $(this).parent('.header').attr('app_label');
        var choice = $(this).attr('choice');
        console.log(app_label, choice);
        if(choice=='yes') {
            $(this).attr('choice','no');
            $('#permission_list tbody tr[app_label='+app_label+'] .choice').attr('choice','no');
        } else {
            $(this).attr('choice','yes');
            $('#permission_list tbody tr[app_label='+app_label+'] .choice').attr('choice','yes');
        }
    });
    $('#permission_list tbody').on('click', '.header .cell', function() {
        var app_label = $(this).parent('.header').attr('app_label');
        titleShow(app_label);
    });

    sentry_user_Search();
    sentry_user_Validate();
});


function permissionGroup(action,group_id,group_name) {
    if(action=='add') {
        var span = '<span class="item" group_id="'+group_id+'"><span class="txt">'+group_name+'</span><span class="close" title="Удалить"></span></span>';
        $('#group_list #group_include').append(span);
        $('#group_list select option[value='+group_id+']').hide();
        $('#group_list select').val('');
        $('#group_list select').trigger("liszt:updated");
    }
    else if(action=='delete') {
        $('#group_list #group_include [group_id='+group_id+']').remove();
        $('#group_list select option[value='+group_id+']').show();
    }
}


function titleShow(app_label) {
    var tr_title = $('#permission_list tbody tr[app_label='+app_label+']');
    var show = tr_title.attr('show');
    if(show=='yes'){
        tr_title.attr('show','no');
        $('#permission_list tbody tr[app_label='+app_label+']:not(.header)').hide();
    } else {
        tr_title.attr('show','yes');
        $('#permission_list tbody tr[app_label='+app_label+']').show();
    }
}


function sentry_user_Search() {
    loading('begin');
    var ajax_array = {
        'is_active': $('.searchObject select[name=is_active]').val(),
        'full_name': $('#users_list thead input[name=full_name]').val(),
        'username': $('#users_list thead input[name=username]').val(),
        'user_post': $('#users_list thead select[name=user_post]').val()
    };
    $.ajax({ url:'/system/sentry_user/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            loading('end');
            if(data['error']!=null){
                alert(data['error']);
            }
            else if(data['user_list']){
                setTable(data['user_list']);
            }
        }
    });
}


function setTable(data) {
    $('#users_list tbody tr').remove();
    var count = 0;
    for(var key in data){
        if(data[key]['is_active']==0){ var active = ' red'; } else { var active = ''; }
        var object_item = '<tr class="row'+active+'" sentry_user_id="'+data[key]['id']+'" >' +
            '<td class="cell">'+data[key]['full_name']+'</td>' +
            '<td class="cell">'+data[key]['username']+'</td>' +
            '<td class="cell">'+data[key]['post__name']+'</td>' +
            '<td class="cell" action="permission"></td></tr>';
        $('#users_list tbody').append(object_item);
        count ++;
    }
    $('.result_count').html('Найдено: '+count);
}


function sentry_user_Choice(sentry_user_id) {
    if(!sentry_user_id) {
        console.log('clear');
        $('#user_form input, #user_form select, #user_form textarea').val('');
        $('[stage=user_access] [name=access]').removeAttr('checked');
        $('#group_list #group_include .item').remove();
        $('#permission_list td.choice').attr('choice','no');
        $('#permission_list select#group').val('');
    }
    else {
        $('#wellcome').hide();
        $('#user_edit').show();
        $('#user_form').removeAttr('sentry_user_id');
        $.ajax({ url:'/system/sentry_user/ajax/get/?sentry_user='+sentry_user_id, type:'get', dataType:'json',
            success: function(data) {
                if(data['error']!=null) {
                    alert(data['error']);
                } else {
                    $('#user_form input, #user_form select, #user_form textarea').val('');
                    if(!!data['user']) {
                        if(!!data['user']['id']) {
                            $('#user_form').attr('sentry_user_id', data['user']['id']);
                            $('#user_form .cabinet_title').text('Пользователь: ' + data['user']['full_name']);
                            $('#user_form [name=full_name]').val(data['user']['full_name']);
                            $('#user_form [name=mobile_phone]').val(data['user']['mobile_phone']);
                            $('#user_form [name=email]').val(data['user']['email']);
                            $('#user_form [name=address]').val(data['user']['address']);
                            $('#user_form select[name=user_post]').val(data['user']['post']);
                        }
                        else {
                            $('#user_form input').each(function () {
                                $(this).val('')
                            });
                        }
                        if(!!data['user']['auth_user_id']) {
                            $('[stage=user_access]').attr('auth_user_id', data['user']['auth_user_id']);
                            $('[stage=user_access] [name=username]').val(data['user']['username']);
                            if(data['user']['auth_is_active']) {
                                $('[stage=user_access] [name=access]').attr('checked', 'checked');
                            } else {
                                $('[stage=user_access] [name=access]').removeAttr('checked');
                            }
                        }
                        else {
                            $('[stage=user_access]').attr('auth_user_id', 'add');
                            $('[stage=user_access] input').each(function () {
                                $(this).val('')
                            });
                            $('[stage=user_access] [name=access]').attr('checked', 'checked');
                        }
                    }
                }

                $('#group_list #group_include .item').remove();
                $('#group_list select option').remove();
                $('#group_list select').append('<option></option>');
                for(var key in data['group_list']){
                    var group = data['group_list'][key];
                    var option_class = '';
                    if(group['choice']=='yes'){
                        permissionGroup('add',group['id'],group['name']);
                        option_class = 'class="hide"';
                    }
                    var option = '<option '+option_class+' value="'+group['id']+'">'+group['name']+'</option>';
                    $('#group_list select').append(option);
                }
                $('#group_list select').val('');
                $('#group_list select').trigger("liszt:updated");

                $('table#permission_list tbody .row').remove();
                $('table#permission_list tbody .row_split').remove();
                var model = '';
                for(var key in data['permission_list']){
                    var permission = data['permission_list'][key];
                    if(!$('table#permission_list tbody .row').is('[app_label='+permission['app_label']+']') ){
                        var row_title = '<tr class="row header" app_label="'+permission['app_label']+'" show="no">' +
                            '<td class="choice" choice="yes"><div class="chechbox"></div></td>' +
                            '<td class="cell">'+permission['app_label']+'</td></tr>';
                        $('table#permission_list tbody').append(row_title);
                    }
                    var permission_txt = '';
                    permission_txt += permission['name'];
                    var row = '<tr class="row permission hide" ' +
                        'app_label="'+permission['app_label']+'" ' +
                        'model="'+permission['model']+'" ' +
                        'codename="'+permission['codename']+'" ' +
                        'permission_id="'+permission['id']+'" >' +
                        '<td class="choice" choice="'+permission['choice']+'"><div class="chechbox"></div></td>' +
                        '<td class="cell" name="permission" >'+permission_txt+'</td></tr>';

                    var tr_split = '<tr class="row_split hide" app_label="'+permission['app_label']+'" model="'+permission['model']+'"><td colspan="2"></td></tr>';
                    if(model!=permission['model']){
                        $('table#permission_list tbody').append(tr_split);
                        model = permission['model'];
                    }
                    $('table#permission_list tbody').append(row);
                }
                permissionsIconChoice();
            }
        });
    }
}


function permissionsIconChoice() {
    var app_label = '';
    var choice = '';
    var permissions = {};
    $('#permission_list tbody tr:not(.row_split)').each(function(){
        app_label = $(this).attr('app_label');
        if( !permissions[app_label] ){
            permissions[app_label] = {'all':0,'choice':0};
        }
        else {
            permissions[app_label]['all']++;
            choice = $(this).find('[choice]').attr('choice');
            if(choice=='yes') {
                permissions[app_label]['choice']++;
            }
        }
    });
    for(var key in permissions){
        if(permissions[key]['choice']==0){
            $('table#permission_list tbody tr[app_label='+key+'].header td.choice').attr('choice','no');
        }
        else if(permissions[key]['all']==permissions[key]['choice']){
            $('table#permission_list tbody tr[app_label='+key+'].header td.choice').attr('choice','yes');
        }
        else {
            $('table#permission_list tbody tr[app_label='+key+'].header td.choice').attr('choice','part');
        }
    }
}


function sentry_user_Update() {
    loading('begin');
    var ajax_data = get_each_value('#sentry_user');
    var sentry_user_id = $('table#user_form').attr('sentry_user_id');
    if(!!sentry_user_id) ajax_data['sentry_user'] = sentry_user_id;
    var auth_user_id = $('tr[stage=user_access]').attr('auth_user_id');
    if(!!auth_user_id) ajax_data['auth_user'] = auth_user_id;

    /*
     $('#user_form input, #user_form select, #user_form textarea').each(function() {
     var item_value = $(this).val();
     if(!!item_value) ajax_data[$(this).attr('name')] = item_value;
     });
     */

    if( $('[stage=user_access] [name=access]').is('[checked=checked]') ) {
        ajax_data['auth_is_active'] = 1;
    } else {
        ajax_data['auth_is_active'] = 0;
    }

    ajax_data['group_list'] = [];
    ajax_data['permission_list'] = [];
    $('#group_list #group_include .item').each(function() {
        var group_id = $(this).attr('group_id');
        ajax_data['group_list'].push(group_id);
    });
    ajax_data['group_list'] = JSON.stringify(ajax_data['group_list']);
    $('#permission_list tbody').find('.permission').each(function() {
        var app_label = $(this).attr('app_label');
        var choice = $(this).find('.choice').attr('choice');
        var permission_id = $(this).attr('permission_id');
        if(choice=='yes' && permission_id!=null) {
            ajax_data['permission_list'].push(permission_id);
        }
    });
    ajax_data['permission_list'] = JSON.stringify(ajax_data['permission_list']);

    $.ajax({ url:'/system/sentry_user/ajax/update/', type:'post', dataType:'json', data: ajax_data,
        success: function(data) {
            loading('end');
            if(data['error']!=null) {
                alert(data['error']);
                $('#users_list tbody [sentry_user_id=new]').remove();
            } else if(data['new_user']) {
                $('#user_form')
                    .attr('sentry_user_id',data['new_user']['sentry_user_id'])
                    .attr('auth_user_id',data['new_user']['auth_user_id']);
                popMessage('Сохранено','green');
            } else {
                popMessage('Сохранено','green');
            }
        }
    });
}


function sentry_user_Delete(sentry_user_id) {
    $.ajax({ url:'/system/sentry_user/ajax/delete/?sentry_user='+sentry_user_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            }
            else {
                sentry_user_Search();
                $('#wellcome').show();
                $('#user_edit').hide();
                $("body").animate({"scrollTop":0},'fast');
            }
        }
    });
}


function sentry_user_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            sentry_user_Update();
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
    $("form#sentry_user").tooltip({
        show: false,
        hide: false
    });

    $("form#sentry_user").validate({ // validate the comment form when it is submitted
        rules: {
            full_name: {
                required: true,
                minlength: 3
            },
            username: {
                required: true,
                minlength: 3
            }
        },
        messages: {
            full_name: {
                required: "Необходимо Ф.И.О.",
                minlength: "Минимум 3 знака"
            },
            username: {
                required: "Необходим логин",
                minlength: "Минимум 3 знака"
            }
        }
    });
}