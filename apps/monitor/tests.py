from django.test import TestCase
from apps.monitor.models import dev_evt_log
from apps.system.models import dir_device_console

class DevEvtLogTestCase(TestCase):
    def setUp(self):

        device = dir_device_console.objects.get(pk=3)

        dev_evt_log.objects.create(device_id=1, stub=1,zone=1,message_id=1,device_console=device,data={})
        dev_evt_log.objects.create(device_id=1, stub=2,zone=2,message_id=2,device_console=device,data={})

    def test_devevtlog(self):
        zone = dev_evt_log.objects.get(zone=1)
        stub = dev_evt_log.objects.get(stub=2)
        self.assertEqual(zone.stub, 1)
        self.assertEqual(stub.zone, 2)

