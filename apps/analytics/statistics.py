# -*- coding: utf-8 -*-

import json
import datetime

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.analytics.extension import statictics_ajax


def index(request):
    if request.user.has_perm('system.client'):
        title = 'Распределение объектов'
        end_date = datetime.datetime.now().strftime("%d.%m.%Y")
        begin_date = (datetime.datetime.now()-datetime.timedelta(days=1)).strftime("%d.%m.%Y")
        client_set = db_sentry.client.objects.filter(is_active=1)
        statistics_list_set = {
            'warden': 'по ответственным сотрудникам',
            'referer': 'по приводу сотрудниками',
            'squad': 'по ГБР',
            'security_company': 'по охранным организациям',
            'service_type': 'по типу охраны'
        }

        return render_to_response('system/analytics/statistics.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )



def ajax(request,action):
    data = {'error': None}

    if action=='get':
        if request.user.has_perm('system.client'):
            data = statictics_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    else:
        data['error'] = 'No function'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')

