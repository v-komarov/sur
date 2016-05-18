# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from apps.system.models  import client_bind


#from apps.system import models



def main(request, client_id=None):
    if request.user.has_perm('sentry.monitor'):


        data = client_bind.objects.all()

        return render_to_response('monitor/operator/monitor-operator.html', locals(), RequestContext(request))

    else:
        return render_to_response('404.html', RequestContext(request))



