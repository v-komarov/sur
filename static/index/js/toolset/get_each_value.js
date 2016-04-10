function get_each_value(form_id){
    var info_array = {};

    $(form_id).each(function () {
        $(this.attributes).each(function () {
            console.log(this.name.slice(0,-3));
            if(this.name.slice(-3)=='_id') {
                info_array[this.name.slice(0,-3)] = this.value;
            }
        });
    });

    $(form_id+' [name]').each(function() {
        var item_name = $(this).attr('name');
        if($(this).is(':visible')){
            if($(this).is('select')){
                info_array[item_name] = $(this).val();
                info_array[item_name+'__text'] = $(this).find(':selected').text();
            }
            else if($(this).is('input')){
                info_array[item_name] = $(this).val();
                if($(this).attr('item_id')){
                    info_array[item_name] = $(this).attr('item_id');
                    info_array[item_name+'__text'] = $(this).val();
                }
            }
            else if($(this).is('textarea')){
                info_array[item_name] = $(this).val();
            }
        }
    });
    return(info_array);
}
