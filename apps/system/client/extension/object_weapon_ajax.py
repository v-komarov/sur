# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry


def get(request,data):
    data['weapon_list'] = {}
    data['dir_weapon_list'] = {}
    service_id = int(request.GET['select_id'])
    service_organization_id = db_sentry.client_object_service.objects.get(id=service_id).service_organization_id
    for weapon in db_sentry.dir_weapon.objects.filter(service_organization=service_organization_id, is_active=1):
        data['dir_weapon_list'][weapon.id] = {
            'name': weapon.weapon_type.name,
            'number': weapon.number,
            'series': weapon.series }
    if request.GET['select_level']=='service':
        for weapon in db_sentry.client_object_service_weapon.objects.filter(service_id=service_id, is_active=1):
            data['weapon_list'][weapon.weapon.id] = {
                'id': weapon.id,
                'name': weapon.weapon.weapon_type.name,
                'series': weapon.weapon.series,
                'number': weapon.weapon.number,
                'comment': weapon.comment }
    return data


def update(request,data):
    if request.POST['service_weapon_id']=='add':
        service_weapon_set = db_sentry.client_object_service_weapon.objects \
            .create(
            service_id = int(request.POST['service_id']),
            weapon_id = int(request.POST['weapon_id']),
            comment = request.POST['comment'],
            is_active = 1 )
        data['service_weapon_id'] = service_weapon_set.id
        armed = 0
    else:
        db_sentry.client_object_service_weapon.objects \
            .filter( id = int(request.POST['service_weapon_id'])) \
            .update(
            weapon = int(request.POST['weapon_id']),
            comment = request.POST['comment'] )
        armed = 1
    db_sentry.client_object_service.objects \
        .filter(id=int(request.POST['service_id'])) \
        .update(armed=armed)
    return data


def delete(request,data):
    service_id = db_sentry.client_object_service_weapon.objects \
        .get(id=int(request.GET['service_weapon_id'])).service_id

    db_sentry.client_object_service_weapon.objects \
        .get(id=int(request.GET['service_weapon_id'])) \
        .delete()

    if db_sentry.client_object_service_weapon.objects \
            .filter(service_id=service_id, is_active=1) \
            .exists():
        armed = 1
    else: armed = 0

    db_sentry.client_object_service.objects \
        .filter(id=service_id) \
        .update(armed=armed)

    return data
