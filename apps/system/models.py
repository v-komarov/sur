# -*- coding: utf-8 -*-

import datetime
from django.utils import timezone
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.postgres.fields import ArrayField


class dir_address_0_country(models.Model):
    name = models.CharField(max_length=256)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_0_country'
        ordering = ['name']
        default_permissions = ()

class dir_address_1_region(models.Model):
    country = models.ForeignKey(dir_address_0_country, default=1)
    name = models.CharField(max_length=256, help_text='Название региона')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_1_region'
        ordering = ['name']
        default_permissions = ()

class dir_address_2_locality(models.Model):
    region = models.ForeignKey(dir_address_1_region)
    name = models.CharField(max_length=256, help_text='Название населенного пункта')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_2_locality'
        ordering = ['region','name']
        default_permissions = ()

class dir_address_3_street(models.Model):
    locality = models.ForeignKey(dir_address_2_locality)
    name = models.CharField(max_length=256, help_text='Название улицы')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_3_street'
        ordering = ['name']
        default_permissions = ()

class dir_address_4_building(models.Model):
    street = models.ForeignKey(dir_address_3_street)
    name = models.CharField(max_length=256, help_text='Номер дома')
    postal_index = models.IntegerField(null=True, blank=True, help_text='Почтовый индекс')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_4_building'
        ordering = ['name']
        default_permissions = ()

class dir_address_placement_type(models.Model):
    label = models.CharField(max_length=128, help_text='')
    name = models.CharField(max_length=128, help_text='')
    description = models.CharField(max_length=256, help_text='')
    def __unicode__(self):
        return self.label
    class Meta:
        db_table = 'dir_address_placement_type'
        default_permissions = ()

class dir_holding(models.Model):
    name = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_holding'
        ordering = ['name']
        default_permissions = ()

class dir_user_post(models.Model):
    name = models.CharField(max_length=128, help_text='Должность')
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_user_post'
        ordering = ['name']
        default_permissions = ()

class dir_user_status(models.Model):
    name = models.CharField(max_length=128, help_text='Статус')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_user_status'
        ordering = ['name']
        default_permissions = ()

class dir_bank(models.Model):
    bik = models.CharField(max_length=9, help_text='БИК')
    name = models.CharField(max_length=512, help_text='Наименование банка')
    correspondent_account = models.CharField(max_length=32, help_text='Корреспондентский счёт')
    locality = models.CharField(max_length=512)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_bank'
        ordering = ['name']
        default_permissions = ()

class dir_cost_type(models.Model):
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=128)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_cost_type'
        ordering = ['name']
        default_permissions = ()

class dir_charge_month(models.Model):
    name = models.CharField(max_length=128)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_charge_month'
        default_permissions = ()

class dir_device_console(models.Model):
    hard_id = models.IntegerField(null=True, blank=True)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_device_console'
        default_permissions = ()

class dir_device_communication_type(models.Model):
    name = models.CharField(max_length=128)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_device_communication_type'
        default_permissions = ()

class dir_device_communication(models.Model):
    communication_type = models.ForeignKey(dir_device_communication_type)
    name = models.CharField(max_length=128)
    description = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_device_communication'
        default_permissions = ()

class dir_device_type(models.Model):
    name = models.CharField(max_length=32)
    description = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    dir_device_communication = models.ManyToManyField(dir_device_communication)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_device_type'
        default_permissions = ()

class dir_object_status(models.Model):
    label = models.CharField(max_length=32)
    name = models.CharField(max_length=32)
    position = models.IntegerField()
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.label
    class Meta:
        db_table = 'dir_object_status'
        ordering = ['position']
        default_permissions = ()

class dir_tag(models.Model):
    root = models.CharField(max_length=256)
    name = models.CharField(max_length=32)
    description = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_tag'
        default_permissions = ()

class dir_service_type(models.Model):
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=32)
    description = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        ordering = ['name']
        db_table = 'dir_service_type'
        default_permissions = ()

class dir_service_subtype(models.Model):
    service_type = models.ForeignKey(dir_service_type)
    name = models.CharField(max_length=32)
    description = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        ordering = ['name']
        db_table = 'dir_service_subtype'
        default_permissions = ()

class dir_security_squad(models.Model):
    name = models.CharField(max_length=64, help_text='Название ГБР')
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        ordering = ['name']
        db_table = 'dir_security_squad'
        default_permissions = ()

class sentry_user(models.Model):
    full_name = models.CharField(max_length=128)
    username = models.CharField(max_length=128, blank=True)
    post = models.ForeignKey(dir_user_post, null=True, blank=True, help_text='Должность')
    status = models.ForeignKey(dir_user_status, null=True)
    birthday = models.DateTimeField(null=True, blank=True)
    mobile_phone = models.CharField(max_length=24, blank=True)
    city_phone = models.CharField(max_length=24, blank=True)
    other_phone = models.CharField(max_length=24, blank=True)
    email = models.CharField(max_length=256, blank=True)
    passport_series = models.CharField(max_length=4, blank=True, help_text='Серия паспорта')
    passport_number = models.CharField(max_length=6, blank=True, help_text='Номер паспорта')
    passport_date = models.DateTimeField(null=True, blank=True, help_text='Когда выдан')
    passport_issued = models.CharField(max_length=256, blank=True, help_text='Кем выдан')
    address_building = models.ForeignKey(dir_address_4_building, null=True, blank=True, help_text='Здание')
    address_placement = models.CharField(max_length=128, null=True, blank=True, help_text='Помещение')
    address = models.CharField(max_length=256, blank=True)
    address2 = models.CharField(max_length=256, blank=True)
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user'
        ordering = ['full_name']
        default_permissions = ()

    def get_status(self):
        if self.status_id: status__name = self.status.name
        else: status__name = ''
        return status__name

    def get_card_status(self,field=None):
        today = datetime.date.today()
        status_date = datetime.date(1970, 1, 1)
        status = None
        for card in self.sentry_user_card_set.filter(is_active=1):
            try:
                status_set = card.sentry_user_card_status_set.filter(is_active=1, date__lte=today).first()
                if status_set.date > status_date:
                    status_date = status_set.date
                    if field=='id':
                        status = status_set.status.id
                    else:
                        status = status_set.status.name
            except:
                status = None
        return status

    def get_weapon_list(self):
        weapon_list = []
        for item in sentry_user_weapon.objects.filter(user=self.id,is_active=1):
            weapon_list.append(item.weapon_id)
        return weapon_list

