# -*- coding: utf-8 -*-

import json
from django.db.models import Q
from apps.system import models as db_sentry


def search(request, data=None):
    #client_set = None
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

    show_list = ['client', 'contract', 'object']

    bind_set = db_sentry.client_bind.objects.filter(client_object__is_active=1, is_active=1)

    if 'object' in request.GET and request.GET['object'] != '':
        bind_set = bind_set.filter(client_object_id=int(request.GET['object']))

    if 'object_list' in request.GET and request.GET['object_list'] != '':
        bind_set = bind_set.filter(client_object_id__in=json.loads(request.GET['object_list']))

    if 'client' in request.GET and request.GET['client'] != '':
        bind_set = bind_set.filter(client_contract__client_id=int(request.GET['client']))
        if not bind_set.exists():
            data['client_id_list'].append(int(request.GET['client']))

    if 'address_region' in request.GET and request.GET['address_region'] != '':
        bind_set = bind_set.filter(client_object__address_building__street__locality__region_id=int(request.GET['address_region']))
    if 'address_locality' in request.GET and request.GET['address_locality'] != '':
        bind_set = bind_set.filter(client_object__address_building__street__locality_id=int(request.GET['address_locality']))
    if 'address_street' in request.GET and request.GET['address_street'] != '':
        bind_set = bind_set.filter(client_object__address_building__street_id=int(request.GET['address_street']))
    if 'address_placement' in request.GET and request.GET['address_placement'] != '':
        bind_set = bind_set.filter(client_object__address_placement=request.GET['address_placement'])
    if 'address_placement_type' in request.GET and request.GET['address_placement_type'] != '':
        bind_set = bind_set.filter(client_object__address_placement_type_id=request.GET['address_placement_type'])

    if 'client__name' in request.GET and request.GET['client__name'] != '':
        #client_set = db_sentry.client.objects.filter(name__icontains=request.GET['client__name'], is_active=1)
        bind_set = bind_set.filter(client_contract__client__name__icontains=request.GET['client__name'])

    if 'client__legal_type' in request.GET and request.GET['client__legal_type'] != '':
        bind_set = bind_set.filter(client_contract__client__legal_type_base__legal_type=request.GET['client__legal_type'])

    if 'object_name' in request.GET and request.GET['object_name'] != '':
        bind_set = bind_set.filter(client_object__name__icontains=request.GET['object_name'])

    if 'console_number' in request.GET and request.GET['console_number'] != '':
        bind_set = bind_set.filter(console_number=int(request.GET['console_number']))

    if 'status' in request.GET and request.GET['status'] != '':
        bind_set = bind_set.filter(status=int(request.GET['status']))

    #if 'device_console' in request.GET and request.GET['device_console'] != '':
    #    bind_set = bind_set.filter(console_id=int(request.GET['device_console']))

    if 'contract_number' in request.GET and request.GET['contract_number'] != '':
        show_list.remove('client')
        show_list.remove('contract')
        #regexp = '^'+request.GET['contract_number']+'[^0-9]' # http://wiki.dieg.info/regexp
        bind_set = bind_set.filter(client_contract__name__startswith=request.GET['contract_number'])

    '''
    if 'device_type' in request.GET and request.GET['device_type'] != '':
        installation_set = db_sentry.client_object_dir_device.objects.filter(
            device__device_type_id=int(request.GET['device_type']), uninstall_date=None, is_active=1)
        data['device_type_id_list'] = [item.object_id for item in installation_set]
        bind_set = bind_set.filter(id__in=data['device_type_id_list'])

    if 'cost_type' in request.GET and request.GET['cost_type'] != '':
        object_set_ = db_sentry.client_bind_cost.objects.filter(
            object__is_active = 1,
            is_active = 1
        ).exclude(
            cost = None
        )
        data['cost_list'] = [item.id for item in object_set_]
        #object_set = object_set.filter(object_id__in=data['cost_type_id_list'])

    if 'cost_type' in request.GET and request.GET['cost_type'] != '':
        object_set = db_sentry.client_object_service.objects.filter(
            client_object_service_cost__cost_type_id = int(request.GET['cost_type']),
            contract = None, is_active = 1
        )
        data['cost_type_id_list'] = [item.object_id for item in object_set]
        object_set = object_set.filter(id__in=data['cost_type_list'])
    '''

    if 'service_type' in request.GET and request.GET['service_type'] != '':
        bind_set = db_sentry.client_object.objects.filter(service_type_id=int(request.GET['service_type']), is_active=1)
        data['service_type_id_list'] = [item.object_id for item in bind_set]
        bind_set = bind_set.filter(id__in=data['service_type_id_list'])

    if 'service_subtype' in request.GET and request.GET['service_subtype'] != '':
        bind_set = db_sentry.client_object.objects.filter(dir_service_subtype=int(request.GET['service_subtype']), is_active=1)
        data['service_subtype'] = [item.object_id for item in bind_set]
        bind_set = bind_set.filter(id__in=data['service_subtype'])

    if 'service_organization' in request.GET and request.GET['service_organization'] != '':
        bind_set = bind_set.filter(object__client_object_service__service_organization_id=int(request.GET['service_organization']))

    if 'security_squad' in request.GET and request.GET['security_squad'] != '':
        bind_set = bind_set.filter(security_squad_id=int(request.GET['security_squad']))

    if 'holding' in request.GET and request.GET['holding'] != '':
        bind_set = bind_set.filter(object__client__holding_id=int(request.GET['holding']))

    if 'warden' in request.GET and request.GET['warden'] != '':
        event_set = db_sentry.client_workflow.objects.filter(
            sentry_user_id = int(request.GET['warden']),
            event_type__label = 'client_object_warden',
            is_active = 1
        )
        data['warden'] = [item.object_id for item in event_set]
        bind_set = bind_set.filter(id__in=data['warden'])

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


    if 'contract' in show_list:
        for contract in db_sentry.client_contract.objects \
                .filter(client_id__in=data['client_id_list'], is_active=1) \
                .exclude(id__in=data['contract_id_list']):
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
    if 'client' in show_list:
        if 'client' not in request.GET or request.GET['client'] == '':
            for client in db_sentry.client.objects.filter(is_active=1).exclude(id__in=data['client_id_list']):
                data['client_count'] += 1
                data['client_list'][client.id] = {
                    'name': client.name,
                    }


    return data

