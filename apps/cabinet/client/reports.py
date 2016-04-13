# -*- coding: utf-8 -*-

import datetime
import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry_log
#from apps.parse import models as db_security
from apps.cabinet import access


'''
def report(request, object_id=None, period=1):
    title = 'Отчеты'
    client_id = access.get_client_id(request)
    if client_id and request.user.has_perm('cabinet.client_reports'):
        period = int(period)
        today = datetime.date.today()
        month_prev = datetime.date(today.year, today.month-1, 1)

        if 'daterange' in request.GET:
            get_start = request.GET['start']
            get_stop = request.GET['stop']
            date_start = datetime.date( int(get_start[6:10]) ,int(get_start[3:5]), int(get_start[:2]) )
            date_stop = datetime.date( int(get_stop[6:10]) ,int(get_stop[3:5]), int(get_stop[:2])+1 )
        elif period==1:
            date_start = today - datetime.timedelta(days=today.weekday())
            date_stop = date_start + datetime.timedelta(days=7)
        elif period==2:
            date_start = today - datetime.timedelta(days=today.weekday()) - datetime.timedelta(days=7)
            date_stop = date_start + datetime.timedelta(days=7)
        elif period==3:
            date_start = datetime.date(today.year, today.month, 1)
            date_stop = datetime.date(date_start.year, date_start.month+1, 1)
        elif period==4:
            date_start = datetime.date(today.year, today.month-1, 1)
            date_stop = datetime.date(date_start.year, date_start.month+1, 1)

        # исключаем 'посты' security_type=4
        objects_set = db_security.client_object_.objects.using('security')\
                .filter(client=client_id, status='подключен')\
                .exclude(security_type=4)\
                .values('id','name','order_num',
                        'security_company__name','security_type__name','security_subtype__name')\
                .order_by('order_num')

        if object_id:
            object_id = int(object_id)
        elif objects_set.exists():
            object_id = objects_set[0]['id']

        if object_id:
            object_info = db_security.client_object_.objects.using('security')\
                .filter(id=object_id, status='подключен')\
                .values('id','name','order_num','status','month_pay',
                        'client_id','client__name',
                        'security_type__name','security_subtype__name','security_company__name',
                        'locality__name','street__name','building')

            if object_info.exists() and object_info[0]['order_num'].isdigit() and client_id == object_info[0]['client_id']:
                object_report = db_sentry_log.logs.objects.using('sentry_log')\
                    .filter(object_id=object_info[0]['order_num'], date_event__range=(date_start, date_stop))\
                    .values('date_event','key','event')

        if 'daterange' in request.GET:
            list = []
            for item in object_report:
                list.append({
                    'date_event': item['date_event'].strftime("%d.%m.%Y %H:%M:%S"),
                    'key': item['key'],
                    'event': item['event']
                })
            data = json.dumps(list, ensure_ascii=False)
            return HttpResponse(data)

        else:
            return render_to_response('cabinet/client/reports.html', locals(), RequestContext(request) )

    return render_to_response('404.html', RequestContext(request) )
'''