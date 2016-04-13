# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import lunchbox
from apps.system.client.extension import object_incident_ajax


def index(request, client_id=None, contract_id=None):
    if request.user.has_perm('system.client'):
        request.session['lunchbox'] = lunchbox.get(request)
        title = 'Происшествия на объекте'
        #contract_id = db_sentry.client_object_service.objects.filter(contract_id=None,object_id=object_id,is_active=1).first().id
        client_object_set = db_sentry.client_object.objects.filter(client_contract=contract_id)
        incident_set = db_sentry.client_object_incident.objects.filter(object__client_contract=contract_id, is_active=1)
        incident_type_set = db_sentry.dir_incident_type.objects.filter(is_active=1)
        return render_to_response('system/client/object_incident.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action=None):
    data = {'error':None}

    if action=='get':
        if request.user.has_perm('system.client'):
            data = object_incident_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = object_incident_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = object_incident_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')