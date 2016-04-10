# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    device_type_set = db_sentry.dir_device_type.objects.filter(is_active=1)#.values('id','name','description','dir_device_communication')
    if 'device_type_id' in request.GET:
        device_type_set = device_type_set.filter(id=int(request.GET['device_type_id']))
    if 'name' in request.GET:
        device_type_set = device_type_set.filter(name__icontains=request.GET['name'])
    if 'description' in request.GET:
        device_type_set = device_type_set.filter(description__icontains=request.GET['description'])

    data['device_type_list'] = []
    for item in device_type_set:
        item_array = {'id': item.id, 'name': item.name, 'description': item.description}
        item_array['communication_list'] = []
        for communication_type in item.dir_device_communication.all():
            item_array['communication_list'].append({
                'id': communication_type.id,
                'name': communication_type.name,
                'description': communication_type.description
            })

        data['device_type_list'].append(item_array)

    #data['device_type_list'] = [item for item in device_type_set]
    return data


def create(request,data):
    if db_sentry.dir_device_type.objects.filter(name=request.POST['name']).exists():
        data['error'] = 'Уже есть такой тип устройств'.decode('utf-8')
    else:
        device_type_set = db_sentry.dir_device_type.objects.create(name=request.POST['name'])
        if 'description' in request.POST: device_type_set.description = request.POST['description']
        else: device_type_set.description = ''
        if 'communication_list' in request.POST:
            device_type_set.dir_device_communication = json.loads(request.POST['communication_list'])
        else:
            device_type_set.dir_device_communication = None
    return data


def update(request,data):
    if db_sentry.dir_device_type.objects.filter(name=request.POST['name']) \
            .exclude(id=int(request.POST['device_type_id'])).exists():
        data['error'] = 'Уже есть такой тип устройств'.decode('utf-8')
    else:
        device_type_set = db_sentry.dir_device_type.objects.get(id=int(request.POST['device_type_id']))
        device_type_set.name = request.POST['name']
        if 'description' in request.POST: device_type_set.description = request.POST['description']
        else: device_type_set.description = ''

        if 'communication_list' in request.POST:
            device_type_set.dir_device_communication = json.loads(request.POST['communication_list'])
        else:
            device_type_set.dir_device_communication = None

        device_type_set.save()
    return data


def delete(request,data):
    if db_sentry.dir_device.objects \
            .filter(device_type_id=int(request.GET['device_type_id'])) \
            .exists():
        data['error'] = 'Этот тип панели используется'.decode('utf-8')
    else:
        db_sentry.dir_device_type.objects.get(id=int(request.GET['device_type_id'])).delete()
    return data