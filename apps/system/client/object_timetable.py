# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import lunchbox
from apps.system.client.extension import object_timetable_ajax


def index(request,client_id=None,object_id=None):
    if request.user.has_perm('system.client'):
        request.session['lunchbox'] = lunchbox.get(request)
        title = 'Режим работы'
        contract_id = db_sentry.client_object_service.objects.filter(contract_id=None,object_id=object_id,is_active=1).first().id
        client_object_set = db_sentry.client_object.objects.get(id=object_id)
        status_list = ['новый','подключен']
        weekday_set = db_sentry.dir_weekday.objects.all()
        object_set = db_sentry.client_object.objects.filter(
            client = client_id,
            status__name__in = status_list,
            is_active = 1 )
        service_set = db_sentry.client_object_service.objects.filter(
            object__client = client_id,
            status__name__in = status_list,
            is_active = 1 )

        return render_to_response('sentry/system/client/object_service_timetable.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request) )


def ajax(request,action=None):
    data = {'error':None}

    if action=='get':
        if request.user.has_perm('system.client'):
            data = object_timetable_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = object_timetable_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')