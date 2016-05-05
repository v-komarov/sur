# -*- coding: utf-8 -*-

import json
import datetime
from decimal import *

from apps.system.sentry_user import authorize
from apps.system import models as db_sentry
from apps.system.client.extension import client__form
from apps.system.client.extension import client_object_ajax
from apps.system.sentry_user.extension import sentry_log


def get(request, data=None):
    contract = db_sentry.client_contract.objects.get(id=int(request.GET['contract_id']))
    data['contract'] = {
        'id': contract.id,
        'client': contract.client.id,
        'client__name': contract.client.name,
        'name': contract.name,
        'status': contract.status.id,
        'status__label': contract.status.label,
        'status__name': contract.status.name,
        'ovd_status': contract.ovd_status.id,
        'ovd_status__label': contract.ovd_status.label,
        'ovd_status__name': contract.ovd_status.name,
        'security_previously': contract.security_previously,
        'comment': contract.comment,
        'object_list': client_object_ajax.get_object_list(contract_id=contract.id)['object_list'],
        'subtype_list': contract.get_subtype_list(),
        'event_list': contract.get_event_list(),
    }
    if contract.service_type_id:
        data['contract']['service_type'] = contract.service_type_id
        data['contract']['service_type__name'] = contract.service_type.name
    if contract.begin_date: data['contract']['begin_date'] = contract.begin_date.strftime('%d.%m.%Y')
    if contract.end_date: data['contract']['end_date'] = contract.end_date.strftime('%d.%m.%Y')
    if contract.service_organization_id:
        data['contract']['service_organization'] = contract.service_organization_id
        data['contract']['service_organization__name'] = contract.service_organization.name
    if contract.client.holding_id:
        data['contract']['holding'] = contract.client.holding.id
        data['contract']['holding__name'] = contract.client.holding.name

    data['contract']['tag_list'] = []
    for tag in contract.dir_tag.all():
        data['contract']['tag_list'].append({'id': tag.id, 'name': tag.name})

    return data


def add(request, data=None):
    client_id = int(request.POST['client'])
    contract_form = client__form.contract_form(request.POST)
    if contract_form.is_valid():
        contract = contract_form.save()
        contract.client_id = client_id
        contract.dir_tag = json.loads(request.POST['dir_tag'])
        contract.save()
        data['url'] = '/system/client/'+str(client_id)+'/contract/'+str(contract.id)+'/'
    else:
        data['errors'] = contract_form.errors

    return data


def update(request, data=None):
    contract = db_sentry.client_contract.objects.get(id=request.POST['contract'])
    contract_form = client__form.contract_form(request.POST, instance=contract)
    if contract_form.is_valid():# and contract_form.has_changed():
        contract = contract_form.save()
        sentry_log.create(request, client_contract_id=contract.id)
        contract.dir_tag = json.loads(request.POST['dir_tag'])
        if contract.service_type != int(request.POST['service_type']):
            contract.dir_service_subtype.clear()
        data['status'] = contract.check_contract_status()
        contract.save()
    else:
        data['errors'] = contract_form.errors

    return data


def delete(request, data=None):
    object = db_sentry.client_object.objects.get(id=int(request.GET['object']))
    bind = db_sentry.client_bind.objects.filter(
        client_contract__client_id = int(request.GET['client']),
        client_object_id = object.id,
        is_active = 1
    ).first()
    data['bind'] = bind.id

    if bind.status.label == 'white' or bind.status.label == 'new':
        bind.is_active = 0
        bind.save()
    else:
        data['error'] = 'Нельзя удалить этот объект'

    '''
    for service in db_sentry.client_object_service.objects.filter(contract_id=service_set.id):
        service.is_active = 0
        service.save()
        object = db_sentry.client_object.objects.get(id=service.object_id)
        object.is_active = 0
        object.save()
    sentry_log.create(request=request,client_object_id=object_set.id,log_type='object_delete')
    '''
    #data['url'] = '/system/client/'+str(contract.client.id)+'/contract/'

    return data


'''
def contract_revision(contract_id):
    contract_set = db_sentry.client_object_service.objects.get(id=contract_id)
    db_sentry.client_object_service_dir_service_subtype.objects.filter(client_object_service_id=contract_set.id).delete()
    status_id = 1
    object_event_list = []
    contract_status_id = 6
    contract_event_list = []
    subtype_list = []

    for event in contract_set.object.client_work_set.filter(is_active=1):
        contract_event_list.append(event.event_type_id)

    for object_service in db_sentry.client_object_service.objects.filter(contract_id=contract_id):
        for event in object_service.object.client_work_set.filter(is_active=1):
            object_event_list.append(event.event_type_id)

        for subtype in object_service.dir_service_subtype.get_query_set():
            if subtype.id not in subtype_list: subtype_list.append(subtype.id)

    for subtype_id in subtype_list:
        db_sentry.client_object_service_dir_service_subtype.objects.create(
            client_object_service_id = contract_id,
            dir_service_subtype_id = subtype_id)

    if 5 in contract_event_list: contract_status_id = 6
    elif 4 in contract_event_list: contract_status_id = 4
    if 7 in object_event_list: status_id = 6
    elif 6 in object_event_list: status_id = 4

    contract_set.status_id = status_id
    contract_set.contract_status_id = contract_status_id
    contract_set.save()

    data = {
        'contract_event_list': contract_event_list,
        'object_event_list': object_event_list,
        'status': status_id,
        'contract_status': contract_status_id,
        'subtype_list': subtype_list
    }
    return data
'''


def get_contract_interval(request, data=None):
    data['contract_list'] = []
    exclude_list = []
    data['all'] = 0
    data['cnt_contract'] = 0
    data['cnt_exclude'] = 0
    for contract in db_sentry.client_contract.objects.filter(
            service_organization = int(request.GET['service_organization_id']),
            service_type = int(request.GET['service_type_id']),
            is_active = 1 ).exclude(status=6):
        exclude_list.append(contract.name)
        data['cnt_exclude'] += 1

    for contract in db_sentry.dir_contract_interval.objects.filter(
            service_organization = int(request.GET['service_organization_id']),
            is_active = 1 ):
        end = 700
        for number in range(contract.begin,contract.end):
            if end > 0:
                data['all'] += 1
                number = str(number)
                if contract.prefix: number = str(number)+contract.prefix
                if number not in exclude_list:
                    end -= 1
                    data['contract_list'].append(number)
                    data['cnt_contract'] += 1

    data['exclude_list'] = exclude_list
    return data
