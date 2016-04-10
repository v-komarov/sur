# -*- coding: utf-8 -*-

import json
import datetime

from django.http import HttpResponse
from django.shortcuts import render_to_response, redirect
from django.template import RequestContext

from apps.system import models as db_sentry
#from apps.parse import models as models_security
#from apps.profile.models import User
from apps.toolset import token, send_mail
from apps import settings


"""
def list(request, status='wait'):
    if request.user.has_perm('cabinet.manager_requests_reg'):
        title = 'Заявки: Личный кабинет'
        users_request = db_sentry.auth_user_request.objects.filter(status=status)

        return render_to_response('sentry/system/requests/requests_cabinet.html', locals(), RequestContext(request) )
    else:
        return render_to_response('404.html', RequestContext(request) )

def show(request, request_id=None):
    if request.user.has_perm('cabinet.manager_requests_reg'):
        title = 'Заявка: Личный кабинет'
        user_request = db_sentry.auth_user_request.objects.filter(id=int(request_id))

        if db_sentry.auth_user.objects.filter(email=user_request[0].email).exists():
            error = 'Пользователь с таким email уже есть'

        status = ['новый','договор зарегистрирован','подключен']
        client_object = models_security.client_object_.objects.using('security')\
            .filter(status__in=status, visible=1, order_num__startswith=user_request[0].order_num)\
            .values('id','name','order_num','client_id','status','order_date',
                    'security_type__name','security_subtype__name'
                    )\
            .distinct()

        try:
            client_id = client_object[0]['client_id']
            id_len = len(str(user_request[0].order_num))
            ord_list = ['"']
            client_objects_list = []
            for item in client_object:
                if item['order_num'][id_len:id_len+1] in ord_list or len(item['order_num']) == id_len: #.isdigit():
                    client_objects_list.append( item )
        except:
            error = 'Нет объекта с таким № договора'

        return render_to_response('sentry/system/requests/requests_cabinet_show.html', locals(), RequestContext(request) )
    else:
        return render_to_response('404.html', RequestContext(request) )


def reg_response(request, request_id=None, response=None, client_id=None):
    if request.user.has_perm('cabinet.manager_requests_reg'):
        user_request = db_sentry.user_request.objects.get(id=request_id)
        user_request.manager_id = request.user.id
        user_request.date_verify = datetime.datetime.now()

        if response == 'allowed' and client_id:
            if not db_sentry.auth_user.objects.filter(email=user_request.email).exists():
                user_request.status = 'allowed'
                user_request.save()

                user = db_sentry.auth_user.objects.create(
                    client_id = client_id,
                    username = user_request.email,
                    email = user_request.email,
                    phone = user_request.phone,
                    first_name = user_request.full_name,
                    last_name = '',
                    date_joined = datetime.datetime.now(),
                    token = token.Generator(32)
                )
                user.save()
                uu = User.objects.get(email=user_request.email)
                uu.groups.add(3)
                message = 'Пользователь создан'

                mm_title = 'Подтверждение аккаунта'
                mm_message = '''
                    <p>Здравствуйте! {username}</p>
                    <p>Для завершения регистрации на сайте ГПБ «Ураган» пройдите по ссылке: {url}</p>
                    <p>{email}</p>
                    '''.format(
                            username = user_request.email,
                            email = user_request.email,
                            url = settings.ROOT_URL+'cabinet/confirm/'+user.token+'/'
                        )
                send_mail.send([user.email], mm_title, mm_message)
            else:
                error = 'Пользователь с таким email уже есть'
                user_request.status = 'wait'
                user_request.save()

            return render_to_response('sentry/system/requests/requests_cabinet_done.html', locals(), RequestContext(request) )

        elif response == 'denied':
            user_request.status = 'denied'
            user_request.save()
            return redirect('/inside/manager/requests/cabinet/')

    else:
        return render_to_response('404.html', RequestContext(request) )


def get_peoples(request):
    if request.GET['client_id']:
        client_id = int(request.GET['client_id'])
        client_persons = models_security.client_person_.objects.using('security')\
            .filter(client=client_id, visible=1)\
            .values('full_name','position__name','phone_mobile','phone_city','phone_other','email','comment')

        data = json.dumps([item for item in client_persons], ensure_ascii=False)
        return HttpResponse(data)

"""