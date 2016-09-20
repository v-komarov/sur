# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.contrib.auth.models import Group, Permission
from apps.system import models as db_sentry
from apps.system.sentry_user.extension import sentry_user_group_ajax


def index(request,client_id=None):
    title = 'Группы пользователей'
    if request.user.has_perm('system.client'):
        groups_set = Group.objects.all().order_by('name')

        return render_to_response('system/sentry_user/sentry_user_group.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action=None):
    data = {'error':None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = sentry_user_group_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='get_permission':
        if request.user.has_perm('system.client'):
            data = sentry_user_group_ajax.get_permission(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='create':
        if request.user.has_perm('system.client'):
            data = sentry_user_group_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = sentry_user_group_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update_permission':
        if request.user.has_perm('system.client'):
            data = sentry_user_group_ajax.update_permission(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = sentry_user_group_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')