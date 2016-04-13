# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.toolset import lunchbox
from apps.system.directory.extension import dir_bank_ajax


def index(request):
    if request.user.has_perm('system.client'):
        request.session['lunchbox'] = lunchbox.get(request)
        title = 'Справочник банков'
        return render_to_response('system/directory/dir_bank.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )



def ajax(request, action):
    data = {'error': None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = dir_bank_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    if action=='create':
        if request.user.has_perm('system.client'):
            data = dir_bank_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = dir_bank_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = dir_bank_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')


