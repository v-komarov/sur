# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    locality_set = db_sentry.dir_address_2_locality.objects.all() \
        .values('id','name','region_id','region__name')
    if 'region_id' in request.GET and request.GET['region_id']!='':
        locality_set = locality_set.filter(region_id=int(request.GET['region_id']))
    if 'locality_name' in request.GET and request.GET['locality_name'] != '':
        locality_set = locality_set.filter(name__icontains=request.GET['locality_name'])
    if 'limit' in request.GET and request.GET['limit'] != '':
        locality_set = locality_set[:int(request.GET['limit'])]
    data['locality'] = [item for item in locality_set]
    return data


def add(request,data):
    if request.POST['region_id']=='':
        data['error'] = 'Выберите регион.'.decode('utf-8')
    if request.POST['locality_name']=='':
        data['error'] = 'Пустое поле'.decode('utf-8')
    if db_sentry.dir_address_2_locality.objects \
            .filter(region_id=int(request.POST['region_id']), name=request.POST['locality_name']) \
            .exists():
        data['error'] = 'Есть такой населенный пункт'.decode('utf-8')

    if not data['error']:
        locality_id = db_sentry.dir_address_2_locality.objects.create(
            region_id = int(request.POST['region_id']),
            name = request.POST['locality_name'] ).id
        locality_set = db_sentry.dir_address_2_locality.objects \
            .filter(id = locality_id) \
            .values('id','name','region_id','region__name')
        data['locality'] = [item for item in locality_set]
    return data


def save(request,data):
    location = db_sentry.dir_address_2_locality.objects \
        .filter(region_id=int(request.POST['region_id']), name=request.POST['locality_name'])
    if location.exists():
        data['error'] = 'Уже есть такой населенный пункт.'.decode('utf-8')
    else:
        db_sentry.dir_address_2_locality.objects.filter(id=int(request.POST['locality_id'])).update(
            region = int(request.POST['region_id']),
            name = request.POST['locality_name'] )
        data['answer'] = 'done'
    return data


def delete(request,data):
    street = db_sentry.dir_address_3_street.objects.filter(locality_id=int(request.POST['locality_id']))
    if street.exists():
        data['error'] = 'Невозможно удалить эту запись'.decode('utf-8')
    else:
        db_sentry.dir_address_2_locality.objects.get(id=int(request.POST['locality_id'])).delete()
        data['answer'] = 'done'
    return data

