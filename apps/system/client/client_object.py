# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system.client.extension import client__form
from apps.system import models as db_sentry
from apps.toolset import lunchbox
from apps.system.client.extension import client_contract_ajax
from apps.system.client.extension import client_object_ajax
from apps.system.client.extension import client_workflow_ajax


def index(request, client_id=None, object_id=None):
    request.session['lunchbox'] = lunchbox.get(request)

    if (not object_id and request.user.has_perm('system.client_object')) \
            or (object_id and request.user.has_perm('system.client_object')):

        client_set = db_sentry.client.objects.get(id=client_id)
        if object_id:
            title = 'Карточка объекта'
            position = 'client_object'
            contract_set = db_sentry.client_contract.objects.filter(object__id=object_id).first()
        else:
            title = 'Новый объект'
            position = 'client_object_add' # not use
        dir_task_type_set = db_sentry.dir_task_type.objects.all()
        dir_address_1_region_set = db_sentry.dir_address_1_region.objects.all()
        dir_address_placement_type_set = db_sentry.dir_address_placement_type.objects.all()
        dir_device_console_set = db_sentry.dir_device_console.objects.filter(is_active=1)
        dir_device_type_set = db_sentry.dir_device_type.objects.filter(is_active=1)
        dir_referer_type_set = db_sentry.dir_referer_type.objects.filter(is_active=1)
        dir_object_status_set = db_sentry.dir_object_status.objects.all()
        dir_tag_set = db_sentry.dir_tag.objects.filter(is_active=1)
        dir_charge_month_set = db_sentry.dir_charge_month.objects.filter(is_active=1)
        dir_cost_type_set = db_sentry.dir_cost_type.objects.filter(is_active=1)
        dir_service_organization_set = db_sentry.dir_service_organization.objects.filter(is_active=1)
        dir_security_squad_set = db_sentry.dir_security_squad.objects.filter(is_active=1)
        dir_service_type_set = db_sentry.dir_service_type.objects.filter(is_active=1)
        dir_service_subtype_set = db_sentry.dir_service_subtype.objects.filter(is_active=1)

        return render_to_response('system/client/contract/contract.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request))


def ajax(request, action=None):
    data = {}

    if action == 'get':
        if request.user.has_perm('system.client'):
            data = client_object_ajax.get(request=request)
        else: data['errors'] = {'Доступ': 'запрещен'}

    elif action == 'update':
        if request.user.has_perm('system.client'):
            data = client_object_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'delete':
        if request.user.has_perm('system.client'):
            data = client_object_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'archive':
        if request.user.has_perm('system.client'):
            data = client_contract_ajax.archive(request,data)
        else: data['error'] = 'Доступ запрещен'


    elif action == 'search_archive':
        if request.user.has_perm('system.client'):
            data = client_object_ajax.search_archive(request,data)
        else: data['error'] = 'Доступ запрещен'


    elif action == 'event_get':
        if request.user.has_perm('system.client'):
            data = client_workflow_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'event_update':
        if request.user.has_perm('system.client'):
            data = client_workflow_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'event_delete':
        if request.user.has_perm('system.client'):
            data = client_workflow_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    else:
        data['error'] = 'No function'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')