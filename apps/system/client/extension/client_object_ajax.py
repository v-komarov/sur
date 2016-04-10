# -*- coding: utf-8 -*-

import json
import datetime
from decimal import *
from apps.system.client.extension import client__form
from apps.system import models as db_sentry


def get(**kwargs):
    data = {}
    object = None
    if 'request' in kwargs:
        object = db_sentry.client_object.objects.get(id=int(kwargs['request'].GET['object_id']))
    elif 'object_id' in kwargs:
        object = db_sentry.client_object.objects.get(id=kwargs['object_id'])

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
            data['object']['status'] = bind.status.label
            data['object']['ovd_status'] = bind.ovd_status.label
            data['object']['cost_list'] = bind.get_cost(current=True, list=True)
            data['object']['subtype_list'] = bind.get_subtype_list()

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

    return data


def get_object_list(**kwargs):
    data = {}
    if 'contract_id' in kwargs:
        data['object_list'] = {}
        for bind in db_sentry.client_bind.objects.filter(
                client_contract_id = int(kwargs['contract_id']),
                client_object__is_active = 1,
                is_active = 1):
            data['object_list'][bind.client_object.id] = get(object_id=bind.client_object.id)['object']

    return data


def update(request, data=None):
    client_contract_id = int(request.POST['client_contract'])
    if 'client_object' in request.POST:
        object = db_sentry.client_object.objects.get(id=int(request.POST['client_object']))
        object_form = client__form.object_form(request.POST, instance=object)
    else:
        object_form = client__form.object_form(request.POST)

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
            client_object_id = object.id )
        bind.dir_service_subtype.clear()
        bind.dir_service_subtype = json.loads(request.POST['dir_service_subtype'])
        bind.save()
        bind_form = client__form.client_bind(request.POST, instance=bind)
        if bind_form.is_valid():
            bind = bind_form.save()

            # Cost
            data['cc'] = 0
            if 'cost_value__text' in request.POST:
                data['cc'] = 1
                cost_current = db_sentry.client_bind_cost.objects.filter(client_bind_id=bind.id, is_active=1).first()
                if not cost_current:
                    cost_current = db_sentry.client_bind_cost.objects.create(client_bind_id=bind.id)

                if request.POST['cost_value__text'] == '':
                    cost_current.is_active = 0
                else:
                    cost_current.cost_value = Decimal(request.POST['cost_value__text'])
                    if 'cost_type' in request.POST:
                        cost_current.cost_type_id = int(request.POST['cost_type'])
                cost_current.save()

            elif 'cost_value' in request.POST and request.POST['cost_value'] != '' \
                    and 'cost_type' in request.POST and request.POST['cost_type'] != '':
                data['cc'] = 2
                db_sentry.client_bind_cost.objects.create(
                    client_bind_id=bind.id,
                    cost_value = Decimal(request.POST['cost_value']),
                    cost_type_id = int(request.POST['cost_type'])
                )
            if 'cost_new' in request.POST and 'begin_date_new' in request.POST:
                data['cc'] = 3
                cost_last = db_sentry.client_bind_cost.objects \
                    .filter(client_bind_id=bind.id, is_active=1) \
                    .exclude(cost_type=None).last()
                db_sentry.client_bind_cost.objects.create(
                    client_bind_id=bind.id,
                    cost_value = Decimal(request.POST['cost_value']),
                    cost_type_id = cost_last.cost_type.id,
                    begin_date = datetime.datetime.strptime(request.POST['begin_date_new'], '%d.%m.%Y')
                )
        else:
            data['errors'] = bind_form.errors


        data['contract_subtype'] = bind.client_contract.set_subtype()
        data['check_status'] = bind.check_bind_status()


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


def delete(request,data=None):
    object = db_sentry.client_object.objects.get(id=int(request.GET['service_id']))
    object.is_active = 0
    object.save()
    object.check_bind_status()

    data['answer'] = 'done'
    return data

