# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from apps.cabinet import authorize_permissions

from apps.system.directory.extension import dir_device_console_ajax


def index(request):

    # For debugging
    from apps.cabinet import authorize_permissions

    request.session['permissions'] = authorize_permissions.get_all_permissions_list(request)

    if request.user.has_perm('system.client'):
        title = 'Список пультов'
        #device_console_set = db_sentry.dir_device_console.objects.filter(is_active=1)
        return render_to_response('system/directory/dir_device_console.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error':None}

    if action == 'search':
        if request.user.has_perm('system.client'):
            data = dir_device_console_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'create':
        if request.user.has_perm('system.client'):
            data = dir_device_console_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'update':
        if request.user.has_perm('system.client'):
            data = dir_device_console_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'delete':
        if request.user.has_perm('system.client'):
            data = dir_device_console_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'


    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')