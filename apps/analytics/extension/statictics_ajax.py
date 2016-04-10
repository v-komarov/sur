# -*- coding: utf-8 -*-

import datetime

from apps.system import models as db_sentry


def get(request, data):
    #datetime_now = datetime.datetime.today().replace(hour=0,minute=0) - datetime.timedelta(days=1)
    row_id = 0
    row_title = 'Не распределено'
    begin_date = datetime.datetime.strptime(request.GET['begin_date'], '%d.%m.%Y')
    end_date = datetime.datetime.strptime(request.GET['end_date'], '%d.%m.%Y')
    data['paused'] = 0

    data['statistics'] = {'list': {}}
    event_set = db_sentry.client_object_event.objects.filter(
        event_date__range = (begin_date, end_date),
        event_type_id__in=[6,7],
        is_active=1 ) \
        .order_by('-event_date')

    data['statistics']['list']['total'] = {
        'total_pay_list': [],
        'total_free_list': [],
        'connected_pay_list': [],
        'connected_free_list': [],
        'disconnected_pay_list': [],
        'disconnected_free_list': [],
        'paused_pay_list': [],
        'paused_free_list': []
    }
    for event in event_set:

        if request.GET['statistics_type']=='squad':
            data['head_title'] = 'Название ГБР'
            if event.object.security_squad_id:
                row_id = event.object.security_squad_id
                row_title = event.object.security_squad.name.encode('utf-8')

        elif request.GET['statistics_type']=='security_company':
            data['head_title'] = 'Название организации'
            if event.service.security_company_id:
                row_id = event.service.security_company_id
                row_title = event.service.security_company.name.encode('utf-8')

        elif request.GET['statistics_type']=='service_type':
            data['head_title'] = 'Название организации'
            if event.service.service_type_id:
                row_id = event.service.service_type_id
                row_title = event.service.service_type.name.encode('utf-8')

        elif request.GET['statistics_type']=='warden':
            data['head_title'] = 'Ф.И.О. сотрудника'
            event_filter = db_sentry.client_object_event.objects \
                .filter(object_id=event.object_id, event_type_id=1, is_active=1) \
                .order_by('-event_date').first()
            if event_filter:
                row_id = event_filter.sentry_user_id
                row_title = event_filter.sentry_user.full_name.encode('utf-8')

        elif request.GET['statistics_type']=='referer':
            data['head_title'] = 'Ф.И.О. сотрудника'
            if event.object.referer_type_id == 1:
                row_id = event.object.referer_user_id
                row_title = event.object.referer_user.full_name.encode('utf-8')
            else:
                row_id = event.object.referer_type_id
                row_title = event.object.referer_type.name.encode('utf-8')

        if not data['statistics']['list'].has_key(row_id):
            data['statistics']['list'][row_id] = {
                'full_name': row_title,
                'total_pay_list': [],
                'total_free_list': [],
                'connected_pay_list': [],
                'connected_free_list': [],
                'disconnected_pay_list': [],
                'disconnected_free_list': [],
                'paused_pay_list': [],
                'paused_free_list': []
            }
        status = event.service.status.label
        cost = event.object.get_service_cost()

        if cost:
            data['statistics']['list'][row_id]['total_pay_list'].append(event.object_id)
            data['statistics']['list']['total']['total_pay_list'].append(event.object_id)
        else:
            data['statistics']['list'][row_id]['total_free_list'].append(event.object_id)
            data['statistics']['list']['total']['total_free_list'].append(event.object_id)

        if status == 'connected':
            if cost > 0:
                data['statistics']['list'][row_id]['connected_pay_list'].append(event.object_id)
                data['statistics']['list']['total']['connected_pay_list'].append(event.object_id)
            else:
                data['statistics']['list'][row_id]['connected_free_list'].append(event.object_id)
                data['statistics']['list']['total']['connected_free_list'].append(event.object_id)

        elif status == 'disconnected':
            if cost:
                data['statistics']['list'][row_id]['disconnected_pay_list'].append(event.object_id)
                data['statistics']['list']['total']['disconnected_pay_list'].append(event.object_id)
            else:
                data['statistics']['list'][row_id]['disconnected_free_list'].append(event.object_id)
                data['statistics']['list']['total']['disconnected_free_list'].append(event.object_id)

        elif status == 'paused':
            data['paused'] += 1
            if cost > 0:
                data['statistics']['list'][row_id]['paused_pay_list'].append(event.object_id)
                data['statistics']['list']['total']['paused_pay_list'].append(event.object_id)
            else:
                data['statistics']['list'][row_id]['paused_free_list'].append(event.object_id)
                data['statistics']['list']['total']['paused_free_list'].append(event.object_id)

    return data

