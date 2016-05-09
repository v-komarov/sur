# -*- coding: utf-8 -*-

import datetime
from django.utils import timezone
from django.db import models


class dir_address_0_country(models.Model):
    name = models.CharField(max_length=256)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_0_country'
        ordering = ['name']

class dir_address_1_region(models.Model):
    country = models.ForeignKey(dir_address_0_country, default=1)
    name = models.CharField(max_length=256, help_text='Название региона')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_1_region'
        ordering = ['name']

class dir_address_2_locality(models.Model):
    region = models.ForeignKey(dir_address_1_region)
    name = models.CharField(max_length=256, help_text='Название населенного пункта')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_2_locality'
        ordering = ['region','name']

class dir_address_3_street(models.Model):
    locality = models.ForeignKey(dir_address_2_locality)
    name = models.CharField(max_length=256, help_text='Название улицы')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_3_street'
        ordering = ['name']

class dir_address_4_building(models.Model):
    street = models.ForeignKey(dir_address_3_street)
    name = models.CharField(max_length=256, help_text='Номер дома')
    postal_index = models.IntegerField(default=None, help_text='Почтовый индекс')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_address_4_building'
        ordering = ['name']

class dir_address_placement_type(models.Model):
    label = models.CharField(max_length=128, help_text='')
    name = models.CharField(max_length=128, help_text='')
    description = models.CharField(max_length=256, help_text='')
    def __unicode__(self):
        return self.label
    class Meta:
        db_table = 'dir_address_placement_type'

class dir_holding(models.Model):
    name = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_holding'
        ordering = ['name']

class dir_user_post(models.Model):
    name = models.CharField(max_length=128, help_text='Должность')
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_user_post'
        ordering = ['name']

class dir_user_status(models.Model):
    name = models.CharField(max_length=128, help_text='Статус')
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_user_status'
        ordering = ['name']

class dir_bank(models.Model):
    name = models.CharField(max_length=512, help_text='Наименование банка')
    bik = models.CharField(max_length=9, help_text='БИК')
    correspondent_account = models.CharField(max_length=32, help_text='Корреспондентский счёт')
    locality = models.CharField(max_length=512)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_bank'
        ordering = ['name']

class dir_cost_type(models.Model):
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=128)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_cost_type'
        ordering = ['name']

class dir_charge_month(models.Model):
    name = models.CharField(max_length=128)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_charge_month'

class dir_device_console(models.Model):
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_device_console'

class dir_device_communication_type(models.Model):
    name = models.CharField(max_length=128)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_device_communication_type'

class dir_device_communication(models.Model):
    communication_type = models.ForeignKey(dir_device_communication_type)
    name = models.CharField(max_length=128)
    description = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_device_communication'

class dir_device_type(models.Model):
    name = models.CharField(max_length=32)
    description = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    dir_device_communication = models.ManyToManyField(dir_device_communication)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_device_type'

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

class dir_tag(models.Model):
    root = models.CharField(max_length=256)
    name = models.CharField(max_length=32)
    description = models.CharField(max_length=256)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_tag'

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

class dir_security_squad(models.Model):
    name = models.CharField(max_length=64, help_text='Название ГБР')
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        ordering = ['name']
        db_table = 'dir_security_squad'

class dir_task_status(models.Model):
    label = models.CharField(max_length=32)
    name = models.CharField(max_length=64)
    class Meta:
        db_table = 'dir_task_status'

class dir_task_type(models.Model):
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=128)
    class Meta:
        db_table = 'dir_task_type'

class sentry_user(models.Model):
    full_name = models.CharField(max_length=128)
    username = models.CharField(max_length=128)
    post = models.ForeignKey(dir_user_post, help_text='Должность')
    status = models.ForeignKey(dir_user_status)
    birthday = models.DateField(default=None)
    mobile_phone = models.CharField(max_length=24, default=None)
    city_phone = models.CharField(max_length=24, default=None)
    other_phone = models.CharField(max_length=24, default=None)
    email = models.CharField(max_length=256, default=None)
    passport_series = models.CharField(max_length=4, default=None, help_text='Серия паспорта')
    passport_number = models.CharField(max_length=6, default=None, help_text='Номер паспорта')
    passport_data = models.CharField(max_length=64, default=None, help_text='Кем и когда выдан')
    address = models.CharField(max_length=256, default=None)
    address2 = models.CharField(max_length=256, default=None)
    comment = models.TextField(default=None)
    trash = models.CharField(max_length=2048, default=None, help_text='Такие вот права доступа в старом СУРе')
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user'
        ordering = ['full_name']

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

class dir_service_organization(models.Model):
    name = models.CharField(max_length=256)
    license = models.CharField(max_length=32, help_text='Номер лицензии')
    address_locality = models.ForeignKey(dir_address_2_locality)
    address_placement = models.CharField(max_length=128)
    address = models.CharField(max_length=512)
    address_index = models.CharField(max_length=6)
    phone = models.CharField(max_length=128)
    fax = models.CharField(max_length=128)
    bank = models.ForeignKey(dir_bank)
    bank_account = models.CharField(max_length=64, help_text='Расчетный счет')
    inn = models.CharField(max_length=12)
    kpp = models.CharField(max_length=9)
    director = models.ForeignKey(sentry_user)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_service_organization'
        ordering = ['name']

