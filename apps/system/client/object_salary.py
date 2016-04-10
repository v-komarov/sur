# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import lunchbox
from apps.system.client.extension import client__form
from apps.system.client.extension import object_salary_ajax


def index(request, client_id=None, object_id=None):
    if request.user.has_perm('system.client'):
        request.session['lunchbox'] = lunchbox.get(request)
        title = 'Плата сотрудникам'
        contract_id = db_sentry.client_object_service.objects.filter(contract_id=None,object_id=object_id,is_active=1).first().id
        salary_type = ['невооруженный'.decode('utf-8'),'вооруженный'.decode('utf-8')]
        service_set = db_sentry.client_object_service.objects.filter(object=object_id, is_active=1).order_by('name')
        object_name = db_sentry.client_object.objects.get(id=object_id).name
        service_salary_list = []
        for service in service_set:
            try:
                service_salary_set = db_sentry.client_object_service_salary.objects \
                    .filter(service=service.id, is_active=1)[0]
                service_salary_list.append({
                    'service_id': service.id,
                    'service_name': service.name,
                    'service_salary_id': service_salary_set.id,
                    'salary': service_salary_set.salary,
                    'begin_date': service_salary_set.begin_date,
                    'salary_type': service_salary_set.salary_type
                })
            except:
                service_salary_list.append({
                    'service_id': service.id,
                    'service_name': service.name,
                    'service_salary_id': None,
                    'salary': 'нет'
                })

        object_set = db_sentry.client_object.objects.get(id=object_id)
        form = client__form.service_salary()

        return render_to_response('sentry/system/client/object_salary.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request) )


def ajax(request,action=None):
    data = {'error':None}

    if action=='get':
        if request.user.has_perm('system.client'):
            data = object_salary_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = object_salary_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')