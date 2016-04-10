$(document).ready(function() {
    client_id = $('.middleBlock').attr('client_id');
    if(client_id=='None'){
        check_legal_type_base();
        address_locality_Search_lunchbox('address_actual');
        address_locality_Search_lunchbox('address_legal');
        address_locality_Search_lunchbox('address_postal');
        $('.btn_ui[action=client_delete]').hide();
        $('.btn_ui[action=contract_add]').hide();
    }
    else {
        check_legal_type_base();
        address_locality_Search('address_actual','begin');
        address_locality_Search('address_legal','begin');
        address_locality_Search('address_postal','begin');
    }

    $(".tableInfo").on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        console.log(action);
        if(action=='edit'){

        }
        else if(action=='reset'){

        }
        else if(action=='cancel'){

        }
        else if(action=='client_delete'){
            if(confirm('Удалить клиента?')) client_info_Delete();
        }
    });

    $('body').on('change', '[name=legal_type]', function() {
        check_legal_type_base($(this).val());
    });

    $('[name=holding]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/holding/ajax/search/', dataType: "json",
                data: { holding_name:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['holding'], function(item) {
                        return {
                            label: item.name,
                            holding_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id',ui.item.holding_id);
            } else {
                $(this).removeAttr('item_id');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('[name=founding_date]').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });

    client_info_Validate(12);
});


function check_legal_type_base(legal_type_id){
    console.log('legal_type_id: '+legal_type_id);
    if(!!legal_type_id){
        var legal_type_base_id = $('[name=legal_type_base] option[legal_type_id='+legal_type_id+']:eq(0)').attr('value');
    }
    else {
        var legal_type_id = $('[name=legal_type]').attr('item_id');
        var legal_type_base_id = $('[name=legal_type_base]').attr('item_id');
    }
    console.log('legal_type_base_id: '+legal_type_base_id);

    if(legal_type_id==''){
        var legal_type_id = 2;
    }

    if(legal_type_base_id==''){
        var legal_type_base_id = 3;
    }
    $('select[name=legal_type_base] option').each(function(){
        if($(this).attr('legal_type_id')==legal_type_id){
            $(this).show();
        } else {
            $(this).hide();
        }
    });

    $('select[name=legal_type]').val(legal_type_id);
    $('select[name=legal_type_base]').val(legal_type_base_id);


    if(legal_type_id==1){ // ИП
        console.log('ИП');
        client_info_Validate(12);
    }
    else if(legal_type_id==2){ // Юрлицо
        console.log('Юрлицо');
        client_info_Validate(10);
    }
}


function client_info_Delete(){
    $.ajax({ url:'/system/client/info/ajax/delete/?client_id='+client_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                var data_error = data['error'];
                for(var key in data_error){
                    console.log(key+': '+data_error[key]);
                    var tr_title = $('#id_'+key).parents('.row').find('td:eq(0)').text();
                    alert(tr_title+' '+data_error[key]);
                }
            } else if(data['url']){
                location.href = data['url'];
            }
        }
    });
}


function client_info_Update(){
    var info_array = get_each_value('#client_info_form');
    info_array['client'] = client_id;
    $.ajax({ url:'/system/client/info/ajax/update/', type:'post', dataType:'json', data:info_array,
        success: function(data){
            console.log(data['error'], data['error'].length);
            if( !$.isEmptyObject(data['error']) ){
                console.log('error');
                for(var key in data['error']){
                    console.log(key+': '+data['error'][key]);
                    var tr_title = $('#id_'+key).parents('.row').find('td:eq(0)').text();
                    alert(tr_title+' '+data['error'][key]);
                }
            }
            else if(data['errors']){
                popMessage(data['errors'],'red');
            }
            else if(data['url']){
                location.href = data['url'];
            }
            else {
                //location.reload();
                popMessage('Сохранено','green');
            }
        }
    });
}


function client_info_Validate(inn_length){

    $.validator.setDefaults({
        submitHandler: function(){
            client_info_Update();
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
    $("form#client_info_form").tooltip({
        show: false,
        hide: false
    });

    $("form#client_info_form").validate({ // validate the comment form when it is submitted
        rules: {
            name: {
                required: true,
                minlength: 3
            },
            legal_type: {
                required: true
            },
            founding_date: {
                required: false,
                minlength: 10
            },
            address_actual_region: { required:true },
            address_actual_locality: { required:true },
            address_actual_street: { required:true },
            address_actual_building: { required:true },
            address_actual_index: { minlength:6, maxlength:6, number:true },
            address_legal_index: { minlength:6, maxlength:6, number:true },
            address_postal_index: { minlength:6, maxlength:6, number:true },
            inn: { required:true, minlength:10, maxlength:12, number:true },
            kpp: { maxlength:9, number:true },
            ogrn: { maxlength:32, number:true },
            ogrnip: { minlength:15, maxlength:15 },
            rs4et: { maxlength:64, number:true },
            ks4et: { maxlength:64, number:true }
        },
        messages: {
            name: {
                required: "Необходим плательщик",
                minlength: "Минимум 3 знака"
            },
            legal_type: {
                required: "Необходима форма собственности"
            },
            founding_date: {
                required: "Необходима дата выдачи",
                minlength: "Некорректный формат, 30.12.1990"
            },
            address_actual_region: { required:"Необходим регион" },
            address_actual_locality: { required:"Необходим город" },
            address_actual_street: { required:"Необходима улица" },
            address_actual_building: { required:"Необходим дом" },
            address_actual_index: { minlength:"Минимум 6 знаков", maxlength:"Максимум 6 знаков", number:"Только цифры" },
            address_legal_index: { minlength:"Минимум 6 знаков", maxlength:"Максимум 6 знаков", number:"Только цифры" },
            address_postal_index: { minlength:"Минимум 6 знаков", maxlength:"Максимум 6 знаков", number:"Только цифры" },
            inn: { required:"Необходим ИНН", minlength:"Минимум 10 знаков", maxlength:"Максимум 12 знаков", number:"Только цифры" },
            kpp: { maxlength:"Максимум 9 знаков", number: "Только цифры" },
            ogrn: { maxlength:"Максимум 32 знаков", number:"Только цифры" },
            ogrnip: { minlength:"Минимум 15 знаков", maxlength:"Максимум 15 знаков" },
            rs4et: { maxlength:"Максимум 64 знаков", number:"Только цифры" },
            ks4et: { maxlength:"Максимум 64 знаков", number:"Только цифры" }
        }
    });
}
