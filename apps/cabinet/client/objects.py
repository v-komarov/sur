# -*- coding: utf-8 -*-

from django.template import RequestContext
from django.shortcuts import render_to_response

#from apps.parse import models as db_security
from apps.cabinet import access

'''
def objects_list(request):
    title = 'Объекты'
    client_id = access.get_client_id(request)
    if client_id and request.user.has_perm('cabinet.client_objects'):
        status_list = ['новый','договор зарегистрирован','подключен']
        objects_set = db_security.client_object_.objects.using('security')\
            .filter( client=client_id, status__in=status_list, visible=1)\
            .values('id','name','order_num','status',
                    'client__name','month_pay',
                    'security_type__name','security_subtype__name',
                    'locality__name','street__name','building')\
            .order_by('order_num')

        return render_to_response('cabinet/client/objects.html', locals(), RequestContext(request) )
    else:
        return render_to_response('404.html', RequestContext(request) )
'''