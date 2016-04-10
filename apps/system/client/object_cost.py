# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import lunchbox
from apps.system.client.extension import client__form
from apps.system.client.extension import object_cost_ajax




def render(request, client_id=None, object_id=None):
    if request.user.has_perm('system.client'):
        request.session['lunchbox'] = lunchbox.get(request)
        title = 'Абонентская плата'
        dir_cost_type_set = db_sentry.dir_cost_type.objects.filter(is_active=1)
        dir_charge_month = db_sentry.dir_charge_month.objects.filter(is_active=1)
        service_cost_form = client__form.service_cost()
        return render_to_response('sentry/system/client/object_service_cost.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request) )


def ajax(request, action=None):
    data = {'error':None}

    if action=='get_list':
        if request.user.has_perm('system.client'):
            data = object_cost_ajax.get_list(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='get':
        if request.user.has_perm('system.client'):
            data = object_cost_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='cost_null':
        if request.user.has_perm('system.client'):
            data = object_cost_ajax.cost_null(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = object_cost_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = object_cost_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')