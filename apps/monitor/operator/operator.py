# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.db import connections
from apps.system.models  import client_bind
from apps.system.models  import client_object_timetable
from apps.monitor.models import dev_status_evt
import apps.settings
import time






#### Перевод секунд в часы минуты
def Sec2HM(sec):

    s = sec
    h = s/3600
    m = s%3600/60

    if h > 1:
        return '%.0f час. %.0f мин.' % (h,m)
    else:
        return '%.0f мин.' % (m)






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

        response_data['docs'] = {}
        response_data['timetable'] = {}
        response_data['additions'] = {u'client_name': client_bind.objects.get(pk=client_bind_id).client_contract.client.name}

        if dev_status_evt.objects.filter(data__client_bind_id=int(client_bind_id,10),data__status='opened').count() != 0:
            g = dev_status_evt.objects.get(data__client_bind_id=int(client_bind_id,10),data__status='opened')

            response_data['actions'] = {u'time_begin':g.data['time_text'],
                                        u'from_begin':Sec2HM(time.time() - g.data['datetime_begin']),
                                        }



            if (g.data).has_key('action_1') and (g.data).has_key('action_2'):
                response_data['actions']['time_way'] = Sec2HM(g.data['datetime_2'] - g.data['datetime_1'])
                response_data['actions']['time_text_2'] = time.strftime("%H:%M",time.localtime(g.data['datetime_2']))
            else:
                response_data['actions']['time_way'] = ''
                response_data['actions']['time_text_2'] = ''


            if (g.data).has_key('action_1'):
                response_data['actions']['action_1'] = g.data['action_1']
            else:
                response_data['actions']['action_1'] = ''

            if (g.data).has_key('action_2'):
                response_data['actions']['action_2'] = g.data['action_2']
            else:
                response_data['actions']['action_2'] = ''

            if (g.data).has_key('action_3'):
                response_data['actions']['action_3'] = g.data['action_3']
            else:
                response_data['actions']['action_3'] = ''

            if (g.data).has_key('action_4'):
                response_data['actions']['action_4'] = g.data['action_4']
            else:
                response_data['actions']['action_4'] = ''




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



    if r.has_key("first-step") and rg("first-step") != '':

        client_bind_id = int(request.GET["client_bind"],10)
        action_text = request.GET["first-step"]

        evt = dev_status_evt.objects.get(data__client_bind_id=client_bind_id,data__status=u'opened')
        d = evt.data
        d['datetime_1'] = time.time()
        d['action_1'] = action_text
        evt.data = d
        evt.save()

        response_data['result'] = 'ok'



    if r.has_key("second-step") and rg("second-step") != '':

        client_bind_id = int(request.GET["client_bind"],10)
        action_text = request.GET["second-step"]

        evt = dev_status_evt.objects.get(data__client_bind_id=client_bind_id,data__status=u'opened')
        d = evt.data
        d['datetime_2'] = time.time()
        d['action_2'] = action_text
        evt.data = d
        evt.save()

        response_data['result'] = 'ok'



    if r.has_key("third-step") and rg("third-step") != '':

        client_bind_id = int(request.GET["client_bind"],10)
        action_text = request.GET["third-step"]

        evt = dev_status_evt.objects.get(data__client_bind_id=client_bind_id,data__status=u'opened')
        d = evt.data
        d['datetime_3'] = time.time()
        d['action_3'] = action_text
        evt.data = d
        evt.save()

        response_data['result'] = 'ok'



    if r.has_key("fourth-step") and rg("fourth-step") != '':

        client_bind_id = int(request.GET["client_bind"],10)
        action_text = request.GET["fourth-step"]

        evt = dev_status_evt.objects.get(data__client_bind_id=client_bind_id,data__status=u'opened')
        d = evt.data
        d['datetime_4'] = time.time()
        d['action_4'] = action_text
        evt.data = d
        evt.save()

        response_data['result'] = 'ok'




    response = HttpResponse(json.dumps(response_data), content_type="application/json")
    #response['Access-Control-Allow-Origin'] = "*"
    return response


