# -*- coding: utf-8 -*-

import json
import datetime
import time
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from sentry.models import db_security, db_sentry


def event(request):
    if request.user.has_perm('monitor.monitor'):
        data = {}
        alarm_list = ['alarm','alarm_action','alarm_completed']
        if 'id' in request.GET:
            event_id = int(request.GET['id'])
            event_set = db_sentry.event.objects.get(id=event_id)
            data['event_id'] = event_set.id
            data['event_time'] = event_set.event_time.strftime("%d.%m.%Y %H:%M:%S")
            data['event_name'] = event_set.dir_event.name
            data['event_group'] = event_set.dir_event.group.name
            data['description'] = event_set.dir_event.description

            if data['event_group'] in alarm_list:
                if not event_set.response_seconds:
                    event_set.response_seconds = (datetime.datetime.now() - event_set.event_time).total_seconds()
                    event_set.save()
                data['response_time'] = event_set.response_time()

                if event_set.action_id != None:
                    data['gbr_started_time'] = event_set.action.gbr_started_time.strftime('%H:%M:%S')
                    if event_set.action.gbr_arrived_time:
                        data['gbr_arrived_time'] = event_set.action.gbr_arrived_time.strftime('%H:%M:%S')+' ('+event_set.action.get_delta_time()+')'


            # Информация об объекте
            object_set = db_security.client_object_.objects.using('security').filter(id=event_set.object_id)

            if object_set.exists():
                data['object_id'] = object_set[0].id
                data['object_name'] = object_set[0].name
                data['address'] = object_set[0].get_address()
                if object_set[0].security_group_id > 0:
                    data['gbr_name'] = object_set[0].security_group.name
                    data['gbr_id'] = object_set[0].security_group.id
                else:
                    data['gbr_name'] = ''

                if event_set.action_id:
                    data['gbr_started_id'] = event_set.action.gbr_started_id
                    data['gbr_started_name'] = db_security.dir_security_group_.objects.using('security').filter(id=event_set.action.gbr_started_id)[0].name
                    if event_set.action.gbr_arrived_id:
                        data['gbr_arrived_id'] = event_set.action.gbr_arrived_id
                        data['gbr_arrived_name'] = db_security.dir_security_group_.objects.using('security').filter(id=event_set.action.gbr_arrived_id)[0].name
                    if event_set.action.report_id:
                        data['alarm_report_name'] = event_set.action.report.name
                elif event_set.cancel_id:
                    data['alarm_report_name'] = event_set.dir_event.description

                person_set = db_security.client_person_.objects.using('security')\
                    .filter(client_id=object_set[0].client_id, visible=1)
                if person_set.exists():
                    data['contacts'] = []
                    for item in person_set:
                        data['contacts'].append({
                            'full_name': item.full_name,
                            'phone_mobile': item.phone_mobile,
                            'phone_city': item.phone_city,
                            'phone_other': item.phone_other
                        })
            else:
                data['error'] = True

        data = json.dumps(data, ensure_ascii=False)
        return HttpResponse(data)
    else:
        return render_to_response('404.html', RequestContext(request))


def object(request):
    if request.user.has_perm('monitor.monitor'):
        if 'id' in request.GET:
            object_id = int(request.GET['id'])
            data = {}

            event_last_alarm = db_sentry.event.objects.filter(object_id=object_id,dir_event__name='alarm',response_seconds=None)
            if event_last_alarm:
                event_last_alarm.last().response_seconds = (datetime.datetime.now() - event_last_alarm.last().event_time).total_seconds()
                event_last_alarm.last().save()
                data['response_seconds'] = event_last_alarm.last().response_seconds

            object_set = db_security.client_object_.objects.using('security')\
                .filter(id=object_id)
            if object_set.exists():
                data['object_id'] = object_set[0].id
                data['order_num'] = object_set[0].order_num
                data['object_name'] = object_set[0].name
                data['object_status'] = db_sentry.object.objects.get(object_id=object_id).status.name
                data['address'] = object_set[0].get_address()
                if object_set[0].security_group_id > 0:
                    data['gbr_name'] = object_set[0].security_group.name
                else:
                    data['gbr_name'] = ''

                person_set = db_security.client_person_.objects.using('security')\
                    .filter(client_id=object_set[0].client_id, visible=1)
                if person_set.exists():
                    data['contacts'] = []
                    for item in person_set:
                        data['contacts'].append({
                            'full_name': item.full_name,
                            'phone_mobile': item.phone_mobile,
                            'phone_city': item.phone_city,
                            'phone_other': item.phone_other
                        })

                wires_set = db_sentry.object_wires.objects.filter(object_id=object_id)
                if wires_set.exists():
                    data['wires'] = []
                    for item in wires_set:
                        data['wires'].append({
                            'id': item.id,
                            'dir_event_id': item.dir_event.id,
                            'dir_event_description': item.dir_event.description,
                            'description': item.description
                        })

            else:
                data['error'] = True

        data = json.dumps(data, ensure_ascii=False)
        return HttpResponse(data)
    else:
        return render_to_response('404.html', RequestContext(request))


def search_object(request):
    if request.user.has_perm('monitor.monitor'):
        #data = {}
        object_list = db_sentry.event.objects.all()#.values('object_id')
        object_list = [item.object_id for item in object_list]
        object_set = db_security.client_object_.objects.using('security')\
            .filter(name__icontains=request.GET['search'], id__in=object_list)\
            .values('name', 'id')[:9]
        data = json.dumps([item for item in object_set], ensure_ascii=False)
        return HttpResponse(data)
    else:
        return render_to_response('404.html', RequestContext(request))