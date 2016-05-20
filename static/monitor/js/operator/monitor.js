$(document).ready(function() {

    $("ul li a").bind("click",SwitchButton);
    $("button[clear=OK]").bind("click",ClearAlarm);
    $("button[create_alarm=OK]").bind("click",CreateAlarm);
    $("table[group=1] tbody tr").bind("click",ClickObjectRow);
    $("first-step button").bind("click",FirstStep);
    $("second-step button").bind("click",SecondStep);
    $("third-step button").bind("click",ThirdStep);
    $("fourth-step button").bind("click",FourthStep);
    $("button[service=ok]").bind("click",SetStatusService);

    MakeColorTable2();
    GetSettings();
    GetAlarmList();
    GetServiceList();
    MarkFirst();
    setInterval('UpdateData();',5000);

});





function MarkFirst() {

    $("table[group=1] tbody tr").css("background-color","");
    $("table[group=1] tbody tr:first").css("background-color","#FFD700");
    $("table[group=1] tbody tr:first").attr("marked","yes");
    GetAddsData($("table[group=1] tbody tr:first").attr("client_bind"));

}


function MakeColorTable2() {

    $("table[group=2] tbody tr[alert_level=3]").css("background-color","yellow");
    $("table[group=2] tbody tr[alert_level=0]").css("background-color","#98FB98");
    $("table[group=2] tbody tr[alert_level=1]").css("background-color","#40E0D0");
    $("table[group=2] tbody tr[alert_level=9]").css("background-color","#FF4500");

}



function SwitchButton(e) {

    var mygroup = $(this).closest("ul").attr('group');
    var group = $("ul[group="+mygroup+"]").children("li");
    group.removeClass('active');
    $(this).closest("li").addClass('active');

    if ((mygroup == "1") && ($(this).text() == "Все")) {
        $("table[group=1] tbody tr").show();

    }

    if ((mygroup == "1") && ($(this).text() == "Охраняемые")) {
        $("table[group=1] tbody tr[status!=connected]").hide();
        $("table[group=1] tbody tr[status=connected]").show();

    }

    if ((mygroup == "1") && ($(this).text() == "Не подохраной")) {
        $("table[group=1] tbody tr[status=connected]").hide();
        $("table[group=1] tbody tr[status!=connected]").show();

    }

    if ((mygroup == "1") && ($(this).text() == "Тревожные")) {
        $("table[group=1] tbody tr[alarm=no]").hide();
        $("table[group=1] tbody tr[alarm=yes]").show();

    }

    if ((mygroup == "1") && ($(this).text() == "Нет теста")) {
        $("table[group=1] tbody tr[test=yes]").hide();
        $("table[group=1] tbody tr[test=no]").show();

    }

    if ((mygroup == "1") && ($(this).text() == "Обслуживание")) {
        $("table[group=1] tbody tr[service=no]").hide();
        $("table[group=1] tbody tr[service=yes]").show();

    }


    if ((mygroup == "2") && ($(this).text() == "Все")) {
        $("table[group=2] tbody tr").show();

    }

    if ((mygroup == "2") && ($(this).text() == "Тревоги")) {
        $("table[group=2] tbody tr[alert_level!=9]").hide();
        $("table[group=2] tbody tr[alert_level=9]").show();
    }

    if ((mygroup == "2") && ($(this).text() == "На объекте")) {
        var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");
        $("table[group=2] tbody tr[client_bind_id!="+client_bind+"]").hide();
        $("table[group=2] tbody tr[client_bind_id="+client_bind+"]").show();
    }

}






// Создание тревоги
function CreateAlarm(e) {
    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");

    var jqxhr = $.getJSON("/monitor/operator/getdata?createalarm="+client_bind,
    function(data) {

        if (data['result'] == 'ok') {
            $(".alarm").show();
            $(".noalarm").hide();
        }

    })

}







// Отмена тревоги
function ClearAlarm(e) {

    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");

    var jqxhr = $.getJSON("/monitor/operator/getdata?clearalarm="+client_bind,
    function(data) {

        if (data['result'] == 'ok') {
            $(".alarm").hide();
            $(".noalarm").show();
        }

    })
}








