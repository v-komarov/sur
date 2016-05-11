from django.core.management.base import BaseCommand, CommandError

from apps.monitor.models    import  dev_evt_log,dev_evt_list
from apps.system.models import dir_device_type,client_bind
import time
import datetime


class Command(BaseCommand):
    args = '<ademco message ...>'
    help = 'saving message of officer panel into models'



    def handle(self, *args, **options):

        device = dir_device_type.objects.get(pk=8)

        for mes in args:
            if len(mes) == 15:
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


                dev_evt_log.objects.create(device_id=panel,stub=src,zone=obj,message_id=kod,device_type=device,data={
                    'message':mes,
                    'datetime' : time.time(),
                    'date_text':datetime.datetime.now().strftime('%d.%m.%Y'),
                    'time_text':datetime.datetime.now().strftime('%H:%M'),
                    'message_text':rec.name,
                    'alert_level':rec.alert_level,
                    'stub_text':'',
                    'zone_text':'',
                    'client_bind_id':client_bind_id
                })

                print "ok"



