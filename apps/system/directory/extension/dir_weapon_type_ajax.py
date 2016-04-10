# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    weapon_type_set = db_sentry.dir_weapon_type.objects.filter(is_active=1).values('id','name')
    if request.GET['name'] != '':
        weapon_type_set = weapon_type_set.filter(name__icontains=request.GET['name'])
    data['weapon_type'] = [item for item in weapon_type_set]
    return data


def create(request,data):
    if request.GET['name']=='':
        data['error'] = 'Нужно название оружия'.decode('utf-8')

    else:
        weapon_type_set, created = db_sentry.dir_weapon_type.objects \
            .get_or_create(name = request.GET['name'], is_active=1)
        data['weapon_type'] = [{ 'id':weapon_type_set.id, 'name':weapon_type_set.name }]
    return data


def update(request,data):
    weapon_type_set = db_sentry.dir_weapon_type.objects \
        .filter(name=request.GET['name']) \
        .exclude(id=int(request.GET['weapon_type_id']))
    if weapon_type_set.exists():
        data['error'] = 'Уже есть такое оружие'.decode('utf-8')
    else:
        db_sentry.dir_weapon_type.objects \
            .filter(id=int(request.GET['weapon_type_id'])) \
            .update(name=request.GET['name'])
    return data


def delete(request,data):
    if db_sentry.dir_weapon.objects \
            .filter(weapon_type_id=int(request.GET['weapon_type_id'])) \
            .exists():
        data['error'] = 'Этот тип оружия используется'.decode('utf-8')
    else:
        db_sentry.dir_weapon_type.objects.get(id=int(request.GET['weapon_type_id'])).delete()
    return data
