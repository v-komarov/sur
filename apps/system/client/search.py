# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import lunchbox
from apps.system.client.extension import search_ajax


def index(request, status='wait'):
    if request.user.has_perm('system.client'):
        request.session['lunchbox'] = lunchbox.get(request)
        title = 'Поиск'
        dir_address_1_region_set = db_sentry.dir_address_1_region.objects.all()
        dir_address_placement_type_set = db_sentry.dir_address_placement_type.objects.all()
        object_status_set = db_sentry.dir_object_status.objects.filter(is_active=1)
        cost_type_set = db_sentry.dir_cost_type.objects.filter(is_active=1)
        legal_type_set = db_sentry.dir_legal_type.objects.all()
        device_console_set = db_sentry.dir_device_console.objects.filter(is_active=1)
        device_type_set = db_sentry.dir_device_type.objects.filter(is_active=1)
        service_organization_set = db_sentry.dir_service_organization.objects.filter(is_active=1)
        security_squad_set = db_sentry.dir_security_squad.objects.filter(is_active=1)
        service_type_set = db_sentry.dir_service_type.objects.all()
        service_subtype_set = db_sentry.dir_service_subtype.objects.filter(is_active=1)
        holding_set = db_sentry.dir_holding.objects.filter(is_active=1)

        return render_to_response('sentry/system/client/search.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/cabinet/login.html', RequestContext(request))


def ajax(request, action=None):
    data = {'error': None}
    if action == 'search':
        if request.user.has_perm('system.client'):
            data = search_ajax.search(request, data)
            '''
            if 'search_object' in request.GET:
                data = search_ajax.search_object(request,data)
            else:
                data = search_ajax.search_service(request,data)
            '''

        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')

