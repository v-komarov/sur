# -*- coding: utf-8 -*-

import datetime
import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.toolset import lunchbox
from apps.system import models as db_sentry
from apps.system.client.extension import client_charge_ajax
from apps.system.client.extension import client_charge_recharge


def index(request, client_id=None):
    request.session['lunchbox'] = lunchbox.get(request)

    if request.user.has_perm('system.client'):
        title = 'Начисления'
        status_list = ['новый', 'подключен', 'договор зарегистрирован']
        client = db_sentry.client.objects.get(id=client_id)
        object = db_sentry.client_object.objects.filter(
            client_contract__client_id = client.id,
            #status__name__in = status_list,
            is_active = 1
        )
        years_list = [datetime.date.today().year]

        return render_to_response('system/client/client_charge.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request))



def ajax(request,action=None):
    data = {'error': None}

    if action == 'get':
        if request.user.has_perm('system.client'):
            data = client_charge_ajax.get(request, data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'update':
        if request.user.has_perm('system.client'):
            data = client_charge_ajax.update(request, data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'recharge':
        if request.user.has_perm('system.client'):
            data = client_charge_recharge.re(request, data, int(request.POST['client_id']))
        else: data['error'] = 'Доступ запрещен'

    elif action == 'delete':
        if request.user.has_perm('system.client'):
            data = client_charge_ajax.delete(request, data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')


