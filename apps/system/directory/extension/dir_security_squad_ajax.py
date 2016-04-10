# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    security_squad_set = db_sentry.dir_security_squad.objects.filter(is_active=1).values('id','name')
    if request.GET['security_squad_name']!='':
        security_squad_set = security_squad_set.filter(name__icontains=request.GET['security_squad_name'])
    data['security_squad'] = [item for item in security_squad_set]
    return data


def create(request,data):
    if request.GET['security_squad_name']=='':
        data['error'] = 'Необходимо название холдинга'.decode('utf-8')
    else:
        security_squad_set, created = db_sentry.dir_security_squad.objects \
            .get_or_create(name = request.GET['security_squad_name'], is_active=1)
        data['security_squad'] = [{ 'id': security_squad_set.id, 'name': security_squad_set.name }]
    return data


def update(request,data):
    if db_sentry.dir_security_squad.objects \
            .filter(name=request.GET['security_squad_name']) \
            .exclude(id=int(request.GET['security_squad_id'])) \
            .exists():
        data['error'] = 'Уже есть такая группа'.decode('utf-8')
    else:
        db_sentry.dir_security_squad.objects \
            .filter(id=int(request.GET['security_squad_id'])) \
            .update( name = request.GET['security_squad_name'] )
    return data


def delete(request,data):
    if db_sentry.client_object.objects \
            .filter(security_squad_id=int(request.GET['security_squad_id'])) \
            .exists():
        data['error'] = 'Невозможно удалить эту запись'.decode('utf-8')
    else:
        db_sentry.dir_security_squad.objects.get(id=int(request.GET['security_squad_id'])).delete()

    return data