class dir_console_interval(models.Model):
    service_organization = models.ForeignKey(dir_service_organization)
    device_console = models.ForeignKey(dir_device_console)
    begin = models.IntegerField()
    end = models.IntegerField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_console_interval'

class dir_weapon_type(models.Model):
    name = models.CharField(max_length=128)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_weapon_type'

class dir_weapon(models.Model):
    series = models.CharField(max_length=16)
    number = models.CharField(max_length=16)
    weapon_type = models.ForeignKey(dir_weapon_type)
    service_organization = models.ForeignKey(dir_service_organization)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_weapon'
        ordering = ['series','number']

class sentry_user_card(models.Model):
    user = models.ForeignKey(sentry_user)
    service_organization = models.ForeignKey(dir_service_organization)
    series = models.CharField(max_length=8)
    number = models.CharField(max_length=16)
    date = models.DateField()
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_card'
        ordering = ['-date']

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
    date = models.DateField()
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_card_status'
        ordering = ['-date']

class sentry_user_certificate(models.Model):
    user = models.ForeignKey(sentry_user)
    category = models.IntegerField()
    series = models.CharField(max_length=8)
    number = models.CharField(max_length=32)
    date = models.DateField()
    expire_date = models.DateField()
    check_date = models.DateField()
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_certificate'
        ordering = ['-date']

class sentry_user_certificate_check(models.Model):
    certificate = models.ForeignKey(sentry_user_certificate)
    plan_check_date = models.DateField()
    real_check_date = models.DateField(default=None)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_certificate_check'
        ordering = ['-plan_check_date']

class sentry_user_identity(models.Model):
    user = models.ForeignKey(sentry_user)
    series = models.CharField(max_length=8)
    number = models.CharField(max_length=32)
    date = models.DateField()
    extended_date = models.DateField()
    expire_date = models.DateField()
    check_date = models.DateField()
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_identity'
        ordering = ['-expire_date']

class sentry_user_weapon(models.Model):
    user = models.ForeignKey(sentry_user)
    weapon = models.ForeignKey(dir_weapon)
    number = models.CharField(max_length=16)
    date = models.DateField()
    expire_date = models.DateField()
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'sentry_user_weapon'
        ordering = ['-date']

class dir_event_group(models.Model):
    name = models.CharField(max_length=32)
    description = models.CharField(max_length=128)
    status = models.CharField(max_length=128)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_event_group'

class dir_object_event_type(models.Model):
    type = models.CharField(max_length=32)
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=256)
    description = models.TextField()
    position = models.IntegerField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    sentry_user = models.ForeignKey(sentry_user)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_object_event_type'
        ordering = ['position']

class dir_event(models.Model):
    group = models.ForeignKey(dir_event_group)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=128)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_event'

class dir_incident_type(models.Model):
    name = models.CharField(max_length=32)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'dir_incident_type'
        ordering = ['name']

class dir_legal_type(models.Model):
    label = models.CharField(max_length=125)
    name = models.CharField(max_length=125)
    class Meta:
        db_table = 'dir_legal_type'

class dir_legal_type_base(models.Model):
    legal_type = models.ForeignKey(dir_legal_type)
    label = models.CharField(max_length=125)
    name = models.CharField(max_length=125)
    class Meta:
        db_table = 'dir_legal_type_base'

class dir_code(models.Model):
    code = models.CharField(max_length=8)
    dir_event = models.ForeignKey(dir_event)
    def __unicode__(self):
        return self.code
    class Meta:
        db_table = 'dir_event_code'
        ordering = ['code']

class dir_contract_interval(models.Model):
    service_organization = models.ForeignKey(dir_service_organization)
    begin = models.IntegerField()
    end = models.IntegerField()
    prefix = models.CharField(max_length=16, default=None)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_contract_interval'

class dir_referer_type(models.Model):
    label = models.CharField(max_length=32)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=512)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_referer_type'

class dir_weekday(models.Model):
    weekday = models.IntegerField()
    name = models.CharField(max_length=32)
    class Meta:
        db_table = 'dir_weekday'

class client_user_phone(models.Model):
    code = models.CharField(max_length=4)
    phone = models.CharField(max_length=7)
    phone_type = models.CharField(max_length=32)
    comment = models.TextField()
    def __unicode__(self):
        return self.phone
    class Meta:
        db_table = 'client_user_phone'
        ordering = ['phone_type']

class client_user_email(models.Model):
    email = models.CharField(max_length=128)
    subscribe = models.CharField(max_length=3, default='да')
    def __unicode__(self):
        return self.phone
    class Meta:
        db_table = 'client_user_email'

