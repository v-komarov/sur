$(document).ready(function() {
    if(window.location.search !== '') {
        location_search = getSearch(); //alert( href_get['mode'] );
    }
    var path = '/';
    var name = '';
    pack = {};
    opened_dirs = [];
    div_tree = $('#tree');
    div_toolbar = $('#header .toolbar');
    div_scope = $('.content .scope');
    div_breadcrumbs = $('.content .breadcrumbs'); div_breadcrumbs.attr('path','/');
    Toolbar_buttons( ['upload','mkdir'] );

    $.ajax({ url:'/explorer/index/', dataType:'json',
        success: function(data) {
            media_root = data['media_root'];
            Tree_refresh(data['tree']);
            Open('json', data['open']);
        }
    });

    div_tree.on('click','.link', function() {
	    Toolbar_buttons(['upload','mkdir']);
        path = $(this).parent('.dir').attr('path');
	    Open('path',path);
    });
    div_tree.on('click','.icon_dir', function() {
        path = $(this).parent('.dir').attr('path');
	    Nesting(path);
    });

    div_toolbar.on('click','.button:not(.excluded)', function() {
        pack['path'] = div_breadcrumbs.attr('path');
        pack['name'] = div_scope.find('.selected').attr('name');
        pack['type'] = div_scope.find('.selected').attr('type');
        action = $(this).children('.icon').attr('class').replace('icon ','');
        if(action=='upload') {
            $('#upload_form [name=file]').click();
        }
        else if(action=='download') {
            var name = div_scope.find('.selected').attr('name');
            var url = media_root + div_breadcrumbs.attr('path') + name;
            var newWindow = window.open( url, "SaveImage", "resizable,status=no,menubar=no,toolbar=no");
            newWindow.document.execCommand('SaveAs');
        }
        else if(action=='mkdir') {
	        if(div_scope.find('.selected input').is('input')) {
                mkdir_check(); }
            else {
                mkdir_click(); }
        }
        else if(action=='remove') {
	        cmd_remove_check();
        }
    });

    div_breadcrumbs.on('click','.crumb', function() {
        path = $(this).attr('path');
        Open('path',path);
    });

    div_scope.on('click','.item:not(.selected)', function() {
        var new_dir = div_scope.find('.selected[type=new]');
        if( new_dir.length>0 ) {
            mkdir_check();
        } else {
            Toolbar_buttons(['upload','download','remove','mkdir','more']);
            path = div_breadcrumbs.attr('path');
            name = $(this).attr('name');
            Get_info(path,name);
        }
    });

    div_scope.on('dblclick','.item', function() {
        var type = $(this).attr('type');
        if(type=='dir') {
            path = div_breadcrumbs.attr('path') + $(this).attr('name') +'/';
            Open('path',path);
        } else { //if(type=='image')
            path = div_breadcrumbs.attr('path') + $(this).attr('name');
            Give_to(path);
        }
    });

/*
	csrftoken = 1;
	i = 'a';
	var iframe1 = '<iframe class="hide1" id="iframe_'+i+'" ><html><head></head><body><h1>ky</h1></body></html></iframe>';
	$('#upload_file').after('<iframe class="hide1" id="iframe_'+i+'" ><html><head></head><body><h1>ky</h1></body></html></iframe>');//.contents().find('body').append(form);

	document.querySelector('#myfile').onchange = function(e) {
	    var csrftoken = getCookie('csrftoken');
		var files = this.files;
        $('#status').html('');
		for(var i=0; i<files.length; i++) {
            //alert(files.length);
            //alert(files[i].name);
			var iframe = '<iframe name="iframe_'+i+'" />';
	        //var form = '<form method="post" enctype="multipart/form-data" action="/explorer/upload/" target="iframe_'+i+'" />' +
            var form = '<form method="post" enctype="multipart/form-data" action="/explorer/upload/" />' +
                '<input type="hidden" name="csrfmiddlewaretoken" value="'+ getCookie('csrftoken') +'" />' +
                '<input type="hidden" name="path" value="'+ div_breadcrumbs.attr('path') +'" />' +
                '<input type="file" name="'+i+'" value="'+ files[i] +'" />' +
                '<input type="submit" />' +
                '</form>';

            //$('#myfile').after(iframe);//.delay(1000).contents().find('body').append(form);
            $('[name="upload_hidden"]').contents().find('body').append(form);
            //$('[name="upload_hidden"]').contents().find('form').submit();

            //alert(files[i].size);
            //alert(files[i].tmp_name);
            //alert(files[i].error);
	        status = files[i].name +' - '+ files[i].type + '<br />';
            $('#status').append(status);
        }
    }
*/

})

function mkdir_click() {
	Toolbar_buttons(['remove','mkdir']);
	dir = '<div class="item selected" type="new"><div class="icon" /><input></div>';
	div_scope.find('.selected').attr('class','item');
	div_scope.prepend(dir);
	div_scope.find('input').focus();
	$(".selected input").keypress(function(e) {
		if(e.keyCode==13) {
            mkdir_check();
		}
	});
}

function mkdir_check() {
	div_scope.find('input').focus();
	pack['name'] = div_scope.find('.selected input').val();
	if( div_scope.find('[name="'+pack['name']+'"]').is('div') ) {
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

function cmd_remove_check() {
	if( div_scope.find('[type=new]').length > 0 ) {
		div_scope.find('.selected').remove();
	}
    else if( pack['name'] ) { // Selected item (dir,file)
        if( pack['type']=='dir' ) {
            var path = pack['path'] + pack['name'] + '/';
            var sub = div_tree.find('[path="'+path+'"]').attr('state');
            //alert(path);
            if(sub) {
                if(confirm('Папка "'+pack['name']+'" не пуста, удалить?')) {
                    cmd_remove();
                }
            } else {
                cmd_remove();
            }
        } else {
            cmd_remove();
        }
	} else { // Current folder
        var name = pack['path'].split('/').slice(-2).slice(0, -1).toString();
        pack['path'] = pack['path'].replace( name+'/', '');
        if(confirm("Удалить текущую папку \"" + name + "\"?")) {
            pack['type'] = 'dir';
            pack['name'] = name;
            cmd_remove_check();
        }
        return false;
    }
}

function cmd_remove() {
    $.ajax({ url:'/explorer/remove/', type:'post', dataType:'json', data:pack,
        success: function(data) {
            Tree_refresh(data['tree']);
            Open('json',data['open']);
        }
    })

}

