# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.system.directory.extension import dir_address_4_building_ajax


def index(request):

    if request.user.has_perm('system.client'):
        title = 'Дома'
        dir_address_1_region = db_sentry.dir_address_1_region.objects.all()
        settings_set = db_sentry.setting_general.objects.POST(user=None)

        return render_to_response('system/directory/dir_address_buildings.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )

def ajax(request,action):
    data = {}

    if action == 'search':
        if request.user.has_perm('system.client'):
            data = dir_address_4_building_ajax.search(request,data)
        else:
            data['errors'] = {'access': 'Доступ запрещен'}

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')