# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.db import connections
from apps.system.models  import client_bind
from apps.system.models  import client_object_timetable
from apps.monitor.models import dev_status_evt
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

        phones = []
        #clients=client_bind.objects.get(pk=client_bind_id).client_contract.client.client_user

        """
        for item in client_bind.objects.get(pk=client_bind_id).client_contract.client.client_user:
            persons = {}
            persons['name'] = item.name
            persons['phone'] = '4445'
            phones.append(phones)

        response_data['phone'] = phones
        """
        response_data['docs'] = {}
        response_data['timetable'] = {}
        response_data['additions'] = {u'client_name': client_bind.objects.get(pk=client_bind_id).client_contract.client.name }





    if r.has_key("settings") and rg("settings") != '':

        response_data['max_rows'] = apps.settings.OPERATOR_EVT_MAX_ROWS





    if r.has_key("alarmlist") and rg("alarmlist") != '':

        alarm_list = []

        data = dev_status_evt.objects.filter(data__status='opened')
        for item in data:
            alarm_list.append(item.data['client_bind_id'])


        response_data['client_bind_alarm'] = alarm_list




    if r.has_key("clearalarm") and rg("clearalarm") != '':

        client_bind_id = int(request.GET["clearalarm"],10)

        cb = dev_status_evt.objects.get(data__client_bind_id=client_bind_id,data__status=u'opened')
        d = cb.data
        d['status'] = 'closed'
        cb.data = d
        cb.save()

        response_data['result'] = 'ok'





    response = HttpResponse(json.dumps(response_data), content_type="application/json")
    #response['Access-Control-Allow-Origin'] = "*"
    return response


