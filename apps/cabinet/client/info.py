# -*- coding: utf-8 -*-

from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

#from apps.parse import models as db_security
from apps.cabinet import access

'''
def info(request):
    title = 'Общая информация'
    client_id = access.get_client_id(request)

    if client_id and request.user.has_perm('cabinet.client_info'):
        client = db_security.client_.objects.using('security').filter(id=client_id)
        client_person = db_security.client_person_.objects.using('security').filter(client=client_id)
        return render_to_response('sentry/cabinet/client/info.html', locals(), RequestContext(request) )
    elif request.user.has_perm('cabinet.roadside_show'):
        return redirect('/manager/roadside/')
    else:
        message = client_id
        return render_to_response('404.html', locals(), RequestContext(request) )
'''