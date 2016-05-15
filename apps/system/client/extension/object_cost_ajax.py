# -*- coding: utf-8 -*-

import datetime
from decimal import *
from apps.system import models as db_sentry

#import apps.system.client.object_service_cost

#class index(apps.system.client.object_service_cost):
#    pass


def get_list(request, data):
    data['service_cost_list'] = []
    service_set = db_sentry.client_object_service.objects.filter(object=int(request.POST['object_id']), is_active=1)
    for service in service_set:
        try:
            cost_set = db_sentry.client_object_service_cost.objects \
                .filter(service=service.id, is_active=1).first()
            data['service_cost_list'].append({
                'service_id': service.id,
                'service_name': service.name,
                'service_cost_id': cost_set.id,
                'cost': str(cost_set.cost),
                'cost_type_id': cost_set.cost_type_id,
                'cost_type_label': cost_set.cost_type.label,
                'cost_type': cost_set.cost_type.name,
                #'begin_date': cost_set.begin_date,
                'month_day': cost_set.charge_month_day,
                'month': cost_set.charge_month.name })
        except:
            data['service_cost_list'].append({
                'service_id': service.id,
                'service_name': service.name,
                'service_cost_id': None,
                'cost': 'Не определена'.decode('utf-8') })
    return data


def cost_null(request, data):
    bind_set = db_sentry.client_bind.objects.get(id=int(request.POST['service_id']))
    data['service_cost'] = {
        'service_type': bind_set.service_type.name,
        'object__name': bind_set.object.name,
        }
    try: data['service_cost']['begin_date'] = bind_set.begin_date.strftime("%d.%m.%Y")
    except: data['service_cost']['begin_date'] = ''
    contract_cost_set = db_sentry.bind_set_cost.objects.filter(id=bind_set.contract_id,is_active=1).first()
    try:
        data['service_cost']['charge_month_day'] = contract_cost_set.charge_month_day
        data['service_cost']['charge_month_id'] = contract_cost_set.charge_month_id
    except: pass

    return data


def get(request, data):
    cost_set = db_sentry.client_bind_cost.objects.get(id=int(request.GET['cost']))
    data['object_cost'] = {
        'id': cost_set.id,
        'client_bind_id': cost_set.client_bind.id,
        'object__name': cost_set.client_bind.client_object.name,
        'status': cost_set.client_bind.status.name,
        'comment': cost_set.comment
    }
    if cost_set.begin_date: data['object_cost']['begin_date'] = cost_set.begin_date.strftime("%d.%m.%Y")
    if cost_set.cost_type_id:
        data['object_cost']['cost_type'] = cost_set.cost_type_id
        data['object_cost']['cost_type__label'] = cost_set.cost_type.label
        data['object_cost']['cost_type__name'] = cost_set.cost_type.name
    if cost_set.charge_month_id:
        data['object_cost']['charge_month'] = cost_set.charge_month.id
        data['object_cost']['charge_month_day'] = cost_set.charge_month_day
    if cost_set.cost_value: data['object_cost']['cost_value'] = str(cost_set.cost_value)

    data['cost_list'] = cost_set.client_bind.get_cost(current=True, list=True)
    '''
    for item in db_sentry.client_object_service_cost.objects.filter(service_id=cost_set.service_id, is_active=1):
        cost_item = {'id': item.id, 'count': count}
        count += 1
        if item.cost: cost_item['cost'] = str(item.cost)
        if item.begin_date: cost_item['begin_date'] = item.begin_date.strftime("%d.%m.%Y")
        if item.cost_type_id:
            cost_item['cost_type'] = item.cost_type.label
            cost_item['cost_type_id'] = item.cost_type_id
            cost_item['cost_type__name'] = item.cost_type.name
        data['service_cost_log'].append(cost_item)
    '''

    return data


def update(request, data):
    try:
        cost_set = db_sentry.client_bind_cost.objects.get(id=int(request.POST['client_object_cost']))
    except:
        cost_set = db_sentry.client_bind_cost.objects.create(
            client_bind_id = int(request.POST['client_bind']),
            cost_type_id = int(request.POST['cost_type'])
        )
        data['new_cost_id'] = cost_set.id

    cost_set.cost_type_id = int(request.POST['cost_type'])
    try: cost_set.begin_date = datetime.datetime.strptime(request.POST['begin_date'], '%d.%m.%Y')
    except: cost_set.begin_date = None
    try: cost_set.end_date = datetime.datetime.strptime(request.POST['end_date'], '%d.%m.%Y')
    except: cost_set.end_date = None
    try: cost_set.comment = request.POST['comment']
    except: cost_set.comment = ''

    if 'cost_value' in request.POST and request.POST['cost_value'] != '':
        try: cost_set.cost_value = Decimal(request.POST['cost_value'])
        except: data['error'] = 'Wrong cost'
    else: cost_set.cost_value = None

    if 'charge_month_day' in request.POST and 'charge_month' in request.POST:
        cost_set.charge_month_day = int(request.POST['charge_month_day'])
        cost_set.charge_month_id = int(request.POST['charge_month'])
    else:
        try:
            cost_set.charge_month_day = cost_set.client_bind.charge_month_day
            cost_set.charge_month_id = cost_set.client_bind.charge_month_id
        except:
            data['error'] = 'no charge_month_day'

    if not data['error']:
        cost_set.save()
        #client_charge_recalculate.recharge(request, cost_set.service.object.client_id, int(request.POST['service_id']))
    elif 'new_cost_id' in data:
        cost_set.delete()

    #cost_set.client_bind.check_status()
    return data



def delete(request, data):
    cost_set = db_sentry.client_bind_cost.objects.get(id=int(request.POST['client_object_cost']))
    cost_set.is_active = 0
    cost_set.save()
    #data['status'] = cost_set.service.check_object_status()
    return data


