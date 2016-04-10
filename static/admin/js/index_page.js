$(document).ready(function() {
	main_form = $('#main_form');

	CKEDITOR.replace('ckeditor', {
		toolbar: 'Basic',
		enterMode : CKEDITOR.ENTER_BR
	});
	if (CKEDITOR) {
		CKEDITOR.config.removePlugins =
			'save, elementspath, newpage, font, smiley';
	}

    $('#admin_change').on('click','[action=open_explorer]', function() {
        var url = '/explorer/?input='+$(this).parent().find('input').attr('id');
        var winName = 'explorer';
        var params = 'menubar=yes, location=no, resizable=yes, scrollbars=yes, status=yes';
        var newWin = window.open(url, winName, params);
        newWin.focus();
    });
})

function Page_save(action) {
    array = {};
    array['main_id'] = main_form.attr('main_id');

    if(array['main_id']=='add'){
        action = 'add';
    } else if(action=='delete') {
        action ='delete';
    } else {
        action = 'update';
    }
	array['title'] = main_form.find('input#title').val();
    array['text'] = $('.cke_wysiwyg_frame').contents().find(".cke_contents_ltr").html();
    //array['tags'] = main_form.find('.tags input').val();
    $.ajax({ url:'/ajax/pages/'+action+'/', type:'post', dataType:'json', data:array,
        success: function(data){
            if(data['answer'] == 'updated'){
                alert(action+' updated');
            } else if(data['add']){
                location.replace('/admin/index/page/'+data['add']+'/');
            } else if(data['answer'] == 'deleted'){
                location.replace('/admin/index/page/');
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