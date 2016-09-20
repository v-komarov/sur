#!coding:utf8

from django.db import models
from django.contrib.postgres.fields import JSONField
from apps.system import models as system_models




#### Лог событий с оборудования
class dev_evt_log(models.Model):
    datetime_evt = models.DateTimeField(auto_now_add=True) #
    device_id = models.IntegerField(default=0) #
    stub = models.IntegerField(default=0) # Шлейф
    zone = models.IntegerField(default=0) # Зона
    message_id = models.IntegerField(default=0) #
    device_console = models.ForeignKey(system_models.dir_device_console) #
    data = JSONField(default={})
    class Meta:
        default_permissions = ()
        permissions = (
            ('monitor', u'Доступ к ПЦН'),
            ('monitor_change_object', u'Доступ к Менеджеру обьектов'),
        )



#### Четырех шаговая обработка тревоги диспетчером
class dev_status_evt(models.Model):
    evt = models.OneToOneField(dev_evt_log,null=True) #
    data = JSONField(default={})
    class Meta:
        default_permissions = ()



### Справочник видов шаблонов
class dev_patterns(models.Model):
    pattern = models.CharField(max_length=100,default='')
    class Meta:
        default_permissions = ()



### Расшифровка событий в зависимости от типа устройства, определение тревожных событий (Шаблоны)
class dev_evt_list(models.Model):
    alert_level = models.IntegerField(default=0) #
    name = models.CharField(max_length=100,default='') #
    device_console = models.ForeignKey(system_models.dir_device_console,default=3) #
    evt_id = models.CharField(max_length=8,null=True) #
    pattern = models.ForeignKey(dev_patterns,null=True)
    class Meta:
        default_permissions = ()



### Обслуживание
class dev_service_device(models.Model):
    datetime_service = models.DateTimeField(auto_now_add=True)
    delta_time = models.IntegerField(default=0)
    service_end = models.DateTimeField(null=True)
    tech = models.ForeignKey(system_models.sentry_user,default=None)
    client_bind = models.ForeignKey(system_models.client_bind,default=None,null=True)
    reason = models.CharField(max_length=250,default='')
    data = JSONField(default={})
    class Meta:
        default_permissions = ()


### Тестовые сообщения
class dev_device_sync(models.Model):
    datetime_sync = models.DateTimeField(auto_now_add=True) #
    device_id = models.IntegerField(default=0) #
    device_console = models.ForeignKey(system_models.dir_device_console) #
    data = JSONField(default={})
    class Meta:
        default_permissions = ()


### Отсутствие тестовых сообщений
class dev_device_nosync(models.Model):
    datetime_nosync = models.DateTimeField(auto_now_add=True)
    client_bind_id = models.IntegerField(default=0)
    class Meta:
        default_permissions = ()


### Взаимодействие с ГБР
class dev_gbr_action(models.Model):
    datetime_create = models.DateTimeField(auto_now_add=True)
    alarm = models.OneToOneField(dev_status_evt)
    data = JSONField(default={})
    class Meta:
        default_permissions = ()


