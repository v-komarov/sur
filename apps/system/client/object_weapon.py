# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import lunchbox
from apps.system.client.extension import object_weapon_ajax


def index(request, client_id=None, object_id=None):
    if request.user.has_perm('system.client'):
        request.session['lunchbox'] = lunchbox.get(request)
        title = "Оружие на объекте"
        contract_id = db_sentry.client_object_service.objects.filter(contract_id=None,object_id=object_id,is_active=1).first().id
        status_list = ['новый','подключен']
        client_name = db_sentry.client.objects.get(id=client_id).name
        objects_set = db_sentry.client_object.objects.filter(id=object_id,is_active=1)
        service_set = db_sentry.client_object_service.objects.filter(
            object__client = client_id,
            status__name__in = status_list,
            is_active = 1 )

        return render_to_response('system/client/object_weapon.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request))


def ajax(request,action=None):
    data = {'error':None}

    if action=='get':
        if request.user.has_perm('system.client'):
            data = object_weapon_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = object_weapon_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = object_weapon_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')