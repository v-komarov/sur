# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    region_set = db_sentry.dir_address_1_region.objects.all().values('id','name')
    if 'region_name' in request.GET and request.GET['region_name']!='':
        region_set = region_set.filter(name__icontains=request.GET['region_name'])
    elif 'region_id' in request.GET and request.GET['region_id']!='':
        region_set = region_set.filter(id=request.GET['region_id'])
    if 'limit' in request.GET and request.GET['limit']!='':
        region_set = region_set[:int(request.GET['limit'])]
    data['region_list'] = [item for item in region_set]
    return data


def add(request,data):
    pass
    return data


def create(request,data):
    if 'region_name' not in request.GET or request.GET['region_name']=='':
        data['error'] = 'Впишите регион.'.decode('utf-8')
    else:
        region_set, created = db_sentry.dir_address_1_region.objects.get_or_create(name=request.GET['region_name'])
        data['region_list'] = [{'id':region_set.id, 'name':region_set.name}]
    return data


def update(request,data):
    region_set = db_sentry.dir_address_1_region.objects.filter(name=request.POST['region_name'])
    if region_set.exists():
        data['error'] = 'Уже есть такой регион'.decode('utf-8')
    else:
        region_set = db_sentry.dir_address_1_region.objects.get(id=int(request.POST['region_id']))
        region_set.name = request.POST['region_name']
        region_set.save()
        data['answer'] = 'done'
    return data


def delete(request, data):
    locality_set = db_sentry.dir_address_2_locality.objects.filter(region_id=int(request.POST['region_id']))
    if locality_set.exists():
        data['error'] = 'Этот регион используется'.decode('utf-8')
    else:
        db_sentry.dir_address_1_region.objects.get(id=int(request.POST['region_id'])).delete()
        data['answer'] = 'done'

    return data

