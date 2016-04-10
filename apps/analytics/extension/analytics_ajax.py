# -*- coding: utf-8 -*-

import datetime

from apps.system import models as db_sentry


def incident(request,data):
    begin_date = datetime.datetime.strptime(request.GET['begin_date'], '%d.%m.%Y')
    end_date = datetime.datetime.strptime(request.GET['end_date'], '%d.%m.%Y')
    incident_set = db_sentry.client_object_incident.objects \
        .filter(incident_date__range=(begin_date, end_date), is_active=1)#.exclude(cost_result=None)
    if 'client_id' in request.GET and request.GET['client_id']!='':
        incident_set = incident_set.filter(object__client_id=int(request.GET['client']))
    if 'incident_type_id' in request.GET and request.GET['incident_type_id']!='':
        incident_set = incident_set.filter(incident_type_id=int(request.GET['incident_type_id']))
    if 'arrival_min' in request.GET and request.GET['arrival_min']!='':
        incident_set = incident_set.filter(arrival_time__gte=int(request.GET['arrival_min']))
    if 'arrival_max' in request.GET and request.GET['arrival_max']!='':
        incident_set = incident_set.filter(arrival_time__lte=int(request.GET['arrival_max']))

    data['count'] = 0
    data['incident_list'] = []
    for incident in incident_set:
        incident_log = db_sentry.sentry_log.objects.filter(incident_id=incident.id, log_type_id=546)[0]
        data['incident_list'].append({
            'client_id': incident.object.client.id,
            'client__name': incident.object.client.name,
            'object_id': incident.object.id,
            'object__name': incident.object.name,
            'incident_id': incident.id,
            'incident_type': incident.incident_type.name,
            'incident_date': incident.incident_date.strftime("%d.%m.%Y %H:%M"),
            'arrival_time': incident.arrival_time,
            'add_user__full_name': incident_log.sentry_user.full_name,
            'comment': incident.comment,
            'address': incident.object.get_address(),
            'service_list': incident.object.get_service_list()
        })
        data['count'] += 1

    return data


def get(request,data):
    datetime_now = datetime.datetime.today().replace(hour=0,minute=0) - datetime.timedelta(days=1)
    task_set = db_sentry.client_object_task.objects.get(id=int(request.GET['task_id']))
    if task_set.status.label!='process' and datetime_now > task_set.completion_date:
        status = 'expired'
    else:
        status = task_set.status.label
    data['task'] = {
        'id': task_set.id,
        'status_id': task_set.status_id,
        'status__label': status,
        'task_type_id': task_set.task_type_id,
        'task_type__name': task_set.task_type.name,
        'client_id': task_set.object.client.id,
        'client_name': task_set.object.client.name,
        'object_id': task_set.object.id,
        'object_name': task_set.object.name,
        'object_map_yandex': task_set.object.get_map_yandex(),
        'create_user': task_set.create_user.full_name,
        'create_date': task_set.create_date.strftime("%H:%M %d.%m.%Y"),
        'completion_date': task_set.completion_date.strftime("%d.%m.%Y"),
        'warden_id': task_set.warden.id,
        'warden': task_set.warden.full_name,
        'doer_id': task_set.doer.id,
        'doer': task_set.doer.full_name,
        'address': task_set.object.get_address(),
        'comment': task_set.comment }
    if task_set.initiator_id:
        data['task']['initiator_id'] = task_set.initiator.id
        data['task']['initiator'] = task_set.initiator.full_name
    if task_set.initiator_other:
        data['task']['initiator_other'] = task_set.initiator_other
    if task_set.service_id:
        data['task']['service_string'] = task_set.service.get_service_string()
        data['task']['service_status'] = task_set.service.object.status.label

    task_report_set = db_sentry.client_object_task_report.objects.filter(task=task_set.id,is_active=1)
    if task_report_set:
        data['task']['report_list'] = []
        for item in task_report_set:
            report = {
                'id': item.id,
                'time': item.create_date.strftime("%Y%m%d%H%M%S"),
                'create_date': item.create_date.strftime("%d.%m.%Y %H:%M"),
                'doer': item.doer.full_name,
                'comment': item.comment
            }
            data['task']['report_list'].append(report)

    task_log_set = db_sentry.client_object_task_log.objects.filter(task=task_set.id,is_active=1)
    if task_log_set:
        data['task']['log_list'] = []
        for item in task_log_set:
            log = {
                'id': item.id,
                'time': item.create_date.strftime("%Y%m%d%H%M%S"),
                'create_date': item.create_date.strftime("%d.%m.%Y %H:%M"),
                'user': item.user.full_name,
                'old_date': item.old_date.strftime("%d.%m.%Y"),
                'new_date': item.new_date.strftime("%d.%m.%Y"),
                'comment': item.comment
            }
            data['task']['log_list'].append(log)

    return data

