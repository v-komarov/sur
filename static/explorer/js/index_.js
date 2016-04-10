$(document).ready(function() {
    pack = {};
    opened_dirs = [];
    tree = $('#tree');
    toolbar = $('.toolbar');
    scope = $('.content .scope');
    breadcrumbs = $('.content .breadcrumbs'); breadcrumbs.attr('path','/');

    $.ajax({ url:'/explorer/index/', dataType:'json',
        success: function(data) {
            Tree_refresh(data['tree']);
            Open('json', data['open']);
        }
    });

    tree.on('click','.link', function() {
	    Toolbar_buttons(['upload','mkdir']);
        path = $(this).parent('.dir').attr('path');
	    Open('path',path);
    });
    tree.on('click','.icon_dir', function() {
        path = $(this).parent('.dir').attr('path');
	    Nesting(path);
    });

    toolbar.on('click','.button:not(.excluded)', function() {
        pack['path'] = breadcrumbs.attr('path');
        pack['name'] = scope.find('.selected .name').text();
        pack['type'] = scope.find('.selected div').attr('class');
        action = $(this).children('.icon').attr('class').replace('icon ','');
        if(action=='mkdir') {
	        if(scope.find('.selected input').is('input')) {
                mkdir_check(); }
            else {
                mkdir_click(); }
        }
        else if(action=='remove') {
	        cmd_remove(); }
    });

    breadcrumbs.on('click','.crumb', function() {
        path = $(this).attr('path');
        Open('path',path);
    });

    scope.on('click','.item:not(.selected)', function() {
        type = $(this).children('div:eq(0)').attr('class');
        if(type=='dir'){
            scope.find('.selected').attr('class','item');
            $(this).attr('class','item selected');
        } else if(type=='file'){
            scope.find('.selected').attr('class','item');
            $(this).attr('class','item selected');
        }
	    Toolbar_buttons(['upload','remove','mkdir','more']);
    });

    scope.on('dblclick','.item', function() {
        type = $(this).children('div:eq(0)').attr('class');
        path = breadcrumbs.attr('path') + $(this).children('.name').text() +'/';
        if(type=='dir') {
	        Toolbar_buttons(['upload','mkdir']);
            Open('path',path);
        }
    });


	csrftoken = 1;
	i = 'a';
	var iframe = '<iframe class="hide1" id="iframe_'+i+'" />';
	var form = '<form method="post" enctype="multipart/form-data" action="/explorer/upload/">' +
		'<input type="hidden" name="csrfmiddlewaretoken" value="'+csrftoken+'" />' +
		'<input type="file" value="'+i+'" name="'+i+'" />' +
		'<input type="submit"></form>';
	$('#upload_file').after(iframe);//.contents().find('body').append(form);
	$('#iframe_'+i).contents().find('body').html(form);

	document.querySelector('#upload_file').onchange = function(e) {
	    var csrftoken = getCookie('csrftoken');
/*
		    .delay(500).change(function(){
		    $(this).parent().submit().prev().one('load',
			    function(){
				    $(this).next()[0].reset(); //очищает инпут для того что бы не сабмитить файл в родительской форме
				    alert($(this).contents().find('body').html());
			    })
*/
		files = this.files;
		for(var i=0; i<files.length; i++) {

			var iframe = '<iframe class="hide1" id="iframe_'+i+'" />';
	        var form = '<form method="post" enctype="multipart/form-data" action="/explorer/upload/">' +
		        '<input type="hidden" name="csrfmiddlewaretoken" value="'+csrftoken+'" />' +
		        '<input type="file" value="'+files[i]+'" name="'+i+'" />' +
		        '<input type="submit"></form>';
			$('#upload_file').after(iframe);//.contents().find('body').append(form);
			$('#iframe_'+i).contents().find('body').append(form);
			//$('#iframe_'+i).contents().find("body").append("I'm in an iframe!");
			//$('#iframe_'+i).remove();
			//iframe.height(100);
			//iframe.contents().find('html body').html(form);

            //alert(files[i].size);
            //alert(files[i].tmp_name);
            //alert(files[i].error);
			/*
	        status = files[i].name +' - '+ files[i].type + '<br />';
            $('#status').append(status);
            pack['path'] = breadcrumbs.attr('path');
            */
            //pack['files'] = files;

        }
    }

    //$('[name=csrfmiddlewaretoken]').val(getCookie('csrftoken'));
})

function Upload2(){
	$this = $('#file_upload');
	set = {
		'url':'/explorer/upload/',
		'type':'POST',
		'dataType':'json'
	}
	if(opt){ $.extend(set,opt); }
	return this.each(function(){
		$this.change(function(){
			xhr = new XMLHttpRequest;
			xhr.open("POST", set.url, true);
			xhr.setRequestHeader("Content-Type", "application/octet-stream");
			xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
			xhr.setRequestHeader("X-File-Name", encodeURIComponent($this.val()));
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			xhr.send(this.files[0]);
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4){
					if(set.dataType == 'json'){
						response = $.parseJSON(xhr.responseText);
						if(response == null) { response = {}; }
					}else{
						response = xhr.responseText;
					}
					set.success.call('',response);
				}
			}
		});
	});
};







function mkdir_click() {
	Toolbar_buttons(['remove','mkdir']);
	dir = '<div class="item selected"><div class="dir" /><input></div>';
	scope.find('.selected').attr('class','item');
	scope.prepend(dir);
	scope.find('input').focus();
	$(".selected input").keypress(function(e) {
		if(e.keyCode==13) {
            mkdir_check();
		}
	});
}
function mkdir_check() {
	scope.find('input').focus();
	pack['name'] = scope.find('.selected input').val();
	if( scope.find('[title="'+pack['name']+'"]').is('div') ) {
		alert('Есть такая папка');
	}
	else if(pack['name']=='') {
		alert('Введите имя')
	}
	else {
        mkdir_action();
	}
}
function mkdir_action() {
	$.ajax({ url:'/explorer/mkdir/', type:'post', dataType:'json', data:pack,
		success: function(data) {
			Tree_refresh(data['tree']);
			Open('json',data['open']);
		}
	})
}

function cmd_remove() {
	if( scope.find('input').length > 0 ) {
		Toolbar_buttons(['upload','mkdir']);
		scope.find('.selected').remove();
	} else {
		dir = scope.find('.selected');
		$.ajax({ url:'/explorer/remove/', type:'post', dataType:'json', data:pack,
			success: function(data) {
                Tree_refresh(data['tree']);
                Open('json',data['open']);
				Toolbar_buttons(['upload','mkdir']);
			}
		})
	}
}

