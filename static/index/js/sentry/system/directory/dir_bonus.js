$(document).ready(function() {

    $("#bonus_pop").on('click', '.btn_ui, .btn_28', function() {
        var action = $(this).attr('action');
        if(action=='delete'){
            if (confirm('Удалить бонус?')){
                var bonus_id = $('#bonus_list .hover').attr('bonus_id');
                bonus_Delete(bonus_id);
            }
        }
    });

    $('#bonus_pop .header').on('click', '.close', function() {
        bonus_Cancel();
    });

    $('#bonus_list').on('click', '.btn_ui', function() {
        var action = $(this).attr('action');
        if(action == 'add') {
            bonus_Edit('create');
        }
    });

    $('#bonus_list tbody').on('click', '.row:not(.edit)', function() {
        if($.inArray('system.client', lunchbox['permissions'])>=0) {
            var bonus_id = $(this).attr('bonus_id');
            bonus_Cancel();
            bonus_Edit(bonus_id);
        }
    });

    $('.tableInfo thead input').bind('change keyup', function( event ){
        bonus_Search();
    });
/*
    $('#bonus_pop [name=sentry_user]').autocomplete({
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
*/
    bonus_Search();
    bonus_Validate();
    select_sentry_user();
});


function bonus_Edit(bonus_id){
    bonus_Cancel();
    if(bonus_id=='create'){
        $('#bonus_pop input').val('');
        $('#bonus_pop [name=name]').val( $('#bonus_list thead [name=name]').val() );
        popMenuPosition('#bonus_pop','single');
    } else {
        $('table#bonus_list tbody tr[bonus_id='+bonus_id+']').attr('class','row hover');
        $.ajax({ url:'/system/directory/bonus/ajax/get/?bonus_id='+bonus_id, type:'get', dataType:'json',
            success: function(data){
                if(data['error']!=null){
                    alert(data['error']);
                } else {
                    for(var key in data['bonus']){
                        $('#bonus_pop [name='+key+']').val(data['bonus'][key]);
                    }
                    if(data['bonus']['sentry_user_id']){
                        //$('#bonus_pop [name=sentry_user]').attr('user_id',data['bonus']['sentry_user_id']);
                        $('#bonus_pop select[name=sentry_user]').val(data['bonus']['sentry_user_id']);
                        console.log(data['bonus']['sentry_user_id']);
                    }
                    if($.inArray('system.client', lunchbox['permissions'])>=0) {
                        $('#bonus_pop .btn_ui[action=bonus_delete]').show();
                    }
                    popMenuPosition('#bonus_pop','single');
                }
            }
        });
    }
}


function bonus_Update(){
    var bonus_array = {};
    if($('#bonus_list tbody tr.row').is('.hover')) bonus_array['bonus_id'] = $('#bonus_list tbody .hover').attr('bonus_id');
    bonus_array['label'] = $('#bonus_pop [name=label]').val();
    bonus_array['name'] = $('#bonus_pop [name=name]').val();
    var description = $('#bonus_pop [name=description]').val();
    if(!!description) bonus_array['description'] = description;
    var cost = $('#bonus_pop [name=cost]').val();
    if(!!cost) bonus_array['cost'] = cost;
    //var sentry_user_id = $('#bonus_pop [name=sentry_user]').attr('user_id');
    var sentry_user_id = $('#bonus_pop [name=sentry_user]').val();
    if(!!sentry_user_id) bonus_array['sentry_user_id'] = sentry_user_id;
    $.ajax({ url:'/system/directory/bonus/ajax/update/', type:'post', dataType:'json', data:bonus_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                $('#bonus_list input').val('');
                bonus_Search();
            }
        }
    });
}


function bonus_Delete(bonus_id) {
    $.ajax({ url:'/system/directory/bonus/ajax/delete/?bonus_id='+bonus_id, type:'get', dataType:'json',
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                bonus_Search();
            }
        }
    });
}


function bonus_Search() {
    bonus_Cancel();
    $('.loading').show();
    $.ajax({ url:'/system/directory/bonus/ajax/search/', type:'get', dataType:'json',
        data:{
            'name': $('.tableInfo thead input[name=bonus_name]').val()
        },
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            } else {
                var count = 0;
                $('#bonus_list tbody tr').remove();
                for(var key in data['bonus_list']){
                    count ++;
                    var bonus = data['bonus_list'][key];
                    var bonus_tr = '<tr class="row" bonus_id="'+bonus['id']+'">' +
                        '<td class="cell">'+bonus['name']+'</td>' +
                        '<td colspan="2" class="cell">'+bonus['description']+'</td>' +
                        '</tr>';
                    $('#bonus_list tbody').append(bonus_tr);
                }
                $('.resultCount').html('Найдено: '+count);
            }
            $('.loading').hide();
        }
    });
}


function bonus_Cancel() {
    var tr = $('.tableInfo tbody tr.hover').attr('class','row');
    $('#bonus_pop .btn_ui[action=bonus_delete]').hide();
    $('#bonus_pop').hide();
    $('#bonus_pop input').val('');
    $('#bonus_pop input').removeAttr('user_id');
}


function bonus_Validate() {
    $.validator.setDefaults({
        submitHandler: function() {
            bonus_Update();
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
    $("#bonus_pop form").tooltip({
        show: false,
        hide: false
    });

    $("#bonus_pop form").validate({ // validate the comment form when it is submitted
        rules: {
            label: {
                required: true
            },
            name: {
                required: true
            },
            description: {
                required: true
            },
            cost: {
                number: true
            }
        },
        messages: {
            label: {
                required: "Необходима метка, на английском языке"
            },
            name: {
                required: "Необходим наименование"
            },
            description: {
                required: "Необходимо описание"
            },
            cost: {
                number: "Только цифры"
            }
        }
    });
}
