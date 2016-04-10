$(document).ready(function () {
    binds();

    tags_pack = {};
    tags_pack['tags'] = {};
    tags_pack['main_id'] = main_form.attr('main_id');
    tags_pack['tag_section'] = tags.attr('tag_section');

    $('#tag_title').autocomplete({
        source: function (request, response) {
            $.ajax({
                url: '/ajax/tags/autocomplete/', dataType: "json", type: 'post',
                data: {
                    main_id: tags_pack['main_id'],
                    tag_section: tags_pack['tag_section'],
                    tag_title: request.term
                },
                success: function (data) {
                    response($.map(data, function (item) {
                        return {
                            value: item.title,
                            transfer: item.transfer
                        }
                    }));
                }
            });
        },
        minChars: 1,
        width: 200,
        zIndex: 100,
        //deferRequestBy: 300,
        select: function (event, ui) {
            tags_change.find('#tag_transfer').val(ui.item.transfer);
        }
    });

    tags.on('click', '#test1', function () {
        console.log('test');
        tags_list.find('.selected').attr('class','tag');
    });

    tags.on('click', '.edit', function () {
        var tag_transfer = $(this).parent().attr('tag_transfer');
        tagEdit(tag_transfer);
    });

    tags.on('click', '.delete', function () {
        if( $(this).parent().attr('class')=='tag selected' ) {
            tagCancel()
        }
        $(this).parent().remove();
    });

})

function binds() {
    main_form = $('#main_form');
    tags = main_form.find('#tags');
    tags_list = tags.find('#tags_list');
    tags_change = tags.find('#tags_change');
}

function tagEdit(tag_transfer) {
    var tag_transfer = tag_transfer;
    tags_list.find('.selected').attr('class','tag');
    tag_selected = tags_list.find('[tag_transfer=' + tag_transfer + ']');
    tag_selected.attr('class', 'tag selected');

    var tag_id = tag_selected.attr('tag_id');
    var tag_title = tag_selected.find('.edit').text();

    tags_change.attr('tag_id', tag_id);
    tags_change.find('#tag_title').val(tag_title);
    tags_change.find('#tag_transfer').val(tag_transfer);
    tags_change.find('#add').hide();
    tags_change.find('#update').show();
    tags_change.find('#cancel').show();
}

function tagAdd() {
    var pack = {};
    pack['main_id'] = main_form.attr('main_id');
    pack['tag_id'] = tags_change.attr('tag_id');
    pack['tag_title'] = tags_change.find('#tag_title').val();
    pack['tag_transfer'] = tags_change.find('#tag_transfer').val();
    pack['tag_section'] = tags.attr('tag_section');

    $.ajax({ url: '/ajax/tags/check/', type: 'post', dataType: 'json', data: pack,
        success: function (data) {
            tag_div = ' <div class="tag" tag_id="' + data['id'] + '" tag_transfer="' + data['transfer'] + '">' +
                '<div class="edit"></div><div class="delete">x</div></div>';
            tags_list.append(tag_div);

            tag = tags.find('[tag_transfer=' + data['transfer'] + ']');
            tag.attr('class', 'tag');
            tag.attr('tag_transfer', data['transfer']);
            tag.find('.edit').html(data['title']);

            tags_change.find('#tag_title').val('');
            tags_change.find('#tag_transfer').val('');
        }
    });
    tagCancel();
}

function tagUpdate() {
    var tag_id = tags_change.attr('tag_id');
    var tag_transfer = tags_change.find('#tag_transfer').val();
    var tag_title = tags_change.find('#tag_title').val();

    tags_change.removeAttr('tag_id');
    tags_change.find('#tag_title').val('');
    tags_change.find('#tag_transfer').val('');

    if (tag_id) {
        tag = tags_list.find('[tag_id=' + tag_id + ']');
    } else {
        tag = tags_list.find('[tag_transfer=' + tag_transfer + ']');
    }
    tag.attr('tag_transfer', tag_transfer);
    tag.find('.edit').html(tag_title);
    tagCancel();
}

function tagCancel() {
    tags_list.find('.selected').attr('class','tag');
    tags_change.removeAttr('tag_id');
    tags_change.find('#tag_title').val('');
    tags_change.find('#tag_transfer').val('');
    tags_change.find('#add').show();
    tags_change.find('#update').hide();
    tags_change.find('#cancel').hide();
}

function tagsPack() {
    tags_list = [];
    tags.find('.tag').each(function () {
        var tag_id = $(this).attr('tag_id');
        var tag_transfer = $(this).attr('tag_transfer');
        var tag_title = $(this).find('.edit').text();
        if (typeof title != 'undefined') {
            channel_pack = {
                'id': tag_id, 'title': tag_title, 'transfer': tag_transfer
            };
            tags_list.push(channel_pack);
        }
    });
    json = JSON.stringify(tags_list);
    //console.log(json);
    return json;
}

//   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   ---   Validator

/*
 $.validator.setDefaults({
 submitHandler: function() {
 //Save_transmit(); //
 alert("submitted!");
 }
 });

 $().ready(function() {
 tags_change.validate({
 rules: {
 tag_title: {
 required: true,
 minlength: 3,
 maxlength: 13,
 remote: {
 url: '/ajax/tag/validate/', type: 'post',
 data: {
 transmit_id: function() {
 return menu.attr('transmit_id');
 }
 }
 }
 },
 lcn_dvb: {
 maxlength: 5,
 remote: {
 url: '/ajax/tvset_validate/lcn/', type: 'post',
 data: {
 field: 'lcn_dvb',
 transmit_id: function() {
 return menu.attr('transmit_id');
 }
 }
 }
 }

 },
 messages: {
 multicast_ip: {
 minlength: "Коротковат для ip",
 maxlength: "Длинноват для ip",
 remote: "Недопустимый ip"
 },
 service_id: {
 maxlength: "Максимум 5 символов",
 remote: "Есть такой sid"
 }
 }
 });
 });
 */

/*
 $(function() {
 $('form input[type="button"]').click(function() {

 })
 });
 */