
function get_contract_string(data){
    var contract_set = lunchbox['setting']['contract_string'];
    console.log('get_contract_string', contract_set);
    var data_labels = [
        'name',
        'begin_date',
        'service_type__name',
        'subtype_list',
        'tag_list'
    ];
    var contract_array = contract_set.split('%');
    var string = '<div class="service_string" status="'+data['status__label']+'">';
    for(key in contract_array){
        var sign = contract_array[key];
        if(jQuery.inArray(sign, data_labels)>=0 && sign!='' ){
            //console.log(sign);

            if(sign=='begin_date'){
                string += '<span sign="'+sign+'" status="'+data['ovd_status__label']+'">'+data['begin_date']+'</span>';
            }
            else if(sign=='subtype_list'){
                var string_subtype = '<span sign="'+sign+'">';
                for(subtype_key in data['subtype_list']){
                    string_subtype += data['subtype_list'][subtype_key]['name']+'+';
                }
                if(string_subtype.slice(-1)=='+') string_subtype = string_subtype.slice(0,-1);
                string_subtype += '</span>';
                string += string_subtype;
            }
            else {
                string += '<span sign="'+sign+'">'+data[sign]+'</span>';
            }
        }
        else {
            string += contract_array[key];
        }
    }
    string += '</div>';
    return string;
}


function contract_string_set(data,mode){
    var contract_set = lunchbox['setting']['contract_string'];
    var string = '';
    var data_labels = [
        'begin_date',
        'name',
        'service_type__name',
        'subtype_list',
        'tag_list'
    ];
    var contract_array = contract_set.split('%');
    if(mode=='one'){
        string += '<div class="service_string" status="'+data['service_status']+'">';
        for(key in contract_array){
            var sign = contract_array[key];
            if(jQuery.inArray(sign, data_labels)>=0 && sign!='' ){
                if(sign=='begin_date'){
                    string += '<span sign="'+sign+'" status="'+data['status']+'">';
                } else {
                    string += '<span sign="'+sign+'">';
                }
                string += data[sign]
            }
            else {
                string += '<span>'+sign;
            }
            string += '</span>'
        }
        string += '</div>';
    }
    else {
        for(service_key in data['service_list']){
            var service_item = data['service_list'][service_key];
            //console.log(service_item);
            string += '<div class="service_string" status="'+service_item['status']+'">';
            for(key in contract_array){
                var sign = contract_array[key];
                if( jQuery.inArray(sign, data_labels)>=0 && sign!='' ){
                    if(sign=='begin_date'){
                        string += '<span sign="'+sign+'" status="'+service_item['status']+'">';
                    } else {
                        string += '<span sign="'+sign+'">';
                    }
                    string += service_item[sign]
                }
                else {
                    string += '<span>'+sign;
                }
                string += '</span>'
            }
            string += '</div>';
        }
    }
    //console.log(string);
    return string;
}
