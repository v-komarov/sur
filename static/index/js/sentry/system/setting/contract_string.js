$(document).ready(function() {
    $(".tableInfo").on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action=='reset'){
            contract_string_Ajax();
        }
        if(action=='update'){
            contract_string_Update();
        }
    });

    contract_string_Ajax();
    contract_string_Get();
});


function contract_string_Get(){
    var contract_set = lunchbox['setting']['contract_string'];
    console.log(contract_set);
}


function contract_string_Ajax(){
    var contract_string;
    $.ajax({ url:'/system/setting/contract_string/ajax/get/', type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null)
                alert(data['error']);
            else
                contract_string_Split(data['contract_string']);
        }
    });
}


function contract_string_Split(contract_string){
    var contract_array = {
        ' ': ' ',
        'begin_date': 'Дата договора',
        'name': 'Номер договора',
        'service_type__name': 'Тип услуги',
        'subtype_list': 'Подтипы услуги',
        'tag_list': 'Метки объекта',
        '-': '-', '/': '/',
        '[': '[', ']': ']',
        '(': '(', ')': ')' };

    $('select[name=contract_string_view]').each(function(){
        $(this).find('option').remove();
        var item = parseInt( $(this).attr('item') );
        for(key in contract_array){
            $(this).append('<option value="'+key+'">'+contract_array[key]+'</option>');
        }
    });
    var contract_array = contract_string.split('%');
    var item = 1;
    for(key in contract_array){
        $('select[name=contract_string_view][item='+item+']').val(contract_array[key]);
        //console.log(contract_array[key]);
        item++;
    }
}


function contract_string_Update(){
    var contract_string = '';
    $('select[name=contract_string_view]').each(function(){
        if(!!$(this).val()) contract_string += $(this).val()+'%';
        else contract_string += ' %';
    });
    contract_string = contract_string.substr(0,contract_string.length-1);
    console.log(contract_string);

    $.ajax({ url:'/system/setting/contract_string/ajax/update/', type:'post', dataType:'json',
        data:{ contract_string:contract_string },
        success: function(data) {
            if (data['error'] != null)
                alert(data['error']);
            else {
                popMessage('Сохранено', 'green');
                contract_string_Ajax();
            }
        }
    });
}