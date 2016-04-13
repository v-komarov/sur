# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.system.client.extension import client_requisite_ajax, client__form


def index(request,client_id=None):
    if request.user.has_perm('system.client'):

        title = 'Реквизиты'
        client_set = db_sentry.client.objects.get(id=client_id)
        form = client__form.Client_requisite(instance=client_set)

        return render_to_response('system/client/client_requisite.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,client_id=None,action=None):
    data = {'error': None}

    if action=='get':
        if request.user.has_perm('system.client'):
            data = client_requisite_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = client_requisite_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')