function ClickObjectRow(e) {

        var mytablegroup = $(this).siblings("tr")
        mytablegroup.css("background-color","");
        $(this).css("background-color","#FFD700");
        mytablegroup.attr("marked","no");
        $(this).attr("marked","yes");
        GetAddsData($(this).attr("client_bind"));

        //  Для варианта "На объекте"
        var mybutton = $("ul[group=2]").children("li.active");
        if (mybutton.text()=="На объекте") {
            var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");
            $("table[group=2] tbody tr[client_bind_id!="+client_bind+"]").hide();
            $("table[group=2] tbody tr[client_bind_id="+client_bind+"]").show();

        }

}




function GetAlarmList() {

    var jqxhr = $.getJSON("/monitor/operator/getdata?alarmlist=ok",
    function(data) {

        $("table[group=1] tbody tr[service=no]").attr("alarm","no");
        $("table[group=1] tbody tr[service=no]").css("color","");



        var arr = data['client_bind_alarm']
        arr.forEach(function(item,i,arr){
            $("table[group=1] tbody tr[client_bind="+item+"]").attr("alarm","yes");
            $("table[group=1] tbody tr[client_bind="+item+"]").css("color","red");
        });

        // Красная рамка
        if (arr.length != 0) {
            $(".container[border=ok]").css( "border", "13px solid red");
        }
        else {
            $(".container").css( "border", "");
        }


    })

}





function GetServiceList() {

    var jqxhr = $.getJSON("/monitor/operator/getdata?servicelist=ok",
    function(data) {

        $("table[group=1] tbody tr[service=yes]").css("color","");
        $("table[group=1] tbody tr[service=yes]").attr("service","no");



        var arr = data['client_bind_service']
        arr.forEach(function(item,i,arr){
            $("table[group=1] tbody tr[client_bind="+item+"]").attr("service","yes");
            $("table[group=1] tbody tr[client_bind="+item+"]").css("color","green");
        });

    })

}







// Установка статуса обслуживания
function SetStatusService() {

    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");
    var status = $('input[service=ok]:checkbox').prop('checked');
    var comment = $('input[service=ok]:text').val();

    var jqxhr = $.getJSON("/monitor/operator/getdata?service_status="+client_bind+"&status="+status+"&comment="+comment,
    function(data) {



    })

}










// Информация по объекту
function GetAddsData(client_bind) {

    var jqxhr = $.getJSON("/monitor/operator/getdata?client_bind="+client_bind,
    function(data) {

        $("client_name").text(data['additions']['client_name']);
        if ($("table[group=1] tbody tr[client_bind="+client_bind+"]").attr("alarm") == "yes") {
            $(".alarm").show();
            $(".noalarm").hide();


            $("time_begin").text(data['actions']['time_begin'])
            $("from_begin").text(data['actions']['from_begin'])
            $("time_way").text(data['actions']['time_way'])
            $("time_text_2").text(data['actions']['time_text_2'])

            if ( data['actions']['action_1'] != '') {
                $("first-step select").css("background-color","#185574");
                $("first-step select").css("color","#FFFFFF");
                $("first-step select").find("option:contains("+ data['actions']['action_1']  +")").attr("selected", "selected");
            }
            else {$("first-step select").css("background-color",""); $("first-step select").css("color","");}

            if ( data['actions']['action_2'] != '') {
                $("second-step select").css("background-color","#185574");
                $("second-step select").css("color","#FFFFFF");
                $("second-step select").find("option:contains("+ data['actions']['action_2']  +")").attr("selected", "selected");
            }
            else {$("second-step select").css("background-color",""); $("second-step select").css("color","");}

            if ( data['actions']['action_3'] != '') {
                $("third-step select").css("background-color","#185574");
                $("third-step select").css("color","#FFFFFF");
                $("third-step select").find("option:contains("+ data['actions']['action_3']  +")").attr("selected", "selected");
            }
            else {$("third-step select").css("background-color","");$("third-step select").css("color","");}

            if ( data['actions']['action_4'] != '') {
                $("fourth-step select").css("background-color","#185574");
                $("fourth-step select").css("color","#FFFFFF");
                $("fourth-step select").find("option:contains("+ data['actions']['action_4']  +")").attr("selected", "selected");
            }
            else {$("fourth-step select").css("background-color",""); $("fourth-step select").css("color","");}


        }
        else {
            $(".alarm").hide();
            $(".noalarm").show();
        }

        // Информация о обслуживании

        if (data['additions']['service_status']) {
            $('input[service=ok]:checkbox').prop('checked', "checked");
        }
        else {
            $('input[service=ok]:checkbox').prop('checked', "");
        }
        $('input[service=ok]:text').val(data['additions']['service_comment']);
        ShowServiceHistory(client_bind,(data['additions']['service_history']).reverse());


    })


}





