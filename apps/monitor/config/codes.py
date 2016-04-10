# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry


def index(request, client_id=None):
    if request.user.has_perm('sentry.objects'):
        title = 'Список кодов'
        codes_set = db_sentry.dir_code.objects.all()
        group_set = db_sentry.dir_event_group.objects.all()
        dir_event_set = db_sentry.dir_event.objects.all()

        return render_to_response('monitor/config/codes.html', locals(), RequestContext(request))
    else:
        return render_to_response('404.html', RequestContext(request))

def save(request):
    if request.user.has_perm('sentry.objects'):
        data = {}
        dir_event_id = int(request.POST['dir_event_id'])
        if request.POST['code_id'] == 'new':
            data['code_id'] = db_sentry.dir_code.objects.create(
                    code = request.POST['code'],
                    dir_event_id = int(request.POST['dir_event_id'])
                ).id
        else:
            codes_set = db_sentry.dir_code.objects.get(id=int(request.POST['code_id']))
            if dir_event_id == 0:
                codes_set.delete()
                data['code_id'] = 'deleted'
            else:
                codes_set.code = request.POST['code']
                codes_set.dir_event_id = dir_event_id
                codes_set.save()
                data['code_id'] = codes_set.id
        data = json.dumps(data, ensure_ascii=False)
        return HttpResponse(data)

    else:
        return render_to_response('404.html', RequestContext(request))
