# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.system.client.extension import client__form
from apps.system.client.extension import client_user_ajax
from apps.toolset import lunchbox


def index(request, client_id=None, contract_id=None):

    access = False
    client = db_sentry.client.objects.get(id=client_id)

    if client and not contract_id and request.user.has_perm('system.client'):
        access = True
    elif contract_id and request.user.has_perm('system.client'):
        access = True

    if access:
        title = 'Ответственные лица'

        dir_user_post_set = db_sentry.dir_user_post.objects.filter(is_active=1)
        phone_type = ['сотовый'.decode('utf-8'),'городской'.decode('utf-8')]
        form = client__form.client_user()
        return render_to_response('system/client/client_user.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request))


def ajax(request, action=None):
    data = {'error': None}

    if action == 'search':
        if request.user.has_perm('system.client'):
            data = client_user_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'get':
        if request.user.has_perm('system.client'):
            data = client_user_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'update' \
            and 'client' in request.POST and request.POST['client'] != '':
        if request.user.has_perm('system.client'):
            data = client_user_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'update' \
            and 'object' in request.POST and request.POST['object'] != '':
        if request.user.has_perm('system.client'):
            data = client_user_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'delete' \
            and 'client' in request.POST and request.POST['client'] != '':
        if request.user.has_perm('system.client'):
            data = client_user_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'delete' \
            and 'client' in request.POST and request.POST['client'] != '':
        if request.user.has_perm('system.client'):
            data = client_user_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    else:
        data['error'] = 'Нет такой функции'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')