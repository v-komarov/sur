# -*- coding: utf-8 -*-

import json
import datetime
import decimal

from apps.system import models as db_sentry


def balance(request,data):
    begin_date = datetime.datetime.strptime(request.GET['begin_date'], '%d.%m.%Y')
    end_date = datetime.datetime.strptime(request.GET['end_date'], '%d.%m.%Y')
    charge_set = db_sentry.client_object_service_charge.objects.filter(begin_date__range=(begin_date, end_date), is_active=1)

    if 'client' in request.GET and request.GET['client'] != '':
        charge_set = charge_set.filter(service__object__client_id=int(request.GET['client']))
    if 'locality_id' in request.GET and request.GET['locality_id'] != '':
        charge_set = charge_set.filter(service__object__address_building__street__locality_id=int(request.GET['locality_id']))
    if 'service_list' in request.GET:
        charge_set = charge_set.filter(service__service_type_id__in=json.loads(request.GET['service_list']))
    if 'warden_id' in request.GET and request.GET['warden_id'] != '':
        charge_set = charge_set.filter(warden_id=int(request.GET['warden_id']))

    data['count'] = 0
    data['object_list'] = {}
    for charge in charge_set:
        if not data['object_list'].has_key(charge.service.object.id):
            data['object_list'][charge.service.object.id] = {
                'balance': 0,
                'charge': 0,
                'payment': 0,
                'transaction': 0,
                'client_id': charge.service.object.client.id,
                'client__name': charge.service.object.client.name,
                'object_id': charge.service.object.id,
                'object__name': charge.service.object.name,
                'comment': charge.service.object.comment,
                'warden_id': charge.warden_id,
                'address': charge.service.object.get_address(),
                'service_list': charge.service.object.get_service_list()
            }
            data['count'] += 1
        data['object_list'][charge.service.object.id]['balance'] += float(charge.value)
        if charge.value < 0:
            data['object_list'][charge.service.object.id]['charge'] += float(charge.value)
        else:
            data['object_list'][charge.service.object.id]['payment'] += float(charge.value)

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
    data['object_list'] = []
    for bonus in bonus_set:
        data['object_list'].append({
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

