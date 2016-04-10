$(document).ready(function() {
    main_form = $('#portfolio_form');
    tags = $('#tags');
    tag_change = $('#tag_change');

	$('#date_create').datetimepicker({
        showAnim: "blind",
        dateFormat: "yy-mm-dd",
        changeYear: true,
        showOn: "button",
        buttonImage: "/static/index/img/calendar.gif",
        buttonImageOnly: true
    });

    $('#admin_change').on('click','[action=open_explorer]', function() {
        var url = '/explorer/?input='+$(this).parent().find('input').attr('id');
        var winName = 'explorer';
        var params = 'menubar=yes, location=no, resizable=yes, scrollbars=yes, status=yes';
        var newWin = window.open(url, winName, params);
        newWin.focus();
    });
})

function Portfolio_save(action) {
    array = {};
    array['main_id'] = main_form.attr('main_id');

    if(array['main_id']=='add'){
        action = 'add';
    } else if(action=='delete') {
        action ='delete';
    } else {
        action = 'update';
    }

    array['title'] = $('input#title').val();
    array['description'] = $('[name=description]').val();
    array['thumb'] = $('#input_thumb').val();
    array['url'] = $('#input_url').val();
    array['width'] = $('input#width').val();
    array['height'] = $('input#height').val();
    array['date_create'] = $('input#date_create').val();
	array['tag_section'] = tags.attr('tag_section');

    //array['tag_title'] = main_form.find('input#tag_title').val();
    //array['tags'] = main_form.find('.tags input').val();
    $.ajax({ url:'/ajax/portfolio/'+action+'/', type:'post', dataType:'json', data:array,
        success: function(data){
            if(data['answer'] == 'updated') {
                alert(action+' done');
            } else if(data['add']) {
                location.replace('/admin/index/portfolio/'+data['add']+'/');
            } else if(data['answer'] == 'deleted') {
                location.replace('/admin/index/portfolio/');
            }
        }
    });
}


/*
$(function() {
    $('form input[type="button"]').click(function() {

    })
});
*/