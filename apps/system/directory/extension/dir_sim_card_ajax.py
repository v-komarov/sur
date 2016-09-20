# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry
from apps.system.directory.extension import dir__form


def search(request, data):
    sim_card_set = db_sentry.dir_sim_card.objects.filter(is_active=1)
    if 'sim_card' in request.GET and request.GET['sim_card'] != '':
        sim_card_set = sim_card_set.filter(id=int(request.GET['sim_card']))
    if 'number' in request.GET and request.GET['number'] != '':
        sim_card_set = sim_card_set.filter(number__icontains=request.GET['number'])
    if 'device_name' in request.GET and request.GET['device_name'] != '':
        sim_card_set = sim_card_set.filter(dir_device__name__icontains=request.GET['device_name'])
    if 'device_null' in request.GET and request.GET['device_null'] != '':
        sim_card_set = sim_card_set.filter(dir_device=None)

    if 'sim_card_exclude' in request.GET:
        sim_card_set = sim_card_set.exclude(id__in=json.loads(request.GET['sim_card_exclude']))
    if 'limit' in request.GET:
        sim_card_set = sim_card_set[:int(request.GET['limit'])]

    data['sim_card_list'] = []
    for item in sim_card_set:
        item_array = {'id': item.id, 'number': item.number}
        if item.dir_device: item_array['device_name'] = item.dir_device.name
        else: item_array['device_name'] = ''
        data['sim_card_list'].append(item_array)

    return data


def update(request, data):
    try:
        sim_card = db_sentry.dir_sim_card.objects.get(id=int(request.POST['sim_card_id']))
        form = dir__form.dir_sim_card_form(request.POST, instance=sim_card)
    except:
        form = dir__form.dir_sim_card_form(request.POST)

    if form.is_valid():
        sim_card = form.save()
        sim_card.save()
        data['answer'] = 'done'
    else:
        data['errors'] = form.errors

    return data


def delete(request,data):
    sim_card = db_sentry.dir_sim_card.objects.get(id=int(request.GET['sim_card']))
    if sim_card.dir_device_id:
        data['error'] = 'SIM-карта подключена'.decode('utf-8')
    else:
        sim_card.is_active = 0
        sim_card.save()
        data['answer'] = 'done'
    return data

