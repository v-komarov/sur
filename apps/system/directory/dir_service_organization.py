# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.toolset import lunchbox
from apps.system import models as db_sentry
from apps.system.directory.extension import dir_service_organization_ajax


def index(request):
    request.session['lunchbox'] = lunchbox.get(request)

    if request.user.has_perm('system.client'):
        title = 'Список организаций'
        post_list = ['Руководитель','Администратор']
        director_set = db_sentry.sentry_user.objects.filter(post__name__in=post_list, is_active=1)
        return render_to_response('system/directory/dir_service_organization.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error':None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = dir_service_organization_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    if action=='get':
        if request.user.has_perm('system.client'):
            data = dir_service_organization_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='create':
        if request.user.has_perm('system.client'):
            data = dir_service_organization_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = dir_service_organization_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = dir_service_organization_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'


    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')


