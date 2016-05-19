# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from apps.system.models  import client_bind,dir_security_squad
from apps.monitor.models import dev_evt_log,dev_result_list

import apps.settings



def GetGbrList():

    data = ["ГБР не направлялся"]

    for row in dir_security_squad.objects.filter(is_active=1).order_by("name"):
        data.append(row.name)

    return data



def GetStartList():

    data = []

    for row in dev_result_list.objects.filter(result_type=0).order_by("name"):
        data.append(row.name)

    return data


def GetEndList():

    data = []

    for row in dev_result_list.objects.filter(result_type=1).order_by("name"):
        data.append(row.name)

    return data





def main(request, client_id=None):
    if request.user.has_perm('sentry.monitor'):


        gbr_list = GetGbrList()
        start_list = GetStartList()
        end_list = GetEndList()

        data = client_bind.objects.all()
        data_log = dev_evt_log.objects.order_by('-datetime_evt')[0:apps.settings.OPERATOR_EVT_MAX_ROWS]

        return render_to_response('monitor/operator/monitor-operator.html', locals(), RequestContext(request))

    else:
        return render_to_response('404.html', RequestContext(request))



