# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response


from apps.system import models as db_sentry


def index(request, client_id=None):
    if request.user.has_perm('sentry.objects'):
        title = 'Список объектов'
        objects_set = db_sentry.object.objects.filter(is_active=1)

        objects_list = []
        for item in objects_set:
            object_sur = db_security.client_object_.objects.using('security').get(id=item.object_id)
            objects_list.append({
                'id': object_sur.id,
                'name': object_sur.name,
                'order_num': object_sur.order_num
            })


        dir_event_set = db_sentry.dir_event.objects.filter(group__name="alarm")

        return render_to_response('monitor/config/objects.html', locals(), RequestContext(request))
    else:
        return render_to_response('404.html', RequestContext(request))

def save_wires(request):
    if request.user.has_perm('sentry.objects') and 'wires' in request.POST:
        data = {}
        object_id = int(request.POST['object_id'])
        db_sentry.object_wires.objects.filter(object_id=object_id).delete()
        for item in json.loads(request.POST['wires']):
            try:
                objects_set = db_sentry.object_wires.objects.create(
                    object_id = object_id,
                    dir_event_id = int(item['dir_event_id']),
                    description = item['description']
                )
            except:
                data['error'] = 'error'
        data['answer'] = 'done'
        data = json.dumps(data, ensure_ascii=False)
        return HttpResponse(data)
    else:
        return render_to_response('404.html', RequestContext(request))
