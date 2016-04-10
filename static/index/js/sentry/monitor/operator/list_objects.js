function objectsFilter(){
    $('select.event_filter [value=object]').attr('selected','selected');
    event_filter = 'object';
    eventsRefresh('new');
}

function objectsRefresh(action){
    $.ajax({ url:'/monitor/operator/refresh/objects/', type:'post', dataType:'json',
        data:{
            'action': action,
            'object_filter': object_filter
        },
        success: function(data){
            objectsRefreshTable(data,action);
        }
    });
}

function objectsRefreshTable(data,action){
    if(action=='new'){
        $('#objectsBody tr:eq(1) td').removeAttr('style');
        $('#objectsBody tr').remove();
    }
    var result = data['objects'];
    for(var key in result){
        var tr_object =
            '<tr class="row '+result[key]['status']+'" id="'+result[key]['object_id']+'">' +
                '<td class="cell" key="order_num">'+result[key]['order_num']+'</td>' +
                '<td class="cell" key="object_name">'+result[key]['name']+'</td>' +
            '</tr>';
        $('#objectsBody').prepend(tr_object);
    }
    resizeTable('object');
}

function objectSetStatus(result){
    if( $.inArray(result['event_group'], object_status_list)>=0 ){
        if(object_filter=='all'){
            $('#objectsBody tr#'+result['object_id']+':not(.blockInfo)').attr('class','row '+result['event_group']);
        }
        else if(object_filter==result['event_group']){
            var tr_object =
                '<tr class="row '+result['event_group']+'" id="'+result['object_id']+'">' +
                    '<td class="cell" key="order_num">'+result['object_num']+'</td>' +
                    '<td class="cell" key="object_name">'+result['object_name']+'</td>' +
                '</tr>';
            $('#objectsBody').prepend(tr_object);
            resizeTable('object');
        }
        else {
            $('#objectsBody tr#'+result['object_id']).remove();
            resizeTable('object');
        }
    }
}

function objectOpenSearch(object_id){
    $.ajax({ url:'/monitor/get/object/', type:'get', dataType:'json', data:{'id': object_id},
        success: function(data){
            $('#autocomplete_object').val('');
            var tr_object =
                '<tr class="row '+data['object_status']+'" id="'+data['object_id']+'">' +
                    '<td class="cell" key="order_num">'+data['order_num']+'</td>' +
                    '<td class="cell" key="object_name">'+data['object_name']+'</td>' +
                    '</tr>';
            $('#objectsBody tr:eq(1) td').removeAttr('style');
            $('#objectsBody').html(tr_object);

            objectOpenInfo('object',data);
            resizeTable('object');
        }
    });
}

function objectOpenInfo(tbody_id,data){
    var clicked_tr = $('#'+tbody_id+'sBody tr#'+data['object_id']);
    object_id = data['object_id'];
    if(data['contacts'].length>0){
        var contacts_string = collectContacts(data['contacts']);
    }
    var tr_info =
        '<tr class="blockInfo" id="' + data['object_id'] + '"><td colspan="2">' +
            //'<div class="field">id: ' + data['object_id'] + '</div>' +
            '<div class="field">Адрес: ' + data['address'] + '</div>' +
            '<div class="field">ГБР: ' + data['gbr_name'] +'</div>' +
            contacts_string + '<hr>' +
            '<div class="button left" onclick="objectsFilter()">Фильтр</div>' +
            '<div class="button up" action="closeInfo"></div>' +
            '</td></tr>';
    if(event_filter == 'object') {
        eventsRefresh('new');
    }
    buttonCloseInfo(tbody_id);
    clicked_tr.after(tr_info);
}
