$(document).ready(function(){

    $('#device_pop').on('click', 'tr.switch', function(){
        if($(this).attr('checked')=='checked'){
            $(this).removeAttr('checked');
            $('#device_pop tr.switch td.text_right').html('Аренда');
        } else {
            $(this).attr('checked','checked');
            $('#device_pop tr.switch td.text_right').html('Продано');
        }
    });

    $('body').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='sim_add'){
            device_Edit();
        }
        else if(action=='sim_delete') {
            if(confirm('Удалить sim карту?')) {
                device_Delete();
            }
        } else if(action=='list_reset') {
            $('#sim_card_list thead input').val('');
            device_Search();
        }
    });

    $('#sim_card_list tbody').on('click', 'tr', function(){
        //console.log(lunchbox['permissions']);
        //if($.inArray('system.directory_device_change', lunchbox['permissions'])>=0) {
        var sim_card_id = $(this).attr('sim_card_id');
        device_Edit(sim_card_id);
        //}
    });

    $('#sim_card_list thead input').bind('change keyup', function( event ){
        device_Search();
    });
    $('#sim_card_list thead select').on('change', function(){
        device_Search();
    });
    $('#device_pop .header').on('click', '.close', function(){
        device_Cancel();
    });

    device_Search();
    device_Validate();
});


function device_Search() {
    loading('begin');
    device_Cancel();
    var ajax_array = get_each_value('#sim_card_list');
    ajax_array['sim_card'] = $('#sim_card_list tbody tr.hover').attr('sim_card_id');
    $.ajax({ url:'/system/directory/sim_card/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else if(data['sim_card_list']){
                $('#sim_card_list tbody tr').remove();
                var count = 0;
                for(var key in data['sim_card_list']){
                    var item = data['sim_card_list'][key];
                    var item_bg = '';
                    if(item['device_name']!='') item_bg = ' bg_green';
                    var item_tr = '<tr class="row'+item_bg+'" sim_card_id="'+item['id']+'" >' +
                        '<td class="cell">'+item['number']+'</td>' +
                        '<td class="cell" colspan="2">'+item['device_name']+'</td></tr>';
                    $('#sim_card_list tbody').append(item_tr);
                    count ++;
                }
                $('.result_count').html('Найдено: '+count);
            }
        },
        complete: function () {
            loading('end');
        }
    });
}


function device_Edit(sim_card_id) {
    console.log('device_Edit');
    device_Cancel();
    if(!!sim_card_id) {
        $('#sim_card_list tbody tr[sim_card_id='+sim_card_id+']').addClass('hover');
        $('#device_pop div.btn_ui[action=sim_delete]').show();
        /*
         if($.inArray('system.directory_device_delete', lunchbox['permissions'])>=0) {
         $('#device_pop div.btn_ui[action=sim_delete]').show();
         } else {
         $('#device_pop div.btn_ui[action=sim_delete]').show();
         }
         */
        $.ajax({ url:'/system/directory/sim_card/ajax/search/?sim_card='+sim_card_id, type:'get', dataType:'json',
            success: function(data) {
                if(data['error']!=null) {
                    alert(data['error']);
                } else {
                    $('#device_pop [name=number]').val(data['sim_card_list'][0]['number']);
                    $('#device_pop [name=device_name]').text(data['sim_card_list'][0]['device_name']);
                    loading('end');
                }
            }
        });
    } else {
        $('#device_pop input').val('');
        $('#device_pop div.btn_ui[action=sim_delete]').hide();
    }
    popMenuPosition('#device_pop','single');
}


function device_Update(){
    var ajax_array = get_each_value('#device_pop');
    var sim_card_id = $('#sim_card_list tbody tr.hover').attr('sim_card_id');
    if(!!sim_card_id) ajax_array['sim_card_id'] = sim_card_id;
    $.ajax({ url:'/system/directory/sim_card/ajax/update/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['errors']){
                message_Pop_array(data['errors'],'red');
            } else {
                device_Search();
            }
        }
    });
}


function device_Delete(){
    var sim_card_id = $('#sim_card_list tbody tr.hover').attr('sim_card_id');
    $.ajax({ url:'/system/directory/sim_card/ajax/delete/?sim_card='+sim_card_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else {
                device_Search();
            }
        }
    });
}


function device_Cancel(){
    $('#sim_card_list tbody tr.hover').removeClass('hover');
    $('#device_pop').hide();
    $('#device_pop #device_install tbody tr').remove();
}


function device_Validate(){
    $.validator.setDefaults({
        submitHandler: function(){
            device_Update();
        },
        showErrors: function(map, list) { // there's probably a way to simplify this
            var focussed = document.activeElement;
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("close", {
                    currentTarget: focussed
                }, true)
            }
            this.currentElements.removeAttr("title").removeClass("ui-state-highlight");
            $.each(list, function(index, error) {
                $(error.element).attr("title", error.message).addClass("ui-state-highlight");
            });
            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("open", {
                    target: focussed
                });
            }
        }
    });

    // use custom tooltip; disable animations for now to work around lack of refresh method on tooltip
    $("form#device_form").tooltip({
        show: false,
        hide: false
    });

    $("form#device_form").validate({ // validate the comment form when it is submitted
        rules: {
            number: {
                required: true,
                minlength: 5,
                maxlength: 12
            }
        },
        messages: {
            number: {
                required: "Необходим номер",
                minlength: "Минимум 5 знаков",
                minlength: "Максимум 11 знаков"
            }
        }
    });
}
