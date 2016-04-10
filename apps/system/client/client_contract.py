# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.task import models as task_models
from apps.system.client.extension import client_contract_ajax
from apps.system.client.extension import client_object_ajax
from apps.system.client.extension import client_workflow_ajax
from apps.toolset import lunchbox


def index(request, client_id=None, contract_id=None):
    request.session['lunchbox'] = lunchbox.get(request)

    if (not contract_id and request.user.has_perm('system.client')) \
            or (contract_id and request.user.has_perm('system.client')):

        client = db_sentry.client.objects.get(id=client_id)
        if contract_id:
            title = 'Карточка договора'
            position = 'client_contract'
            contract = db_sentry.client_contract.objects.get(id=contract_id)
        else:
            title = 'Новый договор'
            position = 'client_contract_add'
        dir_task_type_set = task_models.task_type.objects.all()
        dir_address_1_region_set = db_sentry.dir_address_1_region.objects.all()
        dir_address_placement_type_set = db_sentry.dir_address_placement_type.objects.all()
        dir_device_console_set = db_sentry.dir_device_console.objects.filter(is_active=1)
        dir_device_type_set = db_sentry.dir_device_type.objects.filter(is_active=1)
        dir_referer_type_set = db_sentry.dir_referer_type.objects.filter(is_active=1)
        dir_object_status_set = db_sentry.dir_object_status.objects.all()
        dir_bonus_set = db_sentry.dir_client_workflow_type.objects.filter(type='bonus',is_active=1)
        dir_tag_set = db_sentry.dir_tag.objects.filter(is_active=1)
        dir_charge_month_set = db_sentry.dir_charge_month.objects.filter(is_active=1)
        dir_cost_type_set = db_sentry.dir_cost_type.objects.filter(is_active=1)
        dir_service_organization_set = db_sentry.dir_service_organization.objects.filter(is_active=1)
        dir_security_squad_set = db_sentry.dir_security_squad.objects.filter(is_active=1)
        dir_service_type_set = db_sentry.dir_service_type.objects.filter(is_active=1)
        dir_service_subtype_set = db_sentry.dir_service_subtype.objects.filter(is_active=1)

        return render_to_response('sentry/system/client/contract/contract.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request))


def list(request, client_id=None):
    request.session['lunchbox'] = lunchbox.get(request)
    if request.user.has_perm('system.client'):
        title = 'Список договоров'
        client_set = db_sentry.client.objects.get(id=client_id)
        return render_to_response('sentry/system/client/contract/contract_list.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request))


def ajax(request, action=None):
    data = {'error': None}

    if action=='get':
        if request.user.has_perm('system.client'):
            data = client_contract_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='add':
        if request.user.has_perm('system.client'):
            data = client_contract_ajax.add(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = client_contract_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = client_contract_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'



    elif action=='get_contract_interval':
        if request.user.has_perm('system.client'):
            data = client_contract_ajax.get_contract_interval(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='event_get':
        if request.user.has_perm('system.client'):
            data = client_workflow_ajax.event_get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='event_update':
        if request.user.has_perm('system.client'):
            data = client_workflow_ajax.event_update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='event_delete':
        if request.user.has_perm('system.client'):
            data = client_workflow_ajax.event_delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='event_list_update':
        if request.user.has_perm('system.client'):
            data = client_workflow_ajax.event_list_update(request,data)
        else: data['error'] = 'Доступ запрещен'



    else: data['error'] = 'No function'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')