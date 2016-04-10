$(document).ready(function(){


    $('select.event_filter').change(function(){
        event_filter = $(this).val();
        eventsRefresh('new');
    });

    $(".wrapper").on('click', '.ui_button', function(){
        var action = $(this).attr('class').replace('ui_button ui_','');
        if(action=='fullscreen'){
            fullScreen();
        } else if(action=='rescreen'){
            fullScreen('off');
        }
    });

    $('.tableInfo tbody').on('click','tr.row', function(){
        var tbody_id = $(this).parent().attr('id').replace('sBody','');
        var click_id = $(this).attr('id');
        var info_id = $('#'+tbody_id+'sBody .blockInfo').attr('id');
        if(info_id==click_id){
            buttonCloseInfo(tbody_id);
        } else {
            clickRow(tbody_id,click_id);
        }
    });

    $('#objects').scroll(function(){
        $('#objects .ui-resizable-s').css('bottom', $('#objects').scrollTop()*-1 );
    });

    initResize();
    resizeEvents();
    resizeTitle();
})

function initResize(){
    $("#objects").resizable({
        handles: "s",
        minHeight: 40,
        maxHeight: $('.leftShore').height()-25,
        containment: $('.leftShore'),
        resize: function(event, ui){ resizeEvents() }
    });
}

function resizeEvents(){
    $('#events').height( $('.leftShore').height() - $('#objects').height() - 3 );
}

function resizeTitle(){
    var cnt=0;
    $('table.objectsTitle thead tr td').each( function(){
        $(this).width( $('#objectsBody tr:eq(0) td:eq('+cnt+')').width()-1 );
        cnt++; });
    var cnt=0;
    $('table.eventsTitle thead tr td').each( function(){
        $(this).width( $('#eventsBody tr:eq(0) td:eq('+cnt+')').width()-1 );
        cnt++; });
}

function fullScreen(action){
    if(action=='off'){
        $('.site_navigation').show();
        $('.inside_navigation').show();
        $('.footer').show();
        $('.leftShore').height(700);
        $('.blockButtons .ui_rescreen').attr('class','ui_button ui_fullscreen');
    } else {
        $('.site_navigation').hide();
        $('.inside_navigation').hide();
        $('.footer').hide();
        $('.blockButtons .ui_fullscreen').attr('class','ui_button ui_rescreen');

        var height_navigation = $('.site_navigation').outerHeight() + $('.inside_navigation').outerHeight();
        console.log( $(window).height() +', '+height_navigation);
        $('.leftShore').height( $(window).height()-50 );
        //$(window).scrollTop(height_navigation+1);
    }
    initResize();
    resizeEvents();
}