# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.toolset import lunchbox
from apps.system.directory.extension import dir_bonus_ajax


def index(request):
    request.session['lunchbox'] = lunchbox.get(request)

    if request.user.has_perm('system.client'):
        title = 'Бонусы'
        return render_to_response('sentry/system/directory/dir_bonus.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error':None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = dir_bonus_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    if action=='get':
        if request.user.has_perm('system.client'):
            data = dir_bonus_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='create':
        if request.user.has_perm('system.client'):
            data = dir_bonus_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = dir_bonus_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = dir_bonus_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'


    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')


