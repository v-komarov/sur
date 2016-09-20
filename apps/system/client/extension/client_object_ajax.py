# -*- coding: utf-8 -*-

import json
import datetime
from decimal import *
from apps.system.client.extension import client__form
from apps.system import models as db_sentry


def get(**kwargs):
    data = {}
    object = None
    client_user_boolean = False
    if 'request' in kwargs:
        object = db_sentry.client_object.objects.get(id=int(kwargs['request'].GET['object']))
        if 'client_user' in kwargs['request'].GET:
            client_user_boolean = True
    elif 'object' in kwargs:
        object = db_sentry.client_object.objects.get(id=kwargs['object'])
        if 'client_user' in kwargs:
            client_user_boolean = True

    data['object'] = {}
    if object and object.is_active==1:
        data['object'] = {
            'id': object.id,
            'name': object.name,
            'occupation': object.occupation,
            'comment': object.comment,
            'password': object.password,
            'event_list': object.get_event_list(),
            'tag_list': object.get_tag_list(),
            'device_install_list': object.get_device_list(),
            #'status': object.status.label,
            #'cost_list': object.get_cost(current=True, list=True),
            #'subtype_list': object.get_subtype_list(),
        }
        if object.referer_type_id:
            data['object']['referer_type'] = object.referer_type_id
            data['object']['referer_type__name'] = object.referer_type.name
        if object.referer_user_id:
            data['object']['referer_user'] = object.referer_user.id
            data['object']['referer_user__full_name'] = object.referer_user.full_name
        if object.security_squad_id:
            data['object']['security_squad'] = object.security_squad.id
            data['object']['security_squad__name'] = object.security_squad.name

        bind = object.client_bind_set.filter(is_active=1).first()
        if bind:
            data['object']['time24'] = bind.time24
            data['object']['status'] = bind.status.label
            data['object']['ovd_status'] = bind.ovd_status.label
            data['object']['cost_list'] = bind.get_cost(current=True, list=True)
            data['object']['subtype_list'] = bind.get_subtype_list()
            data['object']['code'] = bind.GetCode()
            data['object']['connect_cost'] = bind.get_connect_cost()

            if bind.console_id:
                data['object']['console'] = bind.console_id
                data['object']['console__name'] = bind.console.name
                data['object']['console_number'] = bind.console_number

            if bind.charge_month_id:
                data['object']['charge_month'] = bind.charge_month.id
                data['object']['charge_month__name'] = bind.charge_month.name
                data['object']['charge_month_day'] = bind.charge_month_day


        data['object']['address'] = {}
        if object.address_building_id:
            data['object']['address'] = {
                'region': object.address_building.street.locality.region.id,
                'locality': object.address_building.street.locality.id,
                'street': object.address_building.street.id,
                'street__name': object.address_building.street.name,
                'placement': object.address_placement,
                'map_yandex': object.get_map_yandex()
            }
            data['object']['address_string'] = object.get_address()+' '+data['object']['address']['map_yandex']
            data['object']['address']['building'] = object.address_building.id
            data['object']['address']['building__name'] = object.address_building.name
        if object.address_placement_type_id:
            data['object']['address']['placement_type'] = object.address_placement_type.id
            data['object']['address']['placement_type__label'] = object.address_placement_type.label
            data['object']['address']['placement_type__name'] = object.address_placement_type.name

        if client_user_boolean:
            data['object']['client_user_list'] = {}
            for client_user in object.client_user.filter(is_active=1):
                data['object']['client_user_list'][client_user.id] = {
                    'full_name': client_user.full_name
                }
                if client_user.post:
                    data['object']['client_user_list'][client_user.id]['post'] = client_user.post.id
                    data['object']['client_user_list'][client_user.id]['post__name'] = client_user.post.name

            for client_user in db_sentry.client_bind.objects.get(client_object=object.id).client_contract.client.client_user.filter(is_active=1):
                data['object']['client_user_list'][client_user.id] = {
                    'full_name': client_user.full_name
                }
                if client_user.post:
                    data['object']['client_user_list'][client_user.id]['post'] = client_user.post.id
                    data['object']['client_user_list'][client_user.id]['post__name'] = client_user.post.name

    return data


