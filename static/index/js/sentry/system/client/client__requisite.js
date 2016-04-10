$(document).ready(function() {

    $('input[name=bank]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/bank/ajax/search/', dataType: "json",
                data: { name:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['bank_list'], function(item) {
                        return {
                            label: item.name,
                            bank_id: item.id,
                            bank_bik: item.bik,
                            bank_correspondent_account: item.correspondent_account
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            $('input[name=bank]').attr('item_id', ui.item.bank_id);
            $('input[name=bank]').val(ui.label);
            $('input[name=bank__bik]').val(ui.item.bank_bik);
            $('input[name=bank__correspondent_account]').val(ui.item.bank_correspondent_account);
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

    $('input[name=bank__bik]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/bank/ajax/search/', dataType: "json",
                data: { bik:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['bank_list'], function(item) {
                        return {
                            label: item.bik +' ('+ item.name +')',
                            value: item.bik,
                            bank_id: item.id,
                            bank_name: item.name,
                            bank_bik: item.bik,
                            bank_correspondent_account: item.correspondent_account
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            $('input[name=bank]').attr('item_id', ui.item.bank_id);
            $('input[name=bank]').val(ui.item.bank_name);
            $('input[name=bank__bik]').val(ui.item.bank_bik);
            $('input[name=bank__correspondent_account]').val(ui.item.bank_correspondent_account);
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

    $('input[name=bank__correspondent_account]').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/system/directory/bank/ajax/search/', dataType: "json",
                data: { correspondent_account:request.term, limit:10 },
                success: function(data) {
                    response($.map(data['bank_list'], function(item) {
                        return {
                            label: item.bik +' ('+ item.name +')',
                            value: item.correspondent_account,
                            bank_id: item.id,
                            bank_name: item.name,
                            bank_bik: item.bik,
                            bank_correspondent_account: item.correspondent_account
                        }
                    }));
                }
            });
        },
        select: function(event, ui) {
            $('input[name=bank]').attr('item_id', ui.item.bank_id);
            $('input[name=bank]').val(ui.item.bank_name);
            $('input[name=bank__bik]').val(ui.item.bank_bik);
            $('input[name=bank__correspondent_account]').val(ui.item.bank_correspondent_account);
        },
        minChars: 2, // Минимальная длина запроса для срабатывания автозаполнения
        zIndex: 100, // z-index списка
        deferRequestBy: 200 // Задержка запроса (мсек), на случай, если мы не хотим слать миллион запросов, пока пользователь печатает. Я обычно ставлю 300.
    });

});

