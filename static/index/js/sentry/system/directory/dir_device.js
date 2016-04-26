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
        if(action=='device_add'){
            device_Edit();
        }
        else if(action=='device_list_reset') {
            device_Search();
        }
        else if(action=='install_priority'){
            device_install_Priority( $(this).parents('tr').attr('install_id') );
        }
        else if(action=='sim_card_add'){
            device_sim_card('add');
        }
        else if(action=='delete'){
            if (confirm('Удалить объектовое устройство?')){
                device_Delete();
            }
        } else if(action=='device_reset'){
            var device_id = $('#device_list tbody tr.hover').attr('device_id');
            device_Edit(device_id);
        }
    });

    $('#device_pop .in_pop_sublist').on('click', '.close', function(){
        var sim_card_id = $(this).parent().attr('sim_card_id');
        device_sim_card('delete',sim_card_id)
    });

    $('#device_list tbody').on('click', '.row:not(.edit)', function(){
        if($.inArray('main.client', lunchbox['permissions'])>=0) {
            var device_id = $(this).attr('device_id');
            device_Edit(device_id);
        }
    });

    $('#device_list thead input').bind('change keyup', function( event ){
        device_Search();
    });
    $('#device_list thead select').on('change', function(){
        device_Search();
    });
    $('#device_pop .header').on('click', '.close', function(){
        device_Cancel();
    });

    $('input.device_sim_card').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/sim_card/ajax/search/', dataType: "json",
                data: { number:request.term, device_null:true, limit:10 },
                success: function(data) {
                    response($.map(data['sim_card_list'], function(item) {
                        return {
                            label: item.number,
                            sim_card_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('sim_card_id',ui.item.sim_card_id);
            } else {
                $(this).removeAttr('sim_card_id');
                $(this).val('');
            }
        },
        select: function(event, ui) {
            if(ui.item){
                $(this).attr('sim_card_id',ui.item.sim_card_id);
            } else {
                $(this).removeAttr('sim_card_id');
                $(this).val('');
            }
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

    device_Search();
    device_Validate();
});


function device_Search() {
    device_Cancel();
    loading('begin');
    var ajax_array = get_each_value('#device_list');
    ajax_array['install'] = true;
    $.ajax({ url:'/system/directory/device/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data) {
            if(data['error']!=null){
                alert(data['error']);
                loading('end');
            }
            else if(data['device_list']){
                setTable(data['device_list']);
            }
        },
        error: function() {
            loading('end');
            popMessage('system error','red');
        }
    });
}


function device_sim_card(action,data) {
    if(action=='add'){
        var sim_card_number = $('#device_pop input.device_sim_card').val();
        var sim_card_id = $('#device_pop input.device_sim_card').attr('sim_card_id');
        if(!!sim_card_id){
            var span = '<span class="item" sim_card_id="'+sim_card_id+'">' +
                '<span class="txt">'+sim_card_number+'</span>' +
                '<span class="close" title="Удалить"></span></span>';
            $('#device_pop div.in_pop_sublist').append(span);
            $('#device_pop input.device_sim_card').val('');
            $('#device_pop input.device_sim_card').removeAttr('sim_card_id');
        }
    }
    else if(action=='delete'){
        $('#device_pop .in_pop_sublist .item[sim_card_id='+data+']').remove();
    }
    else if(action=='get'){
        var sim_card_list = [];
        $('#device_pop .in_pop_sublist .item').each(function(){
            sim_card_list.push( $(this).attr('sim_card_id') );
        });
        return JSON.stringify(sim_card_list);
    }
    else if(action=='set'){
        console.log(data);
        $('#device_pop .in_pop_sublist .item').remove();
        for(var key in data){
            var span = '<span class="item" sim_card_id="'+data[key]['id']+'">' +
                '<span class="txt">'+data[key]['number']+'</span>' +
                '<span class="close" title="Удалить"></span></span>';
            $('#device_pop .in_pop_sublist').append(span);
        }
    }
}


function setTable(data) {
    $('#device_list tbody tr').remove();
    var count = 0;
    for(var key in data){
        var device_console__name = '';
        if(data[key]['device_console__name']) device_console__name = data[key]['device_console__name'];
        var device_type__name = '';
        if(data[key]['device_type__name']) device_type__name = data[key]['device_type__name'];

        var series_number = '';
        if(data[key]['series']){ series_number += data[key]['series']}
        if(data[key]['number']){ series_number += ' - '+data[key]['number']}
        var comment = '';
        if(data[key]['comment']) comment = data[key]['comment'];
        if(data[key]['belong']=='rent') var belong_name = 'Аренда';
        else var belong_name = 'Продано';
        var tr_bg = '';
        if(data[key]['install']=='yes') tr_bg = ' bg_green';
        var item_tr = '<tr class="row'+tr_bg+'" device_id="'+data[key]['id']+'" >' +
            '<td class="cell">'+device_console__name+'</td>' +
            '<td class="cell">'+device_type__name+'</td>' +
            '<td class="cell">'+data[key]['name']+'</td>' +
                //'<td class="cell">'+series_number+'</td>' +
            '<td class="cell">'+belong_name+'</td>' +
            '<td class="cell" colspan="2">'+comment+'</td>' +
            '</tr>';
        $('#device_list tbody').append(item_tr);
        count ++;
    }
    loading('end');
    $('.result_count').html('Найдено: '+count);
}


function device_Edit(device_id){
    device_Cancel();
    $('tr[name=communication_gsm]').hide();
    $('#device_pop .in_pop_sublist .item').remove();
    if(!!device_id){
        $('#device_list tbody tr[device_id='+device_id+']').addClass('hover');
        if($.inArray('main.client', lunchbox['permissions'])>=0) {
            $('#device_pop div.btn_ui[action=delete]').show();
        } else {
            $('#device_pop div.btn_ui[action=delete]').hide();
        }
        var ajax_array = {'device':device_id,'communication':true};
        $.ajax({ url:'/system/directory/device/ajax/get/', type:'get', dataType:'json', data:ajax_array,
            success: function(data) {
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    $('#device_pop [name=belong].switch').removeAttr('checked');
                    if(data['device']['belong']=='sell'){
                        $('#device_pop tr.switch').attr('checked','checked');
                        $('#device_pop tr.switch td.text_right').html('Продано');
                    } else {
                        $('#device_pop tr.switch td.text_right').html('Аренда');
                    }
                    for(var key in data['device']){
                        $('#device_pop [name='+key+']').val(data['device'][key]);
                    }

                    var gsm = false;
                    for(key_comm in data['device']['communication_list']){
                        if(data['device']['communication_list'][key_comm]['communication_type']=='GSM'){
                            gsm = true;
                        }
                    }
                    if(gsm){
                        $('tr[name=communication_gsm]').show();
                        device_sim_card('set',data['device']['sim_card_list']);
                    }

                    var install_count = 0;
                    for(var key in data['device']['install_list']){
                        install_count++;
                        var install = data['device']['install_list'][key];
                        console.log(+install['object__name']);
                        var item = '<tr install_id='+install['id']+'><td class="middle">' +
                            '<a class="inline_block" href="/system/client/'+install['client']+'/contract/'+install['contract']+'/">' +
                            '<div class="padding">'+install['object__name']+'</div></a>' +
                            '</td><td><div class="btn_ui btn_28 left" action="install_priority" icon="'+install['priority']+'"><div class="icon"></div></div></td></tr>';
                        $('#device_pop #device_install tbody').append(item);
                        $('#device_pop #device_install').attr('install_count',install_count);
                    }
                    loading('end');
                }
            },
            error: function() {
                loading('end');
                popMessage('system error','red');
            }
        });
    } else {
        var head = $('#device_list thead');
        $('#device_pop [name=name]').val( head.find('[name=device_name]').val() );
        $('#device_pop [name=series]').val( head.find('[name=series]').val() );
        $('#device_pop [name=number]').val( head.find('[name=number]').val() );
        //$('#device_pop select[name=device_type_id] option[value='+ head.find('[name=device_type_id]').val() +']').attr("selected", "selected");
        $('#device_pop [name=comment]').val( head.find('[name=comment]').val() );
        $('#device_pop div.btn_ui[action=delete]').hide();
    }
    popMenuPosition('#device_pop','single');
}


