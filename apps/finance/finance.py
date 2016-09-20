# -*- coding: utf-8 -*-

import json
import datetime

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.finance.extension import finance_ajax


def balance(request):
    if request.user.has_perm('system.client'):
        title = 'Фильтр финансов'
        today = datetime.datetime.now().strftime("%d.%m.%Y")
        month_day = datetime.datetime.now().replace(day=1).strftime("%d.%m.%Y")
        holding_set = db_sentry.dir_holding.objects.all()
        client_set = db_sentry.client.objects.all()
        service_organization_set = db_sentry.dir_service_organization.objects.filter(is_active=1)
        dir_locality_set = db_sentry.dir_address_2_locality.objects.all()
        dir_service_type_set = db_sentry.dir_service_type.objects.all()
        return render_to_response('system/finance/balance.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def bonus(request):
    if request.user.has_perm('system.client'):
        title = 'Бонусы'
        today = datetime.datetime.now().strftime("%d.%m.%Y")
        month_day = datetime.datetime.now().replace(day=1).strftime("%d.%m.%Y")
        bonus_type_set = db_sentry.dir_client_workflow_type.objects.filter(type='bonus',is_active=1)
        return render_to_response('system/finance/bonus.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def export(request):
    if request.user.has_perm('system.client'):
        title = 'Экспорт'
        today = datetime.datetime.now().strftime("%d.%m.%Y")
        month_day = datetime.datetime.now().replace(day=1).strftime("%d.%m.%Y")
        security_company_set = db_sentry.dir_service_organization.objects.filter(is_active=1)
        return render_to_response('system/finance/export.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request, action):
    data = {}

    if action == 'balance':
        if request.user.has_perm('system.client'):
            data = finance_ajax.balance(request,data)
        else:
            data['errors'] = {'access': 'Доступ запрещен'}

    elif action == 'bonus':
        if request.user.has_perm('system.client'):
            data = finance_ajax.bonus(request,data)
        else:
            data['errors'] = {'access': 'Доступ запрещен'}

    elif action == 'bonus_click':
        if request.user.has_perm('system.client'):
            data = finance_ajax.bonus_click(request,data)
        else:
            data['errors'] = {'access': 'Доступ запрещен'}

    elif action == 'export_post':
        if request.user.has_perm('system.client'):
            data = finance_ajax.export_post(request,data)
        else:
            data['errors'] = {'access': 'Доступ запрещен'}

    else:
        data['error'] = 'No function'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')


