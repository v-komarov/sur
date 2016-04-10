# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry
from apps.toolset import date_convert


def search(request,data):
    device_communication_set = db_sentry.dir_device_communication.objects.filter(is_active=1) \
        .values('id','communication_type','communication_type__name','name','description')
    if 'communication_id' in request.GET:
        device_communication_set = device_communication_set.filter(id=request.GET['communication_id'])
    if 'name' in request.GET:
        device_communication_set = device_communication_set.filter(name__icontains=request.GET['name'])
    if 'communication_type_id' in request.GET:
        device_communication_set = device_communication_set.filter(communication_type=int(request.GET['communication_type_id']))
    if 'description' in request.GET:
        device_communication_set = device_communication_set.filter(description__icontains=request.GET['description'])
    if 'limit' in request.GET:
        device_communication_set = device_communication_set[:int(request.GET['limit'])]
    data['device_communication_list'] = [item for item in device_communication_set]
    return data


def update(request,data):
    if 'communication' in request.POST:
        device_communication_set = db_sentry.dir_device_communication.objects.get(id=int(request.POST['communication']))
    else:
        device_communication_set = db_sentry.dir_device_communication.objects.create(
            communication_type_id = int(request.POST['communication_type'])
        )
    device_communication_set.name = request.POST['name']
    device_communication_set.communication_type_id = int(request.POST['communication_type'])
    device_communication_set.description = request.POST['description']
    device_communication_set.save()
    data['answer'] = 'done'
    return data


def delete(request,data):
    communication_set = db_sentry.dir_device_communication.objects.get(id=int(request.GET['communication']))
    communication_set.is_active = 0
    communication_set.save()
    data['answer'] = 'done'
    return data

