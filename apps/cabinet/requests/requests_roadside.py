# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry


def list(request, status='wait'):
    if request.user.has_perm('cabinet.manager_requests_reg'):
        title = 'Заявки: «Помощь на дороге»'

        request_roadside = db_sentry.site_roadside.objects.filter(status=status)

        return render_to_response('sentry/system/requests/requests_roadside.html', locals(), RequestContext(request) )
    else:
        return render_to_response('404.html', RequestContext(request) )


