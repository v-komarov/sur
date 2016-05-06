$(document).ready(function() {



    $("button[group=1]:first").addClass("active");
    $("button[group=2]:first").addClass("active");


    //$("button").on("click",SwitchButton);

    //StartData();
    //setInterval('UpdateData();',5000);


});




function SwitchButton(e) {
    //console.log($(this).attr('group'));
    var mygroup = $(this).attr('group');
    var group = $("button[group="+mygroup+"]");
    group.removeClass('active');
    $(this).addClass('active');

    var clear = $(this).attr("clear");
    if (clear == "OK") { ClearAlarm(e); }

    var clear = $(this).attr("clear-phones");
    if (clear == "OK") { HidePhones(e); }

}






// Отмена тревоги общая
function ClearAlarm(e) {


    var jqxhr = $.getJSON("/monitor/operator/getdata?clear="+window.num_p,
    function(data) {
        //console.log(data);

        HideRightPart(e);
    })
}








function ClickRow(e) {


    // Реагируем только на красные строки
    if ($(this).attr("action")=="red") {

        window.num_p = $(this).children("td").eq(2).text();

        var mytablegroup = $(this).attr('group');
        var tablegroup = $("tr[group="+mytablegroup+"]");
        tablegroup.css("color","");
        if ($(this).attr("group")=="1") {
            $(this).css("color","#0000FF");
            HideRightPart(e);

        }
        else if ($(this).attr("group")=="2") {

            $(this).css("color","#0000FF");
            HidePhones(e);
            ShowRightPart(e);
        }

    }


    if ($(this).closest("tbody").attr("group") == 1) {

        window.num_p = $(this).children("td").eq(0).text();
        //console.log(window.num_p);
        HideRightPart(e);
        ShowPhones(e);

    }

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

