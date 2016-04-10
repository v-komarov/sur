$(document).ready(function() {
    $('.searchObject').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='export_ajax') export_Ajax();
    });

    $('div[name=security_company_filter] .drop_list').on('click', 'li', function(){
        $(this).parents('.drop_list').attr('changed','changed');
        if( $(this).attr('checked')=='checked' ){
            $(this).removeAttr('checked');
        } else {
            $(this).attr('checked','checked');
        }
        security_company_list('check');
    });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    var dates = $('#from, #to').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        showButtonPanel: true,
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        },

        defaultDate: "+1w",
        numberOfMonths: 1,
        onSelect: function(selectedDate){
            var option = this.id == "from" ? "minDate" : "maxDate",
                instance = $( this ).data( "datepicker" ),
                date = $.datepicker.parseDate(
                    instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                    selectedDate, instance.settings);
            dates.not(this).datepicker("option", option, date);
        }

    });

    security_company_list('check');
});


function security_company_list(action){
    if(action=='check'){
        var list_txt = '';
        $("div[name=security_company_filter] .drop_list [checked=checked] .txt").each(function(){
            list_txt += $(this).text()+'<br/>';
        });
        $('[name=security_company_list]').html( list_txt.substr(0,list_txt.length-2) );
    }
    else if('get_list'){
        var security_company_list = [];
        $("div[name=security_company_filter] .drop_list [checked=checked]").each(function(){
            security_company_list.push( $(this).attr('security_company_id') );
        });
        return JSON.stringify(security_company_list);
    }
}


function export_Ajax(){
    $('.loading').show();
    var ajax_array = {};
    ajax_array['security_company_list'] = security_company_list('get_list');
    ajax_array['begin_date'] = $('input#from').val();
    ajax_array['end_date'] = $('input#to').val();
    $.ajax({ url:'/system/finance/ajax/export_post/', type:'post', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            }
            else {
                location.href = data['file_url']
            }
            $('.loading').hide();
        }
    });
}