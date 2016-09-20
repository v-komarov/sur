$(document).ready(function() {
    // Wellcome
    $("#wellcome .tableInfo").on('click', '.row', function() {
        var group_id = $(this).attr('group_id');
        $('#wellcome').hide();
        $('#group_permissions').show();
        permissions_Get(group_id);
    });
    $("#wellcome").on('click', 'a.link_edit_group', function() {
        $('#wellcome').hide();
        $('#group_edit').show();
        $('#group_edit .tableInfo thead input[name=weapon_name]').val('');
        group_list_Refresh('search','#group_edit');
    });

    // Groups edit
    $("#group_edit").on('click', 'a.link_edit_group', function() {
        $('#wellcome').show();
        $('#group_edit').hide();
        $('#group_edit .tableInfo thead input[name=weapon_name]').val('');
        group_list_Refresh('search','#wellcome');
    });
    $('body').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        console.log(action);
        if(action=='group_item_add'){
            group_list_Refresh('create','#group_edit');
        }
        else if(action=='group_item_cancel'){
            group_Cancel();
        }
        else if(action=='group_item_update'){
            group_item_Update($(this).parents('.edit').attr('group_id'));
        }
        else if(action=='group_item_delete'){
            group_Delete($(this).parents('.edit').attr('group_id'));
        }
    });
    $('#group_edit .tableInfo tbody').on('click', '.row:not(.edit)', function(){
        var group_id = $(this).attr('group_id');
        console.log(group_id);
        group_Cancel();
        group_Edit(group_id);
    });

    $('#group_edit .tableInfo input[name=weapon_name]').bind('change keyup', function( event ){
        group_list_Refresh('search','#group_edit');
    });


    $("#group_select").change(function(){
        var group_id = $("#group_select").val();
        permissions_Get(group_id);
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


    $(".middleBlock").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='group_add'){

        }
        else if(action=='back'){
            $('#wellcome').show();
            $('#group_permissions').hide();
            $("body").animate({"scrollTop":0},'fast');
        }
        else if(action=='delete'){
            var group_id = $('select#group_select').val();
            group_Delete(group_id);
        }
        else if(action=='reset'){
            var group_id = $("#group_select").val();
            permissions_Get(group_id);
            $("body").animate({"scrollTop":0},'fast');
        }
        else if(action=='save'){
            update_Permissions();
        }
    });
});


