# -*- coding: utf-8 -*-

import datetime
import json

from django.contrib import auth
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from django.contrib.auth import logout

from apps.system import models as db_sentry



def get_sentry_user(request):
    sentry_user = db_sentry.sentry_user.objects.get(username=request.user.get_username())
    data = {
        'id': sentry_user.id,
        'username': sentry_user.username,
        'full_name': sentry_user.full_name,
        }
    return data


def logout_view(request):
    logout(request)
    return HttpResponseRedirect('/')
