# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    device_console_set = db_sentry.dir_device_console.objects.filter(is_active=1).values('id','name','description')
    if request.GET['device_console_name'] != '':
        device_console_set = device_console_set.filter(name__icontains=request.GET['device_console_name'])
    if request.GET['description'] != '':
        device_console_set = device_console_set.filter(description__icontains=request.GET['description'])
    data['device_console'] = [item for item in device_console_set]
    return data


def create(request,data):
    if request.GET['device_console_name'] == '':
        data['error'] = 'Необходимо название панели'.decode('utf-8')
    else:
        device_console_set, created = db_sentry.dir_device_console.objects \
            .get_or_create(name=request.GET['device_console_name'], description=request.GET['description'], is_active=1)
        data['device_console'] = [{'id': device_console_set.id, 'name': device_console_set.name, 'description': device_console_set.description }]
    return data


def update(request,data):
    if db_sentry.dir_device_console.objects \
            .filter(name=request.GET['device_console_name']).exclude(id=int(request.GET['device_console_id'])) \
            .exists():
        data['error'] = 'Уже есть такая панель'.decode('utf-8')
    else:
        db_sentry.dir_device_console.objects.filter(id=int(request.GET['device_console_id'])) \
            .update( name = request.GET['device_console_name'],
                     description = request.GET['description'] )
    return data


def delete(request,data):
    if db_sentry.dir_device.objects \
            .filter(device_console_id=int(request.GET['device_console_id'])) \
            .exists():
        data['error'] = 'Этот тип панели используется'.decode('utf-8')
    else:
        db_sentry.dir_device_console.objects.get(id=int(request.GET['device_console_id'])).delete()
    return data