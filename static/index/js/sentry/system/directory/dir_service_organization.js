$(document).ready(function() {

    $("#pop_company").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='delete'){
            if (confirm('Вы уверенны, что хотите удалить эту организацию?')){
                var company_id = $('#company_list .hover').attr('company_id');
                service_organization_Delete(company_id);
            }
        }
    });

    $('#pop_company .header').on('click', '.close', function() {
        service_organizationCancel();
    });

    $('#company_list').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action == 'add') {
            service_organization_Edit('create');
        }
    });

    $('#company_list tbody').on('click', '.row:not(.edit)', function() {
        if(8>0) {
            var company_id = $(this).attr('company_id');
            service_organizationCancel();
            service_organization_Edit(company_id);
        }
    });

    $(".tableInfo select[name=region]").on('change', function(){
        service_organization_Ajax('search'); });

    $('.tableInfo thead input').bind('change keyup', function( event ){
        service_organization_Ajax('search');
    });


    $('[name=address_locality__region__name]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/region/ajax/search/', dataType: "json",
                data: { region_name:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['region_list'], function(item) {
                        return {
                            label: item.name,
                            region_id: item.id
                        }
                    }));
                }
            });
        },
        select: function(event, ui) { $('#pop_company').attr('region_id', ui.item.region_id); },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

    $('[name=address_locality__name]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/locality/ajax/search/', dataType: "json",
                data: {
                    limit:10,
                    region_id:$('#pop_company').attr('region_id'),
                    locality_name:request.term },
                success: function(data) {
                    response($.map(data['locality'], function(item) {
                        return {
                            label: item.name,
                            locality_id: item.id
                        }
                    }));
                }
            });
        },
        select: function(event, ui) { $('#pop_company').attr('locality_id', ui.item.locality_id); },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

    $('[name=bank__bik]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/bank/ajax/search/', dataType: "json",
                data: { bik:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['bank_list'], function(item) {
                        return {
                            label: item.bik +' ('+ item.name +')',
                            value: item.bik,
                            bank_id: item.id,
                            bank_name: item.name,
                            bank_bik: item.bik,
                            bank_correspondent_account: item.correspondent_account
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            $('#pop_company [name=bank]').attr('item_id', ui.item.bank_id).val(ui.item.bank_name);
            $('#pop_company [name=bank__bik]').val(ui.item.bank_bik);
            $('#pop_company [name=bank__correspondent_account]').val(ui.item.bank_correspondent_account);
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

    $('[name=bank]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/bank/ajax/search/', dataType: "json",
                data: { name:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['bank_list'], function(item) {
                        return {
                            label: item.name,
                            bank_id: item.id,
                            bank_bik: item.bik,
                            bank_name: item.name,
                            bank_bik: item.bik,
                            bank_correspondent_account: item.correspondent_account
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            $('#pop_company [name=bank]').attr('item_id', ui.item.bank_id).val(ui.item.bank_name);
            $('#pop_company [name=bank__bik]').val(ui.item.bank_bik);
            $('#pop_company [name=bank__correspondent_account]').val(ui.item.bank_correspondent_account);
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

    service_organization_Ajax('search');
    service_organization_Validate();
});


function service_organization_Edit(company_id) {
    if(company_id=='create') {
        service_organizationCancel();
        popMenuPosition('#pop_company','single');
        $('#pop_company input').each(function() {
            $(this).val('');
        });
        var head = $('#company_list thead');
        $('#pop_company [name=company_name]').val( head.find('[name=company_name]').val() );
        $('#pop_company div.ui_remove').hide();
    } else {
        $.ajax({ url:'/system/directory/service_organization/ajax/get/?company_id='+company_id, type:'get', dataType:'json',
            success: function(data) {
                if(data['error']!=null) {
                    alert(data['error']);
                    $('.loading').hide();
                } else {
                    var organization = data['company'][0];
                    $('table#company_list tbody tr[company_id='+company_id+']').attr('class','row hover');
                    popMenuPosition('#pop_company','single');
                    $('#pop_company').attr('region_id',organization['address_locality__region_id']);
                    $('#pop_company').attr('locality_id',organization['address_locality_id']);
                    for(var key in organization){
                        $('#pop_company [name='+key+']').val(organization[key]);
                    }
                    $('#pop_company [name=bank]').val(organization['bank__name']);
                    $('#pop_company [name=bank]').attr('item_id',organization['bank_id']);
                    if(8>0) {
                        $('#pop_company div.ui_remove').show();
                    } else {
                        $('#pop_company div.ui_remove').hide();
                    }
                }
            }
        });
    }
}


function service_organization_Update() {
    if($('#company_list tbody tr.row').is(".hover")){
        var action = 'update';
        var tr = $('#company_list tbody .hover');
        var company_id = tr.attr('company_id');
    } else {
        var action = 'create';
    }
    var ajax_array = get_each_value('#pop_company');
    ajax_array['service_organization'] =  company_id;
    ajax_array['address_locality'] = $('#pop_company').attr('locality_id');
    $.ajax({ url:'/system/directory/service_organization/ajax/'+action+'/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                service_organization_Ajax('search');
            }
        }
    });
}

function service_organization_Delete(company_id) {
    $.ajax({ url:'/system/directory/service_organization/ajax/delete/?service_organization='+company_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('#company_list tbody tr[company_id='+company_id+']').remove();
                service_organizationCancel();
            }
        }
    });
}

function service_organization_Ajax(action) {
    service_organizationCancel();
    $('.loading').show();
    $.ajax({ url:'/system/directory/service_organization/ajax/'+action+'/', type:'get', dataType:'json',
        data:{
            'name': $('.tableInfo thead input[name=company_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
                $('.loading').hide();
            } else {
                setTable(data);
            }
        }
    });
}

function setTable(data) {
    $('#company_list tbody tr').remove();
    count = 0;
    if(data['error']!=null){
        alert(data['error']);
    }
    data = data['company']
    for(var key in data){
        var object_item = '<tr class="row" company_id="'+data[key]['id']+'">' +
            '<td colspan="2" class="cell">'+data[key]['name']+'</td>' +
            '</tr>';
        $('#company_list tbody').append(object_item);
        count ++;
    }
    $('.loading').hide();
    $('.resultCount').html('Найдено: '+count);
}

function service_organizationCancel() {
    var tr = $('.tableInfo tbody tr.hover').attr('class','row');
    $('#pop_company').hide();
}

function service_organization_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            service_organization_Update();
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
    $("#pop_company form").tooltip({
        show: false,
        hide: false
    });

    $("#pop_company form").validate({ // validate the comment form when it is submitted
        rules: {
            address_locality__region__name: {
                required: true
            },
            address_locality__name: {
                required: true
            },
            company_name: {
                required: true,
                minlength: 3
            },
            address_index: {
                required: true,
                minlength: 6,
                number: true
            },
            inn: {
                required: true,
                minlength: 6,
                number: true
            },
            kpp: {
                //required: true,
                minlength: 6,
                number: true
            },
            bank: {
                required: true
            }
        },
        messages: {
            address_locality__region__name: {
                required: "Необходимо край, область"
            },
            address_locality__name: {
                required: "Необходим населенный пунк"
            },
            company_name: {
                required: "Необходимо наименование компании",
                minlength: "Минимум 3 знака"
            },
            address_index: {
                required: "Необходим индекс",
                minlength: "Минимум 6 знаков",
                number: "Только цифры"
            },
            inn: {
                required: "Необходим КПП",
                minlength: "Минимум 6 знаков",
                number: "Только цифры"
            },
            kpp: {
                //required: "Необходим КПП",
                minlength: "Минимум 6 знаков",
                number: "Только цифры"
            },
            bank: {
                required: "Необходим банк"
            }
        }
    });
}