def get_object_list(**kwargs):
    data = {}
    if 'contract_id' in kwargs:
        data['object_list'] = {}
        for bind in db_sentry.client_bind.objects.filter(
                client_contract_id = int(kwargs['contract_id']),
                client_object__is_active = 1,
                is_active = 1):
            data['object_list'][bind.client_object.id] = get(object=bind.client_object.id)['object']
            data['object_list'][bind.client_object.id]['bind'] = bind.id
            data['object_list'][bind.client_object.id]['time24'] = bind.time24

    return data


def update(request, data=None):
    client_contract_id = int(request.POST['client_contract'])
    object_new = False
    if 'client_object' in request.POST:
        object = db_sentry.client_object.objects.get(id=int(request.POST['client_object']))
        object_form = client__form.object_form(request.POST, instance=object)
    else:
        object_form = client__form.object_form(request.POST)
        object_new = True

    if object_form.is_valid(): #and object_form.has_changed():
        object = object_form.save()
        object.dir_tag = json.loads(request.POST['dir_tag'])
        if request.POST['address_building'] != '' and not 'address_building__text' in request.POST:
            address_building, created = db_sentry.dir_address_4_building.objects.get_or_create(
                street_id = int(request.POST['address_street']),
                name = request.POST['address_building']
            )
            address_building_id = address_building.id
        else:
            try:
                address_building_id = int(request.POST['address_building'])
            except:
                address_building_id = None
        object.address_building_id = address_building_id
        object.save()


        bind, created = db_sentry.client_bind.objects.get_or_create(
            client_contract_id = client_contract_id,
            client_object_id = object.id
        )
        bind.dir_service_subtype.clear()
        bind.dir_service_subtype = json.loads(request.POST['dir_service_subtype'])
        bind.time24 = request.POST['time24']
        bind.save()
        bind_form = client__form.client_bind(request.POST, instance=bind)

        if 'console' in request.POST and request.POST['console'] != '':
            check_console_number = bind.checkConsoleNumber(
                console = int(request.POST['console']),
                console_number = int(request.POST['console_number'])
            )
            if check_console_number:
                data['errors'] = check_console_number
                if object_new:
                    object.delete()

        if bind_form.is_valid() and not 'errors' in data:
            bind = bind_form.save()


            # Cost

            data['cost'] = 0
            if 'cost_value__text' in request.POST:
                data['cost'] = 1
                cost_current = db_sentry.client_bind_cost.objects \
                    .filter(client_bind_id=bind.id, is_active=1, ) \
                    .exclude(cost_type__label__in=['once', 'pause', 'client_object_connect']) \
                    .last()
                if not cost_current:
                    cost_current = db_sentry.client_bind_cost.objects.create(
                        client_bind_id = bind.id,
                        cost_type_id = int(request.POST['cost_type'])
                    )

                if request.POST['cost_value__text'] == '':
                    cost_current.is_active = 0
                else:
                    cost_current.cost_value = Decimal(request.POST['cost_value__text'])
                    if 'cost_type' in request.POST:
                        cost_current.cost_type_id = int(request.POST['cost_type'])
                cost_current.save()

            elif 'cost_value' in request.POST and request.POST['cost_value'] != '' \
                    and 'cost_type' in request.POST and request.POST['cost_type'] != '':
                data['cost'] = 2
                db_sentry.client_bind_cost.objects.create(
                    client_bind_id=bind.id,
                    cost_value = Decimal(request.POST['cost_value']),
                    cost_type_id = int(request.POST['cost_type'])
                )
            if 'cost_new' in request.POST and 'begin_date_new' in request.POST:
                data['cost'] = 3
                cost_last = db_sentry.client_bind_cost.objects \
                    .filter(client_bind_id=bind.id, is_active=1) \
                    .exclude(cost_type=None).last()
                db_sentry.client_bind_cost.objects.create(
                    client_bind_id=bind.id,
                    cost_value = Decimal(request.POST['cost_value']),
                    cost_type_id = cost_last.cost_type.id,
                    begin_date = datetime.datetime.strptime(request.POST['begin_date_new'], '%d.%m.%Y')
                )

            # Connect cost, event_type=='client_object_connect'

            cost_type = db_sentry.dir_cost_type.objects.get(label='client_object_connect')
            try:
                connect_cost, created = db_sentry.client_bind_cost.objects.get_or_create(
                    client_bind_id = bind.id,
                    cost_type_id = cost_type.id,
                    is_active = 1
                )
                connect_cost.cost_value = Decimal(request.POST['connect_cost'])
                connect_cost.save()
                data['connect_cost'] = str(connect_cost.cost_value)
            except:
                db_sentry.client_bind_cost.objects.filter(
                    client_bind_id = bind.id,
                    cost_type_id = cost_type.id,
                    is_active = 1
                ).update(is_active=0)
                data['connect_cost'] = None


            data['contract_subtype'] = bind.client_contract.set_subtype()
            data['check_status'] = bind.check_bind_status()

            if 'from_bind' in request.POST:
                from_bind = db_sentry.client_bind.objects.get(id=int(request.POST['from_bind']))
                install_set = db_sentry.client_object_dir_device.objects.filter(object=from_bind.client_object.id, is_active=1)
                for install in install_set:
                    install_new = db_sentry.client_object_dir_device.objects.create(
                        object_id = bind.client_object.id,
                        device_id = install.device.id,
                        priority = install.priority,
                        install_date = install.install_date,
                        install_user_id = install.install_user.id,
                        password = install.password,
                        comment = install.comment
                    )
                    if install.uninstall_date and install.uninstall_user:
                        install_new.uninstall_date = install.uninstall_date
                        install_new.uninstall_user = install.uninstall_user
                    install_new.save()

        else:
            if check_console_number:
                data['errors'] = check_console_number
            else:
                data['errors'] = bind_form.errors



        # client_object_warden
        workflow, created = db_sentry.client_workflow.objects.get_or_create(
            object_id = object.id,
            workflow_type_id = 1
        )
        if request.POST['client_object_warden'] == '':
            workflow.is_active = 0
        else:
            workflow.sentry_user_id = int(request.POST['client_object_warden'])
            workflow.is_active = 1
        workflow.save()

    else:
        data['form_errors'] = object_form.errors

    data['answer'] = 'done'
    return data


