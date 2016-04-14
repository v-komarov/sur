# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry
from apps.system.directory.extension import dir__form
from apps.toolset import date_convert


def search(request, data):
    device_set = db_sentry.dir_device.objects.filter(is_active=1)
    if 'name' in request.GET and request.GET['name']:
        device_set = device_set.filter(name__icontains=request.GET['name'])
    if 'number' in request.GET and request.GET['number']:
        device_set = device_set.filter(number__icontains=int(request.GET['number']))
    if 'device_type' in request.GET and request.GET['device_type']:
        device_set = device_set.filter(device_type_id=int(request.GET['device_type']))
    if 'device_console' in request.GET and request.GET['device_console']:
        device_set = device_set.filter(device_console_id=int(request.GET['device_console']))
    if 'series' in request.GET and request.GET['series']:
        device_set = device_set.filter(series__icontains=request.GET['series'])
    if 'belong' in request.GET and request.GET['belong']:
        device_set = device_set.filter(belong=request.GET['belong'])
    if 'comment' in request.GET and request.GET['comment']:
        device_set = device_set.filter(comment__icontains=request.GET['comment'])
    if 'limit' in request.GET:
        device_set = device_set[:int(request.GET['limit'])]

    if 'communication' in request.GET:
        data['device_list'] = []
        for device in device_set:
            install = 'no'
            if db_sentry.client_object_dir_device.objects.filter(device_id=device.id, uninstall_date=None, is_active=1).exists():
                install = 'yes'
            device_item = {
                'id': device.id,
                'name': device.name,
                'belong': device.belong,
                'comment': device.comment,
                'install': install
            }
            if device.device_console_id:
                device_item['device_console__name'] = device.device_console.name
            else:
                device_item['device_console__name'] = ''
            if device.device_type_id:
                device_item['device_type__name'] = device.device_type.name
            else:
                device_item['device_type__name'] = ''
            data['device_list'].append(device_item)
    else:
        device_set = device_set.values('id','device_console__name','device_type__name','name','series','number','belong','comment')
        data['device_list'] = [item for item in device_set]
    return data


def get(request, data):
    if 'device_install_id' in request.GET:
        device = db_sentry.dir_device.objects \
            .get(id=db_sentry.client_object_dir_device.objcts.get(id=int(request.GET['device_install_id'])).device_id)
    else:
        device = db_sentry.dir_device.objects.get(id=int(request.GET['device']))

    try: registration_date = device.registration_date.strftime("%d.%m.%Y")
    except: registration_date = None
    data['device'] = {
        'id': device.id,
        'name': device.name,
        'series': device.series,
        'number': device.number,
        'belong': device.belong,
        'comment': device.comment,
        'registration_date': registration_date,
        'install_list': []
    }
    if device.device_console_id: data['device']['device_console'] = device.device_console_id
    else: data['device']['device_console'] = ''
    if device.device_type_id: data['device']['device_type'] = device.device_type_id
    else: data['device']['device_type'] = ''

    for install in db_sentry.client_object_dir_device.objects.filter(device_id=device.id, uninstall_date=None, is_active=1):
        contract = install.object.client_bind_set.first().client_contract
        data['device']['install_list'].append({
            'id': install.id,
            'client': contract.client.id,
            'contract': contract.id,
            'object_id': install.object.id,
            'object__name': install.object.name,
            'priority': install.priority,
            })

    data['device']['communication_list'] = []
    if device.device_type_id:
        for item in device.device_type.dir_device_communication.all():
            data['device']['communication_list'].append({
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'communication_type': item.communication_type.name
            })

    data['device']['sim_card_list'] = []
    for sim_card in device.dir_sim_card_set.all():
        data['device']['sim_card_list'].append({
            'id': sim_card.id,
            'number': sim_card.number
        })

    return data


def update(request, data):
    try:
        device = db_sentry.dir_device.objects.get(id=request.POST['device'])
        form = dir__form.dir_device_form(request.POST, instance=device)
    except:
        form = dir__form.dir_device_form(request.POST)

    if form.is_valid():
        device = form.save()
        if 'device_sim_card_list' in request.POST and len(json.loads(request.POST['device_sim_card_list']))>0:
            db_sentry.dir_sim_card.objects.filter(dir_device=device.id).update(dir_device=None)
            db_sentry.dir_sim_card.objects \
                .filter(id__in=json.loads(request.POST['device_sim_card_list'])) \
                .update(dir_device=device.id)
        else:
            db_sentry.dir_sim_card.objects.filter(dir_device=device.id).update(dir_device=None)
        device.save()
        data['answer'] = 'done'

    else:
        data['errors'] = form.errors

    '''
    if db_sentry.dir_device.objects.filter(name=request.POST['name'], is_active=1).exclude(id=device.id).exists():
        data['error'] = 'Есть ОУ с наким номером'
    '''
    #data['len'] = len(json.loads(request.POST['device_sim_card_list']))
    return data


def set_priority(request, data):
    install_set = db_sentry.client_object_dir_device.objects.get(id=int(request.POST['install_id']))
    device_id = install_set.device_id
    for item in db_sentry.client_object_dir_device.objects.filter(device=device_id):
        if item.object_id == install_set.object_id:
            item.priority = 'primary'
        else:
            item.priority = 'secondary'
        item.save()
    data['answer'] = 'priority'
    return data


def check_priority(device_id):
    # Если ОУ не подключена, но назначается priority == 'primary', иначе по умолчанию 'secondary'
    device_install_set = db_sentry.client_object_dir_device.objects.filter(device_id=device_id, is_active=1)
    if device_install_set.exists():
        priority = 0
        for install in device_install_set:
            if install.priority == 'primary':
                priority += 1
        if priority < 1:
            device_install_set[0].priority = 'primary'
            device_install_set[0].save()
    return 'done'


def delete(request, data):
    device = db_sentry.dir_device.objects.get(id=int(request.GET['device']))
    device.is_active = 0
    device.save()
    db_sentry.dir_sim_card.objects.filter(dir_device=device.id).update(dir_device=None)
    data['answer'] = 'done'
    return data