class client_user(models.Model):
    full_name = models.CharField(max_length=256)
    priority = models.IntegerField(default=1)
    post = models.ForeignKey(dir_user_post)
    birthday = models.DateField()
    passport = models.CharField(max_length=256, default=None)
    address = models.CharField(max_length=512, default=None)
    client_user_phone = models.ManyToManyField(client_user_phone)
    client_user_email = models.ManyToManyField(client_user_email)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)

    def __unicode__(self):
        return self.full_name
    class Meta:
        db_table = 'client_user'
        ordering = ['full_name']

'''
class client_user_client_user_phone(models.Model):
    client_user = models.ForeignKey(client_user)
    client_user_phone = models.ForeignKey(client_user_phone)
    class Meta:
        db_table = 'client_user_client_user_phone'

class client_user_client_user_email(models.Model):
    client_user = models.ForeignKey(client_user)
    client_user_email = models.ForeignKey(client_user_email)
    class Meta:
        db_table = 'client_user_client_user_email'
'''

class client(models.Model):
    name = models.CharField(max_length=256)
    holding = models.ForeignKey(dir_holding)
    founding_date = models.DateField(blank=True)
    legal_type_base = models.ForeignKey(dir_legal_type_base)
    address_legal_index = models.CharField(max_length=6)
    address_legal_building = models.ForeignKey(dir_address_4_building, related_name='client_address_legal_building')
    address_legal_placement = models.CharField(max_length=128)
    address_legal_placement_type = models.ForeignKey(dir_address_placement_type, related_name='client_address_legal_placement_type')
    address_actual_index = models.CharField(max_length=6)
    address_actual_building = models.ForeignKey(dir_address_4_building, related_name='client_address_actual_building')
    address_actual_placement = models.CharField(max_length=128)
    address_actual_placement_type = models.ForeignKey(dir_address_placement_type, related_name='client_address_actual_placement_type')
    address_postal_index = models.CharField(max_length=6)
    address_postal_building = models.ForeignKey(dir_address_4_building, related_name='client_address_postal_building')
    address_postal_placement = models.CharField(max_length=128)
    address_postal_placement_type = models.ForeignKey(dir_address_placement_type, related_name='client_address_postal_placement_type')
    pay_type = models.CharField(default=None, max_length=128)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bank = models.ForeignKey(dir_bank)
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


'''
class client_client_user(models.Model):
    client = models.ForeignKey(client)
    client_user = models.ForeignKey(client_user)
    class Meta:
        db_table = 'client_client_user'
'''

class client_payment(models.Model):
    client = models.ForeignKey(client)
    sentry_user = models.ForeignKey(sentry_user)
    value = models.DecimalField(max_digits=10, decimal_places=2, help_text='Сумма пополнения')
    payment_type = models.CharField(max_length=128, help_text='Способ оплаты')
    date = models.DateTimeField(help_text='Когда пополняли баланс')
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_payment'
        ordering = ['date']

class dir_device(models.Model):
    device_console = models.ForeignKey(dir_device_console)
    device_type = models.ForeignKey(dir_device_type)
    name = models.CharField(max_length=128)
    series = models.CharField(max_length=16)
    number = models.IntegerField()
    belong = models.CharField(max_length=64, default='rent')
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_device'

class dir_sim_card(models.Model):
    number = models.CharField(max_length=12)
    dir_device = models.ForeignKey(dir_device, default=None, null=True, on_delete=models.SET_NULL)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'dir_sim_card'