def search_archive(request, data):
    bind = db_sentry.client_bind.objects.filter(is_active=1, status__label='archive').values(
        'id',
        'client_object__name',
        'client_object__id',
        'client_object__address_building__street__locality__name',
        'client_object__address_building__street__name',
        'client_object__address_building__name',
        'client_object__address_placement_type__name',
        'client_object__address_placement'
    )

    if 'name' in request.GET and request.GET['name'] != '':
        bind = bind.filter( client_object__name__icontains = request.GET['name'] )

    if 'address' in request.GET and request.GET['address'] != '':
        bind = bind.filter(
            #client_object__address_building__name__icontains = request.GET['address'],
            client_object__address_building__street__name__icontains = request.GET['address'],
            #client_object__address_building__street__locality__name__icontains = request.GET['address']
        )

    data['bind_list'] = [item for item in bind]

    return data


def delete(request, data=None):
    # Not work!!!
    # ...now work =)
    bind = db_sentry.client_bind.objects.get(id=int(request.GET['bind']))
    if bind.client_object.client_object_dir_device_set.filter(uninstall_date=None, is_active=1):
        data['errors'] = {'install': 'Установлено ОУ'}
    else:
        bind.is_active = 0
        bind.save()
        bind.check_bind_status()
        data['answer'] = 'done'
    return data

