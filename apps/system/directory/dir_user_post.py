# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from apps.cabinet import authorize_permissions

from apps.system import models as db_sentry
from apps.system.directory.extension import dir_user_post_ajax


def index(request, client_id=None):

    # For debugging
    from apps.cabinet import authorize_permissions

    request.session['permissions'] = authorize_permissions.get_all_permissions_list(request)


    if request.user.has_perm('system.client'):
        title = 'Должности'
        post_set = db_sentry.dir_user_post.objects.filter(is_active=1)
        return render_to_response('sentry/system/directory/dir_user_post.html', locals(), RequestContext(request))
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error':None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = dir_user_post_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='create':
        if request.user.has_perm('system.client'):
            data = dir_user_post_ajax.create(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='update':
        if request.user.has_perm('system.client'):
            data = dir_user_post_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = dir_user_post_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'


    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')