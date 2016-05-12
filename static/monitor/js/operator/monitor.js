$(document).ready(function() {

    $("ul li a").bind("click",SwitchButton);
    $("table[group=1] tbody tr").bind("click",ClickObjectRow);

    MarkFirst();
    MakeColorTable2();
    GetSettings();

});





function MarkFirst() {

    $("table[group=1] tbody tr").css("background-color","");
    $("table[group=1] tbody tr:first").css("background-color","#FF8C00");
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





// Отмена тревоги общая
function ClearAlarm(e) {


    var jqxhr = $.getJSON("/monitor/operator/getdata?clear="+window.num_p,
    function(data) {
        //console.log(data);

        HideRightPart(e);
    })
}








function ClickObjectRow(e) {

        var mytablegroup = $(this).siblings("tr")
        mytablegroup.css("background-color","");
        $(this).css("background-color","#FF8C00");
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







function GetAddsData(client_bind) {

    var jqxhr = $.getJSON("/monitor/operator/getdata?client_bind="+client_bind,
    function(data) {

       // console.log(data);
    })


}





function GetSettings() {

    var jqxhr = $.getJSON("/monitor/operator/getdata?settings=ok",
    function(data) {

        window.max_rows=data['max_rows'];

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


    //console.log(button2);

    var table1 = data['tablegroup1'];
    var table2 = data['tablegroup2'];

    var status = data['status'];
    var general_status = data['general_status'];


    for (var i = 0; i < group1.length; i++) {
        if (group1[i].textContent.substring(0,3)=='Все') { group1[i].textContent="Все ("+button1['Все']+")"; }
        if (group1[i].textContent.substring(0,10)=='Охраняемые') { group1[i].textContent="Охраняемые ("+button1['Охраняемые']+")"; }
        if (group1[i].textContent.substring(0,14)=='Не под охраной') { group1[i].textContent="Не под охраной ("+button1['Не под охраной']+")"; }
        if (group1[i].textContent.substring(0,9)=='Тревожные') { group1[i].textContent="Тревожные ("+button1['Тревожные']+")"; }
        if (group1[i].textContent.substring(0,13)=='Неисправности') { group1[i].textContent="Неисправности ("+button1['Неисправности']+")"; }
        if (group1[i].textContent.substring(0,9)=='Проверить') { group1[i].textContent="Проверить ("+button1['Проверить']+")"; }
        if (group1[i].textContent.substring(0,9)=='Нет теста') { group1[i].textContent="Нет теста ("+button1['Нет теста']+")"; }
        if (group1[i].textContent.substring(0,12)=='Обслуживание') { group1[i].textContent="Обслуживание ("+button1['Обслуживание']+")"; }
        if (group1[i].textContent.substring(0,16)=='Не обслуживаемые') { group1[i].textContent="Не обслуживаемые ("+button1['Не обслуживаемые']+")"; }
        if (group1[i].textContent.substring(0,13)=='Не охраняемые') { group1[i].textContent="Не охраняемые ("+button1['Не охраняемые']+")"; }

//        var u = "<user>"+data[i]+" </user>";
//        $("users").append(u);
    }

//    for (var i = 0; i < group2.length; i++) {
//        if (group2[i].textContent.substring(0,3)=='Все') { group2[i].textContent="Все ("+button2['Все']+")"; }
//        if (group2[i].textContent.substring(0,9)=='Тревожные') { group2[i].textContent="Тревожные ("+button2['Тревожные']+")"; }
//        if (group2[i].textContent.substring(0,10)=='На объекте') { group2[i].textContent="На объекте ("+button2['На объекте']+")"; }
//        if (group2[i].textContent.substring(0,13)=='Неисправности') { group2[i].textContent="Неисправности ("+button2['Неисправности']+")"; }
//        if (group2[i].textContent.substring(0,7)=='Система') { group2[i].textContent="Система ("+button2['Система']+")"; }
//        if (group2[i].textContent.substring(0,15)=='На обслуживании') { group2[i].textContent="На обслуживании ("+button2['На обслуживании']+")"; }
//    }




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