class client_object(models.Model):
    client = models.ForeignKey(client)
    name = models.CharField(max_length=256)
    status = models.ForeignKey(dir_object_status, default=1)
    address_building = models.ForeignKey(dir_address_4_building)
    address_placement = models.CharField(max_length=128, help_text='Помещение')
    address_placement_type = models.ForeignKey(dir_address_placement_type)
    referer_type = models.ForeignKey(dir_referer_type, default=None, help_text='Как пришел клиент')
    referer_user = models.ForeignKey(sentry_user, default=None, help_text='Кто привел объект')
    security_previously = models.CharField(max_length=256, help_text='Кем охранялся ранее')
    occupation = models.TextField()
    comment = models.TextField()
    client_user = models.ManyToManyField(client_user)
    dir_tag = models.ManyToManyField(dir_tag)
    is_active = models.SmallIntegerField(default=1)
    #dir_device = models.ManyToManyField(dir_device)
    class Meta:
        db_table = 'client_object'

    def get_service_list(self):
        service_list = []
        for service in self.client_object_service_set.filter(is_active=1):
            service_dict = {}
            if service.contract_number:
                service_dict['object_tag'] = self.get_tags()
                service_dict['contract_number'] = service.contract_number
                try: service_dict['contract_date'] = service.begin_date.strftime("%d.%m.%Y")
                except: service_dict['contract_date'] = None
                try: service_dict['contract_status'] = service.contract_status.label
                except: service_dict['contract_status'] = None
                service_dict['service_status'] = service.status.label
                service_dict['service_type'] = service.service_type.name
                service_dict['service_subtype'] = ''
            for subtype in service.dir_service_subtype.all():
                service_dict['service_subtype'] += subtype.name+','
            try: service_dict['service_subtype'] = service_dict['service_subtype'][:-1]
            except: pass
            service_list.append(service_dict)
        return service_list

    def get_service_cost(self):
        check = 0
        for service in self.client_object_service_set.filter(is_active=1):
            for cost in service.client_object_service_cost_set.filter(is_active=1):
                try:
                    check = int(cost.cost)
                    break
                except: pass
        return check

    def get_service_organization(self):
        service_organization = ''
        security_list = []
        for service in self.client_object_service_set.filter(is_active=1):
            if service.service_organization_id:
                if service.service_organization.id not in security_list:
                    service_organization += service.service_organization.name+', '
                    security_list.append(service.service_organization.id)
        return service_organization[:-2]

    def get_warden(self):
        event_set = self.client_object_event_set.filter(event_type=1, is_active=1)
        if event_set.exists():
            return {'id': event_set[0].sentry_user.id, 'full_name': event_set[0].sentry_user.full_name}
        else:
            return {'id': None, 'full_name': None}

    def get_event_list(self):
        event_list = {'core':[], 'bonus':[]}
        for event in self.client_object_event_set.filter(is_active=1):
            try:
                event_dict = {
                    'id': event.id,
                    'event_date': event.event_date.strftime("%d.%m.%Y"),
                    'name': event.event_type.name,
                    'event_type_id': event.event_type.id,
                    'event_type': event.event_type.label,
                    'event_type_name': event.event_type.name,
                    'event_type_description': event.event_type.description
                }
                if event.service_id: event_dict['service_id'] = event.service_id
                if event.event_type.type=='bonus': event_dict['cost'] = str(event.cost)
                if event.sentry_user_id:
                    event_dict['sentry_user_id'] = event.sentry_user.id
                    event_dict['sentry_user'] = event.sentry_user.full_name

                try:
                    event_dict['log_user_id'] = event.sentry_log_set.all().first().sentry_user.id
                    event_dict['log_user'] = event.sentry_log_set.all().first().sentry_user.full_name
                    event_dict['log_date'] = event.sentry_log_set.all().first().log_date.strftime("%d.%m.%Y %H:%M")
                except: pass

                event_list[event.event_type.type].append(event_dict)
            except: pass


        return event_list

    def check_service_event(self,service_id):
        #service_id = self.client_object_service_set.filter(priority=0).first().id
        self.client_object_event_set.all().update(service=None)
        self.client_object_event_set \
            .filter(event_type_id__in=[2,3,4,5,6,7,8,9],is_active=1) \
            .update(service=service_id)
        return service_id

    def get_tag_list(self):
        string = ''
        for tag in self.dir_tag.filter(root='client_object',is_active=1):
            string += tag.name+','
        return string[:-1]

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
        url = 'http://maps.yandex.ru/?text='+self.get_address()
        url = '<a class="yandex_map" href="'+url+'" target="_blank"></a>'
        return url


