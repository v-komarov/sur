# -*- coding: utf-8 -*-

import datetime
import time
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry


def index(request, client_id=None):
    if 'socket' in request.GET:
        try:
            event_id = db_sentry.dir_code.objects.get(code=request.GET['alarm']).dir_event_id
        except:
            event_id = 3

        date = datetime.datetime.now() - datetime.timedelta(minutes=1)#seconds=10)
        order_num = string_int(request.GET['txwzid'])

        db_object = db_security.client_object_.objects.using('security').filter(order_num=order_num,visible=1)
        # Есть ли объект с таким order_num
        if db_object.exists():
            # Нет ли такого же события, с разницей по времени datetime
            if not db_sentry.event.objects.filter(
                    object_id = db_object[0].id,
                    dir_event_id = event_id,
                    event_time__gte=date
                ).exists():

                try:
                    event = db_sentry.event.objects.create(
                        object_id = db_object[0].id,
                        dir_event_id = event_id,
                        #order_num = string_int(request.GET['txwzid']),
                    )
                    db_sentry.object.objects.filter(object_id=db_object[0].id)\
                        .update(status = event.dir_event.group.id)
                    answer = date.strftime("%d.%m.%Y %H:%M:%S")
                except:
                    answer = 'order_num: '+str(order_num)+', object_id: '+str(db_object[0].id)

            else:
                answer = 'already have'
        else:
            answer = 'no object'

        return HttpResponse(answer)


def string_int(string=None):
    out = ''
    for item in string:
        try:
            out += str(int(item))
        except:
            break

    return int(float(out))