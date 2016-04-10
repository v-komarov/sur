# -*- coding: utf-8 -*-

import datetime
import json

from django.contrib import auth
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry
from apps.site.site import index
from apps.cabinet import forms
from apps.toolset import token, send_mail
from apps import settings


def cabinet_auth(request):
    data={}
    data['email'] = request.POST['email']
    if request.is_ajax() and request.method == 'POST':
        user = auth.authenticate( username = request.POST['email'], password = request.POST['passw'] )
        request.session['email'] = data['email']

        if user:
            if user.is_active: # the password verified for the user

                request.session['sentry'] = {}
                #request.session['sentry']['enter_time'] = datetime.datetime.now().strftime('%M:%S')

                auth.login(request, user)
                data['answer'] = 'green'
                if user.has_perm('cabinet.manager_interface'):
                    data['url'] = '/system/client/search/'
                elif user.has_perm('cabinet.roadside_show'):
                    data['url'] = '/system/roadside/'
                else:
                    data['url'] = '/cabinet/'
            else: # the password is valid, but the account has been disabled
                data['answer'] = 'yellow'
        else:
            data['answer'] = 'red'

    data = json.dumps(data, ensure_ascii=False)
    return HttpResponse(data)


def cabinet_logout(request):
    auth.logout(request)
    return redirect('/')


def get_access(request):
    right_pack = index.right_pack_get()

    if(request.POST):
        date_request = datetime.date.today()
        token_key = token.Generator(32)

        form = forms.regForm(request.POST)
        if form.is_valid():
            #client_people = models_security.client_people.objects.using('security').filter(email=email)
            login_request = form.save(commit=False)
            login_request.date_request = datetime.datetime.now()
            login_request.save()
            email = request.POST['email']

            managers = db_sentry.users_groups.objects.filter(group_id=4)
            manager_emails = []
            for item in managers:
                manager_emails.append(item.user.email.encode('utf-8'))
            #url = 'http://127.0.0.1:8000/cabinet/confirmation/'+token_key+'/'
            title = 'Новый запрос на регистрацию'
            message = '<p>Новый запрос на регистрацию от '+str(request.POST['full_name'].encode('utf-8'))+', '+settings.ROOT_URL+'cabinet/mng/requests_reg/ </p>'
            send_mail.send(manager_emails, title, message)
            return render_to_response('sentry/cabinet/get_access_continue.html', locals(), RequestContext(request) )

        #else: Captcha_error = True
    else:
        form = forms.regForm()

    return render_to_response('sentry/cabinet/get_access.html', locals(), RequestContext(request) )


def get_restore(request):
    right_pack = index.right_pack_get()

    if(request.POST):
        date_request = datetime.date.today()

        form = forms.restoreForm(request.POST)
        get_user = db_sentry.user.objects.get(email=request.POST['email'])
        if form.is_valid() and get_user:
            get_user.token = token.Generator(32)
            get_user.save()
            email = [get_user.email]
            title = 'Восстановление пароля'
            message = '''<p>Чтоб задать новый пароль, пройдите по ссылке: {url}</p>'''\
                    .format( url=settings.ROOT_URL+'cabinet/confirm_restore/'+get_user.token+'/' )
            send_mail.send(email, title, message)
            done = True

        #else: Captcha_error = True
    else:
        form = forms.regForm()

    return render_to_response('sentry/cabinet/get_restore.html', locals(), RequestContext(request) )


def confirmation(request, token):
    user = db_sentry.user.objects.filter(token=token)
    if user:
        objects = db_sentry.users_objects.objects.filter(user=user[0].id)
        if request.POST:
            if request.POST['password1'] == request.POST['password2']:
                done = True
            else:
                error = 'Пароли не совпадают'

        return render_to_response('sentry/cabinet/get_access_continue.html', locals(), RequestContext(request) )
    else:
        return render_to_response('404.html', RequestContext(request) )