function permissions_Get(group_id) {
    loading('begin');
    var ajax_data = {};
    ajax_data['group'] = group_id;
    $.ajax({ url:'/system/sentry_user/group/ajax/get_permission/', type:'get', dataType:'json', traditional:true, data:ajax_data,
        success: function(data) {
            if(data['error']!=null) {
                var data_error = data['error'];
                for(var key in data_error){
                    console.log(key+': '+data_error[key]);
                }
            }
            else {
                $('#group_select [value='+group_id+']').attr('selected', 'selected');
                $('table#permission_list tbody .row').remove();
                $('table#permission_list tbody .row_split').remove();
                var model = '';
                for(var key in data['permissions']) {
                    var permission = data['permissions'][key];
                    if( !$('table#permission_list tbody .row').is('[app_label='+permission['app_label']+']') ){
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

                $('table#notice_list tbody .row').remove();
                for(var key in data['notice_list']) {
                    var notice = data['notice_list'][key];
                    var notice_txt = '';
                    if(notice['position']!='None') notice_txt = notice['position']+'. ';
                    notice_txt += notice['description'];
                    var notice_tr = '<tr class="row select__item hide" model_name="notice" notice_id="'+notice['id']+'" >' +
                        '<td class="choice" choice="'+notice['choice']+'"><div class="chechbox"></div></td>' +
                        '<td class="cell" name="notice" >'+notice_txt+'</td></tr>';
                    $('table#notice_list tbody').append(notice_tr);
                }

                permissionsIconChoice();
                loading('end');
            }
        },
        error: function(data) {
            loading('end');
        }
    });
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


function update_Permissions(group_id) {
    loading('begin');
    var ajax_data = {};
    ajax_data['group'] = $("#group_select").val();
    ajax_data['permissions'] = [];
    ajax_data['notice_list'] = [];
    $('#permission_list tbody').find('.row').each(function(){
        var model_name = $(this).attr('model_name');
        var choice = $(this).find('.choice').attr('choice');
        var permission_id = $(this).attr('permission_id');
        if(choice=='yes' && permission_id!=null){
            ajax_data['permissions'].push(permission_id);
        }
    });
    $('#notice_list tbody').find('.row').each(function(){
        var choice = $(this).find('.choice').attr('choice');
        var notice_id = $(this).attr('notice_id');
        if(choice=='yes' && notice_id!=null){
            ajax_data['notice_list'].push(notice_id);
        }
    });
    ajax_data['permissions'] = JSON.stringify(ajax_data['permissions']);
    ajax_data['notice_list'] = JSON.stringify(ajax_data['notice_list']);

    $.ajax({ url:'/system/sentry_user/group/ajax/update_permission/', type:'post', dataType:'json', traditional:true, data:ajax_data,
        success: function(data) {
            if(data['error']!=null) {
                var data_error = data['error'];
                for(var key in data_error) {
                    console.log(key+': '+data_error[key]);
                }
            }
            else {
                loading('end');
                popMessage('Сохранено','green');
            }
        }
    });
}


function group_Edit(group_id){
    var tr = $('#group_edit .tableInfo tbody tr[group_id='+group_id+']');
    var group_name = tr.find('td:eq(0)').text();
    tr.attr('class','row edit').find('td').removeClass('cell');
    tr.attr('old_group',group_name);

    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td class="cell"><input class="wide" type="text" value="'+group_name+'"></td>' +
        '<td>' +
        '<div class="btn_ui btn_34" action="group_item_update" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="group_item_cancel" icon="cancel"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="group_item_delete" icon="delete"><div class="icon"></div></div>' +
        '</td></tr></table>';
    tr.find('td:eq(0)').html(td_eq1);
}


function group_item_Update(group_id){
    var tr = $('#group_edit .tableInfo tbody tr[group_id='+group_id+']');
    var group_name = tr.find('td:eq(0) input').val();
    if(tr.attr('old_group')==group_name){
        group_Cancel();
    }
    else {
        $.ajax({ url:'/system/sentry_user/group/ajax/update/', type:'post', dataType:'json',
            data:{'group_id':group_id,'group_name':group_name},
            success: function(data){
                if(data['error']!=null) alert(data['error']);
                else {
                    tr.attr('old_group',group_name);
                    group_Cancel();
                }
            }
        });
    }
}


function group_Delete(group_id){
    if (confirm('Уверенны, что хотите удалить группу?')){
        $.ajax({ url:'/system/sentry_user/group/ajax/delete/', type:'get', dataType:'json',
            data:{ 'group_id':group_id },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                    group_Cancel();
                }
                else {
                    location.href = '/system/sentry_user/group/';
                }
            }
        });
    }
}


function group_Cancel(){
    var tr = $('#group_edit .tableInfo tbody tr.edit').attr('class','row');
    var group_name = tr.attr('old_group');
    tr.removeAttr('old_group');
    tr.find('td:eq(0)').html(group_name).attr('class','cell');
}


function group_list_Refresh(action,section){
    $('.loading').show();
    $.ajax({ url:'/system/sentry_user/group/ajax/'+action+'/', type:'get', dataType:'json',
        data:{ 'group_name':$('.tableInfo thead input[name=weapon_name]').val() },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['groups']!=null){
                $(section+' .group_list tbody tr').remove();
                for(var key in data['groups']){
                    var object_item =
                        '<tr class="row" group_id="'+data['groups'][key]['id']+'" >' +
                        '<td class="cell" colspan="2">'+data['groups'][key]['name']+'</td></tr>';
                    $(section+' .group_list tbody').append(object_item);
                }
                $('.loading').hide();
            }
        }
    });
}
