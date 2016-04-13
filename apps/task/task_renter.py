# -*- coding: utf-8 -*-

import json
import datetime

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.task.extension import task_renter_ajax


def renter(request):
    if request.user.has_perm('system.client'):
        title = 'Смена арендатора'
        tomorrow = (datetime.datetime.today()+datetime.timedelta(days=1)).strftime("%d.%m.%Y")
        return render_to_response('task/task_renter.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def ajax(request,action):
    data = {'error':None}

    if action=='change':
        if request.user.has_perm('system.client'):
            data = task_renter_ajax.change(request,data)
        else: data['error'] = 'Доступ запрещен'

    else:
        data['error'] = 'No function'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')
