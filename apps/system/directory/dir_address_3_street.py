# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from apps.cabinet import authorize_permissions

from apps.system import models as db_sentry
from apps.system.directory.extension import dir_address_3_street_ajax


def index(request, client_id=None):
    request.session['permissions'] = authorize_permissions.get_all_permissions_list(request)

    if request.user.has_perm('system.client'):
        title = 'Улицы'
        dir_address_1_region = db_sentry.dir_address_1_region.objects.all()
        #settings_set = db_sentry.settings_general.objects.POST(user=None)

        return render_to_response('system/directory/dir_address_3_street.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error':None}

    if action=='search':
        if request.user.has_perm('system.client'):
            data = dir_address_3_street_ajax.search(request,data)
        else: data['error'] = 'Доступ запрещен'

    if action=='add':
        if request.user.has_perm('system.client'):
            data = dir_address_3_street_ajax.add(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='save':
        if request.user.has_perm('system.client'):
            data = dir_address_3_street_ajax.save(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='delete':
        if request.user.has_perm('system.client'):
            data = dir_address_3_street_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'


    return HttpResponse( json.dumps(data, ensure_ascii=False), content_type='application/json' )



