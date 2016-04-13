# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.toolset import lunchbox
from apps.toolset.check_inn import check_inn
from apps.system import models as db_sentry
from apps.system.client.extension import client_ajax


def index(request, client_id=None):
    if request.user.has_perm('system.client'):
        request.session['lunchbox'] = lunchbox.get(request)
        position = 'client'
        title = 'Карточка клиента'
        client_set = db_sentry.client.objects.get(id=client_id)
        dir_address_1_region_set = db_sentry.dir_address_1_region.objects.all()
        dir_address_placement_type_set = db_sentry.dir_address_placement_type.objects.all()
        legal_type_set = db_sentry.dir_legal_type.objects.all()
        legal_type_base_set = db_sentry.dir_legal_type_base.objects.all()
        pay_type = ['Банк'.decode('utf-8'),'Касса'.decode('utf-8'),'Взаимозачет'.decode('utf-8'),'Терминал'.decode('utf-8')]

        return render_to_response('system/client/client.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request))


def add(request, client_id=None):
    if request.user.has_perm('system.client'):
        title = 'Новый клиент'
        dir_address_1_region_set = db_sentry.dir_address_1_region.objects.all()
        dir_address_placement_type_set = db_sentry.dir_address_placement_type.objects.all()
        legal_type_set = db_sentry.dir_legal_type.objects.all()
        legal_type_base_set = db_sentry.dir_legal_type_base.objects.all()
        pay_type = ['Банк'.decode('utf-8'),'Касса'.decode('utf-8'),'Взаимозачет'.decode('utf-8'),'Терминал'.decode('utf-8')]

        return render_to_response('system/client/client.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request))


def ajax(request, action=None):
    data = {'error':None}

    if action=='create':
        if request.user.has_perm('system.client'):
            data = client_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = client_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = client_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='check_inn':
        data = check_inn(request.GET['inn'])

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')
