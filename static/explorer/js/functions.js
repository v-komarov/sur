function Toolbar_buttons(array) {
    div_toolbar.find('.button').each(function(i, item) {
        var button = $(item).children('.icon').attr('class').substring(5);
        if($.inArray(button, array)>=0) {
            div_toolbar.find('.'+button).parent('div').attr('class','button');
        } else {
            div_toolbar.find('.'+button).parent('div').attr('class','button excluded');
        }
    });
}

function Get_info(path,name) {
    pack['path'] = path+name;
    $.ajax({ url:'/explorer/get_info/', type:'post', dataType:'json', data:pack,
        success: function(data) {
            Set_info(data);
        }
    })
    div_scope.find('.selected').attr('class','item');
    div_scope.find('[name="'+name+'"]').attr('class','item selected');
}

function Set_info(data) {
    var div_info = $('#header .info');
    var size = ''
    if(data['size']>0){ size += data['size'].toString().slice(0,-3); }
    else { size += 0; }
    size += 'кб';
    div_info.html('размер: '+size+', время: '+data['time']);
}

function Open(type, data, selected) {
    if(type=='path') {
        if( data!='/'){
            Toolbar_buttons(['upload','remove','mkdir','more']);
        } else {
            Toolbar_buttons( ['upload','mkdir'] );
        }
        $.ajax({ url:'/explorer/open/?path='+data, dataType:'json',
            success: function(data) {
                Open('json',data);
            }
        });
    } else {
        Set_info(data);
        var path = data['path'];
        div_scope.html('');
        var items = '';
        var item_class = '';


        var employees=[]
        employees[0]={name:"George", age:32, retiredate:"March 12, 2014"}
        employees[1]={name:"Edward", age:17, retiredate:"June 2, 2023"}
        employees[2]={name:"Christine", age:58, retiredate:"December 20, 2036"}
        employees[3]={name:"Sarah", age:62, retiredate:"April 30, 2020"}
        employees.sort(function(a, b){
            var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
            if (nameA < nameB)
                return -1
            if (nameA > nameB)
                return 1
            return 0
        })


        var dirs = Sort_array(data['dirs']);
        for(item in dirs) {
            var name = dirs[item]['name'];
            if(item == selected){ item_class = 'item selected'; }
            else { item_class = 'item'; }
            items += '<div class="'+item_class+'" name="'+name+'" type="dir"><div class="icon" />' +
                '<div class="name">'+name+'</div></div>';
        }

        var files = Sort_array(data['files']);
        for(item in files) {
            var type = 'null';
            var name = files[item]['name'];
            if(name.length >15){
                var name = name.slice(0, 13)+'...';
            }
            if(item == selected){
                item_class = 'item selected';
            } else {
                item_class = 'item';
            }
            if(files[item]['type']) {
                type = files[item]['type'].split("/", 1);
            }

            if(type=='image') {
                items += '<div class="'+item_class+'" name="'+files[item]['name']+'" type='+type+' >' +
                    '<img class="icon" src="'+media_root+path+files[item]['name']+'" />' +
                    '<div class="name">'+name+'</div>' +
                    '</div>';
            } else if(type!='image') {
                type = 'null';
                items += '<div class="'+item_class+'" name="'+files[item]['name']+'" type='+type+' >' +
                    '<div class="icon" />' +
                    '<div class="name">'+name+'</div>' +
                    '</div>';
            }

        }
        div_scope.append(items)

        /* .tree .link selected */
        div_tree.find('.selected').attr('class','link');
        var div_tree_focus = div_tree.find('[path="'+path+'"] .link:eq(0)');
        div_tree_focus.attr('class','link selected');

        //div_tree.parents('[state="closed"]:last').find('.link:eq(0)').attr('class','link selected');
        div_tree_focus.parents('[state="closed"]').each(function(){
            parent_path = $(this).attr('path');
            if($.inArray(parent_path, opened_dirs) === -1){
                opened_dirs.push(parent_path);
                //console.log(opened_dirs);
            }
            $(this).find('.sub:eq(0)').show();
            $(this).attr('state','opened');
        });

        /* breadcrumbs */
        div_breadcrumbs.attr('path',path);
        div_breadcrumbs.html('');
        var crumbs_array = path.split('/');
        crumbs_array.splice(-1);
        crumbs_array[0] = 'home';
        var crumbs_path = '/';
        for(item in crumbs_array){
            if(item>0){
                crumbs_path += crumbs_array[item]+'/';
            }
            var crumb = '<div class="crumb" path="'+crumbs_path+'">' + crumbs_array[item] +
                '<div class="slash">/</div></div>'
            div_breadcrumbs.append(crumb);
        }
        lastcrumb = div_breadcrumbs.find('.crumb:last');
        lastcrumb.children('.slash').remove();
    }
}

