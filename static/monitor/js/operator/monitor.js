$(document).ready(function() {

    $("ul li a").bind("click",SwitchButton);
    $("button[clear=OK]").bind("click",ClearAlarm);
    $("table[group=1] tbody tr").bind("click",ClickObjectRow);
    $("first-step button").bind("click",FirstStep);
    $("second-step button").bind("click",SecondStep);
    $("third-step button").bind("click",ThirdStep);
    $("fourth-step button").bind("click",FourthStep);

    MakeColorTable2();
    GetSettings();
    GetAlarmList();
    MarkFirst();

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

        $("table[group=1] tbody tr").attr("alarm","no");
        $("table[group=1] tbody tr").css("color","");

        var arr = data['client_bind_alarm']
        arr.forEach(function(item,i,arr){
            $("table[group=1] tbody tr[client_bind="+item+"]").attr("alarm","yes");
            $("table[group=1] tbody tr[client_bind="+item+"]").css("color","red");
        });

        if (arr.length != 0) {
            $(".container[border=ok]").css( "border", "13px solid red");
        }
        else {
            $(".container").css( "border", "");
        }


    })

}





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
                $("first-step select").find("option:contains("+ data['actions']['action_1']  +")").attr("selected", "selected");
            }
            if ( data['actions']['action_2'] != '') {
                $("second-step select").css("background-color","#185574");
                $("second-step select").find("option:contains("+ data['actions']['action_2']  +")").attr("selected", "selected");
            }
            if ( data['actions']['action_3'] != '') {
                $("third-step select").css("background-color","#185574");
                $("third-step select").find("option:contains("+ data['actions']['action_3']  +")").attr("selected", "selected");
            }
            if ( data['actions']['action_4'] != '') {
                $("fourth-step select").css("background-color","#185574");
                $("fourth-step select").find("option:contains("+ data['actions']['action_4']  +")").attr("selected", "selected");
            }


        }
        else {
            $(".alarm").hide();
            $(".noalarm").show();
        }

    })


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
    })
}









function ShowData(data) {
    //$("user").remove();

    var button1 = data['buttongroup1'];
//    var button2 = data['buttongroup2'];

    var general_status = data['general_status'];

    var group1 = $("button[group=1]");
//    var group2 = $("button[group=2]");





    // Таблица 2

    for (item in table2) {
        ob = table2[item];

        var background = "style=\"background-color:#B0C4DE;\" ";

        if (ob['action'] == 'red') { background = "style=\"background-color:#FA8072;\" "; }
        if (ob['action'] == 'yellow') { background = "style=\"background-color:#F0E68C;\" "; }
        if (ob['action'] == 'green') { background = "style=\"background-color:#90EE90;\" "; }


        var t = "<tr group='2' "

        +"row_id=\""+ob["id"]+"\" "

        +"action=\""+ob["action"]+"\" "

        +background
        +"><td width='10%'>"
        +ob['col1']+"</td><td width='5%'>"
        +ob['col2']+"</td><td width='10%'>"
        +ob['col3']+"</td><td width='25%'>"
        +ob['col4']+"</td><td width='30%'>"
        +ob['col5']+"</td><td width='5%'>"
        +ob['col6']+"</td><td width='5%'>"
        +ob['col7']+"</td></tr>";

        var tr = $(t);

        //console.log($("tbody[group=2] tr:first").attr("row_id"));

        var first = $("tbody[group=2] tr:first").attr("row_id");

        //console.log(Number(ob['id']),Number(first)+Number(1));

        if (Number(ob['id']) == (Number(1)+Number(first))) {$("tbody[group=2]").prepend(t);}


    }



    for (i in status) {
        s = status[i];

        $("tr[group=1]").each(function( index ) {

            if ($(this).children("td").eq(0).text() == i && s == "red") { $(this).css("background-color","red"); $(this).children("td").eq(1).text("!"); }
            if ($(this).children("td").eq(0).text() == i && s == "green") { $(this).css("background-color",""); $(this).children("td").eq(1).text(""); }

        });

    }



    // Рамка
    if (general_status['status'] == "red") { $(".container[border=ok]").css( "border", "13px solid red"); } else {$(".container").css( "border", "");}

    $("tr").on("click",ClickRow);

}