class client_object_service(models.Model):
    object = models.ForeignKey(client_object)
    contract = models.ForeignKey('self', default=None, related_name='client_object_service_contract')
    console = models.ForeignKey(dir_device_console, default=None)
    console_number = models.IntegerField(default=None)
    contract_number = models.CharField(max_length=32)
    name = models.CharField(max_length=256)
    password = models.CharField(max_length=256)
    status = models.ForeignKey(dir_object_status, default=1, related_name='client_object_service_status')
    contract_status = models.ForeignKey(dir_object_status, default=4)
    service_type = models.ForeignKey(dir_service_type)
    begin_date = models.DateField(default=None)
    end_date = models.DateField(default=None)
    service_organization = models.ForeignKey(dir_service_organization, default=None)
    security_squad = models.ForeignKey(dir_security_squad, default=None)
    comment = models.TextField()
    armed = models.IntegerField(default=0)
    is_active = models.SmallIntegerField(default=1)
    dir_service_subtype = models.ManyToManyField(dir_service_subtype)
    class Meta:
        db_table = 'client_object_service'
        ordering = ['name']

    def get_device_list(self):
        device_list = []
        for item in self.client_object_service_dir_device_set.filter(uninstall_date=None,is_active=1):
            install = {
                'id': item.id,
                'device': item.device_id,
                'device__name': item.device.name,
                'install_date': item.install_date.strftime("%d.%m.%Y"),
                'password': item.password,
                'comment': item.comment,
                'priority': item.priority }
            if item.device.device_type_id:
                install['device__device_type_id'] = item.device.device_type.id
                install['device__device_type__name'] = item.device.device_type.name
            else:
                install['device__device_type__name'] = ''
            if item.install_user_id:
                install['install_user'] = item.install_user.id
                install['install_user__full_name'] = item.install_user.full_name
            device_list.append(install)
        return device_list

    def get_charge_month_day(self):
        cost_set = self.client_object_service_cost_set.filter(is_active=1).first()
        charge_month_day_array = {
            'charge_month_day': cost_set.charge_month_day,
            'charge_month_id': cost_set.charge_month_id
        }
        return charge_month_day_array

    def get_contract_subtype_list(self):
        subtype_id_list = []
        subtype_list = []
        for service in client_object_service.objects.filter(contract=self.id):
            for subtype in service.dir_service_subtype.all():
                if subtype.id not in subtype_id_list:
                    subtype_id_list.append(subtype.id)
                    subtype_list.append({
                        'id': subtype.id,
                        'name': subtype.name,
                        'description': subtype.description
                    })
        return subtype_list

    def get_subtype_list(self):
        subtype_list = []
        for subtype in self.dir_service_subtype.all():
            subtype_list.append({
                'id': subtype.id,
                'name': subtype.name,
                'description': subtype.description
            })
        return subtype_list

    def get_weapon_list(self):
        weapon_list = []
        for item in client_object_service_weapon.objects.filter(service_id=self.id,is_active=1):
            weapon_list.append(item.weapon_id)
        return weapon_list

    def get_service_string(self):
        if self.contract_id: contract_number = self.contract.contract_number
        else: contract_number = self.contract_number
        service_string = contract_number+' - '+self.service_type.name
        subtype_cnt = 0
        for subtype in self.dir_service_subtype.all():
            if subtype_cnt==0:
                service_string += ' ['
            service_string += subtype.name+'+'
            subtype_cnt += 1
        if subtype_cnt>0:
            service_string = service_string[:-1]+']'

        return service_string

    def check_contract_status(self,**kwargs):
        if kwargs['contract_id']:
            contract_id = kwargs['contract_id']
        else:
            contract_id = self.id
        contract_set = client_object_service.objects.get(id=contract_id)

        object_status_list = []
        object_contract_status_list = []
        for object in client_object_service.objects.filter(contract=contract_id, is_active=1):
            event_list = []
            for event in object.client_object_event_set.filter(event_type__type='core', is_active=1 ):
                event_list.append(event.event_type.label)

            contract_status = 'disconnected' # цвет поля «Дата договора»
            if 'client_object_contract_notice' in event_list:
                contract_status = 'connected'
            if 'client_object_contract_notice_off' in event_list:
                contract_status = 'disconnected'
            object.contract_status_id = dir_object_status.objects.get(label=contract_status).id
            object.save()

            object_status_list.append(object.status.label)
            object_contract_status_list.append(object.contract_status.label)

        # цвет поля «Номер договора»
        service_status = 'new'
        if len(object_status_list)>0:
            if 'connected' in object_status_list: service_status = 'connected'
            else: service_status = 'disconnected'

        # цвет поля «Дата договора»
        contract_status = 'disconnected'
        if len(object_contract_status_list)>0:
            if 'connected' in object_contract_status_list: contract_status = 'connected'
            else: contract_status = 'disconnected'

        contract_set.status_id = dir_object_status.objects.get(label=service_status).id
        contract_set.contract_status_id = dir_object_status.objects.get(label=contract_status).id
        contract_set.save()
        return {'service_status':service_status, 'contract_status':contract_status, 'object_list':object_status_list}

    def check_object_status(self):
        if self.contract_id:
            status = 'new'
            event_list = []
            for event in self.client_object_event_set.filter(event_type__type='core', is_active=1):
                event_list.append(event.event_type.label)

            if 'client_object_connect' in event_list:
                status = 'connected'
            if 'client_object_disconnect' in event_list and self.client_object_service_dir_device_set.filter(uninstall_date=None,is_active=1).exists():
                status = 'disconnecting'
            elif 'client_object_disconnect' in event_list:
                status = 'disconnected'

            cost = self.client_object_service_cost_set.filter(
                cost_type__label='pause', is_active=1,
                begin_date__lte=datetime.date.today(), end_date__gte=datetime.date.today() )
            if cost.exists():
                status = 'paused'

            self.status_id = dir_object_status.objects.get(label=status).id
            self.save()
            contract_answer = self.check_contract_status(contract_id=self.contract.id)

            return ['status',contract_answer]
            #return status
        else:
            contract_answer = self.check_contract_status(contract_id=self.id)
            return ['status',contract_answer]

    def get_cost(self, **kwargs):
        today = datetime.date.today()
        cost_array = {}
        if 'current' in kwargs:
            cost = self.client_object_service_cost_set \
                .filter(begin_date__lte=today, is_active=1) \
                .exclude(cost_type__label='pause').last()
            if not cost:
                cost = self.client_object_service_cost_set \
                    .filter(is_active=1).exclude(cost_type__label='pause').last()

            if cost:
                cost_array['current'] = {
                    'id': cost.id,
                    'cost': str(cost.cost),
                    'cost_type': cost.cost_type.label,
                    'cost_type_id': cost.cost_type_id,
                    'cost_type__name': cost.cost_type.name,
                    'charge_month_day': cost.charge_month_day,
                    'charge_month_id': cost.charge_month_id
                }
                if cost.begin_date: cost_array['current']['begin_date'] = cost.begin_date.strftime('%d.%m.%Y')
                if cost.comment: cost_array['current']['comment'] = cost.comment

        if 'list' in kwargs:
            cost_array['list'] = []
            index = 0
            cost_set = self.client_object_service_cost_set.filter(is_active=1).order_by('begin_date')
            for cost in cost_set:
                cost_item = {
                    'id': cost.id,
                    'index': index,
                    'charge_month_day': cost.charge_month_day,
                    'charge_month_id': cost.charge_month_id
                }
                if cost.cost_type_id:
                    cost_item['cost'] = str(cost.cost)
                    cost_item['cost_type'] = cost.cost_type.label
                    cost_item['cost_type_id'] = cost.cost_type_id
                    cost_item['cost_type__name'] = cost.cost_type.name
                if cost.cost: cost_item['cost'] = str(cost.cost)
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


