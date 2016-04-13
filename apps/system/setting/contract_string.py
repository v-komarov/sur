# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry


def index(request):
    if request.user.has_perm('system.client'):
        title = 'Нумерация договоров'
        return render_to_response('system/setting/contract_string.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request))


def ajax(request,action=None):
    data = {'error':None}

    if action=='get':
        if request.user.has_perm('system.client'):
            data['contract_string'] = db_sentry.setting_general.objects.get(user=None).contract_string
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            db_sentry.setting_general.objects.filter(user=None)\
                .update(contract_string=request.POST['contract_string'])
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')