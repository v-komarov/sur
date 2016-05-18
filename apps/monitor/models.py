#!coding:utf8

from django.db import models
from django.contrib.postgres.fields import JSONField
from apps.system import models as system_models



#### Расшифровка зон
class dev_zone_info(models.Model):
    device_object = models.ForeignKey(system_models.client_bind) #
    name = models.CharField(max_length=200) #
    zone = models.IntegerField() #



#### Первый статус события
class dev_result_list_start(models.Model):
    name = models.CharField(max_length=50) #



#### Лог событий с оборудования
class dev_evt_log(models.Model):
    datetime_evt = models.DateTimeField(auto_now_add=True) #
    device_id = models.IntegerField(default=0) #
    stub = models.IntegerField(default=0) # Шлейф
    zone = models.IntegerField(default=0) # Зона
    message_id = models.IntegerField(default=0) #
    device_console = models.ForeignKey(system_models.dir_device_console) #
    data = JSONField(default={})



### Справочник окончательно принятого решения на тревожное событие
class dev_result_list_end(models.Model):
    name = models.CharField(max_length=50) #




#### Четырех шаговая обработка тревоги диспетчером
class dev_status_evt(models.Model):
    evt = models.OneToOneField(dev_evt_log) #
    data = JSONField(default={})



### Название шлейфов
class dev_data_adds(models.Model):
    device_id = models.ForeignKey(system_models.client_bind) # Уникальное устройство
    name = models.CharField(max_length=200) #
    stub = models.IntegerField() # Номер шлейфа



### Расшифровка событий в зависимости от типа устройства, определение тревожных событий
class dev_evt_list(models.Model):
    alert_level = models.IntegerField(default=0) #
    name = models.CharField(max_length=100,default='') #
    device_console = models.ForeignKey(system_models.dir_device_console,default=3) #
    evt_id = models.IntegerField(default=0) #



### Обслуживание
class dev_service_device(models.Model):
    datetime_service = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)
    history = models.BooleanField(default=True)
    comment = models.TextField(default='')
    client_bind = models.ForeignKey(system_models.client_bind,default=None,null=True)

