$(document).ready(function() {
    pop_armory = $('#pop_armory');

    $(".tableInfo").on('click', '.ui_button', function() {
        var action = $(this).attr('class').replace('ui_button ui_','');
        if(action=='add'){
            armoryEdit('add');
        } else if(action=='remove'){
            if (confirm('Уверенны, что хотите удалить запись?')){
                armoryRemove();
            }
        } else if(action=='save'){
            armorySave();
        }
    });

    $('#pop_armory .header').on('click', '.close', function() {
        armoryCancel(); });

    $('#armory_list tbody').on('click', '.row:not(.edit)', function() {
        var armory_id = $(this).attr('armory_id');
        armoryCancel();
        armoryEdit(armory_id);
    });


    $('#armory_list thead input').bind('change keyup', function( event ){
        ajaxSearch('search'); });
    $('#armory_list thead select').on('change', function(){
        ajaxSearch('search'); });

    ajaxSearch('search');
});

function ajaxSearch(action) {
    $('.loading').show();
    $.ajax({ url:'/system/directory/armory/', type:'get', dataType:'json',
        data:{ 'action': action,
            'series': $('#armory_list thead input[name=series]').val(),
            'number': $('#armory_list thead input[name=number]').val(),
            'weapon_id': $('#armory_list thead select[name=weapon]').val(),
            'company_id': $('#armory_list thead select[name=company]').val(),
            'comment': $('#armory_list thead input[name=comment]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            }
            else if(data['armory']!=null){
                setTable(data['armory']);
            }
        }
    });
}


function setTable(data) {
    $('#armory_list tbody tr').remove();
    count = 0;
    for(var key in data){
        var object_item = '<tr class="row" armory_id="'+data[key]['id']+'" >' +
            '<td class="cell">'+data[key]['security_company__name']+'</td>' +
            '<td class="cell">'+data[key]['series']+'</td>' +
            '<td class="cell">'+data[key]['number']+'</td>' +
            '<td class="cell">'+data[key]['weapon__name']+'</td>' +
            '<td class="cell" colspan="2">'+data[key]['comment']+'</td>' +
            '</tr>';
        $('#armory_list tbody').append(object_item);
        count ++;
    }
    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}


function armoryEdit(armory_id) {
    if(armory_id=='add'){
        armoryCancel();
        var head = $('#armory_list thead');
        pop_armory.find('[name=series]').val( head.find('[name=series]').val() );
        pop_armory.find('[name=number]').val( head.find('[name=number]').val() );
        pop_armory.find('select[name=weapon] option[value='+ head.find('[name=weapon]').val() +']').attr("selected", "selected");
        pop_armory.find('select[name=company] option[value='+ head.find('[name=company]').val() +']').attr("selected", "selected");
        pop_armory.find('[name=comment]').val( head.find('[name=comment]').val() );
    } else {
        var tr = $('#armory_list tbody tr[armory_id='+armory_id+']');
        tr.attr('class','row hover');
        $.ajax({ url:'/system/directory/armory/', type:'get', dataType:'json',
            data:{ 'action': 'get', 'armory_id': armory_id },
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                    $('.loading').hide();
                } else {
                    data = data['armory'];
                    for(var key in data){
                        pop_armory.find('[name=series]').val(data[key]['series']);
                        pop_armory.find('[name=number]').val(data[key]['number']);
                        pop_armory.find('select[name=weapon] option[value='+data[key]['weapon_id']+']').attr("selected", "selected");
                        pop_armory.find('select[name=company] option[value='+data[key]['security_company_id']+']').attr("selected", "selected");
                        pop_armory.find('[name=comment]').val(data[key]['comment']);
                    }
                }
            }
        });
    }
    menuPosition('#pop_armory');
}

function armorySave() {
    if($(".row").is(".hover")){
        var action = 'save';
        var tr = $('#armory_list .hover');
        var armory_id = tr.attr('armory_id');
    } else {
        var action = 'add';
        $('#armory_list tbody').append('<tr class="row" armory_id="new">' +
            '<td class="cell"></td>' +
            '<td class="cell"></td>' +
            '<td class="cell"></td>' +
            '<td class="cell"></td>' +
            '<td class="cell" colspan="2"></td></tr>');
        var tr = $('#armory_list [armory_id=new]');
    }
    $.ajax({ url:'/system/directory/armory/', type:'get', dataType:'json',
        data:{ 'action': action,
            'armory_id': armory_id,
            'series': pop_armory.find('[name=series]').val(),
            'number': pop_armory.find('[name=number]').val(),
            'weapon_id': pop_armory.find('select[name=weapon]').val(),
            'company_id': pop_armory.find('select[name=company]').val(),
            'comment': pop_armory.find('[name=comment]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('#armory_list tbody [armory_id=new]').remove();
            } else {
                tr.attr('armory_id',data['armory_id']);
                tr.find('td:eq(0)').html(pop_armory.find('[name=company] :selected').text());
                tr.find('td:eq(1)').html(pop_armory.find('[name=series]').val());
                tr.find('td:eq(2)').html(pop_armory.find('[name=number]').val());
                tr.find('td:eq(3)').html(pop_armory.find('[name=weapon] :selected').text());
                tr.find('td:eq(4)').html(pop_armory.find('[name=comment]').val());
                armoryCancel();
            }
        }
    });
}

function armoryRemove() {
    var armory_id = $('#armory_list .hover').attr('armory_id');
    $.ajax({ url:'/system/directory/armory/', type:'get', dataType:'json',
        data:{ 'action':'remove', 'armory_id':armory_id },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('.tableInfo tbody tr[armory_id='+armory_id+']').remove();
                armoryCancel();
            }
        }
    });
}


function armoryCancel() {
    var tr = $('#armory_list tbody tr.hover').attr('class','row');
    pop_armory.hide();
}


function menuPosition(menu_name){
    pop_menu = $(menu_name);
    pop_menu.draggable({
        handle: ".header",
        cursor: 'move',
        stack: ".pop",
        containment: $('.container')
    });

    // позиция Pop окна
    win_w = $(window).width();
    win_h = $(window).height();
    win_scroll = $(window).scrollTop();
    win_buttom = win_scroll + win_h;
    pop_menu_h = pop_menu.height();
    pop_menu_top = parseInt(pop_menu.css('top'));
    //console.log(pop_menu_h+', '+pop_menu.css('top'));

    if( pop_menu.css('top')=='0px' && pop_menu.css('left')=='0px' ){
        pop_menu.css('top', (win_scroll+win_h/2-pop_menu_h/2)+'px');
        pop_menu.css('left', (win_w/2-pop_menu.width()/2)+'px');

    } else if( pop_menu_top < $(window).scrollTop() ){
        pop_menu.css('top', $(window).scrollTop()+'px');
    } else if( (pop_menu_top+pop_menu_h) > (win_scroll+win_h) ){
        pop_menu.css('top', win_buttom-pop_menu_h+'px');
    }
    pop_menu.show();
}