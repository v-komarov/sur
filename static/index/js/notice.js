$(document).ready(function(){
    eventsRefreshInterval = 5000000000000;
    active = false;
    window.onfocus = function() {
        active = true;
    };
    $('body').mousemove(function() {
        active = true;
    });
    window.onblur = function() {
        active = false;
    };


    $('.notice_btn').on('click', function(){
        notice_click();
    });
    $('.notice').on('click','.btn_ui, .top .title, .later__title, .later__item', function(){
        var action = $(this).attr('action');
        var notice_id = $(this).parents('.notice__item').attr('notice_id');
        console.log('notice_id: '+notice_id);
        if(action=='notice_click'){
            notice_click();
        }
        else if(action=='notice_all_sight'){
            if(confirm('Удалить все оповещения?')) notice_action(action);
        }
        else if(action=='notice_item_sight'){
            notice_action(action,notice_id);
        }
        else if(action=='show_later'){
            show_later(notice_id);
        }
        else if(action=='later'){
            var minutes = $(this).attr('minutes');
            notice_action(action,notice_id,minutes);
        }
    });

    I = setInterval(function(){ notice_Check('auto') }, eventsRefreshInterval);
    notice_click();

});


function notice_action(action,notice_id,minutes) {
    var ajax_array = {};
    ajax_array['notice_id'] = notice_id;
    ajax_array['minutes'] = minutes;
    $.ajax({ url:'/system/sentry_user/notice/ajax/'+action+'/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                notice_Check('auto');
            }
        }
    });
}


function notice_click() {
    notice_Check('click');
}


function show_later(notice_id) {
    $('.notice .notice__item:not([notice_id='+notice_id+']) .later__item').hide();
    if($('.notice .notice__item[notice_id='+notice_id+'] .later__item').is(':visible')){
        $('.notice .notice__item[notice_id='+notice_id+'] .later__item').hide();
    } else {
        $('.notice .notice__item[notice_id='+notice_id+'] .later__item').show();
    }
}


function notice_Check(action) {
    console.log('notice active: '+active);
    if(active) {
        $.ajax({ url:'/system/sentry_user/notice/ajax/get_notice_list/', type:'get', dataType:'json',
            success: function(data){
                $('.notice .notice_btn').text(data['count']);
                $('.notice .top .title').text('Оповещения: '+data['count']);
                if(action=='click'){
                    if(data['count']==0) $('.notice .notice_list').hide();
                    else {
                        if( $('.notice_list').is(':visible') ) $('.notice_list').hide();
                        else $('.notice_list').show();
                    }
                }
                $('.notice_list .body .notice__item').remove();
                for(key in data['notice_list']){
                    var notice = data['notice_list'][key];
                    var notice_div = '<div class="notice__item" notice_id="'+notice['id']+'">' +
                        '<div class="date">'+notice['log_date']+'</div>' +
                        '<div class="btn_ui btn_28" action="notice_item_sight" icon="close"><div class="icon"></div></div>' +
                        '<div class="clear"></div>' +
                        '<div class="log_type">'+notice['log_type']+'</div>' +
                        '<a class="client_object" href="/system/client/'+notice['client_id']+'/object/'+notice['client_object_id']+'/">'+notice['client_object']+'</a>' +
                        '<div class="clear"></div>' +
                        '<div class="later">' +
                        '<div class="later__title" action="show_later">Напомнить позже</div>' +
                        '<div class="later__item" action="later" minutes="15">15 минут</div>' +
                        '<div class="later__item" action="later" minutes="30">30 минут</div>' +
                        '<div class="later__item" action="later" minutes="60">1 час</div>' +
                        '<div class="later__item" action="later" minutes="180">3 часа</div>' +
                        '<div class="later__item" action="later" minutes="720">12 часов</div>' +
                        '</div>' +
                        '<div class="clear"></div></div>';
                    $('.notice_list .body').prepend(notice_div);
                }
            }
        });
    }
}