class dir_post_reason(models.Model):
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=256)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_post_reason'
        default_permissions = ()

class dir_service_organization(models.Model):
    name = models.CharField(max_length=256)
    license = models.CharField(max_length=32, blank=True, help_text='Номер лицензии')
    address_locality = models.ForeignKey(dir_address_2_locality, null=True, blank=True)
    address_placement = models.CharField(max_length=128, blank=True)
    address = models.CharField(max_length=512, blank=True)
    address_index = models.CharField(max_length=6, blank=True)
    phone = models.CharField(max_length=128, blank=True)
    fax = models.CharField(max_length=128, blank=True)
    bank = models.ForeignKey(dir_bank, null=True, blank=True)
    bank_account = models.CharField(max_length=64, blank=True, help_text='Расчетный счет')
    inn = models.CharField(max_length=12, blank=True)
    kpp = models.CharField(max_length=9, blank=True)
    director = models.ForeignKey(sentry_user, null=True, blank=True)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_service_organization'
        ordering = ['name']
        default_permissions = ()

class dir_console_interval(models.Model):
    service_organization = models.ForeignKey(dir_service_organization)
    device_console = models.ForeignKey(dir_device_console)
    begin = models.IntegerField()
    end = models.IntegerField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_console_interval'
        default_permissions = ()

class dir_weapon_type(models.Model):
    name = models.CharField(max_length=128)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_weapon_type'
        default_permissions = ()

class dir_weapon(models.Model):
    series = models.CharField(max_length=16)
    number = models.CharField(max_length=16)
    weapon_type = models.ForeignKey(dir_weapon_type)
    service_organization = models.ForeignKey(dir_service_organization)
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_weapon'
        ordering = ['series','number']
        default_permissions = ()

class sentry_user_card(models.Model):
    user = models.ForeignKey(sentry_user)
    service_organization = models.ForeignKey(dir_service_organization)
    series = models.CharField(max_length=8)
    number = models.CharField(max_length=16)
    date = models.DateTimeField()
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_card'
        ordering = ['-date']
        default_permissions = ()

    def get_status(self,field=None):
        today = datetime.date.today()
        try:
            status_set = self.sentry_user_card_status_set.filter(is_active=1, date__lte=today).first()
            if field=='id':
                status = status_set.status.id
            else:
                status = status_set.status.name
        except:
            status = None
        return status

class sentry_user_card_status(models.Model):
    card = models.ForeignKey(sentry_user_card)
    status = models.ForeignKey(dir_user_status)
    date = models.DateTimeField()
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_card_status'
        ordering = ['-date']
        default_permissions = ()

class sentry_user_certificate(models.Model):
    user = models.ForeignKey(sentry_user)
    category = models.IntegerField()
    series = models.CharField(max_length=8)
    number = models.CharField(max_length=32)
    date = models.DateTimeField()
    expire_date = models.DateTimeField()
    check_date = models.DateTimeField(blank=True)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_certificate'
        ordering = ['-date']
        default_permissions = ()

class sentry_user_certificate_check(models.Model):
    certificate = models.ForeignKey(sentry_user_certificate)
    plan_check_date = models.DateTimeField()
    real_check_date = models.DateTimeField(null=True)
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_certificate_check'
        ordering = ['-plan_check_date']
        default_permissions = ()

class sentry_user_identity(models.Model):
    user = models.ForeignKey(sentry_user)
    series = models.CharField(max_length=8)
    number = models.CharField(max_length=32)
    date = models.DateTimeField(blank=True)
    extended_date = models.DateTimeField(blank=True)
    expire_date = models.DateTimeField(blank=True)
    check_date = models.DateTimeField(blank=True)
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_identity'
        ordering = ['-expire_date']
        default_permissions = ()

class sentry_user_weapon(models.Model):
    user = models.ForeignKey(sentry_user)
    weapon = models.ForeignKey(dir_weapon)
    number = models.CharField(max_length=16)
    date = models.DateTimeField()
    expire_date = models.DateTimeField()
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_weapon'
        ordering = ['-date']
        default_permissions = ()

class dir_event_group(models.Model):
    name = models.CharField(max_length=32)
    description = models.CharField(max_length=128)
    status = models.CharField(max_length=128)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_event_group'
        default_permissions = ()

class dir_client_workflow_type(models.Model):
    type = models.CharField(max_length=32)
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=256)
    description = models.TextField()
    position = models.IntegerField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sentry_user = models.ForeignKey(sentry_user, null=True, blank=True)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_client_workflow_type'
        ordering = ['position']
        default_permissions = ()

class dir_event(models.Model):
    group = models.ForeignKey(dir_event_group)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=128)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_event'
        default_permissions = ()

class dir_incident_type(models.Model):
    name = models.CharField(max_length=32)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_incident_type'
        ordering = ['name']
        default_permissions = ()

class dir_legal_type(models.Model):
    label = models.CharField(max_length=125)
    name = models.CharField(max_length=125)
    class Meta:
        db_table = 'dir_legal_type'
        default_permissions = ()

