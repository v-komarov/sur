# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from django.contrib.auth.models import Group, Permission
from apps.system import models as db_sentry
from apps.system.sentry_user.extension import permission_ajax


def index(request, client_id=None):
    if request.user.has_perm('system.client'):
        title = 'Права доступа'
        return render_to_response('system/sentry_user/permission.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action=None):
    data = {'error': None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = permission_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = permission_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='parse':
        if request.user.has_perm('system.client'):
            data = permission_ajax.parse(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')