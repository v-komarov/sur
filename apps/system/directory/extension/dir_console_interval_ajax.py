# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from django.db.models import Q

from apps.system import models as db_sentry


def search(request,data):
    console_interval_set = db_sentry.dir_console_interval.objects.filter(is_active=1) \
        .values('id','service_organization_id','service_organization__name','begin','end','device_console_id','device_console__name')
    if 'console_interval_id' in request.GET and request.GET['console_interval_id'] != '':
        console_interval_set = console_interval_set.filter(id=int(request.GET['console_interval_id']))
    else:
        if 'service_organization_id' in request.GET and request.GET['service_organization_id'] != '':
            console_interval_set = console_interval_set.filter(service_organization_id=int(request.GET['service_organization_id']))
        if 'device_console_id' in request.GET and request.GET['device_console_id'] != '':
            console_interval_set = console_interval_set.filter(device_console_id=int(request.GET['device_console_id']))

    data['console_interval_list'] = [item for item in console_interval_set]
    return data


def console_interval_list(request,data=None):
    data['console_number_list'] = []
    data['exclude'] = []
    data['count'] = 0
    data['exclude_count'] = 0
    for object in db_sentry.client_bind.objects.filter(
            console_id = int(request.GET['device_console_id']),
            is_active = 1 ):
        data['exclude'].append(object.console_number)
        data['exclude_count'] += 1
    for console in db_sentry.dir_console_interval.objects.filter(
            device_console = int(request.GET['device_console_id']),
            is_active = 1 ):
        for number in range(console.begin,console.end+1):
            if number not in data['exclude']:
                data['console_number_list'].append(number)
                data['count'] += 1
    return data


def create(request,data):
    check = check_interval(
        #service_organization_id = request.POST['service_organization_id'],
        device_console_id = request.POST['device_console'],
        begin = request.POST['begin'],
        end = request.POST['end']
    )
    if check:
        interval_set = db_sentry.dir_console_interval.objects.create(
            service_organization_id = request.POST['service_organization'],
            device_console_id = request.POST['device_console'],
            begin = int(request.POST['begin']),
            end = int(request.POST['end'])
        )
    else:
        data['error'] = 'Есть такой диапозон'
    return data


def update(request,data):
    begin = int(request.POST['begin'])
    end = int(request.POST['end'])
    check = check_interval(
        interval_id = request.POST['console_interval'],
        #service_organization_id = request.POST['service_organization'],
        device_console_id = request.POST['device_console'],
        begin = begin,
        end = end
    )

    '''
    if db_sentry.dir_console_interval.objects.filter(
                service_organization_id=int(request.POST['service_organization']),
                device_console_id=int(request.POST['device_console']),
                begin=begin, end=end) \
                .exclude(id=int(request.POST['console_interval'])) \
                .exists():
        data['error'] = 'Уже есть такой интервал.'.decode('utf-8')
    else:
    '''
    if check:
        console_interval_set = db_sentry.dir_console_interval.objects.get(id=int(request.POST['console_interval']))
        console_interval_set.service_organization_id = int(request.POST['service_organization'])
        console_interval_set.device_console_id = int(request.POST['device_console'])
        console_interval_set.begin = begin
        console_interval_set.end = end
        console_interval_set.save()
    else:
        data['error'] = 'Есть такой диапозон'

    return data


def check_interval(**kwargs):
    begin = int(kwargs['begin'])
    end = int(kwargs['end'])
    console_interval_set = db_sentry.dir_console_interval.objects.filter(
        Q(
        #service_organization_id = int(kwargs['service_organization_id']),
          device_console_id = int(kwargs['device_console_id']),
          is_active = 1
        ) &
        Q(
            Q(
                Q(begin__lte = begin) & Q(end__gte = begin)
            ) |
            Q(
                Q(begin__lte = end) & Q(end__gte = end)
            )
        )
    )

    if 'interval_id' in kwargs: console_interval_set = console_interval_set.exclude(id=int(kwargs['interval_id']))

    if console_interval_set.exists():
        return False
    else:
        return True



def delete(request, data):
    interval_set = db_sentry.dir_console_interval.objects.get(id=int(request.GET['console_interval']))
    interval_set.is_active = 0
    interval_set.save()
    '''
    object_set = db_sentry.client_object.objects.filter(
        console = interval_set.device_console_id,
        contract__service_organization = interval_set.service_organization_id,
        console_number__range = (interval_set.begin, interval_set.end),
        is_active = 1
    )
    data['count'] = object_set.count()
    data['console_id'] = interval_set.device_console_id
    data['service_organization_id'] = interval_set.service_organization_id
    if object_set.exists():
        data['error'] = 'Есть номера на пульте из интервала'
    else:
        interval_set.is_active = 0
        interval_set.save()
    '''

    return data