class dir_legal_type_base(models.Model):
    legal_type = models.ForeignKey(dir_legal_type)
    label = models.CharField(max_length=125)
    name = models.CharField(max_length=125)
    class Meta:
        db_table = 'dir_legal_type_base'
        default_permissions = ()

class dir_code(models.Model):
    code = models.CharField(max_length=8)
    dir_event = models.ForeignKey(dir_event)
    def __unicode__(self):
        return self.code
    class Meta:
        db_table = 'dir_event_code'
        ordering = ['code']
        default_permissions = ()

class dir_contract_interval(models.Model):
    service_organization = models.ForeignKey(dir_service_organization)
    begin = models.IntegerField()
    end = models.IntegerField()
    prefix = models.CharField(max_length=16, null=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_contract_interval'
        default_permissions = ()

class dir_referer_type(models.Model):
    label = models.CharField(max_length=32)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=512)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_referer_type'
        default_permissions = ()


class dir_weekday(models.Model):
    weekday = models.IntegerField()
    name = models.CharField(max_length=32)
    class Meta:
        db_table = 'dir_weekday'
        default_permissions = ()


class client_user_phone(models.Model):
    code = models.CharField(max_length=4, blank=True)
    phone = models.CharField(max_length=13)
    phone_type = models.CharField(max_length=32)
    comment = models.TextField(blank=True)
    def __unicode__(self):
        return self.phone
    class Meta:
        db_table = 'client_user_phone'
        ordering = ['phone_type']
        default_permissions = ()

class client_user_email(models.Model):
    email = models.CharField(max_length=128)
    subscribe = models.CharField(max_length=3, default='да')
    def __unicode__(self):
        return self.email
    class Meta:
        db_table = 'client_user_email'
        default_permissions = ()


class client_user(models.Model):
    full_name = models.CharField(max_length=256)
    priority = models.IntegerField(default=1)
    post = models.ForeignKey(dir_user_post, blank=True, null=True)
    birthday = models.DateTimeField(blank=True, null=True)
    passport = models.CharField(max_length=256, blank=True, null=True)
    address_building = models.ForeignKey(dir_address_4_building, null=True, blank=True, help_text='Здание')
    address_placement = models.CharField(max_length=128, null=True, blank=True, help_text='Помещение')
    address = models.CharField(max_length=512, blank=True, null=True, help_text='Адрес')
    comment = models.TextField(blank=True, help_text='Комментарий')
    is_active = models.SmallIntegerField(default=1)
    client_user_phone = models.ManyToManyField(client_user_phone)
    client_user_email = models.ManyToManyField(client_user_email)
    data = JSONField(default={})
    def __unicode__(self):
        return self.full_name
    class Meta:
        db_table = 'client_user'
        ordering = ['full_name']
        default_permissions = ()
        permissions = (
            ('client_user', 'Доступ к ответственным лицам'),
            ('add_client_user', 'Добавлять ответственные лица'),
            ('change_client_user', 'Редактировать ответственные лица'),
            ('delete_client_user', 'Удалять ответственные лица'),
        )

    def get_address(self):
        address_string = ''
        if self.address_building:
            address_string = self.address_building.street.locality.name \
                             +', '+ self.address_building.street.name \
                             +', '+ self.address_building.name \
                             +u', кв.'+self.address_placement
        return address_string


class permissions(models.Model):
    name = models.CharField(max_length=256)
    class Meta:
        default_permissions = ()
        permissions = (
            ('finance', 'Доступ к финансам'),
            ('sentry_user', 'Доступ к пользователям'),
            ('directory', 'Доступ к справочникам'),
            ('setting', 'Доступ к настройкам'),
            ('search', 'Доступ к поиску'),
            ('egg_squad', 'Доступ к ГБР'),
            ('egg_client', 'Доступ к клиентам'),
        )


