#coding:utf8

from django.core.management.base import BaseCommand, CommandError

from apps.monitor.models    import  dev_evt_log,dev_evt_list,dev_status_evt
from apps.system.models import dir_device_type,client_bind
import time
import datetime


class Command(BaseCommand):
    args = '<ademco message ...>'
    help = 'saving message of officer panel into models'




    def handle(self, *args, **options):

        device = dir_device_type.objects.get(pk=8)


        for mes in args:
            if len(mes) == 16:
                panel = int(mes[0:4],10)
                ver = int(mes[4:6],10)
                mode = int(mes[6:7],10)
                kod = int(mes[7:10],10)
                obj = int(mes[10:12],10)
                src = int(mes[12:15],10)

                try:
                    item = client_bind.objects.get(console_number=panel)
                    client_bind_id = item.id
                except:
                    client_bind_id = 0

                rec = dev_evt_list.objects.get(device_type=device,evt_id=kod)


                n = dev_evt_log.objects.create(device_id=panel,stub=src,zone=obj,message_id=kod,device_type=device,data={
                    'message':mes,
                    'device_number':panel,
                    'datetime': time.time(),
                    'date_text':datetime.datetime.now().strftime('%d.%m.%Y'),
                    'time_text':datetime.datetime.now().strftime('%H:%M'),
                    'message_text':rec.name,
                    'alert_level':rec.alert_level,
                    'zone_text':obj,
                    'stub_text':src,
                    'client_bind_id':client_bind_id
                })


                ### Генарация тревоги
                if rec.alert_level == 9:
                    s = dev_status_evt.objects.filter(data__status='opened',data__client_bind_id=client_bind_id).count()
                    if s == 0:
                        dev_status_evt.objects.create(evt=n,data={
                            'status':'opened',
                            'client_bind_id':client_bind_id,
                            'datetime_begin': time.time(),
                            'date_text':datetime.datetime.now().strftime('%d.%m.%Y'),
                            'time_text':datetime.datetime.now().strftime('%H:%M'),
                            'message_text':rec.name
                        })

                print "ok"