class client_object_service_weapon(models.Model):
    service = models.ForeignKey(client_object)
    weapon = models.ForeignKey(dir_weapon)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_service_weapon'

class client_object_service_cost(models.Model):
    service = models.ForeignKey(client_object_service)
    begin_date = models.DateTimeField(default=None, help_text='Дата начала')
    end_date = models.DateTimeField(default=None, help_text='Дата окончания')
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=None)
    cost_type = models.ForeignKey(dir_cost_type)
    charge_month_day = models.SmallIntegerField(default=None, help_text='День начисления')
    charge_month = models.ForeignKey(dir_charge_month, help_text='Месяц начисления')
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_service_cost'
        ordering = ['begin_date']


class client_object_event(models.Model):
    object = models.ForeignKey(client_object)
    service = models.ForeignKey(client_object_service)
    event_type = models.ForeignKey(dir_object_event_type)
    sentry_user = models.ForeignKey(sentry_user, default=None)
    event_date = models.DateTimeField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=None)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_event'
        ordering = ['-event_date']

class client_object_service_salary(models.Model):
    service = models.ForeignKey(client_object_service)
    salary_type = models.CharField(max_length=128)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    begin_date = models.DateTimeField()
    is_active = models.IntegerField(default=1)
    class Meta:
        db_table = 'client_object_service_salary'
        ordering = ['-begin_date']

class client_object_service_timetable(models.Model):
    service = models.ForeignKey(client_object_service)
    weekday = models.ForeignKey(dir_weekday)
    shift = models.SmallIntegerField()
    timetable_type = models.CharField(max_length=128, default='суточная')
    begin_time = models.TimeField()
    end_time = models.TimeField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    class Meta:
        db_table = 'client_object_service_timetable'
        ordering = ['shift']

class client_object_service_charge(models.Model):
    service = models.ForeignKey(client_object_service)
    charge_type = models.CharField(max_length=128, default='auto', db_index=True)
    begin_date = models.DateTimeField(db_index=True)
    end_date = models.DateTimeField(db_index=True)
    value = models.DecimalField(max_digits=20, decimal_places=2, default=0.00, db_index=True)
    total = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    comment = models.TextField(default=None)
    warden  = models.ForeignKey(sentry_user, default=None, db_index=True)
    is_active = models.SmallIntegerField(default=1, db_index=True)
    class Meta:
        db_table = 'client_object_service_charge'
        ordering = ['begin_date']

class client_object_service_post(models.Model):
    charge = models.ForeignKey(client_object_service_charge)
    service = models.ForeignKey(client_object_service)
    sentry_user = models.ForeignKey(sentry_user, default=None)
    plan = models.CharField(default='planned', max_length=128)
    planned_begin_date = models.DateTimeField()
    planned_end_date = models.DateTimeField()
    completed_begin_date = models.DateTimeField()
    completed_end_date = models.DateTimeField()
    reason_begin = models.ForeignKey(dir_post_reason, default=None, related_name='client_object_service_post_reason_begin')
    reason_end = models.ForeignKey(dir_post_reason, default=None, related_name='client_object_service_post_reason_end')
    weapon = models.ForeignKey(dir_weapon)
    hours = models.DecimalField(max_digits=5, decimal_places=2, default=None)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=None)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=None)
    comment = models.TextField(default=None)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_service_post'
        ordering = ['completed_begin_date']


'''
class client_object_client_user(models.Model):
    client_object = models.ForeignKey(client_object)
    client_user = models.ForeignKey(client_user)
    class Meta:
        db_table = 'client_object_client_user'

class client_object_service_dir_service_subtype(models.Model):
    client_object_service = models.ForeignKey(client_object_service)
    dir_service_subtype = models.ForeignKey(dir_service_subtype)
    class Meta:
        db_table = 'client_object_service_dir_service_subtype'

class client_object_dir_tag(models.Model):
    client_object = models.ForeignKey(client_object)
    dir_tag = models.ForeignKey(dir_tag)
    class Meta:
        db_table = 'client_object_dir_tag'
'''

class client_object_service_dir_device(models.Model):
    service = models.ForeignKey(client_object_service)
    device = models.ForeignKey(dir_device)
    priority = models.CharField(max_length=32, default='secondary')
    install_date = models.DateField()
    install_user = models.ForeignKey(sentry_user, related_name='client_object_service_dir_device_install_user')
    uninstall_date = models.DateField()
    uninstall_user = models.ForeignKey(sentry_user, related_name='client_object_service_dir_device_uninstall_user')
    password = models.CharField(max_length=256, default=None)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_service_dir_device'


