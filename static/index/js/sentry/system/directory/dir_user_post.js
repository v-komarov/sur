$(document).ready(function() {

    $(".tableInfo").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='add'){
            user_postAjax('create');
        } else if(action=='delete'){
            if (confirm('Уверенны, что хотите удалить должность?')){
                var post_id = $(this).parents('.edit').attr('post_id');
                postDelete(post_id);
            }
        } else if(action=='cancel'){
            postCancel();
        } else if(action=='save'){
            var post_id = $(this).parents('.edit').attr('post_id');
            postUpdate(post_id);
        }
    });

    $('.tableInfo tbody').on('click', '.row:not(.edit)', function() {
        //if($.inArray('main.directory_user_post_change', lunchbox['permissions'])>=0) {
        var post_id = $(this).attr('post_id');
        postCancel();
        postEdit(post_id);
        //}
    });


    $('.tableInfo input[name=post_name]').bind('change keyup', function( event ){
        user_postAjax('search');
    });

    user_postAjax('search');
});

function user_postAjax(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/user_post/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'id': $('.tableInfo thead select[name=region]').val(),
            'name': $('.tableInfo thead input[name=post_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['post']!=null){
                setTable(data['post']);
            }
        }
    });
}

function setTable(data) {
    $('.tableInfo tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" post_id="'+data[key]['id']+'" >' +
            '<td class="cell" colspan="2">'+data[key]['name']+'</td></tr>';
        $('.tableInfo tbody').append(object_item);
        count ++;
    }
    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function postEdit(post_id) {
    var tr = $('.tableInfo tbody tr[post_id='+post_id+']');
    var post_name = tr.find('td:eq(0)').text().replace(/"/g,'&quot;');
    tr.attr('class','row edit').find('td').removeClass('cell');
    tr.attr('old_post',post_name);
    var div_delete = '';
    //if($.inArray('main.directory_user_post_delete', lunchbox['permissions'])>=0) {
    div_delete = '<div class="btn_ui btn_34" action="delete" icon="delete"><div class="icon"></div></div>';
    //}
    var td_eq1 = '<table style="width: 100%"><tr>' +
        '<td><input style="margin: 5px 0 0 5px" type="text" value="'+post_name+'"></td>' +
        '<td><div class="btn_ui btn_34" action="save" icon="save"><div class="icon"></div></div>' +
        '<div class="btn_ui btn_34" action="cancel" icon="cancel"><div class="icon"></div></div>' +
        div_delete +
        '</td></tr></table>';
    tr.find('td:eq(0)').html(td_eq1);
}

function postUpdate(post_id) {
    var tr = $('.tableInfo tbody tr[post_id='+post_id+']');
    var post_name = tr.find('td:eq(0) input').val();
    if(tr.attr('old_post')==post_name){
        postCancel();
    } else {
        $.ajax({ url:'/system/directory/user_post/ajax/update/', type:'get', dataType:'json',
            data:{
                'id': post_id,
                'name': post_name
            },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    tr.attr('old_post',post_name);
                    postCancel();
                }
            }
        });
    }
}

function postDelete(post_id) {
    $.ajax({ url:'/system/directory/user_post/ajax/delete/?id='+post_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                postCancel();
            } else {
                $('.tableInfo tbody tr[post_id='+post_id+']').remove();
            }
        }
    });
}

function postCancel() {
    var tr = $('.tableInfo tbody tr.edit').attr('class','row');
    var post_name = tr.attr('old_post');
    tr.removeAttr('old_post');
    tr.find('td:eq(0)').html(post_name).attr('class','cell');
}