function ShowServiceHistory(client_bind,data) {


    $("tbody[group=3]").empty();

    var status = '';

    data.forEach(function(item,i,arr){

        if (item['status']) {status = "Обслуживание";} else {status = "Работа";}

        var t = "<tr "

            +"><td width='15%'>"
            +item['date_text']+"</td><td width='15%'>"
            +item['time_text']+"</td><td width='20%'>"
            +status+"</td><td width='50%'>"
            +item['comment']+"</td></tr>";

            $("tbody[group=3]").prepend(t);

    });
}






function GetSettings() {

    var jqxhr = $.getJSON("/monitor/operator/getdata?settings=ok",
    function(data) {

        window.max_rows=data['max_rows'];

    })


}



function FirstStep(e) {
    var uyuy = $("first-step select option:selected").text();
    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");

    var jqxhr = $.getJSON("/monitor/operator/getdata?first-step="+uyuy+"&client_bind="+client_bind,
    function(data) {
        if (data['result'] == 'ok') {
            GetAddsData(client_bind);
        }
    })
}



function SecondStep(e) {
    var uyuy = $("second-step select option:selected").text();
    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");

    var jqxhr = $.getJSON("/monitor/operator/getdata?second-step="+uyuy+"&client_bind="+client_bind,
    function(data) {
        if (data['result'] == 'ok') {
            GetAddsData(client_bind);
        }
    })

}




function ThirdStep(e) {
    var uyuy = $("third-step select option:selected").text();
    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");

    var jqxhr = $.getJSON("/monitor/operator/getdata?third-step="+uyuy+"&client_bind="+client_bind,
    function(data) {
        if (data['result'] == 'ok') {
            GetAddsData(client_bind);
        }
    })

}




function FourthStep(e) {
    var uyuy = $("fourth-step select option:selected").text();
    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");

    var jqxhr = $.getJSON("/monitor/operator/getdata?fourth-step="+uyuy+"&client_bind="+client_bind,
    function(data) {
        if (data['result'] == 'ok') {
            GetAddsData(client_bind);
        }
    })

}







function UpdateData() {
    var jqxhr = $.getJSON("/monitor/operator/getdata?update=ok",
    function(data) {

        //console.log(data);
        ShowData(data);
        GetAlarmList();
        GetServiceList();
    })
}









function ShowData(data) {


    data['update'].forEach(function(item,i,arr){

        var t = "<tr "

        +"row_id=\""+item["row_id"]+"\" "

        +"alert_level=\""+item["alert_level"]+"\" "

        +"client_bind_idl=\""+item["client_bind_id"]+"\" "

        +"><td width='10%'>"
        +item['date_text']+"</td><td width='10%'>"
        +item['time_text']+"</td><td width='10%'>"
        +item['device_number']+"</td><td width='40%'>"
        +item['message_text']+"</td><td width='15%'>"
        +item['zone_text']+"</td><td width='15%'>"
        +item['stub_text']+"</td></tr>";

        var first = $("tbody[group=2] tr:first").attr("row_id");

        if (Number(item['row_id']) == (Number(1)+Number(first))) {

            $("tbody[group=2]").prepend(t);

            if ( $("table[group=2] tr:first").attr("alert_level") == 0 ) {$("tbody[group=2] tr:first").css("background-color","#98FB98");}
            if ( $("tbody[group=2] tr:first").attr("alert_level") == 1 ) {$("tbody[group=2] tr:first").css("background-color","#40E0D0");}
            if ( $("tbody[group=2] tr:first").attr("alert_level") == 3 ) {$("tbody[group=2] tr:first").css("background-color","yellow");}
            if ( $("tbody[group=2] tr:first").attr("alert_level") == 9 ) {$("tbody[group=2] tr:first").css("background-color","#FF4500");}

            // Проверка нужно строку показывать ли нет
            if (($("ul[group=2] li.active").text() == "На объекте") && ( $("table[group=1] tr[marked=yes]").attr("client_bind") != item["client_bind_id"] )) {$("table[group=2] tr:first").hide();}

        }

    });

}