class client_object_incident(models.Model):
    object = models.ForeignKey(client_object)
    incident_type = models.ForeignKey(dir_incident_type)
    incident_date = models.DateTimeField()
    arrival_date = models.DateTimeField(default=None)
    arrival_time = models.SmallIntegerField()
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_incident'
        ordering = ['-incident_date']


'''
class object(models.Model):
    object_id = models.IntegerField()
    status = models.ForeignKey(dir_event_group, default=1)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'object'

class event_action(models.Model):
    reason = models.ForeignKey(dir_event)
    gbr_started_id = models.IntegerField()
    gbr_started_time = models.DateTimeField(blank=True)
    gbr_arrived_id = models.IntegerField()
    gbr_arrived_time = models.DateTimeField(blank=True)
    gbr_arrived_seconds = models.IntegerField(blank=True)
    report = models.ForeignKey(dir_incident_type)
    def __unicode__(self):
        return self.action
    def get_delta_time(self):
        return datetime.datetime.fromtimestamp(self.gbr_arrived_seconds).strftime("%M:%S")
    class Meta:
        db_table = 'event_action'
        ordering = ['-gbr_started_time']

class event_cancel(models.Model):
    reason = models.ForeignKey(dir_event)
    time = models.DateTimeField(blank=True)
    def __unicode__(self):
        return self.time
    class Meta:
        db_table = 'event_cancel'
        ordering = ['-time']

class event(models.Model):
    object = models.ForeignKey(object, to_field='object_id')
    dir_event = models.ForeignKey(dir_event)
    event_time = models.DateTimeField(blank=None)
    response_seconds = models.IntegerField(default=None)
    action = models.ForeignKey(event_action, default=None)
    cancel = models.ForeignKey(event_cancel, default=None)
    def __unicode__(self):
        return self.event
    def response_time(self):
        return datetime.datetime.fromtimestamp(self.response_seconds).strftime("%M:%S")
    class Meta:
        db_table = 'event'
        ordering = ['-event_time']

class event_log(models.Model):
    object = models.ForeignKey(object, to_field='object_id')
    event = models.ForeignKey(event)
    previous_dir_event = models.ForeignKey(dir_event)
    dir_event = models.ForeignKey(dir_event)
    user_id = models.IntegerField()
    time = models.DateTimeField(blank=None)
    def __unicode__(self):
        return self.id
    class Meta:
        db_table = 'event_log'
        ordering = ['id']

class object_wires(models.Model):
    object = models.ForeignKey(object, to_field='object_id')
    dir_event = models.ForeignKey(dir_event)
    description = models.CharField(max_length=128)
    class Meta:
        db_table = 'object_wires'
        ordering = ['dir_event__name']
'''

class setting_general(models.Model):
    user = models.ForeignKey(sentry_user, related_name='setting_general_user')
    manager = models.ForeignKey(sentry_user, related_name='setting_general_manager')
    warden = models.ForeignKey(sentry_user, related_name='setting_general_warden')
    programmer = models.ForeignKey(sentry_user, related_name='setting_general_programmer')
    technician = models.ForeignKey(sentry_user, related_name='setting_general_technician')
    region = models.ForeignKey(dir_address_1_region)
    locality = models.ForeignKey(dir_address_2_locality)
    contract_string = models.CharField(max_length=512)
    class Meta:
        db_table = 'setting_general'

class setting_interface(models.Model):
    section = models.CharField(max_length=128)
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=256)
    side = models.CharField(max_length=128, default='primary')
    position = models.IntegerField()
    class Meta:
        db_table = 'setting_interface'
        ordering = ['position']

class client_object_task(models.Model):
    object = models.ForeignKey(client_object)
    service = models.ForeignKey(client_object_service)
    task_type = models.ForeignKey(dir_task_type)
    status = models.ForeignKey(dir_task_status, default=1)
    create_user = models.ForeignKey(sentry_user, related_name='client_object_task_create_user')
    create_date = models.DateTimeField()
    completion_date = models.DateTimeField()
    device = models.ForeignKey(dir_device, default=None)
    initiator = models.ForeignKey(client_user, default=None)
    initiator_other = models.CharField(max_length=256, default=None)
    warden = models.ForeignKey(sentry_user, related_name='client_object_task_warden')
    doer = models.ForeignKey(sentry_user, related_name='client_object_task_doer')
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_task'
        ordering = ['-completion_date']

    def get_report(self):
        report_list = []
        report_set = client_object_task_report.objects.filter(task=self.id,is_active=1)
        for item in report_set:
            report_list.append(item.weapon_id)
        return report_list


class client_object_task_log(models.Model):
    task = models.ForeignKey(client_object_task)
    create_date = models.DateTimeField()
    user = models.ForeignKey(sentry_user)
    old_date = models.DateTimeField()
    new_date = models.DateTimeField()
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_task_log'

