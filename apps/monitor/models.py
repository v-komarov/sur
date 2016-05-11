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
    datetime_evt = models.DateTimeField() #
    device_object = models.ForeignKey(system_models.client_bind) #
    stub = models.IntegerField() # Шлейф
    zone = models.IntegerField() # Зона
    message_id = models.IntegerField() #
    device_type = models.ForeignKey(system_models.dir_device_type) #
    data = JSONField(default={})



### Справочник окончательно принятого решения на тревожное событие
class dev_result_list_end(models.Model):
    name = models.CharField(max_length=50) #




#### Четырех шаговая обработка тревоги диспетчером
class dev_status_evt(models.Model):
    evt = models.OneToOneField(dev_evt_log) #
    data = JSONField(default={})

    """
    comment = models.CharField(max_length=200) #
    operator_1_action = models.ForeignKey(dev_result_list_start) #
    operator_1_datetime = models.DateTimeField() #
#    operator_2_action = models.ForeignKey(system_models.dir_security_squad) #
    operator_2_datetime = models.DateTimeField() #
#    operator_3_action = models.ForeignKey(system_models.dir_security_squad) #
    operator_3_datetime = models.DateTimeField() #
    operator_4_action = models.ForeignKey(dev_result_list_end) #
    operator_4_datetime = models.DateTimeField() #
    """



### Название шлейфов
class dev_data_adds(models.Model):
    device_id = models.ForeignKey(system_models.client_bind) # Уникальное устройство
    name = models.CharField(max_length=200) #
    stub = models.IntegerField() # Номер шлейфа



### Расшифровка событий в зависимости от типа устройства, определение тревожных событий
class dev_evt_list(models.Model):
    alert_level = models.IntegerField(default=0) #
    name = models.CharField(max_length=100,default='') #
    device_type = models.ForeignKey(system_models.dir_device_type,default=8) #
    evt_id = models.IntegerField(default=0) #



