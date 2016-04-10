import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def get(user_id=None):
    settings = {}
    settings_set = db_sentry.settings_general.objects.get(user=user_id)
    settings['region_id'] = settings_set.region_id
    settings['locality_id'] = settings_set.locality_id
    return settings