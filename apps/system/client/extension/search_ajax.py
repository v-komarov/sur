# -*- coding: utf-8 -*-

import json
from django.db.models import Q
from apps.system import models as db_sentry


def search(request, data=None):
    #client_set = None
    contract_set = None
    data['client_list'] = {}
    data['client_count'] = 0
    data['client_id_list'] = []
    data['contract_id_list'] = []
    data['contract_count'] = 0
    data['object_list'] = {}
    data['object_id_list'] = []
    data['object_id_list__'] = []
    data['object_count'] = 0
    data['list'] = []

    show_client = True
    show_contract  = True
    show_object = True

    bind_set = db_sentry.client_bind.objects.filter(client_contract__is_active=1, is_active=1)#client_object__is_active=1,

    if 'object' in request.GET and request.GET['object'] != '':
        bind_set = bind_set.filter(client_object_id=int(request.GET['object']))

    if 'object_list' in request.GET and request.GET['object_list'] != '':
        bind_set = bind_set.filter(client_object_id__in=json.loads(request.GET['object_list']))

    if 'client' in request.GET and request.GET['client'] != '':
        show_client = False
        contract_set = db_sentry.client_contract.objects.filter(client_id=int(request.GET['client']))
        bind_set = bind_set.filter(client_contract__client_id=int(request.GET['client']))
        if not bind_set.exists():
            data['client_id_list'].append(int(request.GET['client']))

    if 'address_region' in request.GET and request.GET['address_region'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(client_object__address_building__street__locality__region_id=int(request.GET['address_region']))
    if 'address_locality' in request.GET and request.GET['address_locality'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(client_object__address_building__street__locality_id=int(request.GET['address_locality']))
    if 'address_street' in request.GET and request.GET['address_street'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(client_object__address_building__street_id=int(request.GET['address_street']))
    if 'address_placement' in request.GET and request.GET['address_placement'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(client_object__address_placement=request.GET['address_placement'])
    if 'address_placement_type' in request.GET and request.GET['address_placement_type'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(client_object__address_placement_type_id=request.GET['address_placement_type'])

    if 'client__name' in request.GET and request.GET['client__name'] != '':
        bind_set = bind_set.filter(client_contract__client__name__icontains=request.GET['client__name'])

    if 'client__legal_type' in request.GET and request.GET['client__legal_type'] != '':
        bind_set = bind_set.filter(client_contract__client__legal_type_base__legal_type=request.GET['client__legal_type'])

    if 'object__name' in request.GET and request.GET['object__name'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(client_object__name__icontains=request.GET['object__name'])


    if 'status' in request.GET and request.GET['status'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(status=int(request.GET['status']))
    else:
        bind_set = bind_set.exclude(status__label='archive')

    if 'contract_status' in request.GET and request.GET['contract_status'] != '':
        show_client = False
        bind_set = bind_set.filter(client_contract__status=int(request.GET['contract_status']))
    else:
        bind_set = bind_set.exclude(client_contract__status__label='archive')

    if 'contract_number' in request.GET and request.GET['contract_number'] != '':
        show_client = False
        bind_set = bind_set.filter(client_contract__name__startswith=request.GET['contract_number'])

    if 'device_console' in request.GET and request.GET['device_console'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(console=request.GET['device_console'])

    if 'console_number' in request.GET and request.GET['console_number'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(console_number=int(request.GET['console_number']))


    if 'service_type' in request.GET and request.GET['service_type'] != '':
        show_client = False
        bind_set = bind_set.filter(client_contract__service_type=int(request.GET['service_type']))

    if 'service_subtype' in request.GET and request.GET['service_subtype'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(dir_service_subtype=int(request.GET['service_subtype']))

    if 'service_organization' in request.GET and request.GET['service_organization'] != '':
        show_client = False
        bind_set = bind_set.filter(client_contract__service_organization_id=int(request.GET['service_organization']))

    if 'security_squad' in request.GET and request.GET['security_squad'] != '':
        show_client = False
        show_contract = False
        bind_set = bind_set.filter(client_object__security_squad_id=int(request.GET['security_squad']))

    if 'holding' in request.GET and request.GET['holding'] != '':
        show_contract = False
        bind_set = bind_set.filter(client_contract__client__holding_id=int(request.GET['holding']))

    if 'warden' in request.GET and request.GET['warden'] != '':
        show_client = False
        show_contract = False
        event_set = db_sentry.client_workflow.objects.filter(
            sentry_user_id = int(request.GET['warden']),
            workflow_type__label = 'client_object_warden',
            is_active = 1
        )
        data['warden'] = [item.object_id for item in event_set]
        bind_set = bind_set.filter(client_object__in=data['warden'])

    data['locality_exclude'] = []
    for locality in db_sentry.dir_address_2_locality.objects.all():
        if not request.user.has_perm('system.locality_'+str(locality.id)):
            data['locality_exclude'].append(locality.id)
    data['service_organization_exclude'] = []
    for service_organization in db_sentry.dir_service_organization.objects.all():
        if not request.user.has_perm('system.service_organization_'+str(service_organization.id)):
            data['service_organization_exclude'].append(service_organization.id)
    #bind_set = bind_set.exclude(object__address_building__street__locality_id__in=data['locality_exclude'])
    #bind_set = bind_set.exclude(object__client_object_service__service_organization_id__in=data['service_organization_exclude'])


    for bind in bind_set:
        # Client
        client_id = bind.client_contract.client.id
        contract_id = bind.client_contract.id
        object_id = bind.client_object.id
        if not data['client_list'].has_key(client_id):
            data['client_count'] += 1
            data['client_id_list'].append(client_id)
            data['client_list'][client_id] = {
                'name': bind.client_contract.client.name,
                'contract_list': {}
            }
        # Contract
        if not data['client_list'][client_id]['contract_list'].has_key(contract_id):
            data['contract_count'] += 1
            data['contract_id_list'].append(contract_id)
            data['client_list'][client_id]['contract_list'][contract_id] = {
                'name': bind.client_contract.name,
                'status': bind.client_contract.status.id,
                'status__label': bind.client_contract.status.label,
                'status__name': bind.client_contract.status.name,
                'service_type': bind.client_contract.service_type.id,
                'service_type__name': bind.client_contract.service_type.name,
                'subtype_list': bind.client_contract.get_subtype_list(),
                'object_list': {}
            }
            if bind.client_contract.ovd_status:
                data['client_list'][client_id]['contract_list'][contract_id]['ovd_status'] = bind.client_contract.ovd_status.id
                data['client_list'][client_id]['contract_list'][contract_id]['ovd_status__label'] = bind.client_contract.ovd_status.label
            if bind.client_contract.begin_date:
                data['client_list'][client_id]['contract_list'][contract_id]['begin_date'] = bind.client_contract.begin_date.strftime("%d.%m.%Y")

        # Object
        object_item = {
            'bind': bind.id,
            'name': bind.client_object.name,
            'status': bind.status.id,
            'status__label': bind.status.label,
            'status__name': bind.status.name,
            'address_string': bind.client_object.get_address(),
            'device_list': bind.client_object.get_device_list(),
            'subtype_list': bind.get_subtype_list(),
            'tag_list': bind.client_object.get_tag_list(),
            'comment': bind.client_object.comment
        }

        if bind.console_id:
            object_item['console'] = bind.console.id
            object_item['console__name'] = bind.console.name
        if bind.console_number: object_item['console_number'] = bind.console_number

        try:
            data['client_list'][client_id]['contract_list'][contract_id]['object_list'][object_id] = object_item
            data['object_id_list'].append(object_id)
            data['object_count'] += 1
        except:
            data['object_id_list__'].append(object_id)


    if show_contract:
        if contract_set:
            contract_set = contract_set.filter(is_active=1).exclude(id__in=data['contract_id_list'])
        else:
            contract_set = db_sentry.client_contract.objects.filter(is_active=1) \
                .exclude(id__in=data['contract_id_list'])

        if 'contract_status' in request.GET and request.GET['contract_status'] != '':
            contract_set = contract_set.filter(status=int(request.GET['contract_status']))
        else:
            contract_set = contract_set.exclude(status__label='archive')

        if 'client__name' in request.GET and request.GET['client__name'] != '':
            contract_set = contract_set.filter(client__name__icontains=request.GET['client__name'])

        if 'holding' in request.GET and request.GET['holding'] != '':
            contract_set = contract_set.filter(client__holding=request.GET['holding'])

        if 'contract_number' in request.GET and request.GET['contract_number'] != '':
            contract_set = contract_set.filter(name__startswith=int(request.GET['contract_number']))

        if 'service_organization' in request.GET and request.GET['service_organization'] != '':
            contract_set = contract_set.filter(service_organization=int(request.GET['service_organization']))

        if 'service_type' in request.GET and request.GET['service_type'] != '':
            contract_set = contract_set.filter(service_type=int(request.GET['service_type']))

        for contract in contract_set:
            if not data['client_list'].has_key(contract.client.id):
                if not data['client_list'].has_key(contract.client.id):
                    # Client
                    data['client_list'][contract.client.id] = {
                        'name': contract.client.name,
                        'contract_list': {}
                    }
            # Contract
            data['contract_count'] += 1
            data['client_list'][contract.client.id]['contract_list'][contract.id] = {
                'name': contract.name,
                #'status': contract.status.id,
                #'status__label': contract.status.label,
                'service_type': contract.service_type.id,
                'service_type__name': contract.service_type.name,
                'object_list': {}
            }
            if contract.begin_date:
                data['client_list'][contract.client.id]['contract_list'][contract.id]['begin_date'] = contract.begin_date.strftime("%d.%m.%Y")

    # Client list
    if show_client:
        client_set = db_sentry.client.objects.filter(is_active=1).exclude(id__in=data['client_id_list'])

        if 'client__name' in request.GET and request.GET['client__name'] != '':
            client_set = client_set.filter(name__icontains=request.GET['client__name'])

        if 'client__legal_type' in request.GET and request.GET['client__legal_type'] != '':
            client_set = client_set.filter(legal_type_base__legal_type=request.GET['client__legal_type'])

        if 'holding' in request.GET and request.GET['holding'] != '':
            client_set = client_set.filter(holding=int(request.GET['holding']))

        for client in client_set:
            data['client_count'] += 1
            data['client_list'][client.id] = {
                'name': client.name,
                }


    return data