class client(models.Model):
    name = models.CharField(max_length=256)
    holding = models.ForeignKey(dir_holding, null=True, blank=True)
    founding_date = models.DateTimeField(null=True, blank=True)
    legal_type_base = models.ForeignKey(dir_legal_type_base, null=True, blank=True)
    address_legal_index = models.CharField(max_length=6, blank=True)
    address_legal_building = models.ForeignKey(dir_address_4_building, null=True, blank=True, related_name='client_address_legal_building')
    address_legal_placement_type = models.ForeignKey(dir_address_placement_type, null=True, blank=True, related_name='client_address_legal_placement_type')
    address_legal_placement = models.CharField(max_length=128, blank=True)
    address_actual_index = models.CharField(max_length=6, blank=True)
    address_actual_building = models.ForeignKey(dir_address_4_building, null=True, blank=True, related_name='client_address_actual_building')
    address_actual_placement_type = models.ForeignKey(dir_address_placement_type, null=True, blank=True, related_name='client_address_actual_placement_type')
    address_actual_placement = models.CharField(max_length=128, blank=True)
    address_postal_index = models.CharField(max_length=6, blank=True)
    address_postal_building = models.ForeignKey(dir_address_4_building, null=True, blank=True, related_name='client_address_postal_building')
    address_postal_placement_type = models.ForeignKey(dir_address_placement_type, null=True, blank=True, related_name='client_address_postal_placement_type')
    address_postal_placement = models.CharField(max_length=128, blank=True)
    pay_type = models.CharField(max_length=128, null=True, blank=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bank = models.ForeignKey(dir_bank, null=True, blank=True)
    bank_account = models.CharField(max_length=64, blank=True, help_text='Расчетный счет')
    inn = models.CharField(max_length=12, blank=True)
    kpp = models.CharField(max_length=9, blank=True)
    ogrn = models.CharField(max_length=32, blank=True, help_text='ОГРН')
    ogrnip = models.CharField(max_length=15, blank=True, help_text='ОГРНИП')
    is_active = models.SmallIntegerField(default=1)
    client_user = models.ManyToManyField(client_user)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'client'
        default_permissions = ()
        permissions = (
            ('client', 'Доступ к карточке клиента'),
            ('add_client', 'Добавлять клиентов'),
            ('change_client', 'Редактировать клиентов'),
            ('delete_client', 'Удалять клиентов'),
        )


class client_payment(models.Model):
    client = models.ForeignKey(client)
    sentry_user = models.ForeignKey(sentry_user, null=True, blank=True)
    value = models.DecimalField(max_digits=10, decimal_places=2, help_text='Сумма пополнения')
    payment_type = models.CharField(max_length=128, help_text='Способ оплаты')
    date = models.DateTimeField(help_text='Дата пополнения')
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_payment'
        ordering = ['date']
        default_permissions = ()
        permissions = (
            ('client_payment', 'Доступ к платежам'),
            ('add_client_payment', 'Добавлять платежи'),
            ('change_client_payment', 'Редактировать платежи'),
            ('delete_client_payment', 'Удалять платежи'),
        )


class dir_device(models.Model):
    device_console = models.ForeignKey(dir_device_console, null=True, blank=True, verbose_name='Пульт')
    device_type = models.ForeignKey(dir_device_type, null=True, blank=True, verbose_name='Тип устройства')
    name = models.CharField(max_length=128, unique=True,
                            verbose_name='Инвентарный номер', help_text='Серийный / инвентарный номер')
    number = models.IntegerField(null=True, blank=True)
    series = models.CharField(max_length=16, blank=True)
    belong = models.CharField(max_length=64, default='rent')
    comment = models.TextField(blank=True, verbose_name='Комментарий')
    code = models.CharField(max_length=8, null=True, blank=True)
    data = JSONField(default={})
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        verbose_name = 'Объектовое устройство'
        db_table = 'dir_device'
        ordering = ['name']
        default_permissions = ()
        permissions = (
            ('dir_device', 'Доступ к объектовым устройствам'),
            ('add_dir_device', 'Добавлять объектовые устройства'),
            ('change_dir_device', 'Редактировать объектовые устройства'),
            ('delete_dir_device', 'Удалять объектовые устройства'),
        )
        #unique_together = ('name', 'is_active')

    def checkPriority(self):
        install = self.client_object_dir_device_set.filter(uninstall_date=None, is_active=1)
        primary_install = install.filter(priority='primary').first()

        if install:
            if primary_install:
                self.client_object_dir_device_set \
                    .filter(uninstall_date=None, is_active=1) \
                    .exclude(id=primary_install.id) \
                    .update(priority='secondary')

            elif install:
                install_set = self.client_object_dir_device_set \
                    .filter(uninstall_date=None, is_active=1)
                install_set.update(priority='secondary')

                primary_install = install_set.first()
                primary_install.priority = 'primary'
                primary_install.save()
            return primary_install.id
        else:
            return 'no install'


class dir_sim_card(models.Model):
    number = models.CharField(max_length=12, unique=True)
    dir_device = models.ForeignKey(dir_device, null=True, blank=True, on_delete=models.SET_NULL)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        ordering = ['number']
        db_table = 'dir_sim_card'
        default_permissions = ()
        permissions = (
            ('dir_sim_card', 'Доступ к сим картам'),
            ('add_dir_sim_card', 'Добавлять сим карты'),
            ('change_dir_sim_card', 'Редактировать сим карты'),
            ('delete_dir_sim_card', 'Удалять сим карты'),
        )
        #unique_together = ('number', 'dir_device')


class client_contract(models.Model):
    client = models.ForeignKey(client, on_delete=models.CASCADE)
    name = models.CharField(max_length=512)
    service_type = models.ForeignKey(dir_service_type, null=True)
    status = models.ForeignKey(dir_object_status, default=1, related_name='client_contract_status')
    ovd_status = models.ForeignKey(dir_object_status, default=1, related_name='client_contract_ovd_status')
    security_previously = models.CharField(max_length=512, blank=True, help_text='Кем охранялся ранее')
    service_organization = models.ForeignKey(dir_service_organization, null=True, blank=True)
    begin_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    dir_service_subtype = models.ManyToManyField(dir_service_subtype)
    dir_tag = models.ManyToManyField(dir_tag)
    class Meta:
        db_table = 'client_contract'
        unique_together = ('name', 'service_organization')
        default_permissions = ()
        permissions = (
            ('client_contract', 'Доступ к договорам'),
            ('add_client_contract', 'Добавлять договора'),
            ('change_client_contract', 'Редактировать договора'),
            ('delete_client_contract', 'Удалять договора'),
        )

    def get_event_list(self):
        workflow_list = {'id':self.id, 'core':[], 'bonus':[]}
        for workflow in self.client_workflow_set.filter(is_active=1):
            workflow_dict = {
                'id': workflow.id,
                'event_date': workflow.workflow_date.strftime("%d.%m.%Y"),
                'name': workflow.workflow_type.name,
                'event_type_id': workflow.workflow_type.id,
                'event_type': workflow.workflow_type.label,
                'event_type_name': workflow.workflow_type.name,
                'event_type_description': workflow.workflow_type.description
            }
            if workflow.cost:
                workflow_dict['cost'] = str(workflow.cost)
            if workflow.sentry_user_id:
                workflow_dict['sentry_user_id'] = workflow.sentry_user.id
                workflow_dict['sentry_user'] = workflow.sentry_user.full_name
            try:
                workflow_dict['log_user_id'] = workflow.sentry_log_set.all().last().sentry_user.id
                workflow_dict['log_user'] = workflow.sentry_log_set.all().last().sentry_user.full_name
                workflow_dict['log_date'] = workflow.sentry_log_set.all().last().log_date.strftime("%d.%m.%Y %H:%M")
            except:
                pass
            workflow_list[workflow.workflow_type.type].append(workflow_dict)

        return workflow_list

    def set_subtype(self):
        subtype_list = []
        self.dir_service_subtype.clear()
        for object in self.client_bind_set.filter(is_active=1):
            for subtype in object.dir_service_subtype.all():
                self.dir_service_subtype.add(subtype.id)
                subtype_list.append(subtype.id)
        return subtype_list

    def get_subtype_list(self):
        subtype_list = []
        for subtype in self.dir_service_subtype.all():
            subtype_list.append({'id': subtype.id, 'name': subtype.name, 'description': subtype.description})
        return subtype_list

    def get_tag_list(self):
        tag_list = []
        for tag in self.dir_tag.filter(is_active=1):
            tag_list.append({'id': tag.id, 'name': tag.name})
        return tag_list

    def check_contract_status(self):
        status = 'new'
        bind_list = []
        ovd_status = 'disconnected'
        ovd_status_list = []

        for bind in self.client_bind_set.filter(is_active=1) \
                .exclude(status__label='new').exclude(status__label='archive'):
            bind_list.append(bind.status.label)
            ovd_status_list.append(bind.ovd_status.label)

        if 'connected' in bind_list:
            status = 'connected'
        elif 'disconnecting' in bind_list:
            status = 'disconnected'
        elif 'disconnected' in bind_list:
            status = 'disconnected'

        if 'disconnected' in ovd_status_list:
            ovd_status = 'disconnected'
        elif 'connected' in ovd_status_list:
            ovd_status = 'connected'

        if self.client_workflow_set.filter(workflow_type__label='client_contract_close', done=True, is_active=1):
            status = 'archive'

        self.status_id = dir_object_status.objects.get(label=status).id
        self.ovd_status_id = dir_object_status.objects.get(label=ovd_status).id
        self.save()

        return 'done status'#[bind_list, 'status: '+str(status), 'ovd_status: '+str(ovd_status)]


class client_object(models.Model):
    name = models.CharField(max_length=256)
    address_building = models.ForeignKey(dir_address_4_building, null=True, blank=True, help_text='Здание')
    address_placement_type = models.ForeignKey(dir_address_placement_type, null=True, blank=True, help_text='Тип помещения')
    address_placement = models.CharField(max_length=128, null=True, blank=True, help_text='Помещение')
    referer_type = models.ForeignKey(dir_referer_type, null=True, blank=True, help_text='Как пришел клиент')
    referer_user = models.ForeignKey(sentry_user, null=True, blank=True, help_text='Кто привел объект')
    security_previously = models.CharField(max_length=256, blank=True, help_text='Кем охранялся ранее')
    security_squad = models.ForeignKey(dir_security_squad, null=True, blank=True, help_text='ГПБ')
    occupation = models.TextField(blank=True, help_text='Вид деятельности')
    comment = models.TextField(blank=True)
    password = models.CharField(max_length=256, blank=True)
    is_active = models.SmallIntegerField(default=1)
    client_user = models.ManyToManyField(client_user)
    dir_tag = models.ManyToManyField(dir_tag)
    class Meta:
        db_table = 'client_object'
        ordering = ['name']
        default_permissions = ()


    def get_device_list(self):
        device_list = []
        for item in self.client_object_dir_device_set.filter(is_active=1):#uninstall_date=None,
            install = {
                'id': item.id,
                'device': item.device.id,
                'device__name': item.device.name,
                'install_date': item.install_date.strftime("%d.%m.%Y"),
                'password': item.password,
                'comment': item.comment,
                'priority': item.priority }
            if item.device.device_type_id:
                install['device__device_type'] = item.device.device_type.id
                install['device__device_type__name'] = item.device.device_type.name
            else:
                install['device__device_type__name'] = ''
            if item.install_user_id:
                install['install_user'] = item.install_user.id
                install['install_user__full_name'] = item.install_user.full_name
            if item.uninstall_date and item.uninstall_user:
                install['uninstall_date'] = item.uninstall_date.strftime("%d.%m.%Y"),
                install['uninstall_user'] = item.uninstall_user.id
                install['uninstall_user__full_name'] = item.uninstall_user.full_name
            device_list.append(install)
        return device_list

    def check_object_event(self):
        self.client_object_event_set.all().update(service=None)
        self.client_object_event_set \
            .filter(event_type_id__in=[2,3,4,5,6,7,8,9],is_active=1) \
            .update(object=object_id)
        return object_id

    def get_event_list(self):
        workflow_list = {'id':self.id, 'core':[], 'bonus':[]}
        for workflow in self.client_workflow_set.filter(is_active=1):
            workflow_dict = {
                'id': workflow.id,
                'event_date': workflow.workflow_date.strftime("%d.%m.%Y"),
                'name': workflow.workflow_type.name,
                'event_type_id': workflow.workflow_type.id,
                'event_type': workflow.workflow_type.label,
                'event_type_name': workflow.workflow_type.name,
                'event_type_description': workflow.workflow_type.description
            }
            if workflow.cost:
                workflow_dict['cost'] = str(workflow.cost)
            if workflow.sentry_user_id:
                workflow_dict['sentry_user_id'] = workflow.sentry_user.id
                workflow_dict['sentry_user'] = workflow.sentry_user.full_name
            try:
                workflow_dict['log_user_id'] = workflow.sentry_log_set.all().last().sentry_user.id
                workflow_dict['log_user'] = workflow.sentry_log_set.all().last().sentry_user.full_name
                workflow_dict['log_date'] = workflow.sentry_log_set.all().last().log_date.strftime("%d.%m.%Y %H:%M")
            except:
                pass
            workflow_list[workflow.workflow_type.type].append(workflow_dict)

        return workflow_list

    def get_address(self):
        try: address = self.address_building.street.locality.name \
                       +', '+ self.address_building.street.name \
                       +', '+ self.address_building.name
        except: address = None

        if address:
            try: address += ', '+self.address_placement_type.name.lower()
            except: address += ', '
            try: address += self.address_placement
            except: pass

        return address

    def get_map_yandex(self):
        address = self.get_address()
        if address:
            url = 'http://maps.yandex.ru/?text='+self.get_address()
            url = '<a class="yandex_map" href="'+url+'" target="_blank"></a>'
            return url
        else:
            return 'no address'

    def get_tag_list(self):
        tag_list = []
        for tag in self.dir_tag.all():
            tag_list.append({'id': tag.id, 'name': tag.name})
        return tag_list

    def get_warden(self):
        workflow_set = self.client_workflow_set.filter(workflow_type=1, done=True, is_active=1)
        if workflow_set.exists():
            return {'id': workflow_set[0].sentry_user.id, 'full_name': workflow_set[0].sentry_user.full_name}
        else:
            return {'id': None, 'full_name': None}


class client_bind(models.Model):
    client_contract = models.ForeignKey(client_contract)
    client_object = models.ForeignKey(client_object)
    console = models.ForeignKey(dir_device_console, null=True, blank=True, help_text='Тип пульта')
    console_number = models.IntegerField(null=True, blank=True, help_text='Номер объекта на пульте')
    status = models.ForeignKey(dir_object_status, default=1, related_name='client_bind_status')
    ovd_status = models.ForeignKey(dir_object_status, default=1, related_name='client_bind_ovd_status')
    begin_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    charge_month_day = models.PositiveSmallIntegerField(null=True, blank=True, help_text='День оплаты')
    charge_month = models.ForeignKey(dir_charge_month, null=True, blank=True, help_text='Месяц оплаты')
    time24 = models.BooleanField(default=True, help_text='Контроль режима работы')
    watch = models.BooleanField(default=False) # Флаг объект под охраной или нет
    watch_sections = ArrayField(models.IntegerField(), default=[]) # Список разделов под охраной
    is_active = models.SmallIntegerField(default=1)
    dir_tag = models.ManyToManyField(dir_tag)
    dir_service_subtype = models.ManyToManyField(dir_service_subtype)
    data = JSONField(default={})
    class Meta:
        db_table = 'client_bind'
        #unique_together = ('console', 'console_number')
        default_permissions = ()
        permissions = (
            ('client_object', 'Доступ к объектам'),
            ('add_client_bind', 'Добавлять объекты'),
            ('change_client_bind', 'Редактировать объекты'),
            ('delete_client_bind', 'Удалять объекты'),
        )


    ### Список разделов по данным расшлейфовки
    def get_sections_list(self):
        sections = [0]
        if not self.data.has_key("stub"):
            return sections
        for stub in self.data["stub"]:
            if stub["id_razdel"] not in sections:
                sections.append(stub["id_razdel"])
        return sections


    ### Проверка наличия услуги у объекта
    def CheckService(self, service_name):
        if service_name == self.client_contract.service_type.name:
            return True
        else:
            return False
            #bind = self..objects.get(pk=item.id)
            #dir_service_subtype.all()


    ### Получение закрепленного ГБР
    def GetSquad(self):
        return self.client_object.security_squad.name


    ### Получение ключа шифрования
    def GetCode(self):
        try:
            return self.client_object.client_object_dir_device_set.filter(uninstall_date=None, is_active=1).first().device.code
        except:
            return ''

    ### Информация о контроле режима работы
    def TimeControl(self):
        if self.time24:
            return u"С контролем режима работы"
        else:
            return u"Без контроля режима работы"


    ### Свободен ли номер на пульте
    def checkConsoleNumber(self, **kwargs):
        check = client_bind.objects. \
            filter(console=kwargs['console'], console_number=kwargs['console_number'], is_active=1). \
            exclude(status__label='archive')
        if check.exists() and check[0].id != self.id:
            return {kwargs['console_number']: u'Есть такой номер на пульте'}
        else:
            pass


    def get_connect_cost(self, **kwargs):
        try:
            connect_cost = str(self.client_bind_cost_set \
                               .filter(cost_type__label='client_object_connect', is_active=1) \
                               .first().cost_value)
        except:
            connect_cost = None
        return connect_cost


    def get_cost(self, **kwargs):
        cost_array = {'client_bind': self.id}
        cost_type_exclude = ['once', 'pause', 'client_object_connect']
        if 'current' in kwargs:
            cost = self.client_bind_cost_set \
                .filter(begin_date__lte=datetime.date.today(), is_active=1) \
                .exclude(cost_type__label__in=cost_type_exclude).last()
            if not cost:
                cost = self.client_bind_cost_set \
                    .filter(is_active=1).exclude(cost_type__label='pause').last()

            if cost:
                cost_array['current'] = {
                    'id': cost.id,
                    'cost_value': str(cost.cost_value),
                    'cost_type': cost.cost_type_id,
                    'cost_type__label': cost.cost_type.label,
                    'cost_type__name': cost.cost_type.name,
                    'charge_month_day': cost.charge_month_day,
                    'charge_month_id': cost.charge_month_id
                }
                if cost.begin_date: cost_array['current']['begin_date'] = cost.begin_date.strftime('%d.%m.%Y')
                if cost.comment: cost_array['current']['comment'] = cost.comment

        if 'list' in kwargs:
            cost_array['list'] = []
            index = 0
            cost_set = self.client_bind_cost_set.filter(is_active=1).order_by('begin_date')
            for cost in cost_set:
                cost_item = {
                    'id': cost.id,
                    'index': index,
                    'charge_month_day': cost.charge_month_day,
                    'charge_month_id': cost.charge_month_id
                }
                if cost.cost_type_id:
                    cost_item['cost_value'] = str(cost.cost_value)
                    cost_item['cost_type'] = cost.cost_type.label
                    cost_item['cost_type_id'] = cost.cost_type_id
                    cost_item['cost_type__name'] = cost.cost_type.name
                if cost.cost_value: cost_item['cost'] = str(cost.cost_value)
                if cost.begin_date: cost_item['begin_date'] = cost.begin_date.strftime('%d.%m.%Y')
                if cost.end_date: cost_item['end_date'] = cost.end_date.strftime('%d.%m.%Y')
                if cost.comment: cost_item['comment'] = cost.comment
                cost_array['list'].append(cost_item)
                index += 1
            if self.end_date:
                cost_array['list'].append({
                    'end_date': self.end_date.strftime('%d.%m.%Y'),
                    'index': 'end'
                })

        return cost_array

    def get_subtype_list(self):
        subtype_list = []
        for subtype in self.dir_service_subtype.all():
            subtype_list.append({'id': subtype.id, 'name': subtype.name})
        return subtype_list

    def check_bind_status(self):
        if self.client_contract.id:
            status = 'new'
            ovd_status = 'disconnected'
            workflow_list = []
            for workflow in client_workflow.objects.filter(
                    contract = self.client_contract.id,
                    object = self.client_object.id,
                    workflow_type__type = 'core',
                    done = True,
                    is_active = 1):
                workflow_list.append(workflow.workflow_type.label)


            if 'client_object_notice_off' in workflow_list:
                ovd_status = 'disconnected'
            elif 'client_object_notice' in workflow_list:
                ovd_status = 'connected'

            device_install = False
            if self.client_object.client_object_dir_device_set.filter(uninstall_date=None, is_active=1).exists():
                device_install = True

            if 'client_object_connect' in workflow_list:
                if ovd_status == 'connected' and device_install:
                    status = 'connected'
                elif ovd_status == 'connected':
                    status = 'connected'
                elif ovd_status == 'disconnected':
                    status = 'disconnected'

            if 'client_object_disconnect' in workflow_list:
                status = 'disconnected'
                if ovd_status=='connected':
                    status = 'disconnected'
                elif ovd_status=='disconnected' and device_install:
                    status = 'blue'
                elif ovd_status=='disconnected' and not device_install:
                    status = 'archive'

            cost = self.client_bind_cost_set.filter(
                cost_type__label='pause', is_active=1,
                begin_date__lte=datetime.date.today(), end_date__gte=datetime.date.today())
            if cost.exists():
                status = 'paused'

            self.status_id = dir_object_status.objects.get(label=status).id
            self.ovd_status_id = dir_object_status.objects.get(label=ovd_status).id
            self.save()

            contract_status = self.client_contract.check_contract_status()
            return [workflow_list,
                    'bind status: '+status,
                    'device_install: '+str(device_install),
                    'contract ovd_status: '+str(ovd_status),
                    'contract status: '+str(contract_status)]
        else:
            contract_answer = self.check_contract_status(contract_id=self.id)
            return ['status', contract_answer]


class client_bind_cost(models.Model):
    client_bind = models.ForeignKey(client_bind, on_delete=models.CASCADE)
    cost_type = models.ForeignKey(dir_cost_type)
    begin_date = models.DateTimeField(default=timezone.now, blank=True, help_text='Дата начала')
    end_date = models.DateTimeField(null=True, blank=True,  help_text='Дата окончания')
    cost_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    charge_month_day = models.SmallIntegerField(null=True, help_text='День начисления')
    charge_month = models.ForeignKey(dir_charge_month, null=True, blank=True, help_text='Месяц начисления')
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_bind_cost'
        ordering = ['begin_date']
        default_permissions = ()
        permissions = (
            ('add_client_bind_cost', 'Добавлять стоимость услуг'),
            ('change_client_bind_cost', 'Редактировать стоимость услуг'),
            ('delete_client_bind_cost', 'Удалять стоимость услуг'),
        )


class client_object_weapon(models.Model):
    object = models.ForeignKey(client_object, on_delete=models.CASCADE)
    weapon = models.ForeignKey(dir_weapon)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_weapon'
        default_permissions = ()
        permissions = (
            ('client_object_weapon', 'Доступ к оружию на объекте'),
            ('add_client_object_weapon', 'Добавлять оружие на объекте'),
            ('change_client_object_weapon', 'Редактировать оружие на объекте'),
            ('delete_client_object_weapon', 'Удалять оружие на объекте'),
        )


class client_workflow(models.Model):
    contract = models.ForeignKey(client_contract, null=True, blank=True)
    bind = models.ForeignKey(client_bind, null=True, blank=True)
    object = models.ForeignKey(client_object, null=True, blank=True)
    sentry_user = models.ForeignKey(sentry_user, null=True, blank=True)
    workflow_type = models.ForeignKey(dir_client_workflow_type)
    workflow_date = models.DateTimeField(default=timezone.now)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    comment = models.TextField(blank=True)
    done = models.BooleanField(default=True) # Если workflow_date = дата из будущего
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_workflow'
        ordering = ['-workflow_date']
        default_permissions = ()

class client_object_salary(models.Model):
    object = models.ForeignKey(client_object)
    salary_type = models.CharField(max_length=128)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    begin_date = models.DateTimeField()
    is_active = models.IntegerField(default=1)
    class Meta:
        db_table = 'client_object_salary'
        ordering = ['-begin_date']
        default_permissions = ()

class client_object_timetable(models.Model):
    bind = models.ForeignKey(client_bind)
    weekday = models.ForeignKey(dir_weekday)
    shift = models.SmallIntegerField()
    timetable_type = models.CharField(max_length=128, default='суточная')
    begin_time = models.TimeField()
    end_time = models.TimeField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    class Meta:
        db_table = 'client_object_timetable'
        ordering = ['shift']
        default_permissions = ()

class client_bind_charge(models.Model):
    bind = models.ForeignKey(client_bind)
    charge_type = models.CharField(max_length=128, default='auto', db_index=True)
    begin_date = models.DateTimeField(db_index=True)
    end_date = models.DateTimeField(db_index=True)
    value = models.DecimalField(max_digits=20, decimal_places=2, default=0.00, db_index=True)
    total = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    comment = models.TextField(blank=True)
    warden  = models.ForeignKey(sentry_user, null=True, blank=True, db_index=True)
    is_active = models.SmallIntegerField(default=1, db_index=True)
    class Meta:
        db_table = 'client_bind_charge'
        ordering = ['begin_date']
        default_permissions = ()

class client_bind_post(models.Model):
    bind = models.ForeignKey(client_bind)
    charge = models.ForeignKey(client_bind_charge)
    sentry_user = models.ForeignKey(sentry_user, null=True, blank=True)
    plan = models.CharField(default='planned', max_length=128)
    planned_begin_date = models.DateTimeField()
    planned_end_date = models.DateTimeField()
    completed_begin_date = models.DateTimeField()
    completed_end_date = models.DateTimeField()
    reason_begin = models.ForeignKey(dir_post_reason, null=True, blank=True, related_name='client_object_post_reason_begin')
    reason_end = models.ForeignKey(dir_post_reason, null=True, blank=True, related_name='client_object_post_reason_end')
    weapon = models.ForeignKey(dir_weapon, null=True, blank=True)
    hours = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_bind_post'
        ordering = ['completed_begin_date']
        default_permissions = ()

class client_object_dir_device(models.Model):
    object = models.ForeignKey(client_object)
    device = models.ForeignKey(dir_device)
    priority = models.CharField(max_length=32, default='primary', blank=True)
    install_date = models.DateTimeField()
    install_user = models.ForeignKey(sentry_user, related_name='client_object_dir_device_install_user')
    uninstall_date = models.DateTimeField(null=True, blank=True)
    uninstall_user = models.ForeignKey(sentry_user, null=True, blank=True, related_name='client_object_dir_device_uninstall_user')
    password = models.CharField(max_length=256, blank=True)
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_dir_device'
        default_permissions = ()

    def check_priority(self):
        # Если ОУ не подключена, но назначается priority == 'primary', иначе по умолчанию 'secondary'
        device_install_set = client_object_dir_device.objects.filter(device_id=self.device_id, is_active=1)
        if device_install_set.exists():
            priority = 0
            for install in device_install_set:
                if install.priority == 'primary':
                    priority += 1
            if priority < 1:
                device_install_set[0].priority = 'primary'
                device_install_set[0].save()
        return 'done'


class client_object_incident(models.Model):
    object = models.ForeignKey(client_object)
    incident_type = models.ForeignKey(dir_incident_type)
    incident_date = models.DateTimeField()
    arrival_date = models.DateTimeField(null=True)
    arrival_time = models.SmallIntegerField()
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_incident'
        ordering = ['-incident_date']
        default_permissions = ()

class setting_general(models.Model):
    user = models.ForeignKey(sentry_user, null=True, blank=True, related_name='setting_general_user')
    manager = models.ForeignKey(sentry_user, null=True, blank=True, related_name='setting_general_manager')
    warden = models.ForeignKey(sentry_user, null=True, blank=True, related_name='setting_general_warden')
    programmer = models.ForeignKey(sentry_user, null=True, blank=True, related_name='setting_general_programmer')
    technician = models.ForeignKey(sentry_user, null=True, blank=True, related_name='setting_general_technician')
    region = models.ForeignKey(dir_address_1_region, null=True, blank=True)
    locality = models.ForeignKey(dir_address_2_locality, null=True, blank=True)
    contract_string = models.CharField(max_length=512)
    currency = models.CharField(max_length=16, default="руб.")
    class Meta:
        db_table = 'setting_general'
        default_permissions = ()

class setting_interface(models.Model):
    section = models.CharField(max_length=128)
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=256)
    side = models.CharField(max_length=128, default='primary')
    position = models.IntegerField()
    class Meta:
        db_table = 'setting_interface'
        ordering = ['position']
        default_permissions = ()

