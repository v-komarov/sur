# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.db import connections
from apps.system.models  import client_bind



def GetOperatorData(request):


    client_bind_id = request.GET["client_bind"]

    item = client_bind.objects.get(pk=client_bind_id)

    print item

    response_data = {}



    response_data['phone'] = {}
    response_data['docs'] = {}
    response_data['timetable'] = {}





    response = HttpResponse(json.dumps(response_data), content_type="application/json")
    #response['Access-Control-Allow-Origin'] = "*"
    return response


