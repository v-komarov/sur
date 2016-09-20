# -*- coding: utf-8 -*-

import json
import datetime
import decimal

from apps.system import models as db_sentry


def balance(request,data):
    begin_date = datetime.datetime.strptime(request.GET['begin_date'], '%d.%m.%Y')
    end_date = datetime.datetime.strptime(request.GET['end_date'], '%d.%m.%Y')
    charge_set = db_sentry.client_bind_charge.objects.filter(
        begin_date__range = (begin_date, end_date),
        bind__client_contract__is_active = 1,
        bind__client_object__is_active = 1,
        bind__is_active = 1,
        is_active = 1
    )

    connected_set = db_sentry.client_workflow.objects.filter(
        contract__is_active = 1,
        bind__is_active = 1,
        workflow_type__label = 'client_object_connect',
        workflow_date__range = (begin_date, end_date),
        is_active = 1
    )
    disconnected_set = db_sentry.client_workflow.objects.filter(
        contract__is_active = 1,
        bind__is_active = 1,
        workflow_type__label = 'client_object_disconnect',
        workflow_date__range = (begin_date, end_date),
        is_active = 1
    )

    if 'holding' in request.GET and request.GET['holding'] != '':
        charge_set = charge_set.filter(bind__client_contract__client__holding_id=int(request.GET['holding']))
        connected_set = connected_set.filter(contract__client__holding=int(request.GET['holding']))
        disconnected_set = disconnected_set.filter(contract__client__holding=int(request.GET['holding']))
    if 'client' in request.GET and request.GET['client'] != '':
        charge_set = charge_set.filter(bind__client_contract__client_id=int(request.GET['client']))
        connected_set = connected_set.filter(contract__client=int(request.GET['client']))
        disconnected_set = disconnected_set.filter(contract__client=int(request.GET['client']))
    if 'service_organization' in request.GET and request.GET['service_organization'] != '':
        charge_set = charge_set.filter(bind__client_contract__service_organization_id=int(request.GET['service_organization']))
        connected_set = connected_set.filter(contract__service_organization=int(request.GET['service_organization']))
        disconnected_set = disconnected_set.filter(contract__service_organization=int(request.GET['service_organization']))
    if 'locality' in request.GET and request.GET['locality'] != '':
        charge_set = charge_set.filter(bind__client_object__address_building__street__locality_id=int(request.GET['locality']))
        connected_set = connected_set.filter(object__address_building__street__locality_id=int(request.GET['locality']))
        disconnected_set = disconnected_set.filter(object__address_building__street__locality_id=int(request.GET['locality']))
    if 'service_list' in request.GET:
        charge_set = charge_set.filter(bind__client_contract__service_type_id__in=json.loads(request.GET['service_list']))
        connected_set = connected_set.filter(contract__service_type_id__in=json.loads(request.GET['service_list']))
        disconnected_set = disconnected_set.filter(contract__service_type_id__in=json.loads(request.GET['service_list']))
    if 'warden' in request.GET and request.GET['warden'] != '':
        charge_set = charge_set.filter(warden_id=int(request.GET['warden']))

        #connected_set = connected_set.filter(contract__=json.loads(request.GET['warden']))
        #disconnected_set = disconnected_set.filter(contract__=json.loads(request.GET['warden']))
    if not 'other' in request.GET:
        charge_set = charge_set.exclude(charge_type='manual', value__lt=0)

    data['client_list'] = []
    data['charge_list'] = []
    data['charge_count'] = charge_set.count()
    data['bind_list'] = {}
    data['bind_count'] = 0
    for charge in charge_set:
        data['client_list'].append(charge.bind.client_contract.client.id)
        item = {
            'pay_type': charge.bind.client_contract.client.pay_type,
            'charge_type': charge.charge_type,
            'id': charge.id,
            'value': int(charge.value),
            'total': int(charge.total),
            'client': charge.bind.client_contract.client.id,
            'client__name': charge.bind.client_contract.client.name,
            'contract': charge.bind.client_contract.id,
            'bind': charge.bind.id,
            'object': charge.bind.client_object.id,
            'object__name': charge.bind.client_object.name,
            'comment': charge.bind.client_object.comment,
            }
        item['warden'] = charge.bind.client_object.get_warden()['id']
        item['warden__full_name'] = charge.bind.client_object.get_warden()['full_name']
        #if charge.warden:
        #item['warden'] = charge.warden.id
        #item['warden__full_name'] = charge.warden.full_name
        if charge.bind.client_contract.service_organization:
            item['service_organization'] = charge.bind.client_contract.service_organization.id
            item['service_organization__name'] = charge.bind.client_contract.service_organization.name
        data['charge_list'].append(item)


        if not data['bind_list'].has_key(charge.bind.id):
            data['bind_list'][charge.bind.id] = {
                'balance': 0,
                'charge': 0,
                'payment': 0,
                'transaction': 0,
                'client': charge.bind.client_contract.client.id,
                'client__name': charge.bind.client_contract.client.name,
                'contract': charge.bind.client_contract.id,
                'bind': charge.bind.id,
                'object': charge.bind.client_object.id,
                'object__name': charge.bind.client_object.name,
                'comment': charge.bind.client_object.comment,
                'address': charge.bind.client_object.get_address(),
                'status': charge.bind.status.label,
                'ovd_status': charge.bind.ovd_status.label,
                'service_type__name': charge.bind.client_contract.service_type.name,
                'subtype_list': charge.bind.get_subtype_list()
            }
            try:
                data['bind_list'][charge.bind.id]['begin_date'] = charge.bind.client_contract.begin_date.strftime('%d.%m.%Y')
            except:
                data['bind_list'][charge.bind.id]['begin_date'] = ''
            if charge.warden:
                data['bind_list'][charge.bind.id]['warden'] = charge.warden.id
                data['bind_list'][charge.bind.id]['warden__full_name'] = charge.warden.full_name
            data['bind_count'] += 1

        data['bind_list'][charge.bind.id]['balance'] += float(charge.value)
        if charge.value < 0:
            data['bind_list'][charge.bind.id]['charge'] += float(charge.value)
        else:
            data['bind_list'][charge.bind.id]['payment'] += float(charge.value)



    payment_set = db_sentry.client_payment.objects.filter(
        client__in = data['client_list'],
        date__range = (begin_date, end_date),
        is_active = 1
    )
    data['payment_list'] = []
    for payment in payment_set:
        data['payment_list'].append({
            'value': int(payment.value),
            'payment_type': payment.payment_type,
            })

    data['connected'] = {
        'count': connected_set.count(),
        'total': decimal.Decimal(0.0)
    }
    for item in connected_set:
        bind = db_sentry.client_bind.objects.filter(client_object=item.object.id, is_active=1).first()
        if bind:
            try:
                data['connected']['total'] += decimal.Decimal(bind.get_connect_cost())
            except:
                pass
    data['connected']['total'] = str(data['connected']['total'])

    data['disconnected'] = disconnected_set.count()

    return data


