# -*- coding: utf-8 -*-

import json
import decimal
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def get(request, data):
    data['settings_search'] = []
    for item in db_sentry.setting_interface.objects.filter(section='search'):
        data['settings_search'].append({
            'id': item.id,
            'label': item.label,
            'name': item.name,
            'side': item.side,
            'position': item.position
        })

    return data


def update(request, data):
    for item in json.loads(request.POST['item_list']):
        setting_search_set = db_sentry.setting_interface.objects.get(section='search', label=item['label'])
        setting_search_set.side = item['side']
        setting_search_set.position = int(item['position'])
        setting_search_set.save()

    data['answer'] = 'done'
    return data
