# -*- coding: utf-8 -*-

from apps.system import models as db_sentry
from apps.system.client.extension import client__form
from apps.toolset import date_convert


def update(request, data):
    data['error'] = {}
    new = False

    try:
        client = db_sentry.client.objects.get(id=request.POST['client'])
        form = client__form.client_form(request.POST, instance=client)
    except:
        form = client__form.client_form(request.POST)
        new = True

    if form.is_valid():
        client = form.save()
        if new:
            data['url'] = '/system/client/'+str(client.id)+'/'

        holding_id = None
        if request.POST['holding'] != '':
            if not 'holding__text' in request.POST:
                client_holding, created = db_sentry.dir_holding.objects.get_or_create(
                    name = request.POST['holding']
                )
                holding_id = client_holding.id
            else:
                holding_id = int(request.POST['holding'])
        client.holding_id = holding_id

        address_actual_building_id = None
        if request.POST['address_actual_building'] != '':
            if not 'address_actual_building__text' in request.POST:
                client_address_actual_building, created = db_sentry.dir_address_4_building.objects.get_or_create(
                    street_id = int(request.POST['address_actual_street']),
                    name = request.POST['address_postal_building']
                )
                address_actual_building_id = client_address_actual_building.id
            else:
                address_actual_building_id = int(request.POST['address_actual_building'])
        client.address_actual_building_id = address_actual_building_id

        address_legal_building_id = None
        if request.POST['address_legal_building'] != '':
            if not 'address_legal_building__text' in request.POST:
                client_address_legal_building, created = db_sentry.dir_address_4_building.objects.get_or_create(
                    street_id = int(request.POST['address_legal_street']),
                    name = request.POST['address_postal_building']
                )
                address_legal_building_id = client_address_legal_building.id
            else:
                address_legal_building_id = int(request.POST['address_legal_building'])
        client.address_legal_building_id = address_legal_building_id

        address_postal_building_id = None
        if request.POST['address_postal_building'] != '':
            if not 'address_postal_building__text' in request.POST:
                client_address_postal_building, created = db_sentry.dir_address_4_building.objects.get_or_create(
                    street_id = int(request.POST['address_postal_street']),
                    name = request.POST['address_postal_building']
                )
                address_postal_building_id = client_address_postal_building.id
            else:
                address_postal_building_id = int(request.POST['address_postal_building'])
        client.address_postal_building_id = address_postal_building_id

        client.save()

    else:
        data['errors'] = form.errors

    '''
    if db_sentry.client.objects.filter(name=request.POST['name'], is_active=1).exclude(id=client.id).exists():
        data['error']['client_name'] = 'Клиент с таким наименованием уже существует'
    if db_sentry.client.objects.filter(inn=request.POST['inn'], is_active=1).exclude(id=client.id).exists():
        data['error']['client_inn'] = 'Клиент с таким ИНН уже существует'

        if 'holding' in request.POST and 'holding_id' not in request.POST:
            holding_set = db_sentry.dir_holding.objects.get_or_create(name=request.POST['holding_id'], is_active=1)
            client_set.holding_id = holding_set[0].id
            data['tt'] = 1
        elif 'holding_id' in request.POST:
            client_set.holding_id = int(request.POST['holding_id'])
            data['tt'] = client_set.holding_id
        else: client_set.holding_id = None

        client_set.legal_type_base_id = int(request.POST['legal_type_base_id'])
        try: client_set.founding_date = date_convert.convert(request.POST['founding_date'])
        except: client_set.founding_date = None
        client_set.name = request.POST['name']
        client_set.pay_type = request.POST['pay_type']


        try: client_set.address_actual_index = request.POST['address_actual_index']
        except: client_set.address_actual_index = None
        try: client_set.address_actual_placement = request.POST['address_actual_placement']
        except: client_set.address_actual_placement = ''
        if 'address_actual_building_id' not in request.POST and 'address_actual_building' in request.POST:
            building_set, created = db_sentry.dir_address_4_building.objects \
                .get_or_create(name=request.POST['address_actual_building'],street_id=int(request.POST['address_actual_street_id']))
            client_set.address_actual_building_id = building_set.id
        elif 'address_actual_building_id' in request.POST:
            client_set.address_actual_building_id = int(request.POST['address_actual_building_id'])
        try: client_set.address_actual_placement_type_id = int(request.POST['address_actual_placement_type_id'])
        except: client_set.address_actual_placement_type_id = None

        try: client_set.address_legal_index = request.POST['address_legal_index']
        except: client_set.address_legal_index = None
        try: client_set.address_legal_placement = request.POST['address_legal_placement']
        except: client_set.address_legal_placement = ''
        if 'address_legal_building_id' not in request.POST and 'address_legal_building' in request.POST:
            building_set,created = db_sentry.dir_address_4_building.objects \
                .get_or_create(name=request.POST['address_legal_building'],street_id=int(request.POST['address_legal_street_id']))
            client_set.address_legal_building_id = building_set.id
        elif 'address_legal_building_id' in request.POST:
            client_set.address_legal_building_id = int(request.POST['address_legal_building_id'])
        try: client_set.address_legal_placement_type_id = int(request.POST['address_legal_placement_type_id'])
        except: client_set.address_legal_placement_type_id = None

        try: client_set.address_postal_index = request.POST['address_postal_index']
        except: client_set.address_postal_index = None
        try: client_set.address_postal_placement = request.POST['address_postal_placement']
        except: client_set.address_postal_placement = ''
        if 'address_postal_building_id' not in request.POST and 'address_postal_building' in request.POST:
            building_set,created = db_sentry.dir_address_4_building.objects \
                .get_or_create(name=request.POST['address_postal_building'],street_id=int(request.POST['address_postal_street_id']))
            client_set.address_postal_building_id = building_set.id
        elif 'address_postal_building_id' in request.POST:
            client_set.address_postal_building_id = int(request.POST['address_postal_building_id'])
        try: client_set.address_postal_placement_type_id = int(request.POST['address_postal_placement_type_id'])
        except: client_set.address_postal_placement_type_id = None


        try: client_set.bank_id = int(request.POST['bank_id'])
        except: client_set.bank_id = None
        try: client_set.inn = request.POST['inn']
        except: client_set.inn = ''
        try: client_set.kpp = request.POST['kpp']
        except: client_set.kpp = ''
        try: client_set.ogrnip = request.POST['ogrnip']
        except: client_set.ogrnip = ''
        try: client_set.ogrn = request.POST['ogrn']
        except: client_set.ogrn = ''
        try: client_set.bank_account = request.POST['bank_account']
        except: client_set.bank_account = ''

        client_set.save()
    elif 'url' in data:
        client_set.delete()
    '''

    return data


def delete(request,data):
    client_set = db_sentry.client.objects.get(id=request.GET['client_id'])
    client_set.is_active = 0
    client_set.save()
    data['url'] = '/system/client/search/'
    return data


