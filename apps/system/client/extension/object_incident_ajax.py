# -*- coding: utf-8 -*-

from apps.system import models as db_sentry
from apps.toolset import date_convert
from apps.system.sentry_user.extension import sentry_log


def get(request,data):
    incident_set = None
    if 'object_id' in request.GET:
        incident_set = db_sentry.client_object_incident.objects.filter(object_id=int(request.GET['object_id']), is_active=1)
    elif 'incident_id' in request.GET:
        incident_set = db_sentry.client_object_incident.objects.filter(id=int(request.GET['incident_id']))

    data['incident_list'] = []
    for item in incident_set:
        incident = {
            'id': item.id,
            'incident_date': item.incident_date.strftime("%d.%m.%Y %H:%M"),
            'comment': item.comment,
            'log': []
        }
        if item.incident_type_id:
            incident['incident_type_id'] = item.incident_type.id
            incident['incident_type'] = item.incident_type.name

        for log in db_sentry.sentry_log.objects.filter(incident=item.id):
            incident['log'].append({
                'log_type': log.log_type.name,
                'sentry_user': log.sentry_user.full_name,
                'create_date': log.log_date.strftime("%d.%m.%Y %H:%M")
            })
        if item.arrival_date:
            incident['arrival_date'] = item.arrival_date.strftime("%d.%m.%Y %H:%M")
            incident['arrival_time'] = item.arrival_time

        data['incident_list'].append(incident)
    return data


def update(request,data=None):
    incident_date = date_convert.convert2datetime(request.POST['incident_date'])
    arrival_date = date_convert.convert2datetime(request.POST['arrival_date'])
    data['error'] = incident_date['error']

    if not data['error']:
        if request.POST['incident_id'] == 'add':
            incident_set = db_sentry.client_object_incident.objects.create(
                object_id = int(request.POST['object_id']),
                incident_date = incident_date['datetime'] )
            data['incident_id'] = incident_set.id
            sentry_log.object_incident(request,incident_set,'object_incident_add')
            data['log_type'] = 'object_incident_add'
        else:
            incident_set = db_sentry.client_object_incident.objects.get(id=int(request.POST['incident_id']))
            sentry_log.object_incident(request,incident_set,'object_incident_update')
            data['log_type'] = 'object_incident_update'
        if not arrival_date['error']:
            incident_set.arrival_date = arrival_date['datetime']
            incident_set.arrival_time = date_convert.get_minutes(incident_date['datetime'],arrival_date['datetime'])
        incident_set.incident_type_id = request.POST['incident_type_id']
        incident_set.incident_date = incident_date['datetime']
        incident_set.comment = request.POST['comment']
        incident_set.save()

    return data


def delete(request,data=None):
    incident_set = db_sentry.client_object_incident.objects.get(id = int(request.GET['incident_id']))
    incident_set.is_active = 0
    incident_set.save()
    sentry_log.object_incident(request,incident_set,'object_incident_delete')
    data['answer'] = 'done'

    return data
