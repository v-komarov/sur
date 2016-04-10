$(document).ready(function() {
    $('body').append('<div id="pop_message" />');
});


function loading(action) {
    //$(window).height();
    //$(window).width();
    if(action=='begin') {
        var scroll_top = $(window).scrollTop();
        $('body').prepend('<div class="loading_animation"></div>');
        $('.loading_animation').css('top',scroll_top+'px');
    }
    else if(action=='end'){
        $('body div.loading_animation').remove();
    }
}


function popMessage(data,color,delay) {
    if(!delay) delay = 2000;
    $('div#pop_message').text(data);
    $('div#pop_message').removeAttr('style');
    if(color=='green'){

    } else if(color=='yellow') {
        $('div#pop_message').attr('style','background-color:#ffff00');
    } else if(color=='red') {
        $('div#pop_message').attr('style','background-color:#ff9a9a');
    }
    $('div#pop_message').show();
    $('div#pop_message').fadeOut(delay);

    // позиция Pop окна
    $('div#pop_message').css('top', ($(window).height()/3.5 +$(window).scrollTop())+'px');
    $('div#pop_message').css('left', ($(window).width()/2-$('div#pop_message').width()/2)+'px');

}

function message_Pop_array(data,color) {
    for(var item in data) {
        popMessage(item+': '+data[item],color, 5000);
    }
}