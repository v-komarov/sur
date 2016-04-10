$(document).ready(function() {
	main_form = $('#main_form');

    $('#date_create').datetimepicker({
        showAnim: "blind",
        dateFormat: "yy-mm-dd",
        changeYear: true,
        showOn: "button",
        buttonImage: "/static/index/img/calendar.gif",
        buttonImageOnly: true
    });

	CKEDITOR.replace('news', {
		toolbar: 'Basic',
		enterMode: CKEDITOR.ENTER_BR
	});
	if (CKEDITOR) {
		//CKEDITOR.config.filebrowserBrowseUrl = '/explorer/?pop=3'
		CKEDITOR.config.removePlugins = 'save, elementspath, newpage, font, smiley';
	}

    main_form.on('click','.visible', function() {
        var visible = main_form.find('.visible div').attr('class');
        if(visible=='yes'){
            main_form.find('.visible div').attr('class','no');
        } else {
            main_form.find('.visible div').attr('class','yes');
        }
    });

    $('#admin_change').on('click','[action=open_explorer]', function() {
        var url = '/explorer/?input='+$(this).parent().find('input').attr('id');
        var winName = 'explorer';
        var params = 'menubar=yes, location=no, resizable=yes, scrollbars=yes, status=yes';
        var newWin = window.open(url, winName, params);
        newWin.focus();
    });
})

function newsSave() {
    var array = {};
    array['main_id'] = main_form.attr('main_id');

    array['visible'] = main_form.find('.visible div').attr('class');
    array['title'] = main_form.find('input#title').val();
    array['text'] = $('.cke_wysiwyg_frame').contents().find(".cke_contents_ltr").html();
    array['entry_thumb'] = main_form.find('input#input_thumb').val();
    array['date_create'] = main_form.find('input#date_create').val();
	array['tag_section'] = tags.attr('tag_section');
    array['tags'] = tagsPack();
    $.ajax({ url:'/ajax/news/save/', type:'post', dataType:'json', data:array,
        success: function(data){
            alert('1');
            console.log('news_id: '+data['id']);
            main_form.attr('main_id',data['id']);
            for (var i = 0; i < data['tags'].length; i++) {
                tags_list.find('[tag_transfer='+data['tags'][i]['transfer']+']').attr('tag_id',data['tags'][i]['id']);
            }
            //console.log('date_create: '+data['date_create']);
            main_form.find('input#date_create').val(data['date_create'])
            alert(data['answer']);
            /*
            if(data['answer'] == 'updated') {
                alert(action+' updated');
            } else if(data['add']) {
                location.replace('/admin/index/news/'+data['add']+'/');
            } else if(data['answer'] == 'deleted') {
                location.replace('/admin/index/news/');
            }
            */
        }
    });
    binds();
}

function newsDelete() {
    var id = main_form.attr('main_id');
    $.ajax({ url:'/ajax/news/delete/', type:'get', data:{'news_id':id},
        success: function(data){
            alert(data['answer']);
            /*
             if(data['answer'] == 'updated') {
             alert(action+' updated');
             } else if(data['add']) {
             location.replace('/admin/index/news/'+data['add']+'/');
             } else if(data['answer'] == 'deleted') {
             location.replace('/admin/index/news/');
             }
             */
        }
    });
}

/*
$(function() {
    $('form input[type="button"]').click(function() {

    })
});
*/