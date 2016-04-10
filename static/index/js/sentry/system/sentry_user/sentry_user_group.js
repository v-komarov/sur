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

    $('.table_select').on('click', '.header .cell', function(){
        //var table_id = $(this).parents('table').attr('id');
        var model_name = $(this).parent('.header').attr('model_title');
        list_Show(model_name);
    });
    $('.table_select').on('click', '.header .choice', function(){
        var model_name = $(this).parent('.header').attr('model_title');
        var choice = $(this).attr('choice');
        if(choice=='yes'){
            $(this).attr('choice','no');
            $('.table_select tbody tr[model_name='+model_name+'] .choice').attr('choice','no');
        } else {
            $(this).attr('choice','yes');
            $('.table_select tbody tr[model_name='+model_name+'] .choice').attr('choice','yes');
        }
    });
    $('.table_select').on('click', '.select__item', function() {
        //#permission_list
        var model_name = $(this).attr('model_name');
        var permission_id = $(this).attr('permission_id');
        var choice = $(this).find('.choice').attr('choice');
        if(choice=='yes'){
            $(this).find('.choice').attr('choice','no');
            //$('.table_select tbody [model_title='+model_name+'] .choice').attr('choice','no');
        } else {
            $(this).find('.choice').attr('choice','yes');
        }
        select_title__Choice(model_name);
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
                var position = 0;
                var model_check = '';
                for(var key in data['permissions']) {
                    var permission = data['permissions'][key];
                    if( !$('table#permission_list tbody .row').is('[model_title='+permission['model_name']+']') )
                    {
                        var row_title = '<tr class="row header" model_title="'+permission['model_name']+'" show="no">' +
                            '<td class="choice" choice="yes"><div class="chechbox"></div></td>' +
                            '<td class="cell">'+permission['model_description']+'</td></tr>';
                        $('table#permission_list tbody').append(row_title);
                    }
                    var permission_txt = '';
                    if(permission['position']!='None') permission_txt = permission['position']+'. ';
                    permission_txt += permission['name'];
                    var row = '<tr class="row select__item hide" model_name="'+permission['model_name']+'" permission_id="'+permission['id']+'" >' +
                        '<td class="choice" choice="'+permission['choice']+'"><div class="chechbox"></div></td>' +
                        '<td class="cell" name="permission" >'+permission_txt+'</td></tr>';

                    var position_string_index = permission['position'].indexOf('.');
                    var position_check = permission['position'].slice(0, position_string_index);
                    var tr_split = '<tr class="row_split hide" model_name="'+permission['model_name']+'"><td colspan="2"></td></tr>';
                    if(position_check!=position) {
                        position = position_check;
                        if(model_check==permission['model_name']){
                            $('table#permission_list tbody').append(tr_split);
                        } else {
                            model_check = permission['model_name'];
                        }
                    }

                    $('table#permission_list tbody').append(row);
                }
                select_title__Choice('permission');

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
                select_title__Choice('notice');
                loading('end');
            }
        },
        error: function(data) {
            loading('end');
        }
    });
}


function select_title__Choice(model_name) {
    var model_title = '';
    var choice = '';
    var choice_title = '';
    var select_list = {};
    if(model_name=='permission') {
        $('table#permission_list tbody tr:not(.row_split)').each(function(){
            if( $(this).attr('model_title') ){
                model_title = $(this).attr('model_title');
                select_list[model_title] = {'all':0,'choice':0};
            }
            else {
                select_list[model_title]['all']++;
                choice = $(this).children('td.choice').attr('choice');
                if(choice=='yes') {
                    select_list[model_title]['choice']++;
                }
            }
        });
        console.log(select_list);
        for(var key in select_list){
            if(select_list[key]['choice']==0) choice_title = 'no';
            else if(select_list[key]['all']==select_list[key]['choice']) choice_title= 'yes';
            else choice_title = 'part';
            $('table.table_select tr[model_title='+key+'] td.choice').attr('choice',choice_title);
        }
    }
    else {
        select_list[model_name] = {'all':0,'choice':0};
        $('table#notice_list tr[model_name='+model_name+']:not(.row_split)').each(function(){
            select_list[model_name]['all']++;
            choice = $(this).children('td.choice').attr('choice');
            if(choice=='yes') {
                select_list[model_name]['choice']++;
            }
        });

        if(select_list[model_name]['choice']==0) choice_title = 'no';
        else if(select_list[model_name]['all']==select_list[model_name]['choice']) choice_title= 'yes';
        else choice_title = 'part';
        $('table.table_select tr[model_title='+model_name+'] td.choice').attr('choice',choice_title);
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


function list_Show(model_name) {
    //console.log(model_name);
    var tr_title = $('.table_select tr[model_title='+model_name+']');
    var show = tr_title.attr('show');
    if(show=='yes'){
        tr_title.attr('show','no');
        $('.table_select tbody tr[model_name='+model_name+']').hide();
    } else {
        tr_title.attr('show','yes');
        $('.table_select tbody tr[model_name='+model_name+']').show();
    }
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
