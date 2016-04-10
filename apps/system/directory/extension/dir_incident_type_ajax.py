# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    incident_type_set = db_sentry.dir_incident_type.objects.filter(is_active=1).values('id','name')
    if request.GET['incident_type_name'] != '':
        incident_type_set = incident_type_set.filter(name__icontains=request.GET['incident_type_name'])
    data['incident_type'] = [item for item in incident_type_set]
    return data


def create(request,data):
    if request.GET['incident_type_name'] == '':
        data['error'] = 'Необходимо название типа происшествия'.decode('utf-8')

    else:
        incident_type_set, created = db_sentry.dir_incident_type.objects \
            .get_or_create(name = request.GET['incident_type_name'], is_active=1)
        data['incident_type'] = [{ 'id': incident_type_set.id, 'name': incident_type_set.name }]
    return data


def update(request,data):
    if db_sentry.dir_incident_type.objects \
            .filter(name=request.GET['incident_type_name']).exclude(id=int(request.GET['incident_type_id'])) \
            .exists():
        data['error'] = 'Уже есть такой тип происшествия'.decode('utf-8')
    else:
        db_sentry.dir_incident_type.objects \
            .filter(id=int(request.GET['incident_type_id'])) \
            .update(
            name = request.GET['incident_type_name'] )
    return data


def delete(request,data):
    if db_sentry.client_object_incident.objects \
            .filter(incident_type_id=int(request.GET['incident_type_id'])) \
            .exists():
        data['error'] = 'Этот тип происшествия используется'.decode('utf-8')
    else:
        db_sentry.dir_incident_type.objects.get(id=int(request.GET['incident_type_id'])).delete()
    return data



