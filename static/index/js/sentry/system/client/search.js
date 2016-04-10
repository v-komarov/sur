$(document).ready(function(){

    $('body').on('click', '.switch', function() {
        if( $(this).attr('checked')=='checked' ){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
    });

    $('.search').keypress(function(e){
        console.log('enter');
        if(e.keyCode==13) client_object_Search();
    });

    $('.search').on('click','.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='search'){
            client_object_Search();
        } else if(action=='expand' || action=='hide'){
            search_expand(action);
        } else if(action=='reset') {
            $('.search input, .search select').each(function(){
                if( $(this).is(':visible') ) {
                    $(this).find(":first").attr("selected", "selected");
                    $(this).val('');
                }
            });

        }
    });
    /*
     $('.search input').keyup(function () {
     client_object_Search();
     });

     $('.search:not(.expand) input').focus(function(){
     var focus_name = $(this).attr('name');
     $('.search:not(.expand) input').each(function(){
     if(focus_name!=$(this).attr('name')){
     $(this).val('');
     }
     });
     });

     $('.objectsList').delegate("a.item", "mouseenter", function(){
     console.log('mouseenter');
     $(this).focus();
     });
     */

    $(".search select[name=service_type]").on('change', function(){
        service_type_Change($(this).val());
    });

    $('body').on('change', 'select[name=address_region]', function(){

        address_locality_Search( $(this).val() );
    });

    $('input[name=address_street]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/street/ajax/search/', type:'get', dataType:'json', data: {
                    street_name: $('input[name=address_street]').val(),
                    limit: 9 },
                success: function(data) {
                    response($.map(data['street'], function(item) {
                        return {
                            label: item.locality__name+', '+item.name,
                            street_id: item.id,
                            street__name: item.name
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            if(ui.item){
                $('input[name=address_street]').attr('item_id',ui.item.street_id).val(ui.item.street__name);
            } else {
                $('input[name=address_street]').removeAattr('item_id');
                $('[name=address] input[name=address_street]').val('');
            }
        },
        change: function(event, ui) { // change duplicate select
            if(ui.item){
                $(this).attr('item_id',ui.item.street_id).val(ui.item.street__name);
            } else {
                $(this).removeAttr('item_id');
                $('input[name=address_street]').val('');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('.search [name=warden]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/sentry_user/ajax/search/', type:'get', dataType:'json',
                data:{full_name:request.term, limit:10},
                success: function(data) {
                    response($.map(data['user_list'], function(item) {
                        return { label:item.full_name, user_id:item.id }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id', ui.item.user_id);
            } else {
                $(this).val('').removeAttr('item_id');
            }
        },
        //select: function(event, ui) { $('tr#holding__name').attr('holding_id', ui.item.holding_id); },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('.tableInfo input[name=object_name], .tableInfo input[name=contract_number]').autocomplete({
        source: function(request, response) {
            var ajax_array = get_array_Ajax();
            $.ajax({
                url: '/system/client/search/ajax/search/', type:'get', dataType:'json', data:ajax_array,
                success: function(data) {
                    table_Draw(data);
                },
                beforeSend: function() {
                    if((!!ajax_array['object_name'] && ajax_array['object_name'].length>=3)
                        || !ajax_array['contract_number']){
                        console.log(ajax_array['object_name']);
                    }
                }
            });
        },
        minChars:3, zIndex:100, deferRequestBy:200, delay:1000
    });

    service_type_Change();
    search_expand('begin');
    search_item_Position();
});


function address_locality_Search(region_id) {
    console.log('address_locality_Search');
    $.ajax({ url:'/system/directory/locality/ajax/search/?region_id='+region_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else if(data['locality']){
                $('select[name=address_locality] option').remove();
                $('select[name=address_locality]').append('<option/>');
                for(var key in data['locality']){
                    var option = '<option value="'+data['locality'][key]['id']+'">'+data['locality'][key]['name']+'</option>';
                    $('select[name=address_locality]').append(option);
                }
            }
        },
        complete: function (){

        }
    });
}


function search_item_Position() {
    for(key in lunchbox['setting']['search']) {
        var item = lunchbox['setting']['search'][key];
        //  console.log(item['side'],item['label']);
        if(item['side']=='hide') {
            console.log('hide',item['label']);
            $('tr.search__item[label='+item['label']+']').hide();
        } else {
            console.log(item['side'],item['label']);
            $('table.search[side='+item['side']+']').append($('tr.search__item[label='+item['label']+']'));
        }
    }
    //$('table.search[side='+item['side']+']').append($('tr.white[label='+item['label']+']'));
    $('table[side=primary]').append( $('tr.white') );

}


function client_object_Search() {
    loading('begin');
    var ajax_array = get_each_value('.search__view');
    //console.log(ajax_array);
    $.ajax({
        url: '/system/client/search/ajax/search/', type: 'get', dataType: 'json', data: ajax_array,
        success: function (data) {
            contract_list_draw('#object_list',data);
            loading('end');
        },
        error: function() {
            loading('end');
            popMessage('system error','red');
        }
    });
}


function service_type_Change(service_type_id) {
    $('.search select[name=service_subtype] option').hide();
    if(service_type_id){
        $('.search select[name=service_subtype] option[service_type_id='+service_type_id+']').show();
    }
    $('.search select[name=service_subtype] option:eq(0)').show().attr('selected','selected');
}


function search_expand(action) {
    console.log(action);
    var margin_left = $('table.search.expand').width()*-1;
    if(action=='begin'){
        $('table.expand').hide();
    }
    else if(action=='expand'){
        $('div.search__expand').css('margin-left', margin_left+'px');
        $('table.expand').show();
        $('div.search__expand').animate({ marginLeft: '0px' },{
            complete: function() {
                $('.search .btn_ui[action=expand] .txt').text('Скрыть расширенный поиск');
                $('.search .btn_ui[action=expand]').attr('icon','arrow_left');
                $('.search .btn_ui[action=expand]').attr('action','hide');
            }
        });

    } else {
        $('div.search__expand').animate({ marginLeft: margin_left+'px' },{
            complete: function() {
                $('div.search__expand').css('margin-left', '0px');
                $('table.expand').hide();
                $('.search .btn_ui[action=hide] .txt').text('Расширенный поиск');
                $('.search .btn_ui[action=hide]').attr('icon','arrow_right');
                $('.search .btn_ui[action=hide]').attr('action','expand');
            }
        });
    }
}