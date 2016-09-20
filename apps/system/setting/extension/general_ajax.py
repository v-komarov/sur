# -*- coding: utf-8 -*-

import json
import decimal
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def get(request, data):
    setting_set = db_sentry.setting_general.objects.get(user=None)
    data['setting'] = {
        'manager': setting_set.manager_id,
        'warden': setting_set.warden_id,
        'programmer': setting_set.programmer_id,
        'technician': setting_set.technician_id,
        'region': setting_set.region_id,
        'locality': setting_set.locality_id,
        'currency': setting_set.currency
    }
    return data


def update(request, data):
    setting_set = db_sentry.setting_general.objects.filter(user=None).update(
        manager = request.POST['manager_id'],
        warden = request.POST['warden_id'],
        programmer = request.POST['programmer_id'],
        technician = request.POST['technician_id'],
        region = request.POST['region'],
        locality = request.POST['locality'],
        currency = request.POST['currency']
    )
    data = 'done'
    return data