function Tree_refresh(data) {
    var div_tree = $('#tree');
    div_tree.html('');
	for(i in data) {
        var path = data[i]['path'];
        var child = data[i]['child']
        var sub = data[i]['sub'];

        if( $.inArray(path, opened_dirs) >=0 ) {
            dir_state = 'opened';
            sub_style = 'display: block;';
        } else {
            dir_state = 'closed';
            sub_style = ''; }
        if(path=='/') {
            var target = div_tree; }
        else {
            var target = div_tree.find('[path="'+path+'"] .sub:eq(0)');

            $('[path="'+path+'"]').attr('state',dir_state);
            $('[path="'+path+'"] .icon_dir').html('<div class="state" />');
            $('[path="'+path+'"] .sub:eq(0)').attr('style', sub_style);
        }
        var level = path.split('/').length-1;
        var margin_left = parseInt($('.icon_dir').css('margin-left'));
            margin_left = 'style="margin-left:'+margin_left*level+'px"'

        var dirs = '';
	    for(var k=0; k<sub.length; k++) {
            var path_sub = path + sub[k] +'/';
            dirs += '<div class="dir" path="'+path_sub+'" >' +
                '<div class="icon_dir" '+margin_left+' />' +
                '<div class="link">'+sub[k]+'</div>' +
                '<div class="sub" />' +
                '</div>';
        }
        target.html(dirs);
        var selected = div_breadcrumbs.attr('path');
        div_tree.find('[path="'+selected+'"] .link:eq(0)').attr('class','link selected');
    }
}

function Nesting(path) {
    var div = div_tree.find('[path="'+path+'"]');
    var state = div.attr('state');
    var sub = div.find('div.sub:eq(0)');
    if(state=='closed') {
        sub.show();
        div.attr('state','opened');
        if(div.find('.selected').length > 1) {
            div.find('.selected:eq(0)').attr('class','link');
        }
        opened_dirs.push(path);
    }
    else if(state=='opened') {
        sub.hide();
        div.attr('state','closed');
        if( div.find('.selected').is('div')) {
            div.find('.link:eq(0)').attr('class','link selected');
        }
        n = $.inArray(path, opened_dirs);
        opened_dirs.splice(n, 1);
    } else {
        Open('path', path);
    }
    //console.log(opened_dirs);
}

function Upload() {
    var form = $('#upload_form');
    var iframe = '<iframe class="hide" name="upload_hidden" onload="Upload_complete()"></iframe>';
    form.after(iframe);
    form.find('[name=path]').val( div_breadcrumbs.attr('path') );
    form.submit();
}

function Upload_complete() { Open('path', div_breadcrumbs.attr('path')); }

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getSearch() {
    var data = window.location.search.replace('?','');
    var tmp = [];
    var search = {};
    var pairs = data.split('&');
    for(var i=0; i<pairs.length; i++) {
        tmp = pairs[i].split('=');
        search[tmp[0]] = tmp[1];
    }
    return search;
}

function Give_to(path) {
    if( location_search['CKEditorFuncNum']==1 ){
        path = '/media'+path;
        $('#cke_107_textInput', window.opener.document).val( path );
        window.close();
    }
    else if( location_search['input'] ) {
        path = path.slice(1);
        $('#'+location_search['input'], window.opener.document).val( path );
        window.close();
    }
}

function Sort_array(array) {
    array.sort(function(a, b) { // sort by name
        var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
        if(nameA < nameB)
            return -1
        if(nameA > nameB)
            return 1
        return 0
    })
    return array;
/*
    Сортируем по возрасту
    array.sort(function(a, b){
        return a.age-b.age
    })

    Сортируем по дате
    array.sort(function(a, b){
        var dateA=new Date(a.retiredate), dateB=new Date(b.retiredate)
        return dateA-dateB
    })
*/

}

<!--
function Unique_array(array) {
    var unique = [];
    $.each(array, function(i, el) {
        if($.inArray(el, unique) === -1) {
            unique.push(el);
        }
    });
    return unique;
}
-->