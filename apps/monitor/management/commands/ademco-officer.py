#coding:utf8

from django.core.management.base import BaseCommand, CommandError

from apps.monitor.models    import  dev_evt_log,dev_evt_list,dev_status_evt,dev_service_device
from apps.system.models import dir_device_console,client_bind,client_object_dir_device,dir_device
import time
import datetime

"""

    Прием и обработка сообщений для охранной панели Офицер










Постановка на охрану и снятие с охраны в целом объекта
Код постановки "001"
Код снятия "002"

Если раздел единственный в расшлейфовке (для всех записей номер раздела тот же "00000"), то
 Ставиться на охрану объект в целом. Если есть разграничение по разным разделам , то ставиться
 под охрану только раздел.

 Метод get_sections_list модели client_bind возвращает список разделов расшлейфовки
"""
def WatchSwitch(client_bind_id,code,section_id):
    client = client_bind.objects.get(pk=client_bind_id)
    ## Если раздел один (по умолчанию) - то ставим объект на охрану (или снимаем с охраны)
    if len(client.get_sections_list()) <= 1:
        if code == "001":
            client.watch = True
            client.save()
        if code == "002":
            client.watch = False
            client.save()

    ### Случай когда несколько разделов и все их нужно обрабатывать отдельно
    else:
        sec = client.watch_sections
        if int(section_id,10) in sec and code == "002":
            sec.remove(int(section_id,10))

        if not int(section_id,10) in sec and code == "001":
            sec.append(int(section_id,10))

        client.watch_sections = sec
        client.save()

        if len(sec) == len(client.get_sections_list()):
            client.watch = True
            client.save()

        else:
            client.watch = False
            client.save()




### Расшифровка сообщения определение адреса и названия
def Mess(client_bind_id,kod):

    if client_bind_id == 0:
        return {"work":u"Объект не найден!","alert_level":0, "address":"", "object":""}

    else:
        co = client_bind.objects.get(pk=client_bind_id)
        try:
            address = u"%s %s %s%s" % (co.client_object.address_building.street.name,co.client_object.address_building.name,co.client_object.address_placement_type.name,co.client_object.address_placement)
        except:
            address = u"%s %s" % (co.client_object.address_building.street.name,co.client_object.address_building.name)
        object = co.client_object.name
        data = co.data
        if data.has_key("stub"):
            for item in data["stub"]:
                if item["code"] == kod:
                    item["address"] = address
                    item["object"] = object
                    return item


    return {"work":u"Код %s не найден!" % kod,"alert_level":0, "address":address, "object":object}





class Command(BaseCommand):
    args = '<ademco message ...>'
    help = 'saving message of officer panel into models'




    def handle(self, *args, **options):

        device = dir_device_console.objects.get(pk=3)


        for mes in args:
            if len(mes) == 21:
                panel = mes[0:4]
                ver = mes[4:6]
                mode = mes[6:7]
                kod = mes[7:10]
                obj = mes[10:12]
                src = mes[12:15]
                razdel_id = mes[16:21]

                try:
                    item = client_bind.objects.get(console_number=panel,is_active=1,console=device)
                    client_bind_id = item.id
                except:
                    client_bind_id = 0

                ## Постановка и снятие с охраны
                WatchSwitch(client_bind_id,kod,razdel_id)

                ## Расшифровка
                it = Mess(client_bind_id,kod+obj+src)

                ### 027 и 028 коды сообщений о уровне сигнала - не фиксируем записи в базу
                if kod != "027" and kod != "028":
                    n = dev_evt_log.objects.create(device_id=panel,stub=src,zone=obj,message_id=kod,device_console=device,data={
                        'message':mes,
                        'device_number':panel,
                        'datetime': time.time(),
                        'date_text':datetime.datetime.now().strftime('%d.%m.%Y'),
                        'time_text':datetime.datetime.now().strftime('%H:%M'),
                        'alert_level':it["alert_level"],
                        'razdel':obj,
                        'stub':src,
                        'message_text':it["work"],
                        'razdel_id':razdel_id,
                        'client_bind_id':client_bind_id,
                        'address':it["address"],
                        'object':it["object"]
                    })
                else:
                    ### 027 и 028 фиксируем в client_bind (data["gsm"] {"signal":"high","level":60})
                    data = item.data
                    signal = ""
                    if kod == "027":
                        signal = "low"
                    if kod == "028":
                        signal = "high"

                    data["gsm"] = {
                        "signal" : signal,
                        "level" : int(src,10),
                        "datetime" : datetime.datetime.now().strftime('%d.%m.%Y %H:%M')
                    }

                    item.data = data
                    item.save()


                ### Тревога для услуги ПЦН и подключенных объектов
                if client_bind_id != 0:
                    bind = client_bind.objects.get(pk=client_bind_id)

                    ### Обслуживание
                    service_on = dev_service_device.objects.filter(service_end__gte=datetime.datetime.now(),client_bind=bind).count()
                    if (bind.CheckService(u"ПЦН") or bind.CheckService(u"ТВ")) and item.status.label == 'connected' and service_on == 0:

                        ### Генарация тревоги
                        if it["alert_level"] == 9:
                            s = dev_status_evt.objects.filter(data__status='opened',data__client_bind_id=client_bind_id).count()
                            if s == 0:
                                dev_status_evt.objects.create(evt=n,data={
                                    'status':'opened',
                                    'client_bind_id':client_bind_id,
                                    'datetime_begin': time.time(),
                                    'date_text':datetime.datetime.now().strftime('%d.%m.%Y'),
                                    'time_text':datetime.datetime.now().strftime('%H:%M'),
                                    'message_text':it["work"]
                                })

                        print "ok"



