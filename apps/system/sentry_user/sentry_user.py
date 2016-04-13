# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from django.contrib.auth.models import Group, Permission
from apps.system import models as db_sentry
from apps.system.sentry_user.extension import sentry_user_ajax


def index(request, client_id=None):
    # For debugging
    from apps.cabinet import authorize_permissions
    request.session['permissions'] = authorize_permissions.get_all_permissions_list(request)

    if request.user.has_perm('system.client'):
        title = 'Пользователи'
        permission_groups_set = Group.objects.all()
        user_post_set = db_sentry.dir_user_post.objects.all()
        users_set = db_sentry.sentry_user.objects.all()

        return render_to_response('system/sentry_user/sentry_user.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action=None):
    data = {'error': None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = sentry_user_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='get':
        if request.user.has_perm('system.client'):
            data = sentry_user_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = sentry_user_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = sentry_user_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')