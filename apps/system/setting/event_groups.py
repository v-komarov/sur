# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.system.setting.extension import event_groups_ajax


def index(request, client_id=None):
    if request.user.has_perm('system.settings__event_groups'):
        title = 'Список пользователей'
        setting_set = db_sentry.setting_general.objects.get(user=None)
        sentry_user_set = db_sentry.sentry_user.objects.filter(is_active=1)

        return render_to_response('system/setting/event_groups.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request, action=None):
    data = {'error': None}

    if action=='get':
        if request.user.has_perm('system.settings'):
            data = event_groups_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.settings__event_groups'):
            data = event_groups_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')