def bonus(request,data):
    begin_date = datetime.datetime.strptime(request.GET['begin_date'], '%d.%m.%Y')
    end_date = datetime.datetime.strptime(request.GET['end_date'], '%d.%m.%Y')

    bonus_type_set = db_sentry.dir_object_event_type.objects.filter(type='bonus',is_active=1)
    bonus_set = db_sentry.client_object_event.objects \
        .filter(is_active=1, event_date__range=(begin_date, end_date)) \
        .exclude(cost=None, sentry_user_id=None)
    if 'sentry_user_id' in request.GET and request.GET['sentry_user_id']!='':
        bonus_set = bonus_set.filter(sentry_user_id=int(request.GET['sentry_user_id']))
    if 'bonus_list' in request.GET:
        bonus_set = bonus_set.filter(event_type_id__in=json.loads(request.GET['bonus_list']))

    data['count'] = 0
    data['bonus_list'] = {}
    data['bonus_type_list'] = []
    for type in bonus_type_set:
        data['bonus_type_list'].append({
            'id': type.id,
            'label': type.label,
            'name': type.name })
    for bonus in bonus_set:
        if not data['bonus_list'].has_key(bonus.sentry_user.id):
            data['bonus_list'][bonus.sentry_user.id] = {
                'sentry_user_id': bonus.sentry_user.id,
                'sentry_user__full_name': bonus.sentry_user.full_name,
                'sentry_user__post': bonus.sentry_user.post.name }
            for bonus_type in bonus_type_set:
                data['bonus_list'][bonus.sentry_user.id][bonus_type.label] = 0
            data['count'] += 1

        data['bonus_list'][bonus.sentry_user.id][bonus.event_type.label] += float(bonus.cost)
    return data


