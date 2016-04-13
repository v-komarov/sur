$(document).ready(function() {
    get_params_cnt = 1;

    /*
     $(".searchObject select").on('change', function(){ personal_Search() });
     */
    $('.pop .header').on('click', '.close', function(){ userCancel() });

    $('table.search').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='search') {
            personal_Search();
        }
        else if(action=='reset') {
            $('.search input, .search select').each(function() {
                if( $(this).is(':visible') ) {
                    $(this).find(":first").attr("selected", "selected");
                    $(this).val('');
                }
            });
        }
    });

    $('#user_list thead').on('click', '.btn_ui', function(){
        var action = $(this).attr('action');
        if(action=='object_add'){
            userDetailsEdit('add');
        }
    });

    $('#user_list tbody').on('click', 'td.user', function(){
        $('#user_list tbody tr.hover').attr('class','row');
        var user_id = $(this).parent('.row').attr('user_id');
        var fullname = $('#user_list tbody tr[user_id='+user_id+'] td[name=fullname]').text();
        userDetailsEdit(user_id);
    });
    $('#user_list tbody').on('click', 'td.click', function(){
        $('#user_list tbody tr.hover').attr('class','row');
        var action = $(this).attr('action');
        var user_id = $(this).parent('.row').attr('user_id');
        var fullname = $('#user_list tbody tr[user_id='+user_id+'] td[name=fullname]').text();
        $('.pop .header b').text(fullname);
        if(action=='card'){
            userCardEdit(user_id,'none') }
        else if(action=='identity'){
            userIdentityEdit(user_id,'none') }
        else if(action=='certificate' ||  action=='certificate_check'){
            userCertificateEdit(user_id,'none') }
        else if(action=='weapon'){
            userWeaponEdit(user_id,'none') }
    });
    $('.personal_pop_navigation').on('click', '.btn_ui:not(.focus)', function(){
        var user_id = $('#user_list tbody tr.hover').attr('user_id');
        var action = $(this).attr('action');
        if(action=='details'){
            userDetailsEdit(user_id) }
        else if(action=='card'){
            userCardEdit(user_id,'none') }
        else if(action=='identity'){
            userIdentityEdit(user_id,'none') }
        else if(action=='certificate' ||  action=='certificate_check'){
            userCertificateEdit(user_id,'none') }
        else if(action=='weapon'){
            userWeaponEdit(user_id,'none') }
    });

    /*
     $('#user_list thead input').bind('change keyup', function(event){ personal_Search() });
     */
    $('#user_list').keypress(function(e){
        if(e.keyCode==13){ personal_Search() }
    });
    $("#user_list thead").on('change', 'select', function(){ personal_Search() });

    $.datepicker.setDefaults( $.extend($.datepicker.regional["ru"]) );
    $('.datepicker').datepicker({
        showOn: "both",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd.mm.yy",
        showButtonPanel: true,
        monthNamesShort: $.datepicker.regional[ "ru" ].monthNames,
        onClose: function( selectedDate ) {
            $( "#stopValue" ).datepicker( "option", "minDate", selectedDate );
        }
    });
});


function getParams() {
    if(get_params_cnt>0) {
        var params = {};
        var params_search = location.search.replace('?','').split('&');
        for(key in params_search) {
            var param = params_search[key].split('=');
            params[param[0]] = param[1];
        }
        console.log(params);
        if(params['user_id']) {
            userDetailsEdit(params['user_id']);
        }
        get_params_cnt--;
    }
}


function personal_Search() {
    userCancel();
    loading('begin');
    var ajax_array = {};
    $('table.search tr.search__item input, table.search tr.search__item select').each(function() {
        var input_name = $(this).attr('name');
        var input_value = $(this).val();
        if(!!input_value && $(this).is(':visible') ) {
            ajax_array[input_name] = input_value;
        }
    });
    $.ajax({ url:'/post/personal/ajax/search/', type:'get', dataType:'json', data:ajax_array,
        success: function(data){
            if(data['error']!=null){
                alert(data['error']);
            }
            else if(data['users']!=null){
                personal_Draw(data['users']);
            }
            loading('end');
        },
        complete: function(){
            getParams();
        }
    });
}


function personal_Draw(data) {
    $('#user_list tbody tr').remove();
    count = 0;
    for(var key in data){
        if(data[key]['is_active']==0){ var active = ' red'; } else { var active = ''; }
        var object_item = '<tr class="row'+active+'" user_id="'+data[key]['id']+'" >' +
            '<td class="cell user nowrap" name="fullname">'+data[key]['full_name']+'</td>' +
            '<td class="cell user">'+data[key]['post__name']+'</td>' +
            '<td class="cell click" action="card">'+data[key]['status__name']+'</td>' +
            '<td class="cell click" action="identity">'+data[key]['identity_guard_date']+'</td>' +
            '<td class="cell click" action="certificate">'+data[key]['certificate_date']+'</td>' +
            '<td class="cell click" action="certificate_check">'+data[key]['certificate_check_date']+'</td>' +
            '<td class="cell click" action="weapon" colspan="2">'+data[key]['weapon_date']+'</td>' +
            '</tr>';
        $('#user_list tbody').append(object_item);
        count ++;
    }
    $('.result_count').html('Найдено: '+count);
}


function userCancel(){
    var tr = $('#user_list tbody tr.hover').attr('class','row');
    $('.pop').hide();
}