function device_Update(){
    var ajax_array = get_each_value('#device_pop');
    ajax_array['device_sim_card_list'] = device_sim_card('get');
    ajax_array['device'] = $('#device_list tbody tr.hover').attr('device_id');
    if($('#device_pop tr[name=belong]').is('[checked]')) ajax_array['belong'] = 'sell'; else ajax_array['belong'] = 'rent';
    $.ajax({ url:'/system/directory/device/ajax/update/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['errors']){
                message_Pop_array(data['errors'],'red');
            } else {
                device_Search();
            }
        },
        error: function() {
            popMessage('system error','red');
        }
    });
}


function device_Delete(){
    var device_id = $('#device_list .hover').attr('device_id');
    $.ajax({ url:'/system/directory/device/ajax/delete/?device='+device_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('.tableInfo tbody tr[device_id='+device_id+']').remove();
                device_Cancel();
            }
        }
    });
}


function device_Cancel(){
    $('#device_list tbody tr.hover').removeClass('hover');
    $('#device_pop').hide();
    $('#device_pop #device_install tbody tr').remove();
}


function device_install_Priority(install_id){
    var ajax_array = {'install_id': install_id};
    $.ajax({ url:'/system/directory/device/ajax/priority/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            device_Edit( $('#device_list tbody tr.hover').attr('device_id') );
        }
    });
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
            name: {
                required: true
            },
            series: {
                maxlength: 16
            },
            number: {
                maxlength: 11,
                number: true
            }
        },
        messages: {
            name: {
                required: "Необходимо наименование"
            },
            series: {
                minlength: "Минимум 6 знаков"
            },
            number: {
                minlength: "Максимум 11 знаков",
                number: "Только цифры"
            }
        }
    });
}
