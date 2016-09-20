# -*- coding: utf-8 -*-

import datetime
import decimal

from apps.toolset import date_convert
from apps.system import models as db_sentry
from apps.system.sentry_user import authorize


def get(request,data):
    payments_set = db_sentry.client_payment.objects.filter(
        client=int(request.GET['client_id']),
        is_active = 1 ).order_by('-date')
    if 'year' in request.GET:
        year = int(request.GET['year'])
        start_date = datetime.date(year, 1, 1)
        end_date = datetime.date(year, 12, 31)
        payments_set = payments_set.filter(date__range=(start_date, end_date))

    try: data['balance'] = str(payments_set[0].client.balance)
    except: data['balance'] = 0
    data['payment_list'] = []
    for item in payments_set:
        data['payment_list'].append({
            'id': item.id,
            'mount': str(item.value),
            'user_name': item.sentry_user.full_name,
            'comment': item.comment,
            'payment_type': item.payment_type,
            'payment_date': item.date.strftime("%d.%m.%Y"),
            'pay_time': item.date.strftime("%H:%M:%S") })
    return data


def update(request, data):
    value = 0
    payment_date = date_convert.convert(request.POST['payment_date'])
    if not payment_date: data['error']['payment_date'] = 'Неправильный формат даты'

    try:
        value = decimal.Decimal(request.POST['mount'])
    except:
        data['error'] = 'Неправильный формат платежа'

    if not data['error']:
        balance = db_sentry.client.objects.get(id=int(request.POST['client_id'])).balance
        if 'payment_id' in request.POST:
            payment_set = db_sentry.client_payment.objects.get(id=int(request.POST['payment_id']))
            value_delta = value - payment_set.value
        else:
            payment_set = db_sentry.client_payment.objects.create(
                client_id = int(request.POST['client_id']),
                value = value,
                date = payment_date,
                payment_type = request.POST['payment_type'] )
            value_delta = value

        data['value_delta'] = str(value_delta)
        if (value_delta+balance)>0:
            payment_set.sentry_user_id = authorize.get_sentry_user(request)['id']
            payment_set.value = value
            payment_set.date = payment_date
            payment_set.payment_type = request.POST['payment_type']
            if 'comment' in request.POST: payment_set.comment = request.POST['comment']
            payment_set.save()

            client_set = db_sentry.client.objects.get(id=payment_set.client_id)
            client_set.balance = client_set.balance + value_delta
            data['value_delta'] = str(value_delta)
            client_set.save()
        else:
            data['error'] = 'Средства уже распределены'

    return data


def delete(request,data):
    payment_set = db_sentry.client_payment.objects.get(id=int(request.POST['payment_id']))
    balance = payment_set.client.balance
    if (balance-payment_set.value)>0:
        payment_set.is_active = 0
        payment_set.save()
        client_set = db_sentry.client.objects.get(id=payment_set.client_id)
        client_set.balance = client_set.balance - payment_set.value
        client_set.save()
        data['answer'] = 'done'
    else:
        data['error'] = 'Средства уже распределены'
    return data