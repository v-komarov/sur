# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.system.directory.extension import dir_console_interval_ajax


def index(request, client_id=None):
    if request.user.has_perm('system.client'):
        title = 'Интервалы пультовых номеров'
        service_organization_set = db_sentry.dir_service_organization.objects.filter(is_active=1)
        device_console_set = db_sentry.dir_device_console.objects.filter(is_active=1)
        return render_to_response('system/directory/dir_console_interval.html', locals(), RequestContext(request))

    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error': None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = dir_console_interval_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='console_interval_list':
        if request.user.has_perm('system.client'):
            data = dir_console_interval_ajax.console_interval_list(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='create':
        if request.user.has_perm('system.client'):
            data = dir_console_interval_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = dir_console_interval_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = dir_console_interval_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'


    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')