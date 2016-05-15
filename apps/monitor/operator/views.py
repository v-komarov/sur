# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from apps.system.models  import client_bind
from apps.monitor.models import dev_evt_log
import apps.settings


#from apps.system import models



## Список действий при поступлении тревоги
def start_action_list():

    data = ['','Проверка']

    return data



## Список действий при поступлении тревоги
def end_action_list():

    data = ['','Проверка']

    return data




## Список ГБР
def gbr_action_list():

    data = ['ГБР не направлялся']

    return data





def main(request, client_id=None):
    if request.user.has_perm('sentry.monitor'):

        start_list = start_action_list()
        end_list = end_action_list()
        gbr_list = gbr_action_list()

        data = client_bind.objects.all()
        data_log = dev_evt_log.objects.order_by('-datetime_evt')[0:apps.settings.OPERATOR_EVT_MAX_ROWS]



        return render_to_response('monitor/operator/monitor-operator.html', locals(), RequestContext(request))

    else:
        return render_to_response('404.html', RequestContext(request))



