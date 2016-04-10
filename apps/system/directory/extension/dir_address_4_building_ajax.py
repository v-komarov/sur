# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    building_set = db_sentry.dir_address_4_building.objects.all() \
        .values('id','street_id','name')

    if 'street_id' in request.GET:
        building_set = building_set.filter(street_id=int(request.GET['street_id']))
    if 'building_name' in request.GET:
        building_set = building_set.filter(name__icontains=request.GET['building_name'])
    if 'limit' in request.GET:
        building_set = building_set[:int(request.GET['limit'])]
    data['buildings'] = [item for item in building_set]

    return data


    '''
    elif request.POST['action'] == 'add':
        if request.POST['locality_id'] == 'all':
            data['error'] = 'Выберите населенный пункт.'.decode('utf-8')

        else:
            street_set = db_sentry.dir_address_3_street.objects.filter(
                    locality_id = int(request.POST['locality_id']),
                    name__iexact = request.POST['street_name']
                ).values('id','name','locality_id')

            if street_set.exists() or request.POST['street_name']=='':
                data['error'] = 'Есть такая улица'.decode('utf-8')

            else:
                street_id = db_sentry.dir_address_3_street.objects.create(
                    locality_id = int(request.POST['locality_id']),
                    name = request.POST['street_name'] ).id
                street_set = db_sentry.dir_address_3_street.objects\
                    .filter(id = street_id).values('id','name','locality_id')
            data['street'] = [item for item in street_set]


    elif request.POST['action'] == 'save':
        street = db_sentry.dir_address_3_street.objects\
            .filter(locality_id=int(request.POST['locality_id']), name=request.POST['street_name'])
        if street.exists():
            data['error'] = 'Уже есть такая улица.'.decode('utf-8')
        elif request.POST['locality_id'] == 'all':
            data['error'] = 'Выберите населенный пункт.'.decode('utf-8')
        else:
            db_sentry.dir_address_3_street.objects.filter(id=int(request.POST['locality_id'])).update(
                locality = int(request.POST['locality_id']),
                name = request.POST['street_name'] )


    elif request.POST['action'] == 'remove':
        street = db_sentry.client_object.objects.filter(address_building__street_id=int(request.POST['street_id']))
        if street.exists():
            data['error'] = 'Невозможно удалить эту запись'.decode('utf-8')
        else:
            db_sentry.dir_address_3_street.objects\
                .POST(id=int(request.POST['street_id'])).delete()
    '''