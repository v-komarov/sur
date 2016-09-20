# -*- coding: utf-8 -*-

import datetime
import json
import time

from django.http import HttpResponse

import apps.settings
from apps.monitor.models import dev_status_evt,dev_evt_log,dev_service_device,dev_device_nosync
from apps.system.models  import client_bind, sentry_user
from apps.tools import SortDict


#### Перевод секунд в часы минуты
def Sec2HM(sec):

    s = sec
    h = s/3600
    m = s%3600/60

    if h > 1:
        return '%.0f час. %.0f мин.' % (h,m)
    else:
        return '%.0f мин.' % (m)




### Контакты : Должности Фио Телефоны
def Contacts(client_bind_id):

    cu = client_bind.objects.get(pk=client_bind_id).client_object.client_user.all()

    object_id = client_bind.objects.get(pk=client_bind_id).client_object.id

    posts = []

    for user in cu:

        address = user.get_address()

        ### Поиск номера ключа для пользователя
        if user.data.has_key("object_key"):
            if user.data["object_key"].has_key(u"%s" % object_id):
                hiskey =  user.data["object_key"][u"%s" % object_id]
            else:
                hiskey = ""
        else:
            hiskey = ""
        phones = []
        for p in user.client_user_phone.all():
            phones.append({"code":p.code,"phone":p.phone,"phone_type":p.phone_type})
        try:
            user_post = user.post.name
        except:
            user_post = ''
        posts.append({"hiskey":hiskey,"name":user.full_name,"post":user_post,"phones":phones,"address":address})



    return SortDict(posts,"hiskey")








def GetOperatorData(request):


    response_data = {}

    r = request.GET
    rg = request.GET.get


    if r.has_key("getdata") and rg("getdata") != '':

        client_bind_id = request.GET["client_bind"]

        item = client_bind.objects.get(pk=client_bind_id)

        users = item.client_object.client_user.all()


