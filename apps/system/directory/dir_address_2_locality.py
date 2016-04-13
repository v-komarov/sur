# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.system.directory.extension import dir_address_2_locality_ajax


def index(request):

    if request.user.has_perm('system.client'):
        title = 'Населенные пункты'
        dir_address_1_region = db_sentry.dir_address_1_region.objects.all()
        settings_set = db_sentry.setting_general.objects.get(user=None)

        return render_to_response('system/directory/dir_address_2_locality.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error':None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = dir_address_2_locality_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    if action=='add':
        if request.user.has_perm('system.client'):
            data = dir_address_2_locality_ajax.add(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='save':
        if request.user.has_perm('system.client'):
            data = dir_address_2_locality_ajax.save(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = dir_address_2_locality_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'


    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')
