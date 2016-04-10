# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system.setting.extension import search_ajax


def index(request):
    if request.user.has_perm('system.client'):
        title = 'Поиск'

        return render_to_response('sentry/system/setting/search.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request) )


def ajax(request,action=None):
    data = {'error':None}

    if action=='get':
        if request.user.has_perm('system.client'):
            data = search_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = search_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    else:
        data['error'] = 'no function'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')