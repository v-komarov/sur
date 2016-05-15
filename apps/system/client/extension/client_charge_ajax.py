# -*- coding: utf-8 -*-

import datetime
import decimal

from apps.system.client.extension import client__form

from apps.toolset.month_name import get_month_name
from apps.toolset import date_convert
from apps.system import models as db_sentry
from apps.system.client.extension import client__form
from apps.system.sentry_user.extension import sentry_log


def get(request, data=None):
    client = db_sentry.client.objects.get(id=int(request.GET['client']))
    charge_set = db_sentry.client_bind_charge.objects.filter(bind__client_contract__client=client.id, is_active=1)
    if 'contract' in request.GET:
        charge_set = charge_set.filter(bind__client_contract=int(request.GET['contract']))
    if 'bind' in request.GET:
        charge_set = charge_set.filter(bind=int(request.GET['bind']))

    data['balance'] = str(db_sentry.client.objects.filter(id=client.id, is_active=1).first().balance)
    data['charge'] = {}
    data['year_list'] = []
    if 'year' in request.GET and request.GET['year'] != '':
        year = int(request.GET['year'])

    if charge_set.exists():
        for item in xrange(charge_set.first().begin_date.year, charge_set.last().begin_date.year+1):
            data['year_list'].append(item)
        '''
        charge_last = charge_set.filter(begin_date__lt=datetime.datetime(year=year,month=1,day=1))
        total = 0
        for charge in charge_last:
            total += charge.value
        data['begin_year_saldo'] = str(total)
        '''
        charge_set = charge_set.filter(begin_date__year=year)

        for charge in charge_set:
            if not data['charge'].has_key(charge.begin_date.month):
                data['charge'][charge.begin_date.month] = {
                    'month_name': get_month_name(charge.begin_date.month),
                    'list': {},
                    'cost_count': 0, 'pay_count': 0,
                    'cost_total': decimal.Decimal('0.00'),
                    'pay_total': decimal.Decimal('0.00')
                }
            if charge.value < 0:
                data['charge'][charge.begin_date.month]['cost_count'] += 1
                data['charge'][charge.begin_date.month]['cost_total'] += charge.value
            else:
                data['charge'][charge.begin_date.month]['pay_count'] += 1
                data['charge'][charge.begin_date.month]['pay_total'] += charge.value
            data['charge'][charge.begin_date.month]['list'][charge.id] = {
                'id': charge.id,
                'bind_id': charge.bind_id,
                'charge_type': charge.charge_type,
                'begin_date': charge.begin_date.strftime("%d.%m.%Y"),
                'end_date': charge.end_date.strftime("%d.%m.%Y"),
                'month': charge.begin_date.month,
                'month_name': get_month_name(charge.begin_date.month),
                'value': str(charge.value),
                'total': str(charge.total),
                'comment': charge.comment
            }
        for key,item in data['charge'].items():
            data['charge'][key]['cost_total'] = str(data['charge'][key]['cost_total'])
            data['charge'][key]['pay_total'] = str(data['charge'][key]['pay_total'])

    else:
        data['charge'] = [{'cost_total': 0, 'pay_total': 0, 'month_name': ''}]
        data['year_list'].append(datetime.date.today().year)

    return data


def update(request, data=None):
    client_id = int(request.POST['client_id'])
    bind_id = int(request.POST['bind_id'])
    form = client__form.client_charge(request.POST)
    if form.is_valid():
        value = decimal.Decimal(request.POST['value'])
        if request.POST['action']=='cost':
            log_type = 'charge_cost_updated'
            value *= -1
        else:
            log_type = 'charge_pay_updated'

        if request.POST['charge_id']=='add':
            if value < 0:
                log_type = 'charge_cost_add'
            else:
                log_type = 'charge_pay_add'
                client_set = db_sentry.client.objects.get(id=client_id)
                client_set.balance = client_set.balance - value
                client_set.save()

            charge_set = db_sentry.client_object_charge.objects.create(
                service_id = service_id,
                charge_type = 'manual',
                begin_date = date_convert.convert(request.POST['end_date']),
                end_date = date_convert.convert(request.POST['end_date']),
                value = value)
        else:
            charge_set = db_sentry.client_object_charge.objects.get(id=request.POST['charge_id'])
        charge_set.service_id = service_id
        charge_set.charge_type = 'manual'
        charge_set.begin_date = date_convert.convert(request.POST['begin_date'])
        charge_set.end_date = date_convert.convert(request.POST['end_date'])
        charge_set.value = value
        if 'comment' in request.POST: charge_set.comment = request.POST['comment']
        charge_set.save()
        sentry_log.create(request=request, client_object_id=charge_set.service.object.id, charge_id=charge_set.id, log_type=log_type)
        data['answer'] = 'done'
        #client_charge_recharge.charge_sum_total(service_id=service_id)
    else:
        data['error'] = form.errors
    return data


def delete(request, data=None):
    charge_set = db_sentry.client_bind_charge.objects.get(id=request.POST['charge_id'])
    charge_set.is_active = 0
    charge_set.save()
    if charge_set.value < 0:
        log_type = 'charge_cost_deleted'
    else:
        log_type = 'charge_pay_deleted'
        client_set = db_sentry.client.objects.get(id=request.POST['client_id'])
        client_set.balance = client_set.balance + charge_set.value
        client_set.save()
    sentry_log.create(request=request, client_object_id=charge_set.service.object.id, charge_id=charge_set.id, log_type=log_type)
    #client_charge_recharge.charge_sum_total(service_id=charge_set.service_id)
    data['answer'] = 'done'

    return data



