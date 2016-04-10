$(document).ready(function() {
    /*
     $(".search select").on('change', function(){
     task_Search();
     });
     $('.search input').bind('change keyup', function( event ){
     task_Search();
     });
     */
    $('table.search').on('click', '.switch', function() {
        if( $(this).attr('checked')=='checked' ){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
        task_Search();
    });

    $('table.search').on('click', '.btn_ui', function() {
        var action= $(this).attr('action');
        if(action=='search'){
            task_Search();
        } else if(action=='expand' || action=='hide'){
            search_expand(action);
        }
    });

    $('table.search input[name=locality]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/locality/ajax/search/', type:'get', dataType:'json', data: {
                    //locality_id: $('#client_object_pop [name=address] select[name=address_locality]').val(),
                    locality_name: $('table.search input[name=locality]').val(),
                    limit: 10 },
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
        select: function(event, ui) {
            if(ui.item){
                var locality_id = ui.item.locality_id
            } else {
                $('table.search input[name=locality]').val('');
            }
            $('table.search input[name=locality]').attr('locality_id',locality_id);
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    var dates = $(".search [name=from_date], .search [name=to_date]").datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        defaultDate: "+1w",
        numberOfMonths: 1,
        onSelect: function(selectedDate){
            var option = this.id == "from" ? "minDate" : "maxDate",
                instance = $(this).data( "datepicker" ),
                date = $.datepicker.parseDate(
                    instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                    selectedDate, instance.settings);
            dates.not(this).datepicker("option", option, date);
        }
    });

    search_expand();
    task_Search();
});


function search_expand(action){
    if(action=='expand'){
        $('.search.expand').show();
        $('.search .btn_ui[action=expand] .txt').text('Скрыть детали');
        $('.search .btn_ui[action=expand]').attr('icon','arrow_left');
        $('.search .btn_ui[action=expand]').attr('action','hide');
    } else {
        $('.search .btn_ui[action=hide]').attr('action','expand');
        $('.search.expand').hide();
        $('.search .btn_ui[action=expand] .txt').text('Ещё детали');
        $('.search .btn_ui[action=expand]').attr('icon','arrow_right');
    }
}


function task_Search() {
    popMenuClose('all');
    loading('begin');
    $('#task_list tbody tr').remove();
    var search_pack = {'expand':'false'};
    if( $('table.expand').is(":visible") ) search_pack['expand'] = 'true';
    $('.search select, .search input').each(function() {
        var input_name = $(this).attr('name');
        var input_value = $(this).val();
        if(input_value != ''){
            if(input_name=='locality'){
                search_pack['locality_id'] = $('table.search input[name=locality]').attr('locality_id');
            } else {
                search_pack[input_name] = input_value;
            }
        }
    });
    $('table.search tr.status td[checked=checked]').each(function() {
        var name_ = $(this).attr('name');
        if(name_=='uncompleted'){
            search_pack['uncompleted']='true';
        } else if(name_=='expired') {
            search_pack['expired']='true';
        }
    });
    $.ajax({ url:'/task/ajax/search/', type:'post', dataType:'json', data:search_pack,
        success: function(data){
            setTable(data);
            loading('end');
        }
    });
}


function setTable(data) {
    var count = 0;
    for(var key in data['day_list']){
        var day_tr = '<tr class="row caution" day="'+key+'"><td colspan="5"><div class="split_title">';
        if(key==0){
            day_tr += 'Просроченные заявки';
        } else {
            day_tr += '<div class="date">'+data['day_list'][key]['day']+'</div>'+data['day_list'][key]['weekday'];
        }
        day_tr += '<div class="count">0</div></div></td></tr>';
        $('#task_list tbody').append(day_tr);
    }

    for(var key in data['task_list']){
        var task = data['task_list'][key];
        if(task['status_id']==0){
            var status = 'bg_red';
        } else {
            var status = 'bg_green';
        }
        var service_string = '';
        var report = '';
        if(task['service_list']){
            service_string = contract_string_set(task);
        }
        if(task['report']){
            report = '<div class="report">'+task['report']['comment'] +
            '<div class="doer">'+task['report']['doer']+' ['+task['report']['date']+']</div></div>';
        }
        var task_tr = '<tr class="row" task_id="'+task['id']+'" object_id="'+task['object_id']+'">' +
            '<td class="task border-right" status="'+task['status__label']+'">' +
            '<div class="id">'+task['id']+'</div>'+'<div class="type">'+task['task_type__name']+'</div></td>' +
            '<td class="border-right">'+service_string+'<div class="clear"></div><div class="object_name">'+task['object_name']+'</div>' +
            '<div class="address">'+ task['address'] +'</div>' +
            '<div class="client">Плательщик: '+task['client_name']+'</div></td>' +
            '<td class="cell border-right">'+task['doer']+'</td>' +
            '<td><div class="comment">'+task['comment']+'</div>'+report+'</td>' +
            '<td class="border-left"><div class="datetime" title="Дата создания">'+task['create_date']+'</div>' +
            '<div class="datetime complete_date" title="Дата исполнения">'+task['complete_date']+'</div></td>' +
            '</tr>';

        var day_count = parseInt($('#task_list tbody tr[day='+task['day']+'] .split_title .count').text())+1;
        $('#task_list tbody tr[day='+task['day']+'] .split_title .count').text(day_count+' заявки(ок)');
        $('#task_list tbody tr[day='+task['day']+']').after(task_tr);
        count ++;
    }

    if(count > 0){
        $('.result_count').html('Всего заявок: '+count);
        $('.result_count').show();
    } else {
        $('.result_count').hide();
    }
}