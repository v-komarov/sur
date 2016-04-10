# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    service_type_set = db_sentry.dir_service_type.objects.filter(is_active=1)#.values('id','name','description')
    if 'service_type_name' in request.GET and request.GET['service_type_name']!='':
        service_type_set = service_type_set.filter(name__icontains=request.GET['service_type_name'])
    if 'description' in request.GET and request.GET['description']!='':
        service_type_set = service_type_set.filter(description__icontains=request.GET['description'])
    if 'service_type_id' in request.GET and request.GET['service_type_id']!='':
        service_type_set = service_type_set.filter(id=request.GET['service_type_id'])
    #data['type'] = [item for item in service_type_set]
    data['service_type_list'] = []
    for item in service_type_set:
        subtype_list = []
        for subtype in db_sentry.dir_service_subtype.objects.filter(service_type_id=item.id):
            subtype_list.append({
                'id': subtype.id,
                'name': subtype.name,
                'description': subtype.description
            })
        data['service_type_list'].append({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'subtype_list': subtype_list
        })
    return data


def create(request,data):
    if request.GET['service_type_name']=='':
        data['error'] = 'Впишите виды охраны.'.decode('utf-8')
    else:
        db_sentry.dir_service_type.objects \
            .get_or_create(name = request.GET['service_type_name'], description = request.GET['description'], is_active=1)
        data['service_type_list'] = []
        for item in db_sentry.dir_service_type.objects.filter(is_active=1):
            subtype_list = []
            for subtype in db_sentry.dir_service_subtype.objects.filter(service_type_id=item.id):
                subtype_list.append({
                    'id': subtype.id,
                    'name': subtype.name,
                    'description': subtype.description
                })
            data['service_type_list'].append({
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'subtype_list': subtype_list
            })
    return data


def subtype_create(request,data):
    service_type_id = int(request.POST['service_type_id'])
    if request.POST['service_subtype_name']=='':
        data['error'] = 'Впишите подвид услуг'.decode('utf-8')
    else:
        db_sentry.dir_service_subtype.objects.get_or_create(
            service_type_id = service_type_id,
            name = request.POST['service_subtype_name'],
            description = request.POST['service_subtype_description'] )
        data['service_subtype_list'] = []
        for item in db_sentry.dir_service_subtype.objects.filter(service_type_id=service_type_id, is_active=1):
            data['service_subtype_list'].append({
                'id': item.id,
                'service_type_id': item.service_type_id,
                'name': item.name,
                'description': item.description,
                })
    return data


def subtype_delete(request,data):
    service_subtype_id = int(request.POST['service_subtype_id'])
    if db_sentry.client_object_service_dir_service_subtype.objects \
            .filter(dir_service_subtype=service_subtype_id) \
            .exists():
        data['error'] = 'Этот подвид услуг используется'.decode('utf-8')
    else:
        db_sentry.dir_service_subtype.objects.get(id=service_subtype_id).delete()

        data['service_subtype_list'] = []
        for item in db_sentry.dir_service_subtype.objects.filter(service_type=int(request.POST['service_type_id']), is_active=1):
            data['service_subtype_list'].append({
                'id': item.id,
                'service_type_id': item.service_type_id,
                'name': item.name,
                'description': item.description,
                })
    return data


def subtype_update(request,data):
    db_sentry.dir_service_subtype.objects \
        .filter(id=int(request.POST['service_subtype_id'])) \
        .update(name=request.POST['service_subtype_name'], description=request.POST['service_subtype_description'])
    data['service_subtype_list'] = []
    for item in db_sentry.dir_service_subtype.objects.filter(service_type=int(request.POST['service_type_id']), is_active=1):
        data['service_subtype_list'].append({
            'id': item.id,
            'service_type_id': item.service_type_id,
            'name': item.name,
            'description': item.description,
            })

    return data


def update(request,data):
    if db_sentry.dir_service_type.objects \
            .filter(name=request.GET['service_type_name']) \
            .exclude(id=int(request.GET['service_type_id'])) \
            .exists():
        data['error'] = 'Уже есть такой вид охраны.'.decode('utf-8')
    else:
        db_sentry.dir_service_type.objects \
            .filter(id=int(request.GET['service_type_id'])) \
            .update(name=request.GET['service_type_name'], description=request.GET['description'])
    return data


def delete(request,data):
    if db_sentry.client_object_service.objects \
            .filter(service_type=int(request.GET['service_type_id'])) \
            .exists():
        data['error'] = 'Этот вид услуг используется'.decode('utf-8')
    else:
        db_sentry.dir_service_type.objects \
            .get(id=int(request.GET['service_type_id'])) \
            .delete()
    return data
