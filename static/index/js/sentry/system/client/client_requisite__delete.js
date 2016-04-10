$(document).ready(function() {
    $('.tableInfo [action=save]').hide();
    $('.tableInfo [action=reset]').hide();
    $('.tableInfo [action=cancel]').hide();
    client_id = $(".tableInfo").attr('client_id');

    $(".tableInfo").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='edit'){
            $(".tableInfo [action=edit]").hide();
            $(".tableInfo [action=save]").show();
            $(".tableInfo [action=reset]").show();
            $(".tableInfo [action=cancel]").show();
            $(".tableInfo td.info").hide();
            $(".tableInfo td.edit").show();
        }
        if(action=='save'){
            client_infoUpdate();
        }
        if(action=='reset'){
            client_infoReset();
        }
        if(action=='cancel'){
            client_infoReset();
            $(".tableInfo [action=edit]").show();
            $(".tableInfo [action=save]").hide();
            $(".tableInfo [action=reset]").hide();
            $(".tableInfo [action=cancel]").hide();
            $(".tableInfo td.info").show();
            $(".tableInfo td.edit").hide();
        }
    });

    $('tr#bank__name input').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/bank/ajax/search/', dataType: "json",
                data: { name:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['bank'], function(item) {
                        return {
                            label: item.name,
                            bank_id: item.id,
                            bank_bik: item.bik
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            $('.tableInfo tr#bank__name').attr('bank_id', ui.item.bank_id);
            $('.tableInfo tr#bank__bik input').val(ui.item.bank_bik);
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

    $('tr#bank__bik input').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/bank/ajax/search/', dataType: "json",
                data: { bik:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['bank'], function(item) {
                        return {
                            label: item.bik +' ('+ item.name +')',
                            value: item.bik,
                            bank_id: item.id,
                            bank_name: item.name
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            $('.tableInfo tr#bank__name').attr('bank_id', ui.item.bank_id);
            $('.tableInfo tr#bank__name input').val(ui.item.bank_name);
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

});


function client_infoReset() {
    $(".tableInfo tr").each(function(){
        var tr_id = $(this).attr('id');
        $(this).find('input').val( $(this).find('td:eq(1)').text() );
    });
}

function client_infoUpdate() {
    var info_array = infoEach('get_array');
    $.ajax({ url:'/system/client/requisite/ajax/update/', type:'post', dataType:'json', data: info_array,
        success: function(data){
            if(data['error']!=null){
                var data_error = data['error'];
                for(var key in data_error){
                    console.log(key+': '+data_error[key]);
                    var tr_title = $('#id_'+key).parents('.row').find('td:eq(0)').text();
                    alert(tr_title+' '+data_error[key]);
                }
            } else {
                popMessage('Сохранено','green');
                infoEach('save');
                $(".tableInfo [action=edit]").show();
                $(".tableInfo [action=save]").hide();
                $(".tableInfo [action=reset]").hide();
                $(".tableInfo [action=cancel]").hide();
                $(".tableInfo td.info").show();
                $(".tableInfo td.edit").hide();
                console.log('done');
            }
        }
    });
}

function infoEach(action) {
    var info_array = {};
    info_array['client_id'] = client_id;
    info_array['bank_id'] = $('.tableInfo tr#bank__name').attr('bank_id');

    $(".tableInfo tr:not(.white)").each(function(){
        var tr_id = $(this).attr('id');
        var input_val = $(this).find('input').val();
        if(action=='save'){
            $(this).find('td:eq(1)').text( input_val );
        }
        info_array[tr_id] = input_val;
    });

    if(action='get_array'){
        return(info_array);
    }
}

