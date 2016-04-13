# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

#from apps.system import models



def index(request, client_id=None):
    if request.user.has_perm('sentry.monitor'):



        return render_to_response('monitor/operator/index.html', locals(), RequestContext(request))
    else:
        return render_to_response('404.html', RequestContext(request))




def test(request, client_id=None):
    title = 'Монитор событий'
    event_filter = [
        {'name':'all','description':'Все'},
        {'name':'alarm','description':'Тревожные'},
        {'name':'object','description':'На объекте'}
    ]

    return render_to_response('monitor/operator/test.html', locals(), RequestContext(request))
