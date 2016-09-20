# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from apps.system.models  import client_bind,dir_security_squad,dir_device_console,dir_service_type,dir_service_subtype,dir_incident_type,dir_user_post
from apps.monitor.models import dev_evt_log

import apps.settings



def GetGbrList():

    data = ["ГБР не направлялся"]

    for row in dir_security_squad.objects.filter(is_active=1).order_by("name"):
        data.append(row.name)

    return data



def GetInc():

    data = []

    for row in dir_incident_type.objects.filter(is_active=1).order_by("name"):
        data.append(row.name)

    return data



def TechList():
    # Список техников
    tech = dir_user_post.objects.get(name='Техник')
    return tech.sentry_user_set.filter(is_active=1).all()




def main(request, client_id=None):
    if request.user.has_perm('monitor.monitor'):

        service_type = dir_service_type.objects.filter(is_active=1).all().order_by("name")
        device = dir_device_console.objects.filter(is_active=1).all().order_by("name")
        gbr_list = GetGbrList()
        inc_list = GetInc()
        tech_list = TechList()
        print tech_list

#        data = client_bind.objects.filter(status__name="connected").all()
        data = client_bind.objects.all().filter(is_active=1,status__label='connected').order_by("console_number")


        data_log = dev_evt_log.objects.order_by('-datetime_evt')[0:apps.settings.OPERATOR_EVT_MAX_ROWS]

        return render_to_response('monitor/operator/monitor-operator.html', locals(), RequestContext(request))

    else:
        return render_to_response('404.html', RequestContext(request))



