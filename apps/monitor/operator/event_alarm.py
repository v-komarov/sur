# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from sentry.models import db_security, db_sentry
import event_log, refresh

def index(request):
    if request.user.has_perm('monitor.monitor'):
        user_id = request.user.id
        data = {}
        if 'action' in request.GET:
            if request.GET['action'] == 'gbr_started':
                event = db_sentry.event.objects.get( id=int(request.GET['event_id']) )
                action = db_sentry.event_action.objects\
                    .create(
                        gbr_started_id=int(request.GET['gbr_started_id']),
                        gbr_started_time = datetime.datetime.now(),
                        reason_id = event.dir_event.id
                    )
                event.action_id = action.id
                previous_dir_event_id = event.dir_event_id
                event.dir_event_id = 4 #ГБР в пути
                event.save()

                event = db_sentry.event.objects.get( id=int(request.GET['event_id']) )
                data['object_id'] = event.object_id
                data['description'] = event.dir_event.description
                data['gbr_started_id'] = event.action.gbr_started_id
                data['gbr_started_name'] = db_security.dir_security_group_.objects.using('security').filter(id=event.action.gbr_started_id)[0].name
                data['gbr_started_time'] = event.action.gbr_started_time.strftime("%H:%M:%S")

                data['log_id'] = event_log.create(event.object_id, event.id, previous_dir_event_id, event.dir_event_id, user_id)


            elif request.GET['action'] == 'gbr_arrived':
                event = db_sentry.event.objects.get( id=int(request.GET['event_id']) )
                previous_dir_event_id = event.dir_event_id
                event.dir_event_id = 5 #ГБР прибыл
                event.save()
                action = db_sentry.event_action.objects.get( id=event.action_id )
                action.gbr_arrived_id = int(request.GET['gbr_arrived_id'])
                action.gbr_arrived_time = datetime.datetime.now()
                action.gbr_arrived_seconds = (datetime.datetime.now() - action.gbr_started_time).total_seconds()
                action.save()

                event = db_sentry.event.objects.get( id=int(request.GET['event_id']) )
                data['object_id'] = event.object_id
                data['description'] = event.dir_event.description
                data['gbr_arrived_id'] = event.action.gbr_arrived_id
                data['gbr_arrived_name'] = db_security.dir_security_group_.objects.using('security').filter(id=event.action.gbr_arrived_id)[0].name
                data['gbr_arrived_time'] = event.action.gbr_arrived_time.strftime("%H:%M:%S")+' ('+event.action.get_delta_time()+')'

                data['log_id'] = event_log.create(event.object_id, event.id, previous_dir_event_id, event.dir_event_id, user_id)


            elif request.GET['action'] == 'alarm_report':
                event = db_sentry.event.objects.get( id=int(request.GET['event_id']) )
                previous_dir_event_id = event.dir_event_id
                event.dir_event_id = 6 #Отработанная тревога
                event.save()
                action = db_sentry.event_action.objects.get( id=event.action_id )
                action.report_id = int(request.GET['alarm_report_id'])
                action.save()

                event = db_sentry.event.objects.get( id=int(request.GET['event_id']) )
                data['object_id'] = event.object_id
                data['description'] = event.dir_event.description
                data['alarm_report_name'] = event.action.report.name

                data['log_id'] = event_log.create(event.object_id, event.id, previous_dir_event_id, event.dir_event_id, user_id)

            elif request.GET['action'] == 'alarm_cancel':
                event = db_sentry.event.objects.get( id=int(request.GET['event_id']) )
                event_cancel = db_sentry.event_cancel.objects.create(reason_id = event.dir_event.id)
                previous_dir_event_id = event.dir_event_id
                event.dir_event_id = 7 #Отменено оператором
                event.cancel_id = int(event_cancel.id)
                event.save()

                event = db_sentry.event.objects.get( id=int(request.GET['event_id']) )
                data['object_id'] = event.object_id
                data['description'] = event.dir_event.description
                data['alarm_report_name'] = event.dir_event.name

                data['log_id'] = event_log.create(event.object_id, event.id, previous_dir_event_id, event.dir_event_id, user_id)


            db_sentry.object.objects.filter( object_id=event.object_id )\
                .update(status = event.dir_event.group.id)

        data = json.dumps(data, ensure_ascii=False)
        return HttpResponse(data)
