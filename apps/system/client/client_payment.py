# -*- coding: utf-8 -*-

import datetime
import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.toolset import lunchbox
from apps.system import models as db_sentry
from apps.system.client.extension import client_payment_ajax


def index(request,client_id=None):
    request.session['lunchbox'] = lunchbox.get(request)

    if request.user.has_perm('system.client_payment'):
        title = 'Платежи'
        client_set = db_sentry.client.objects.get(id=client_id)
        today_year = datetime.date.today().year
        payment_type = ['Касса'.decode('utf-8'),'Банк'.decode('utf-8'),'Взаимозачет'.decode('utf-8'),'Терминал'.decode('utf-8')]

        years_list = [today_year]
        try:
            payments_set = db_sentry.client_payment.objects.filter(client=client_id).first()
            for year in xrange(int(payments_set.date.year), today_year):
                years_list.append(year)
        except: pass
        years_list.sort()

        return render_to_response('system/client/client_payment.html', locals(), RequestContext(request))

    else:
        return render_to_response('403.html', locals(), RequestContext(request))
        
        
def ajax(request,action=None):
    data = {'error': None}

    if action == 'get':
        if request.user.has_perm('system.client_payment'):
            data = client_payment_ajax.get(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'update':
        if request.user.has_perm('system.add_client_payment'):
            data = client_payment_ajax.update(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action == 'delete':
        if request.user.has_perm('system.delete_client_payment'):
            data = client_payment_ajax.delete(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')
    
    

def sum(request, client_id=None):
    if request.user.has_perm('system.client'):
        pass