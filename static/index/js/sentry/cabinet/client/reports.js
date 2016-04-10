$(document).ready(function() {
    object_id = $(".selectObject").attr('object_id');

    $("select.selectObject").change(function () {
        id = $(this).val();
        location.href='/cabinet/reports/'+id+'/';
        console.log(id);
    })

    $(".daterange").on('click','.item', function() {
        $(".leftBlock .selected").attr('class','item');
        $(".daterange .item").attr('class','item selected');
        $(".rangeSelectBlock").show();
    });

    $("#startValue").on('change', function(){ ajaxReport(); });
    $("#stopValue").on('change', function(){ ajaxReport(); });

})


function ajaxReport(){
    console.log('click');
    $.ajax({ url:'/cabinet/reports/', type:'get', dataType:'json',
        data:{ 'daterange': 'True',
            'start': $('#startValue').val(),
            'stop': $('#stopValue').val()
        },
        success: function(data){
            setTable(data);
        }
    });
}

function setTable(data) {
    report = data;
    tr = '';
    $('.tableInfo tbody tr').remove();
    for(var key in report){
        if(report[key]['event']=='lock'){
            event = 'Постановка на охрану';
        } else {
            event = 'Снятие с охраны';
        }
        tr += '<tr>' +
            '<td class="cell date_transaction">'+report[key]['date_event'].slice(0,10)+' <span class="time">'+report[key]['date_event'].slice(10,18)+'</span></td>' +
            '<td class="cell bg_key">'+report[key]['key']+'</td>' +
            '<td class="cell bg_'+report[key]['event']+'">'+event+'</td></tr>';
    }
    $('.tableInfo tbody').html(tr);
}

$(function() {
    $.datepicker.setDefaults(
        $.extend($.datepicker.regional["ru"])
    );
    $('#startValue').datepicker({
        showOn: "button",
        buttonImage: "/static/admin/img/icon_calendar.gif",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
            /*
             $.ajax({ url:'/cabinet/report/', type:'get', dataType:'json',
             data:{ 'daterange': 'True',
             'start': selectedDate,
             'stop': $('#stopValue').val()
             },
             success: function(data){
             setTable(data);
             }
             });
             */
        }
    });

    $('#stopValue').datepicker({
        showOn: "button",
        buttonImage: "/static/admin/img/icon_calendar.gif",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#startValue" ).datepicker( "option", "maxDate", selectedDate );
            /*
             $.ajax({ url:'/cabinet/report/', type:'get', dataType:'json',
             data:{ 'daterange': 'True',
             'start': $('#startValue').val(),
             'stop': selectedDate
             },
             success: function(data){
             setTable(data);
             }
             });
             */
        }
    });
});