# -*- coding: utf-8 -*-

from django.template import RequestContext
from django.shortcuts import render_to_response

#from apps.parse import models as db_security
from apps.cabinet import access


'''
def accounts(request, obj_id=None, period=1):
    title = 'Расчетный счет'
    client_id = access.get_client_id(request)
    if client_id:
        objects_set = db_security.client_object_.objects.using('security')\
                .filter(client=client_id, status='подключен')\
                .values('security_company')
        company_list = []
        for item in objects_set:
            if item['security_company'] not in company_list:
                company_list.append(item['security_company'])

        accounts_set = db_security.payment_account.objects.using('security')\
            .filter(id__in=company_list)


        return render_to_response('cabinet/client/payment_account.html', locals(), RequestContext(request) )

    return render_to_response('404.html', RequestContext(request) )
'''