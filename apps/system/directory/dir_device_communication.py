# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from apps.cabinet import authorize_permissions

from apps.system import models as db_sentry
from apps.system.directory.extension import dir_device_communication_ajax


def index(request):
    if request.user.has_perm('system.client'):
        title = 'Каналы связи'
        device_communication_type_set = db_sentry.dir_device_communication_type.objects.filter(is_active=1)
        return render_to_response('sentry/system/directory/dir_device_communication.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error':None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = dir_device_communication_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='get':
        if request.user.has_perm('system.client'):
            data = dir_device_communication_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = dir_device_communication_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = dir_device_communication_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'


    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')