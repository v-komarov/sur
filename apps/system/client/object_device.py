# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.system.client.extension import object_device_ajax
from apps.system.directory.extension import dir_device_ajax
from apps.toolset import lunchbox
from apps.system.client.extension import object_device_ajax
from apps.system.directory.extension import dir_device_ajax


def index(request,client_id=None,object_id=None):
    if request.user.has_perm('system.client'):
        request.session['lunchbox'] = lunchbox.get(request)
        title = 'Объектовые устройства'
        return render_to_response('system/client/object_device.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request))


def ajax(request,action=None):
    data = {'error': None}

    if action == 'get_install':
        if request.user.has_perm('system.client'):
            data = object_device_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'install_update':
        if request.user.has_perm('system.client'):
            data = object_device_ajax.install_update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'install_delete':
        if request.user.has_perm('system.client'):
            data = object_device_ajax.install_delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'search_device':
        if request.user.has_perm('system.client'):
            data = dir_device_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'get_device':
        if request.user.has_perm('system.client'):
            data = dir_device_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'update_device':
        if request.user.has_perm('system.client'):
            data = dir_device_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'delete_device':
        if request.user.has_perm('system.client'):
            data = dir_device_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    else:
        data['error'] = 'No function'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')