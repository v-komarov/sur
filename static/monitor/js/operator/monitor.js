$(document).ready(function() {

    window.static_url = "";
    window.max_rows = 0;

    window.alarm1 = "";
    window.alarm2 = "";
    window.alarm3 = "";
    window.alarm9 = "";

    // Загрузка свойств
    var jqxhr = $.getJSON("/monitor/operator/getdata?settings=ok",
    function(data) {

        window.max_rows = data['max_rows'];
        window.static_url = data["static_url"];

        window.alarm9 = new Audio(window.static_url+"monitor/wav/9.wav");
        window.alarm1 = new Audio(window.static_url+"monitor/wav/1.wav");
        window.alarm2 = new Audio(window.static_url+"monitor/wav/2.wav");
        window.alarm3 = new Audio(window.static_url+"monitor/wav/3.wav");

        // Список техников
        /*
        t = "";
        data["tech_list"].forEach(function(item,i,arr){

            var a = "<option value="+item["tech_id"]+">"+item["tech_name"]+"</option>"
            t = t + a
            $("#tech_list").prepend(t);

        });
        */
    })
    // Загрузка свойств конец


    $("button[create_alarm=OK]").bind("click",CreateAlarm);
    $("table[group=1] tbody tr").bind("click",ClickObjectRow);
    $("first-step button").bind("click",FirstStep);
    $("second-step button").bind("click",SecondStep);
    $("third-step button").bind("click",ThirdStep);
    $("button[service=ok]").bind("click",SetStatusService);
    $("button[service=end]").bind("click",OffStatusService);

    $('#tooltip').tooltip();

    MakeColorTable2();
    //GetSettings();
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

    // Окраска в зависимости от alert_level
    $("table[group=2] tbody tr[alert_level=9]").css("background-color","red").css("color","white");
    $("table[group=2] tbody tr[alert_level=1]").css("background-color","#330099").css("color","white");
    $("table[group=2] tbody tr[alert_level=3]").css("background-color","#336633").css("color","white");
    $("table[group=2] tbody tr[alert_level=2]").css("background-color","brown").css("color","white");
    $("table[group=2] tbody tr[alert_level=4]").css("background-color","gray").css("color","white");

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

    // Для заполнения описания и отмены тревоги необходимо заполнить три поля
    if ($("first-step button").hasClass("btn-success") && $("second-step button").hasClass("btn-success")) {


        var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");
        $("#dialog-info textarea").val("");


        // Ввод описания
        $("#dialog-info").dialog(
            {
                hide: { effect: "blind", duration: 100 },
                show: { effect: "blind", duration: 100 },
                minWidth: 500,
                modal: false,
                position: {my : "center", at : 'center', of : ".alarm"},
                title: "Описание события: " + $("third-step select").val(),
                buttons: [
                    {
                        text: "Сохранить отчет",
                        click: function() {

                            var uyuy = $("#dialog-info textarea").val();
                            $("fourth-step input").val(uyuy);

                            var jqxhr = $.getJSON("/monitor/operator/getdata?fourth-step="+uyuy+"&client_bind="+client_bind,
                            function(data) {
                                if (data['result'] == 'ok') {

                                    // Отмена тревоги

                                            var jqxhr = $.getJSON("/monitor/operator/getdata?clearalarm="+client_bind,
                                            function(data) {

                                                if (data['result'] == 'ok') {
                                                    $(".alarm").hide();
                                                    $(".noalarm").show();
                                                }
                                            })
                                    // Отмена тревоги конец

                                    //GetAddsData(client_bind);

                                }
                            })

                            $(this).dialog("close");
                        }
                    },
                    {
                        text: "Не сохранять",click: function() { $(this).dialog("close"); }
                    }
                ]
            }
        );












    }
    else {
        $("#dialog-alarm").dialog({
            model: true,
            buttons:[
                {text:"Закрыть",click: function() {
                    $(this).dialog("close")}}]
        });

    }




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




// суммы на кнопках
function ButtonCount() {
    var all = $("table[group=1] tbody tr").length;
    $("ul[group=1] li:first a").html("Все<br />("+all+")");

    var watching = $("table[group=1] tbody tr[status=True]").length;
    $("ul[group=1] li:eq(1) a").html("Охраняемые<br />("+watching+")");

    var nowatching = $("table[group=1] tbody tr[status=False]").length;
    $("ul[group=1] li:eq(2) a").html("Не под<br />охраной ("+nowatching+")");

    var alarm = $("table[group=1] tbody tr[alarm=yes]").length;
    $("ul[group=1] li:eq(3) a").html("Тревожные<br />("+alarm+")");

    var test = $("table[group=1] tbody tr[test=no]").length;
    $("ul[group=1] li:eq(4) a").html("Нет теста<br />("+test+")");

    var service = $("table[group=1] tbody tr[service=yes]").length;
    $("ul[group=1] li:eq(5) a").html("Обслуживание<br />("+service+")");

}




// Получение списка объектов с отсутсвием теста
function GetNoTestList() {

    var jqxhr = $.getJSON("/monitor/operator/getdata?notestlist=ok",
    function(data) {

        var arr = data['notestlist']
        $("table[group=1] tbody tr").attr("test","yes");
        arr.forEach(function(item,i,arr){
            $("table[group=1] tbody tr[client_bind="+item+"]").attr("test","no");

        });

    });

}




// Список объектов с тревогой
function GetAlarmList() {

    var jqxhr = $.getJSON("/monitor/operator/getdata?alarmlist=ok",
    function(data) {

        $("table[group=1] tbody tr[service=no]").attr("alarm","no");
        $("table[group=1] tbody tr[service=no]").css("color","");



        var arr = (data['client_bind_alarm'])['alarm_visio']
        var arr2 = (data['client_bind_alarm'])['alarm_audio']
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

        // Звуковой сигнал
        if (arr2.length != 0) {
            // Звуковой сигнал тревоги
            window.alarm9.play();
        }

    })

}






// Список объектов на обслуживании
function GetServiceList() {

    var jqxhr = $.getJSON("/monitor/operator/getdata?servicelist=ok",
    function(data) {

        $("table[group=1] tbody tr[service=yes]").css("color","");
        $("table[group=1] tbody tr[service=yes]").attr("service","no");



        var arr = data['client_bind_service']
        arr.forEach(function(item,i,arr){
            $("table[group=1] tbody tr[client_bind="+item+"]").attr("service","yes");
            $("table[group=1] tbody tr[client_bind="+item+"]").css("color","brown");
        });

    })

}







// Установка статуса обслуживания
function SetStatusService() {

    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");

    var time = $("#service-time").val();
    var tech = $("#service-tech").val();
    var reason = $("#service-reason").val();

    var jqxhr = $.getJSON("/monitor/operator/getdata?service_status="+client_bind+"&time="+time+"&reason="+reason+"&tech="+tech,
    function(data) {

        if (data['result'] == 'ok') {
            GetAddsData(client_bind);
        }

    })

}






// Сброс обслуживания
function OffStatusService() {



    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");

    var jqxhr = $.getJSON("/monitor/operator/getdata?service_status_end="+client_bind,
    function(data) {

        if (data['result'] == 'ok') {
            GetAddsData(client_bind);
        }

    })

}







// Информация по объекту
function GetAddsData(client_bind) {

    var jqxhr = $.getJSON("/monitor/operator/getdata?getdata=ok&client_bind="+client_bind,
    function(data) {


        // Закрепленный ГБР
        var squad = data["squad"];
        $("first-step select option").css("background-color","").css("color","");
        $("first-step select :contains("+squad+")").css("background-color","#009933").css("color","white");

        // Отображение состояния кнопок обработки тревоги
        // first
        if ( data['actions']['action_1'] != '') {

            $("first-step select").css("background-color","#185574");
            $("first-step select").css("color","#FFFFFF");
            $("first-step select").val(data['actions']['action_1']);
            $("first-step button").toggleClass("btn-success",true);
            $("first-step button").toggleClass("btn-danger",false);
        }
        else {

            $("first-step select").css("background-color","");
            $("first-step select").css("color","");
            $("first-step button").toggleClass("btn-success",false);
            $("first-step button").toggleClass("btn-danger",true);
            $('first-step select option:selected').removeAttr("selected");
        }


        // second
        if ( data['actions']['action_2'] != '') {
            $("second-step select").css("background-color","#185574");
            $("second-step select").css("color","#FFFFFF");
            $("second-step select").val(data['actions']['action_2']);
            $("second-step button").toggleClass("btn-success",true);
            $("second-step button").toggleClass("btn-danger",false);
        }
        else {
            $("second-step select").css("background-color","");
            $("second-step select").css("color","");
            $("second-step button").toggleClass("btn-success",false);
            $("second-step button").toggleClass("btn-danger",true);
            $('second-step select option:selected').removeAttr("selected");
            // Копирование выбранного ГБР в первом во второй
            if ( data['actions']['action_1'] != '') { $("second-step select").val($("first-step select option:selected").val()); }
        }

        // third
        if ( data['actions']['action_3'] != '') {
            $("third-step select").css("background-color","#185574");
            $("third-step select").css("color","#FFFFFF");
            $("third-step select").val(data['actions']['action_3']);
            $("third-step button").toggleClass("btn-success",true);
            $("third-step button").toggleClass("btn-danger",false);
        }
        else {
            $("third-step select").css("background-color","");
            $("third-step select").css("color","");
            $("third-step select").val('');
            $("third-step button").toggleClass("btn-success",false);
            $("third-step button").toggleClass("btn-danger",true);
        }

        // Информация о времени
        $("time_begin").text(data['actions']['time_begin'])
        $("from_begin").text(data['actions']['from_begin'])
        $("time_way").text(data['actions']['time_way'])
        $("time_text_2").text(data['actions']['time_text_2'])



        $("client_name").text(data['additions']['client_name']);
        if ($("table[group=1] tbody tr[client_bind="+client_bind+"]").attr("alarm") == "yes") {
            $(".alarm").show();
            $(".noalarm").hide();

        }
        else {
            $(".alarm").hide();
            $(".noalarm").show();
        }

        // Информация о обслуживании
        ShowServiceHistory(client_bind,(data['additions']['service_history']).reverse());

        // История вызовов ГБР
        ShowGbrHistory((data['additions']['gbr_history']));


        // Контакты
        $("dl.contacts").empty();
        data['contacts'].forEach(function(item,i,arr){

            var t = "<dt class='col-md-offset-1'>"+item["hiskey"]+" "+item['name']+" ("+item['post']+")</dt>"
                        + "<dd class='col-md-offset-2'>" + item["address"] + "</dd>";

                item['phones'].forEach(function(item2,i2,arr2){

                    t = t + "<dd class='col-md-offset-2'>"+item2['phone']+" ("+item2['phone_type']+")</dd>";

                });

            $("dl.contacts").append(t);

        });


        // Сервисная информация
        ShowServiceInformation(data["gsm"]);





    })


}







function ShowServiceInformation(data) {

    $("#status-gsm").css("width",data["level"]*3+"%");
    if (data["signal"] == "high") { $("#status-gsm").toggleClass("progress-bar-success",true); $("#status-gsm").toggleClass("progress-bar-warning",false); }
    if (data["signal"] == "low") { $("#status-gsm").toggleClass("progress-bar-success",false); $("#status-gsm").toggleClass("progress-bar-warning",true); }
    $("#status-gsm").text(data["level"]*3+"%");
}







function ShowServiceHistory(client_bind,data) {


    $("tbody[group=3]").empty();

    var status = '';

    data.forEach(function(item,i,arr){

        var t = "<tr "

            +"><td width='20%' style=\"color:red;\">"+item['datetime_text']
            +"</td><td width='20%' style=\"color:green;\">"+item['datetime_text2']
            +"</td><td width='25%'>"+item['tech']
            +"</td><td width='35%'>"+item['reason']
            +"</td></tr>";

            $("tbody[group=3]").prepend(t);

    });
}





function ShowGbrHistory(data) {


    $("tbody[group=4]").empty();

    data.forEach(function(item,i,arr){

        var t = "<tr "

            +"><td width='20%' style=\"color:red;\">"+item['time_start']
            +"</td><td width='10%' style=\"color:green;\">"+item['time_arived']
            +"</td><td width='15%'>"+item['gbr']
            +"</td><td width='25%'>"+ "<a id=\"tooltip\" title=\""+item['type_evt']+"\">"+item['type_evt'].substring(0,18)+"</a>"
            +"</td><td width='30%'>"+ "<a id=\"tooltip\" title=\""+item['comment']+"\">"+item['comment'].substring(0,22)+"</a>"
            +"</td></tr>";

            $("tbody[group=4]").prepend(t);

    });
}






function FirstStep(e) {
    var uyuy = $("first-step select option:selected").text();
    var client_bind = $("table[group=1] tbody tr[marked=yes]").attr("client_bind");

    var jqxhr = $.getJSON("/monitor/operator/getdata?first-step="+uyuy+"&client_bind="+client_bind,
    function(data) {

        if (data['result'] == 'ok') {
            if (uyuy == "ГБР не направлялся") {
                // Отмена тревоги
                var jqxhr2 = $.getJSON("/monitor/operator/getdata?clearalarm="+client_bind,
                    function(data2) {

                        if (data2['result'] == 'ok') {
                            $(".alarm").hide();
                            $(".noalarm").show();
                        }

                    })

            }
            else { GetAddsData(client_bind); }

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
            ClearAlarm();
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
        ButtonCount();
        GetNoTestList();
        $("ul[group=1] li.active").trigger("click");
    })
}









function ShowData(data) {


    data['update'].forEach(function(item,i,arr){

        var t = "<tr "

        +"row_id=\""+item["row_id"]+"\" "

        +"alert_level=\""+item["alert_level"]+"\" "

        +"client_bind_idl=\""+item["client_bind_id"]+"\" "

        +"><td width='10%'>"+item['date_text']
        +"</td><td width='5%'>"+item['time_text']
        +"</td><td width='5%'>"+item['device_number']
        +"</td><td width='15%'>"+item['object']
        +"</td><td width='20%'>"+item['address']
        +"</td><td width='50%'>"+item['message_text']
        +"</td><td width='5%'>"+item['stub']
        +"</td></tr>";

        var first = $("tbody[group=2] tr:first").attr("row_id");

        if (Number(item['row_id']) == (Number(1)+Number(first))) {

            $("tbody[group=2]").prepend(t);

            // Окраска в зависимости от alert_level
            $("table[group=2] tbody tr:first[alert_level=9]").css("background-color","red").css("color","white");
            $("table[group=2] tbody tr:first[alert_level=1]").css("background-color","#330099").css("color","white");
            $("table[group=2] tbody tr:first[alert_level=3]").css("background-color","#336633").css("color","white");
            $("table[group=2] tbody tr:first[alert_level=2]").css("background-color","brown").css("color","white");
            $("table[group=2] tbody tr:first[alert_level=4]").css("background-color","gray").css("color","white");
            // Звуковой сишнал
            if ($("table[group=2] tbody tr:first").attr("alert_level") == 1) { window.alarm1.play();}
            if ($("table[group=2] tbody tr:first").attr("alert_level") == 2) { window.alarm2.play();}
            if ($("table[group=2] tbody tr:first").attr("alert_level") == 3) { window.alarm3.play();}
            if ($("table[group=2] tbody tr:first").attr("alert_level") == 9) { window.alarm9.play();}

            // Проверка нужно строку показывать ли нет
            if (($("ul[group=2] li.active").text().substring(0,10) == "На объекте") && ( $("table[group=1] tr[marked=yes]").attr("client_bind") != item["client_bind_id"] )) {$("table[group=2] tr:first").hide();}

        }

    });

}