#        for t in client_object_timetable.objects.all():
#            if t.client_object == item.client_object:
#                print t

        response_data['contacts'] = Contacts(client_bind_id)
        response_data['docs'] = {}
        response_data['timetable'] = {}
        response_data['additions'] = {u'client_name': client_bind.objects.get(pk=client_bind_id).client_object.name}
        response_data['squad'] = item.GetSquad()

        if item.data.has_key("gsm"):
            response_data['gsm'] = item.data["gsm"]
        else:
            response_data['gsm'] = {
                "signal":"",
                "level":0
            }

        ### Обслуживание
        cb = client_bind.objects.get(pk=client_bind_id)
        service_history = []
        for item in dev_service_device.objects.filter(client_bind=cb).order_by('-datetime_service'):
            service_history.append({
                'datetime_text':(item.datetime_service).strftime("%d.%m.%Y %H:%M"),
                'datetime_text2':(item.service_end).strftime("%d.%m.%Y %H:%M"),
                'tech':item.tech.full_name,
                'reason':item.reason
            })

        response_data['additions']['service_history'] = service_history

        #### Обслуживание окончание


        #### Вызовы ГБР ####
        gbr_list = dev_status_evt.objects.filter(data__status=u"closed",data__client_bind_id=int(client_bind_id,10)).exclude(data__action_1=u"ГБР не направлялся")
        history_list = []
        for item in gbr_list:
            history_list.append({
                "datetime_1":item.data["datetime_1"],
                "time_start":datetime.datetime.fromtimestamp(item.data['datetime_1']).strftime("%d.%m.%Y %H:%M"),
                "time_arived":datetime.datetime.fromtimestamp(item.data['datetime_2']).strftime("%H:%M"),
                "gbr":item.data["action_1"],
                "type_evt":item.data["action_3"],
                "comment":item.data["action_4"]
            })

        response_data['additions']['gbr_history'] = SortDict(history_list,"datetime_1")

        #### Вызовы ГБР Завершение ####



        if dev_status_evt.objects.filter(data__client_bind_id=int(client_bind_id,10),data__status='opened').count() == 1:
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

        # если тревоги нет
        else:

            response_data['actions'] = {u'time_begin':'', u'from_begin':'',u'time_way':'',u'time_text_2':''}
            response_data['actions']['action_1'] = ''
            response_data['actions']['action_2'] = ''
            response_data['actions']['action_3'] = ''
            response_data['actions']['action_4'] = ''



    if r.has_key("settings") and rg("settings") != '':

        response_data['max_rows'] = apps.settings.OPERATOR_EVT_MAX_ROWS
        response_data["static_url"] = apps.settings.STATIC_URL
        ## Справочники
        # Список техников
        """
        tech = dir_user_post.objects.get(name='Техник')
        tech_list = []
        for item in tech.sentry_user_set.filter(is_active=1).all():
            tech_list.append(
                {
                    'tech_id':item.id,
                    'tech_name':item.full_name
                }
            )

        response_data['tech_list'] = tech_list
        """



    """
    Список кодов записей объектов со статусом "Тревога" + список кодов записей
    объектов со звуковым сигналом тревоги - "погасить" звуковой сигнал можно раньше
    отмены тревоги

    """
    if r.has_key("alarmlist") and rg("alarmlist") != '':

        alarm_list = {}
        alarm_list["alarm_visio"] = []
        alarm_list["alarm_audio"] = []

        data = dev_status_evt.objects.filter(data__status='opened').exclude(data__client_bind_id=0)

        for item in data:
            alarm_list["alarm_visio"].append(item.data['client_bind_id'])
            # Исключение звукового сигнала для объектов по которым была нажата первая кнопка обработки тревоги has_key('action_1')
            if not item.data.has_key("action_1"):
                alarm_list["alarm_audio"].append(item.data['client_bind_id'])

        response_data['client_bind_alarm'] = alarm_list




    if r.has_key("notestlist") and rg("notestlist") != "":

        notestlist = []
        data = dev_device_nosync.objects.all()
        for item in data:
            notestlist.append(item.client_bind_id)

        response_data['notestlist'] = notestlist





    ### Список объектов на обслуживании
    if r.has_key("servicelist") and rg("servicelist") != '':

        service_list = []

        data = dev_service_device.objects.filter(service_end__gte=datetime.datetime.now())

        for item in data:
            service_list.append(item.client_bind.id)


        response_data['client_bind_service'] = service_list





    if r.has_key("clearalarm") and rg("clearalarm") != '':

        client_bind_id = int(request.GET["clearalarm"],10)

        cb = dev_status_evt.objects.get(data__client_bind_id=client_bind_id,data__status=u'opened')

        # Проверка все ли необходимые данные заполнены, за исключением первого поля "ГБР не направлялся"
        d = cb.data
        if (d.has_key("action_1") and d.has_key("action_2") and d.has_key("action_3") and d.has_key("action_4")) or (d["action_1"] == u'ГБР не направлялся'):

            d['status'] = 'closed'
            cb.data = d
            cb.save()

            response_data['result'] = 'ok'

        else:
            response_data['result'] = 'error'





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



    if r.has_key("update") and rg("update") != '':

        data_log = dev_evt_log.objects.order_by('-datetime_evt')[0:apps.settings.OPERATOR_EVT_UPDATE_ROWS]
        data = []
        for row in data_log:

            data.append(
                {'row_id':row.id,
                 'alert_level':row.data['alert_level'],
                 'client_bind_id':row.data['client_bind_id'],
                 'date_text':row.data['date_text'],
                 'time_text':row.data['time_text'],
                 'razdel_id':row.data['razdel_id'],
                 'device_number':row.data['device_number'],
                 'message_text':row.data['message_text'],
                 'razdel':row.data['razdel'],
                 'stub':row.data['stub'],
                 'address':row.data['address'],
                 'object':row.data['object']
                 }
            )
        response_data['update'] = data



    ### Установка статуса обслуживания
    if r.has_key("service_status") and rg("service_status") != '':

        client_bind_id = int(request.GET["service_status"],10)
        cb = client_bind.objects.get(pk=client_bind_id)

        reason = request.GET["reason"]
        tech_id = int(request.GET["tech"],10)
        dtime = int(request.GET["time"],10)

        tech = sentry_user.objects.get(pk=tech_id)

        delta_time = datetime.timedelta(seconds=dtime)
        now = datetime.datetime.today()

        dev_service_device.objects.create(client_bind = cb, reason = reason, tech = tech, delta_time = dtime, service_end = now + delta_time)

        response_data['result'] = 'ok'

    ### Установка статуса обслуживания конец



    ### Сброс статуса обслуживания
    if r.has_key("service_status_end") and rg("service_status_end") != '':

        client_bind_id = int(request.GET["service_status_end"],10)
        cb = client_bind.objects.get(pk=client_bind_id)

        now = datetime.datetime.today()

        dev_service_device.objects.filter(client_bind=cb,service_end__gte=now).update(service_end=now)

        response_data['result'] = 'ok'

    ### Сброс статуса обслуживания конец




    ### Создание тревоги вручную
    if r.has_key("createalarm") and rg("createalarm") != '':
        client_bind_id = int(request.GET["createalarm"],10)
        cb = client_bind.objects.get(pk=client_bind_id)
        # Проверка есть ли уже такая тревога
        if dev_status_evt.objects.filter(data__status='opened',data__client_bind_id=cb.id).count() == 0:
        ### Проверка на обслуживании объект или нет
        #if dev_service_device.objects.filter(history=False,service_end__lte=datetime.datetime.now(),client_bind=cb).count() == 0:

            dev_status_evt.objects.create(data={
                'status':'opened',
                'client_bind_id':client_bind_id,
                'datetime_begin': time.time(),
                'date_text':datetime.datetime.now().strftime('%d.%m.%Y'),
                'time_text':datetime.datetime.now().strftime('%H:%M'),
                'message_text':"Тревога создана оператором"
            })

            response_data['result'] = 'ok'
        else:
            response_data['result'] = 'no'
    ### Создание тревоги вручную конец



    ### Получение картографических данных
    if r.has_key("getmaps") and rg("getmaps") != '':

        maps = apps.settings.MAPS
        for item in maps:
            if item['default'] and item['show']:
                response_data['center'] = item['center']






    response = HttpResponse(json.dumps(response_data), content_type="application/json")
    response['Access-Control-Allow-Origin'] = "*"
    return response