class parser_debug(models.Model):
    date = models.DateTimeField(default=timezone.now)
    sentry_id = models.IntegerField(null=True, blank=True)
    security_id = models.IntegerField(null=True, blank=True)
    comment = models.TextField()
    class Meta:
        default_permissions = ()

class sentry_log(models.Model):
    #log_type = models.ForeignKey(auth_permission)
    log_date = models.DateTimeField(default=timezone.now)
    sentry_user = models.ForeignKey(sentry_user)
    client_contract = models.ForeignKey(client_contract, null=True, blank=True)
    client_object = models.ForeignKey(client_object, null=True, blank=True)
    client_workflow = models.ForeignKey(client_workflow, on_delete=models.CASCADE, blank=True, null=True)
    cost = models.ForeignKey(client_bind_cost, null=True, blank=True)
    charge = models.ForeignKey(client_bind_charge, null=True, blank=True)
    incident = models.ForeignKey(client_object_incident, null=True, blank=True)
    comment = models.TextField()
    noticed = models.IntegerField(default=0)
    class Meta:
        ordering = ['log_date']
        db_table = 'sentry_log'
        default_permissions = ()

class sentry_log_notice(models.Model):
    sentry_log = models.ForeignKey(sentry_log)
    sentry_user = models.ForeignKey(sentry_user)
    create_date = models.DateTimeField(default=timezone.now)
    alert_date = models.DateTimeField(default=timezone.now)
    sight = models.IntegerField(default=0)
    class Meta:
        db_table = 'sentry_log_notice'
        ordering = ['create_date','alert_date']
        default_permissions = ()



