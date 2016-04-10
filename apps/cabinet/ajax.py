# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse

from apps.system import models as db_sentry
#from apps.parse import models as db_security


def check_email(request):
    if request.is_ajax() and request.method == 'GET':
        user = db_sentry.client_user_email.objects.filter(email=request.GET['email'])
        if user.exists():
            answer = 'false'
        else:
            answer = 'true'

        if 'action' in request.GET and request.GET['action'] == 'restore' and user.exists():
            answer = 'true'
        elif 'action' in request.GET and request.GET['action'] == 'restore':
            answer = 'false'

    return HttpResponse(answer)


'''
def get_order_num(request):
    if request.is_ajax() and request.method == 'GET':
        set = db_security.client_object_.objects.using('security')\
            .filter(order_num__startswith=request.GET['id'], visible=1)\
            .values('order_num')[:7]

        data = json.dumps([item for item in set], ensure_ascii=False)

        return HttpResponse(data)
'''
