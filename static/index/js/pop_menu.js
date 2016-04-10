$(document).ready(function() {

    $('.pop').on('click', '.header .close', function() {
        $(this).parents('.pop').hide();
    });

});


function popMenuPosition(menu_name, mode){
    var pop_menu = $(menu_name);
    pop_menu.draggable({
        //handle: ".header",
        cursor: 'move',
        stack: ".pop",
        containment: $('.container')
    });

    if(mode=='single'){
        //console.log('pop: single');
        if($('.pop').is(':visible')) {
            var pop_visible = $('.pop:visible');
            pop_menu.css('top',pop_visible.css('top'));
            pop_menu.css('left',pop_visible.css('left'));
        }
        $('.pop').hide();
    }
    else if(mode=='multiple') {
        var z_index = 1;
        $('.pop').each(function() {
            var pop_z = $(this).zIndex();
            if(z_index <= pop_z) {
                z_index = ++pop_z;
            }
        });
        pop_menu.zIndex(z_index);
    }

    // позиция Pop окна
    var win_w = $(window).width();
    var win_h = $(window).height();
    var win_scroll = $(window).scrollTop();
    var win_buttom = win_scroll + win_h;
    var pop_height = pop_menu.height();
    var pop_top = parseInt(pop_menu.css('top'));
    //console.log('win_h',win_h,', pop_height',pop_height);

    if( pop_menu.css('top')=='0px' && pop_menu.css('left')=='0px' ) {
        if(pop_height>win_h){
            pop_menu.css('top',win_scroll+'px');
        }
        else {
            pop_menu.css('top', (win_scroll+win_h/2-pop_height/2)+'px');
        }
        pop_menu.css('left', (win_w/2-pop_menu.width()/2)+'px');
    }
    else {
        pop_menu.css('top', win_scroll+'px');
    }
    pop_menu.show();
}


function popMenuClose(menu_name) {
    if(menu_name=='all') {
        $('.pop').hide();
    } else {
        var pop_array = menu_name.split(',');
        for (var i=0, len=pop_array.length; i<len; i++) {
            var pop_name = pop_array[i].replace(' ','');
            console.log(pop_name);
            $(pop_name).hide();
        }
    }
}