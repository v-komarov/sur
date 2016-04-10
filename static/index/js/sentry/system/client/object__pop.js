$(document).ready(function() {
    $('#client_object_pop').on('change', 'select[name=referer_type_id]', function(){
        if($(this).val()==1){
            $('#client_object_pop select[name=referer_user]').show().val('').removeAttr('disabled');
        } else {
            $('#client_object_pop select[name=referer_user]').hide().attr('disabled','disabled');
        }
    });

    $('#client_object_pop').on('click', 'td.switch', function(){
        if($(this).attr('checked')=='checked'){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
    });

    $('#client_object_pop').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        console.log('pop action: '+action);
        if(action=='reset'){
            client_object_Edit();
        }
        else if(action=='cancel'){
            //client_object_infoCancel();
        }
        else if(action=='object_tag_add'){
            client_object_tag('add');
        }
    });

    $('#client_object_pop').on('change', 'select[name=address_region]', function(){
        address_locality_Search();
    });

    $('#client_object_pop input[name=address_street]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/street/ajax/search/', type:'get', dataType:'json', data: {
                    locality_id: $('#client_object_pop [name=address] select[name=address_locality]').val(),
                    street_name: $('#client_object_pop [name=address] input[name=address_street]').val(),
                    limit: 19 },
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
        select: function(event, ui) {
            if(ui.item){
                var street_id = ui.item.street_id
            } else {
                var street_id = 'new';
                $('[name=address] input[name=address_street]').val('');
            }
            $('#client_object_pop [name=address] input[name=address_street]').attr('street_id',street_id);
            $('#client_object_pop [name=address] input[name=address_building]').val('');
        },
        change: function(event, ui) { // change duplicate select
            if(ui.item){
                $(this).attr('street_id',ui.item.street_id);
                $('#client_object_pop input[name=address_building]').autocomplete('enable');
            } else {
                $(this).removeAttr('street_id');
                $('#client_object_pop input[name=address_building]').autocomplete('disable');
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('#client_object_pop input[name=address_building]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/building/ajax/search/', type:'get', dataType:'json', data: {
                    street_id: $('#client_object_pop [name=address] input[name=address_street]').attr('street_id'),
                    building_name: request.term ,
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
                $(this).attr('building_id',ui.item.building_id);
            } else {
                $(this).removeAttr('building_id')
            }
        },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('#client_object_pop input[name=referer_user]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/sentry_user/ajax/search/', type:'get', dataType:'json',
                data:{full_name:request.term, limit:10},
                success: function(data) {
                    response($.map(data['user_list'], function(item) {
                        return { label:item.full_name, user_id:item.id }
                    }));
                }
            });
        },
        change: function(event, ui) {
            if(ui.item){
                $(this).attr('user_id', ui.item.user_id);
            } else {
                $(this).val('').removeAttr('user_id');
            }
        },
        //select: function(event, ui) { $('tr#holding__name').attr('holding_id', ui.item.holding_id); },
        minChars: 2, zIndex: 100, deferRequestBy: 200
    });

    $('#client_object_pop .in_pop_sublist').on('click', '.close', function(){
        var tag_id = $(this).parent().attr('tag_id');
        client_object_tag('delete',tag_id)
    });

    client_object_Validate();
});


function client_object_Add(){
    popMenuPosition('#client_object_pop','single');
}


function client_object_Edit(){
    client_object_Reset();
    $('#service_list tbody tr.hover').attr('class','row');
    popMenuPosition('#client_object_pop','single');
}


function address_locality_Search(client_object_data){
    var region_id = $('#client_object_pop select[name=address_region]').val();
    $.ajax({ url:'/system/directory/locality/ajax/search/?region_id='+region_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            }
            else if(data['locality']){
                var locality_select = $('#client_object_pop select[name=address_locality]');
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
            address_street_Clear();
            if(client_object_data){
                var address = client_object_data['address'];
                $('#client_object_pop [name=address_locality] [value=' +address['locality_id']+ ']').attr('selected', 'selected');
                $('#client_object_pop [name=address_street]').attr('street_id',address['street_id']);
                $('#client_object_pop [name=address_street]').val(address['street_name']);
                $('#client_object_pop [name=address_building]').attr('building_id',address['building_id']);
                $('#client_object_pop [name=address_building]').val(address['building_name']);
                $('#client_object_pop [name=address_placement]').val(address['placement']);
            }
        }
    });
}


function address_street_Clear(){
    $('#client_object_pop [name=address_street]').val('').removeAttr('street_id');
    $('#client_object_pop [name=address_building]').val('').removeAttr('building_id');
    $('#client_object_pop [name=address_placement]').val('');
}


function client_object_tag(action,data) {
    if(action=='add'){
        var tag_id = parseInt( $('#client_object_pop select#client_object_tags').val() );
        var tag_txt = $('#client_object_pop select#client_object_tags :selected').attr('name');
        var span = '<span class="item" tag_id="'+tag_id+'">' +
            '<span class="txt">'+tag_txt+'</span>' +
            '<span class="close" title="Удалить"></span></span>';
        $('#client_object_pop div.in_pop_sublist').append(span);
    }
    else if(action=='delete'){
        $('#client_object_pop .in_pop_sublist .item[tag_id='+data+']').remove();
    }
    else if(action=='get'){
        var tag_list = [];
        $('#client_object_pop .in_pop_sublist .item').each(function(){
            tag_list.push( $(this).attr('tag_id') );
        });
        return JSON.stringify(tag_list);
    }
    else if(action=='set'){
        $('#client_object_pop .in_pop_sublist .item').remove();
        for(var key in data){
            var span = '<span class="item" tag_id="'+data[key]['id']+'">' +
                '<span class="txt">'+data[key]['name']+'</span>' +
                '<span class="close" title="Удалить"></span></span>';
            $('#client_object_pop .in_pop_sublist').append(span);
        }
    }

    $('#client_object_pop select#client_object_tags option').removeAttr('class').removeAttr('selected');
    $('#client_object_pop .in_pop_sublist .item').each(function(){
        var tag_id = $(this).attr('tag_id') ;
        $('#client_object_pop select#client_object_tags option[value='+tag_id+']').attr('class','hide');
    });


    if($('#client_object_pop select#client_object_tags option:not(.hide)').length>0){
        $('#client_object_pop select#client_object_tags').show();
        $('#client_object_pop span.btn_ui[name=subtypes]').show();
        $('#client_object_pop select#client_object_tags option:not(.hide):first').attr("selected", "selected");
    } else {
        $('#client_object_pop select#client_object_tags').hide();
        $('#client_object_pop span.btn_ui[name=subtypes]').hide();
    }
}


function client_object_Delete(){
    $.ajax({ url:'/system/client/object/ajax/delete/?object_id='+object_id, type:'post', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            }
            else if(data['url']){
                location.href = data['url'];
            }
            else if(data['answer']){
                alert(data['answer']);
            }
        }
    });
}


function client_object_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            client_object_Update();
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
    $("#client_object_pop form").tooltip({
        show: false,
        hide: false
    });

    $("#client_object_pop form").validate({ // validate the comment form when it is submitted
        rules: {
            name: {
                required: true,
                minlength: 3
            },
            address_street: {
                required: true
            },
            address_building: {
                required: true
            },
            referer_user: {
                required: true
            }
        },
        messages: {
            name: {
                required: "Необходимо наименование",
                minlength: "Минимум 3 знака"
            },
            address_street: {
                required: "Необходима улица"
            },
            address_building: {
                required: "Необходим номер дома"
            },
            referer_user: {
                required: "Необходим менеджер"
            }
        }
    });
}