def bonus_click(request,data):
    begin_date = datetime.datetime.strptime(request.GET['begin_date'], '%d.%m.%Y')
    end_date = datetime.datetime.strptime(request.GET['end_date'], '%d.%m.%Y')

    bonus_set = db_sentry.client_object_event.objects.filter(
        sentry_user_id = request.GET['sentry_user_id'],
        event_type__label = request.GET['bonus_label'],
        event_date__range = (begin_date, end_date),
        is_active=1 ) \
        .exclude(cost=None)

    data['count'] = 0
    data['bind_list'] = []
    for bonus in bonus_set:
        data['bind_list'].append({
            'client_id': bonus.object.client.id,
            'client__name': bonus.object.client.name,
            'object_id': bonus.object.id,
            'object__name': bonus.object.name,
            'address': bonus.object.get_address(),
            'device_list': bonus.object.get_device(),
            'service_list': bonus.object.get_service_list(),
            'bonus_cost': str(bonus.cost),
            'bonus_type_name': bonus.event_type.name,
            })
        data['count'] += 1

    return data


def export_post(request,data):
    from apps.settings import MEDIA_ROOT
    from apps.settings import MEDIA_URL
    begin_date = datetime.datetime.strptime(request.POST['begin_date'], '%d.%m.%Y')
    end_date = datetime.datetime.strptime(request.POST['end_date'], '%d.%m.%Y')
    post_set = db_sentry.client_object_service_post.objects.filter(
        service__security_company_id__in = json.loads(request.POST['security_company_list']),
        completed_end_date__range = (begin_date, end_date),
        is_active = 1 ) \
        .exclude(sentry_user_id=None, hours=None, salary_result=None)

    data['count'] = 0
    data['error_list'] = []
    data['export_list'] = []
    user_list = []
    dict = {}
    for item in post_set:
        if item.sentry_user_id:
            if not dict.has_key(item.sentry_user.full_name):
                dict[item.sentry_user.full_name] = {
                    'user': item.sentry_user.full_name,
                    'hours': decimal.Decimal('0.00'),
                    'salary': decimal.Decimal('0.00') }
                data['count'] += 1
                user_list.append(item.sentry_user.full_name)
            try:
                dict[item.sentry_user.full_name]['salary'] += item.salary_result
                dict[item.sentry_user.full_name]['hours'] += item.hours
            except:
                data['error_list'].append(item.id)

    user_list.sort()
    for user in user_list:
        data['export_list'].append({
            'user': user,
            'hours': str(dict[user]['hours']),
            'salary': str(dict[user]['salary']) })

    filename = 'export/post_ZP_'+begin_date.strftime("%Y%m%d")+'_'+end_date.strftime("%Y%m%d")+'.csv'
    data['file'] = str(MEDIA_ROOT)+'/'+filename
    data['file_url'] = str(MEDIA_URL)+filename
    file = open(data['file'], 'w')
    file.write('ФИО, кол. часов, ЗП\n')
    for item in data['export_list']:
        file.write( item['user'].encode('utf-8')+','+str(item['hours'])+','+str(item['salary'])+'\n' )
    file.close()

    return data