class client_object_task_report(models.Model):
    task = models.ForeignKey(client_object_task)
    status = models.ForeignKey(dir_task_status)
    create_date = models.DateTimeField()
    user = models.ForeignKey(sentry_user, related_name='client_object_task_report_user')
    warden = models.ForeignKey(sentry_user, related_name='client_object_task_report_warden')
    doer = models.ForeignKey(sentry_user, default=None, related_name='client_object_task_report_doer')
    security_squad = models.ForeignKey(dir_security_squad, default=None)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'client_object_task_report'
        ordering = ['-create_date']


class content_type(models.Model):
    name = models.CharField(max_length=100)
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    description = models.CharField(max_length=128)
    position = models.SmallIntegerField(default=None)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'django_content_type'
        ordering = ['position']

class auth_user(models.Model):
    username = models.CharField(max_length=128)
    email = models.CharField(max_length=128)
    first_name = models.CharField(max_length=128, null=True)
    last_name = models.CharField(max_length=128, null=True)
    client_user = models.ForeignKey(client_user)
    sentry_user = models.ForeignKey(sentry_user)
    date_joined = models.DateTimeField()
    last_login = models.DateTimeField()
    password  = models.CharField(max_length=128)
    token = models.CharField(max_length=128, null=True)
    is_active = models.SmallIntegerField(default=1)
    def __unicode__(self):
        return self.username
    class Meta:
        db_table = 'auth_user'

class auth_group(models.Model):
    name = models.CharField(max_length=80)
    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'auth_group'
        ordering = ['name']

class auth_permission(models.Model):
    name = models.CharField(max_length=512)
    content_type = models.ForeignKey(content_type)
    codename = models.CharField(max_length=128)
    position = models.DecimalField(max_digits=5, decimal_places=2)
    locality = models.ForeignKey(dir_address_2_locality)
    service_organization = models.ForeignKey(dir_service_organization)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        db_table = 'auth_permission'
        ordering = ['content_type','position','name']

class auth_user_user_permissions(models.Model):
    user = models.ForeignKey(auth_user)
    permission = models.ForeignKey(auth_permission)
    class Meta:
        db_table = 'auth_user_user_permissions'

class auth_group_permissions(models.Model):
    group = models.ForeignKey(auth_group)
    permission = models.ForeignKey(auth_permission)
    class Meta:
        db_table = 'auth_group_permissions'

class auth_user_groups(models.Model):
    user = models.ForeignKey(auth_user)
    group = models.ForeignKey(auth_group)
    class Meta:
        db_table = 'auth_user_groups'


class auth_user_request(models.Model):
    user_id = models.IntegerField()
    order_num = models.IntegerField()
    client_name = models.CharField(max_length=128)
    full_name = models.CharField(max_length=128)
    phone = models.IntegerField()
    email = models.CharField(max_length=128)
    status = models.CharField(max_length=128, default='wait')
    date_request = models.DateTimeField()
    date_verify = models.DateTimeField()
    manager_id = models.IntegerField()
    def __unicode__(self):
        return self.email
    class Meta:
        db_table = 'auth_user_request'



class debug(models.Model):
    date = models.DateTimeField(default=timezone.now)
    sentry_id = models.IntegerField()
    security_id = models.IntegerField()
    comment = models.TextField()
    class Meta:
        db_table = 'parse_debug'


class site_roadside(models.Model):
    name = models.CharField(max_length=256)
    full_name = models.CharField(max_length=256)
    object_number = models.CharField(max_length=256)
    object_adress = models.CharField(max_length=256)
    object_model = models.CharField(max_length=256)
    object_color = models.CharField(max_length=128)
    object_gnumber = models.CharField(max_length=20)
    email = models.CharField(max_length=128)
    status = models.CharField(max_length=128, default='confirm')
    token = models.CharField(max_length=32)
    date_request = models.DateTimeField()
    date_verify = models.DateTimeField(default=None)

    def __unicode__(self):
        return self.name
    class Meta:
        db_table = 'site_roadside'
        ordering = ['name']


class sentry_log(models.Model):
    log_type = models.ForeignKey(auth_permission)
    log_date = models.DateTimeField()
    sentry_user = models.ForeignKey(sentry_user, default=None)
    client_object = models.ForeignKey(client_object, default=None)
    object_event = models.ForeignKey(client_object_event, default=None)
    cost = models.ForeignKey(client_object_service_cost, default=None)
    charge = models.ForeignKey(client_object_service_charge, default=None)
    incident = models.ForeignKey(client_object_incident, default=None)
    comment = models.TextField()
    noticed = models.IntegerField(default=0)
    class Meta:
        db_table = 'sentry_log'

class sentry_log_notice(models.Model):
    sentry_log = models.ForeignKey(sentry_log)
    sentry_user = models.ForeignKey(sentry_user)
    create_date = models.DateTimeField(default=timezone.now)
    alert_date = models.DateTimeField(default=timezone.now)
    sight = models.IntegerField(default=0)
    class Meta:
        db_table = 'sentry_log_notice'
        ordering = ['create_date','alert_date']



