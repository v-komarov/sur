$(document).ready(function() {
    $('body').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            search_Get();
        }
        else if(action=='update') {
            search_Update();
        }
        else if(action=='up' || 'down' || 'hide' || 'primary' || 'expand') {
            item_Position(this,action);
        }
    });
    search_Get();
});


function item_Position(this_,action) {
    var item = $(this_).parent('.search__item');
    var side = item.parent('div').attr('side');
    var position = parseInt(item.attr('position'));
    var count = $('div[side='+side+']').find('div.search__item').length;
    var new_position = 0;
    if(action=='up') {
        new_position = position-1;
        $('div[side='+side+'] .search__item[position='+new_position+']').before(item);
    }
    else if(action=='down') {
        new_position = position+1;
        $('div[side='+side+'] .search__item[position='+new_position+']').after(item);
    }
    else if(action=='primary') {
        item.find('.btn_ui').remove();
        item.prepend('<div class="btn_ui btn_25 bg left" action="expand" icon="arrow_left"><div class="icon"></div></div>');
        item.append(
            '<div class="btn_ui btn_25 bg right" action="up" icon="arrow_up"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_25 bg right" action="down" icon="arrow_down"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_25 bg right" action="hide" icon="cancel"><div class="icon"></div></div>');
        $('div[side=primary]').append(item);
    }
    else if(action=='expand') {
        item.find('.btn_ui').remove();
        item.append(
            '<div class="btn_ui btn_25 bg right" action="primary" icon="arrow_right"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_25 bg right" action="up" icon="arrow_up"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_25 bg right" action="down" icon="arrow_down"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_25 bg right" action="hide" icon="cancel"><div class="icon"></div></div>');
        $('div[side=expand]').append(item);
    }
    else if(action=='hide') {
        item.find('.btn_ui').remove();
        item.append(
            '<div class="btn_ui btn_25 bg left" action="expand" icon="arrow_left"><div class="icon"></div></div>' +
            '<div class="btn_ui btn_25 bg left" action="primary" icon="arrow_right"><div class="icon"></div></div>');
        $('div[side=hide]').append(item);
    }
    item_Recount();
    console.log(side,count,position,new_position);
}


function item_Recount() {
    $('.item__list').each(function() {
        var count = 1;
        $(this).find('.search__item').each(function() {
            $(this).attr('position',count);
            $(this).find('.position').text(count);
            count++;
        });
    });
}


function search_Get() {
    var contract_string;
    $.ajax({ url:'/system/setting/search/ajax/get/', type:'get', dataType:'json',
        success: function(data) {
            if(data['error']!=null)
                alert(data['error']);
            else {
                $('.search__item').remove();
                for(key in data['settings_search']) {
                    var item = data['settings_search'][key];
                    var item_begin = '';
                    var buttons = '<div class="btn_ui btn_25 bg right" action="up" icon="arrow_up"><div class="icon"></div></div>' +
                        '<div class="btn_ui btn_25 bg right" action="down" icon="arrow_down"><div class="icon"></div></div>' +
                        '<div class="btn_ui btn_25 bg right" action="hide" icon="cancel"><div class="icon"></div></div>';
                    if(item['side']=='expand') {
                        buttons = '<div class="btn_ui btn_25 bg right" action="primary" icon="arrow_right"><div class="icon"></div></div>'+buttons;
                    }
                    else if(item['side']=='primary') {
                        item_begin = '<div class="btn_ui btn_25 bg left" action="expand" icon="arrow_left"><div class="icon"></div></div>';
                    }
                    else if(item['side']=='hide') {
                        buttons = '<div class="btn_ui btn_25 bg left" action="expand" icon="arrow_left"><div class="icon"></div></div>' +
                        '<div class="btn_ui btn_25 bg left" action="primary" icon="arrow_right"><div class="icon"></div></div>';
                    }
                    var item_html = '<div class="search__item" position="'+item['position']+'" label="'+item['label']+'">' +
                        item_begin +
                        '<div class="txt"><div class="position">'+item['position']+'</div>. '+item['name']+'</div>' +
                        buttons + '</div>';
                    $('div[side='+item['side']+']').append(item_html);
                }
            }
        }
    });
}


function search_Update() {
    var ajax_array = {};
    ajax_array['item_list'] = [];
    $('.item__list').each(function() {
        $(this).find('.search__item').each(function() {
            ajax_array['item_list'].push({
                'label': $(this).attr('label'),
                'side': $(this).parent('.item__list').attr('side'),
                'position': $(this).attr('position')
            });
        });
    });
    ajax_array['item_list'] = JSON.stringify(ajax_array['item_list']);
    $.ajax({ url:'/system/setting/search/ajax/update/', type:'post', dataType:'json', data:ajax_array,
        success: function(data) {
            if (data['error'] != null)
                alert(data['error']);
            else {
                popMessage('Сохранено', 'green');
                contract_string_Ajax();
            }
        }
    });
}