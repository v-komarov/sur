# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    interval_set = db_sentry.dir_contract_interval.objects.filter(is_active=1) \
        .values('id','service_organization_id','service_organization__name','begin','end','prefix')
    if 'company_id' in request.GET and request.GET['company_id'] != 'all':
        interval_set = interval_set.filter(service_organization_id=int(request.GET['company_id']))
    data['interval'] = [item for item in interval_set]
    return data


def get(request,data):
    interval_set = db_sentry.dir_contract_interval.objects.filter(id=int(request.GET['interval_id'])) \
        .values('id','service_organization_id','service_organization__name','begin','end','prefix')
    data['interval'] = [item for item in interval_set]
    return data


def create(request,data):
    if request.GET['begin'] == '': data['error'] = 'Нужно начало интервала.'.decode('utf-8')
    if request.GET['end'] == '': data['error'] = 'Нужен конец интервала.'.decode('utf-8')
    else:
        interval_set, created = db_sentry.dir_contract_interval.objects.get_or_create(
            service_organization_id = request.GET['company_id'],
            begin = int(request.GET['begin']),
            end = int(request.GET['end']),
            prefix = request.GET['prefix'],
            is_active=1 )
        data['interval'] = [{
                                'id': interval_set.id,
                                'begin': interval_set.begin,
                                'end': interval_set.end,
                                'prefix': interval_set.prefix,
                                'company_id': interval_set.service_organization_id,
                                'company__name': interval_set.service_organization.name }]
    return data


def update(request,data):
    begin = int(request.GET['begin'])
    end = int(request.GET['end'])
    interval_set = db_sentry.dir_contract_interval.objects.filter(
        begin = begin,
        end = end,
        prefix = request.GET['prefix'] ).exclude(id=int(request.GET['interval_id']))
    if interval_set.exists():
        data['error'] = 'Уже есть такой интервал.'.decode('utf-8')
    else:
        interval_set = db_sentry.dir_contract_interval.objects \
            .filter(id=int(request.GET['interval_id'])).update(
            begin = begin,
            end = end,
            prefix = request.GET['prefix'],
            service_organization = request.GET['company_id'] )
        data['interval'] = [{ 'id': request.GET['interval_id'] }]
    return data


def delete(request,data):
    '''
    holding = db_sentry.client.objects.filter(holding_id=int(request.GET['interval_id']))
    if holding.exists():
        data['error'] = 'Невозможно удалить эту запись'.decode('utf-8')
    else:
    '''
    db_sentry.dir_contract_interval.objects.get(id=int(request.GET['interval_id'])).delete()

    return data





