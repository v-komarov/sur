# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.db import connections
from apps.system.models  import client_bind
from apps.system.models  import client_object_timetable
import apps.settings


def GetOperatorData(request):


    response_data = {}

    r = request.GET
    rg = request.GET.get


    if r.has_key("client_bind") and rg("client_bind") != '':

        client_bind_id = request.GET["client_bind"]

        item = client_bind.objects.get(pk=client_bind_id)

        users = item.client_object.client_user.all()


        for t in client_object_timetable.objects.all():
            if t.client_object == item.client_object:
                print t


        response_data['phone'] = {}
        response_data['docs'] = {}
        response_data['timetable'] = {}
        response_data['additions'] = {u'client_name': client_bind.objects.get(pk=client_bind_id).client_contract.client.name }



    if r.has_key("settings") and rg("settings") != '':

        response_data['max_rows'] = apps.settings.OPERATOR_EVT_MAX_ROWS



    response = HttpResponse(json.dumps(response_data), content_type="application/json")
    #response['Access-Control-Allow-Origin'] = "*"
    return response


