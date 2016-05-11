from django.core.management.base import BaseCommand, CommandError

from apps.monitor.models    import  dev_evt_log
from apps.system.models import dir_device_type
import time


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

                dev_evt_log.objects.create(device_id=panel,stub=src,zone=obj,message_id=kod,device_type=device,data={
                    'message':mes,
                    'datetime' : time.time()
                })

                print "ok"



