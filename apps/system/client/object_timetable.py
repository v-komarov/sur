# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import lunchbox
from apps.system.client.extension import object_timetable_ajax


def index(request, client_id=None, contract_id=None):
    if request.user.has_perm('system.client'):
        title = 'Режим работы'
        status_list = ['новый', 'подключен']
        contract_set = db_sentry.client_contract.objects.filter(client_id=client_id, is_active=1)
        bind_set = db_sentry.client_bind.objects.filter(client_contract=contract_id, is_active = 1)
        weekday_set = db_sentry.dir_weekday.objects.all()

        return render_to_response('system/client/object_timetable.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action=None):
    data = {'error':None}

    if action == 'get':
        if request.user.has_perm('system.client'):
            data = object_timetable_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'update':
        if request.user.has_perm('system.client'):
            data = object_timetable_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')