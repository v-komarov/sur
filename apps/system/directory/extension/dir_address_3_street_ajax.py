# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request, data):
    street_set = db_sentry.dir_address_3_street.objects.all() \
        .values('id','name','locality_id','locality__name')

    if 'region_id' in request.GET and request.GET['region_id']!='':
        street_set = street_set.filter(locality__region_id=int(request.GET['region_id']))
    if 'locality_id' in request.GET and request.GET['locality_id']!='':
        street_set = street_set.filter(locality_id=int(request.GET['locality_id']))
    if 'street_name' in request.GET and request.GET['street_name']!='':
        street_set = street_set.filter(name__icontains=request.GET['street_name'])
    if 'limit' in request.GET:
        street_set = street_set[:int(request.GET['limit'])]
    data['street'] = [item for item in street_set]
    return data


def add(request, data):
    if not 'locality_id' in request.GET or request.GET['locality_id'] == '':
        data['error'] = 'Выберите населенный пункт'.decode('utf-8')

    if request.GET['street_name']=='':
        data['error'] = 'Введите название улицы'.decode('utf-8')
    elif db_sentry.dir_address_3_street.objects.filter(
            locality_id = int(request.GET['locality_id']),
            name__iexact = request.GET['street_name'] ) \
            .exists():
        data['error'] = 'Есть такая улица'.decode('utf-8')

    if not data['error']:
        street_id = db_sentry.dir_address_3_street.objects.create(
            locality_id = int(request.GET['locality_id']),
            name = request.GET['street_name'] ).id
        street_set = db_sentry.dir_address_3_street.objects \
            .filter(id = street_id).values('id','name','locality_id')
        data['street'] = [item for item in street_set]

    return data


def save(request, data):
    if db_sentry.dir_address_3_street.objects.filter(
            locality_id = int(request.POST['locality_id']),
            name = request.POST['street_name']) \
            .exists():
        data['error'] = 'В этом населенном пункте уже есть такая улица'.decode('utf-8')
    if request.POST['locality_id']=='all':
        data['error'] = 'Выберите населенный пункт.'.decode('utf-8')

    if not data['error']:
        street_set = db_sentry.dir_address_3_street.objects.get(id=int(request.POST['street_id']))
        street_set.locality_id = int(request.POST['locality_id'])
        street_set.name = request.POST['street_name']
        street_set.save()
        data['answer'] = 'done'
    return data


def delete(request, data):
    if db_sentry.client_object.objects.filter(address_building__street_id=int(request.GET['street_id'])).exists():
        data['error'] = 'Эта улица используется'.decode('utf-8')
    else:
        db_sentry.dir_address_3_street.objects.get(id=int(request.GET['street_id'])).delete()

    return data
