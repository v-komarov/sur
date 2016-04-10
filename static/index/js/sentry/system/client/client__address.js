$(document).ready(function() {

    $('body').on('change', 'select[mark=address_region]', function(){
        var stage_id = $(this).parents('tr').attr('id');
        var stage_val = $(this).val();
        if(stage_val==''){
            console.log('null');
            $('tr#'+stage_id+' [mark=address_locality] option').remove();
            $('tr#'+stage_id+' input').val('');
        } else {
            address_locality_Search(stage_id,'change');
        }
    });
    $('body').on('change', 'select[mark=address_locality]', function(){
        var stage_id = $(this).parents('tr').attr('id');
        $('tr#'+stage_id+' [mark=address_street]').val('').removeAttr('item_id');
        $('tr#'+stage_id+' [mark=address_building]').val('').removeAttr('item_id');
    });


    $('input[name=address_actual_street]').autocomplete({
        source: function(request,response) {
            $.ajax({ url:'/system/directory/street/ajax/search/', type:'get', dataType:'json', data:{
                locality_id: $('[name=address_actual_locality]').val(),
                street_name: request.term,
                limit: 19
            },
                success: function(data) {
                    response($.map(data['street'], function(item) {
                        return {
                            label: item.name,
                            street_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id',ui.item.street_id);
            } else {
                $(this).removeAttr('item_id');
                $(this).val('');
            }
            $('[name=address_actual_building]').removeAttr('item_id');
            $('[name=address_actual_building]').val('');
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('input[name=address_legal_street]').autocomplete({
        source: function(request,response) {
            $.ajax({ url:'/system/directory/street/ajax/search/', type:'get', dataType:'json', data:{
                locality_id: $('[name=address_legal_locality]').val(),
                street_name: request.term,
                limit: 19
            },
                success: function(data) {
                    response($.map(data['street'], function(item) {
                        return {
                            label: item.name,
                            street_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id',ui.item.street_id);
            } else {
                $(this).removeAttr('item_id');
                $(this).val('');
            }
            $('[name=address_legal_building]').removeAttr('item_id');
            $('[name=address_legal_building]').val('');
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('input[name=address_postal_street]').autocomplete({
        source: function(request,response) {
            $.ajax({ url:'/system/directory/street/ajax/search/', type:'get', dataType:'json', data:{
                locality_id: $('[name=address_postal_locality]').val(),
                street_name: request.term,
                limit: 19
            },
                success: function(data) {
                    response($.map(data['street'], function(item) {
                        return {
                            label: item.name,
                            street_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id',ui.item.street_id);
            } else {
                $(this).removeAttr('item_id');
                $(this).val('');
            }
            $('[name=address_postal_building]').removeAttr('item_id');
            $('[name=address_postal_building]').val('');
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('input[name=address_actual_building]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/building/ajax/search/', type:'get', dataType:'json', data: {
                    street_id: $('[name=address_actual_street]').attr('item_id'),
                    building_name: request.term,
                    limit: 9 },
                success: function(data) {
                    response($.map(data['buildings'], function(item) {
                        return {
                            label: item.name,
                            building_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id',ui.item.building_id);
            } else {
                $(this).removeAttr('item_id')
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('input[name=address_legal_building]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/building/ajax/search/', type:'get', dataType:'json', data: {
                    street_id: $('[name=address_legal_street]').attr('item_id'),
                    building_name: request.term,
                    limit: 9 },
                success: function(data) {
                    response($.map(data['buildings'], function(item) {
                        return {
                            label: item.name,
                            building_name: item.name,
                            building_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id',ui.item.building_id);
            } else {
                $(this).removeAttr('item_id')
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('input[name=address_postal_building]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/building/ajax/search/', type:'get', dataType:'json', data: {
                    street_id: $('[name=address_postal_street]').attr('item_id'),
                    building_name: request.term,
                    limit: 9 },
                success: function(data) {
                    response($.map(data['buildings'], function(item) {
                        return {
                            label: item.name,
                            building_id: item.id
                        }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('item_id',ui.item.building_id);
            } else {
                $(this).removeAttr('item_id')
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    /*
     $('input[mark=address_street]').autocomplete({
     source: function(request,response) {
     $.ajax({
     context: $('[name=address_actual_street]'),
     url: '/system/directory/street/ajax/search/', type:'get', dataType:'json', data: {
     locality_id: $(this).parents('td').find('[mark=address_locality]').attr('item_id'),
     street_name: request.term,
     limit: 19
     },
     success: function(data) {
     response($.map(data['street'], function(item) {
     return {
     label: item.name,
     street_id: item.id
     }
     }));
     }
     });
     },
     change: function(event, ui) {
     if(ui.item){
     $(this).attr('item_id',ui.item.street_id);
     $(this).val(ui.item.street_name);
     } else {
     $(this).removeAttr('item_id');
     $(this).val('');
     }
     $(this).parents('td').find('[mark=address_building]').removeAttr('item_id');
     $(this).parents('td').find('[mark=address_building]').val('');
     },
     minChars: 2, zIndex: 100, deferRequestBy: 200
     });


     $('input[mark=address_building]').autocomplete({
     source: function(request, response) {
     $.ajax({
     url: '/system/directory/building/ajax/search/', type:'get', dataType:'json', data: {
     street_id: $(this).parents('td').find('[mark=address_street]').attr('item_id'),
     building_name: request.term,
     limit: 9 },
     success: function(data) {
     response($.map(data['buildings'], function(item) {
     return {
     label: item.name,
     building_id: item.id
     }
     }));
     }
     });
     },
     change: function(event, ui) {
     if(ui.item){
     $(this).attr('item_id',ui.item.building_id);
     } else {
     $(this).removeAttr('item_id')
     }
     },
     minChars: 2, zIndex: 100, deferRequestBy: 200
     });
     */

});


function address_locality_Search_lunchbox(stage_id){
    var region_id = lunchbox['setting']['region'];
    $('tr#'+stage_id+' [mark=address_region]').val(region_id);
    $.ajax({ url:'/system/directory/locality/ajax/search/?region_id='+region_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null) alert(data['error']);
            else if(data['locality']){
                var locality_select = $('tr#'+stage_id+' select[mark=address_locality]');
                $('tr#'+stage_id+' [mark=address_street]').val('').removeAttr('item_id');
                $('tr#'+stage_id+' [mark=address_building]').val('').removeAttr('item_id');
                locality_select.find('option').remove();
                for(var key in data['locality']){
                    var selected = '';
                    if(data['locality'][key]['id']==lunchbox['setting']['locality']) selected = 'selected';
                    var option = '<option value="'+data['locality'][key]['id']+'" '+selected+'>'+data['locality'][key]['name']+'</option>';
                    locality_select.append(option);
                }
            }
        }
    });
}


function address_locality_Search(stage_id,action,data_address){
    console.log('address_locality_Search',stage_id,action);
    var region_id = '';
    if(action=='set'){
        region_id = data_address['region_id'];
    }
    else if(action=='begin'){
        region_id = $('tr#'+stage_id+' select[mark=address_region]').attr('item_id');
        //region_id = lunchbox['setting']['region'];
    }
    else if(action=='change'){
        region_id = $('tr#'+stage_id+' select[mark=address_region]').val();
        $('tr#'+stage_id+' [mark=address_street]').val('').removeAttr('item_id');
        $('tr#'+stage_id+' [mark=address_building]').val('').removeAttr('item_id');
    }
    $('tr#'+stage_id+' [mark=address_region]').val(region_id);

    if(!!region_id){
        $.ajax({ url:'/system/directory/locality/ajax/search/?region_id='+region_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']!=null) alert(data['error']);
                else if(data['locality']){
                    var locality_select = $('tr#'+stage_id+' select[mark=address_locality]');
                    locality_select.find('option').remove();
                    for(var key in data['locality']){
                        var selected = '';
                        if(data['locality'][key]['id']==lunchbox['setting']['locality']) selected = 'selected';
                        var option = '<option value="'+data['locality'][key]['id']+'" '+selected+'>'+data['locality'][key]['name']+'</option>';
                        locality_select.append(option);
                    }
                }
            },
            complete: function (){
                if(action!='begin'){
                    address_street_Clear(stage_id);
                }
            }
        });
    }
    var placement_type_id = $('tr#'+stage_id+' [mark=address_placement_type]').attr('item_id');
    $('tr#'+stage_id+' [mark=address_placement_type]').val(placement_type_id);
}


function address_street_Clear(stage_id){
    $('tr#'+stage_id+' [name=address_street]').val('').removeAttr('item_id');
    $('tr#'+stage_id+' [name=address_building]').val('').removeAttr('item_id');
    $('tr#'+stage_id+' [name=address_placement]').val('');
}

