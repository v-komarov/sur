# -*- coding: utf-8 -*-

import datetime
import json

from django.contrib import auth
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry
from apps.toolset import token, send_mail


def get_all_permissions_list(request):
    permissions = []
    for permission in request.user.get_all_permissions():
        permissions.append(permission.encode('ascii'))

    return json.dumps(permissions, ensure_ascii=False)
