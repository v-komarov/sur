# -*- coding: utf-8 -*-

import json
import datetime

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.task import models as task_models
from apps.task.extension import task_ajax


def index(request):
    if request.user.has_perm('system.client'):
        title = 'Заявки'
        today = datetime.datetime.today().strftime("%d.%m.%Y")
        month_begin = datetime.datetime.today().replace(day=1).strftime("%d.%m.%Y")
        post_list = [1,2,3,7,8,9,36]
        sentry_user_set = db_sentry.sentry_user.objects \
            .filter(post__in=post_list, is_active=1) \
            .values('id','full_name','post')
        task_type_set = task_models.task_type.objects.all()
        task_status_set = task_models.task_status.objects.filter(is_active=1)
        dir_locality_set = db_sentry.dir_address_2_locality.objects.all()
        dir_security_squad_set = db_sentry.dir_security_squad.objects.filter(is_active=1)
        dir_security_squad_set = db_sentry.dir_security_squad.objects.filter(is_active=1)

        return render_to_response('task/task.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def add(request):
    if request.user.has_perm('system.client'):
        title = 'Новая заявка'
        task_type_set = task_models.task_type.objects.all()
        return render_to_response('task/task_add.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error':None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = task_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='get':
        if request.user.has_perm('system.client'):
            data = task_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='create':
        if request.user.has_perm('system.client'):
            data = task_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = task_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = task_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='get_report':
        if request.user.has_perm('system.client'):
            data = task_ajax.get_report(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='create_report':
        if request.user.has_perm('system.client'):
            data = task_ajax.create_report(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete_report':
        if request.user.has_perm('system.client'):
            data = task_ajax.delete_report(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='get_log':
        if request.user.has_perm('system.client'):
            data = task_ajax.get_log(request,data)
        else: data['error'] = 'Доступ запрещен'
    elif action=='change_complete_date':
        if request.user.has_perm('system.client'):
            data = task_ajax.change_complete_date(request,data)
        else: data['error'] = 'Доступ запрещен'
    elif action=='delete_log':
        if request.user.has_perm('system.client'):
            data = task_ajax.delete_log(request,data)
        else: data['error'] = 'Доступ запрещен'

    else:
        data['error'] = 'No function'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')


def search(request):
    if request.user.has_perm('system.client'):
        title = 'Поиск заявок'
        post_list = [1,2,3,7,8,9,36]
        users_set = db_sentry.sentry_user.objects \
            .filter(post__in=post_list, is_active=1) \
            .values('id','full_name','post')
        locality_set = db_sentry.dir_address_2_locality.objects.all()

        return render_to_response('task/task_search.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )