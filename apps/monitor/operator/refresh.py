# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from sentry.models import db_security, db_sentry


def events(request):
    if request.user.has_perm('sentry.monitor'):
        data = {}
        data['time'] = datetime.datetime.now().strftime("%H:%M:%S")#%Y-%m-%d
        time_delta = datetime.datetime.now() - datetime.timedelta(days=5)#hours=72)

        if not 'event_id' in request.POST: # New
            event_set = db_sentry.event.objects\
                .filter(event_time__gt=time_delta)\
                .order_by('id')
            data['log_id'] = db_sentry.event_log.objects.last().id
        else: # Refresh
            event_set = db_sentry.event.objects\
                .filter( id__gt=int(request.POST['event_id']) ).order_by('id')

        if request.POST['filter'] == 'all':
            event_set = event_set.filter(event_time__gt=time_delta)
        elif request.POST['filter'] == 'alarm':
            event_set = event_set.filter(event_time__gt=time_delta, dir_event__group__name='alarm')
        elif request.POST['filter'] == 'object':
            object_id = int(request.POST['object_id'])
            event_set = event_set.filter(object_id=object_id)
            #.filter(event_time__gt=time_delta)

        if event_set.exists():
            data['events'] = []
            for item in event_set:
                object_set = db_security.client_object_.objects.using('security')\
                    .filter(id=item.object_id)[0]
                if object_set:
                    object_id = object_set.id
                    object_num = object_set.order_num
                    object_name = object_set.name
                    event_error = False
                else:
                    event_error = True

                try:
                    wire_description = db_sentry.object_wires.objects\
                        .get(object_id=object_id, dir_event_id=item.dir_event.id).description
                except:
                    wire_description = item.dir_event.description

                data['events'].append({
                    'object_id': object_id,
                    'object_num': object_num,
                    'object_name': object_set.name,
                    'object_address': object_set.get_address(),
                    'event_id': item.id,
                    'event_group': str(item.dir_event.group),
                    'event_time': item.event_time.strftime('%d.%m %H:%M:%S'),
                    'description': wire_description,
                    'error': event_error
                })


        alarm_list = ['alarm','alarm_action']
        alarm_exclude_list = json.loads(request.POST['alarms'])
        alarm_set = db_sentry.event.objects\
            .filter(dir_event__group__name__in=alarm_list)\
            .exclude(id__in=alarm_exclude_list)\
            .order_by('id')

        try:
            if alarm_set.exists():
                data['alarms'] = []
                for item in alarm_set:
                    object_set = db_security.client_object_.objects.using('security')\
                            .filter(id=item.object_id)[:1]
                    if object_set.exists():
                        object_num = object_set[0].order_num
                        object_name = object_set[0].name
                    else:
                        object_num = 'unknown'
                        object_name = 'unknown'

                    try:
                        wire_description = db_sentry.object_wires.objects\
                            .get(object_id=object_id, dir_event_id=item.dir_event.id).description
                    except:
                        wire_description = item.dir_event.description

                    data['alarms'].append({
                            'object_num': object_num,
                            'object_name': object_name,
                            'event_id': item.id,
                            'event_group': str(item.dir_event.group),
                            'event_time': item.event_time.strftime('%H:%M:%S'),
                            'description': wire_description
                        })
        except:
            pass

        if 'log_id' in request.POST: # Logs
            log_set = db_sentry.event_log.objects\
                .filter( id__gt=int(request.POST['log_id']) ).order_by('id')
            if log_set.exists():
                data['logs'] = []
                for item in log_set:
                    data['logs'].append({
                        'log_id': item.id,
                        'object_id': item.object_id,
                        'event_id': item.event_id,
                        'event_group_name': item.dir_event.group.name,
                        'event_description': item.dir_event.description,
                    })

        try:
            if event_set.exists() or log_set.exists():
                data['count_objects'] = count_objects()
        except:
            pass


        data = json.dumps(data, ensure_ascii=False)
        return HttpResponse(data)
    else:
        return render_to_response('404.html', RequestContext(request))


def objects(request):
    if request.user.has_perm('sentry.monitor'):
        object_filter = request.POST['object_filter']
        data = {}
        if request.POST['action'] == 'new':
            #object_list = json.loads(request.POST['objects_list'])

            object_set = db_sentry.object.objects.filter(is_active=1)
            alarm_list = ['alarm','alarm_action']
            if object_filter == 'lock':
                object_set = object_set.filter(status__name='lock')
            elif object_filter == 'unlock':
                object_set = object_set.filter(status__name='unlock')
            elif object_filter in alarm_list:
                object_set = object_set.filter(status__name__in=alarm_list)

            #object_set = db_security.client_object_.objects.using('security').filter(id__in=object_list)
            data['objects'] = []
            for item in object_set:
                db_object = db_security.client_object_.objects.using('security').get(id=item.object_id)
                #data['objects'].append(item.object_id)
                data['objects'].append({
                        'object_id': item.object_id,
                        'status': str(item.status),
                        'order_num': db_object.order_num,
                        'name': db_object.name,
                        #'address': item.get_address()
                })



            #data = [item for item in event_set],

        data = json.dumps(data, ensure_ascii=False)
        return HttpResponse(data)
    else:
        return render_to_response('404.html', RequestContext(request))


def count_objects():
    alarm_list = ['alarm','alarm_action']
    count_objects = {
                'all' : db_sentry.object.objects.filter(is_active=1).count(),
                'lock' : db_sentry.object.objects.filter(is_active=1,status__name='lock').count(),
                'unlock' : db_sentry.object.objects.filter(is_active=1,status__name='unlock').count(),
                'alarm' : db_sentry.object.objects.filter(is_active=1,status__name__in=alarm_list).count()
            }
    return count_objects