# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.post import checkpoint_ajax


def index(request, client_id=None):
    if request.user.has_perm('system.client'):
        title = 'Текущие смены'
        service_organization_set = db_sentry.dir_service_organization.objects.filter(is_active=1)
        post_reason_set = db_sentry.dir_post_reason.objects.all()
        dir_incident_type_set = db_sentry.dir_incident_type.objects.all()

        return render_to_response('sentry/system/post/checkpoint.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', RequestContext(request))


def ajax(request,action):
    data = {'error':None}

    if request.is_ajax() and request.method == 'GET' \
            and request.user.has_perm('system.client'):

        if action=='get':
            data = checkpoint_ajax.get(request,data)

    elif request.is_ajax() and request.method == 'POST' \
            and request.user.has_perm('system.client'):

        if action=='shift_by_plan':
            data = checkpoint_ajax.shift_by_plan(request,data)
        elif action=='shift_begin':
            data = checkpoint_ajax.shift_begin(request,data)
        elif action=='shift_cancel':
            data = checkpoint_ajax.shift_cancel(request,data)
        elif action=='shift_completed':
            data = checkpoint_ajax.shift_completed(request,data)
        elif action=='shift_user_change':
            data = checkpoint_ajax.shift_user_change(request,data)
        elif action=='shift_edited_save':
            data = checkpoint_ajax.shift_edited_save(request,data)
        elif action=='shift_uncompleted':
            data = checkpoint_ajax.shift_uncompleted(request,data)


    return HttpResponse( json.dumps(data, ensure_ascii=False), content_type='application/json' )