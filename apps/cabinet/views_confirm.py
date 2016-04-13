# -*- coding: utf-8 -*-

from django.template import RequestContext
from django.shortcuts import render_to_response
from django.contrib.auth import authenticate, login

from apps.system import models as db_sentry
#from apps.profile.models import User

'''
def confirm(request, token=None):
    user = db_sentry.user.objects.filter(token=token)
    if user.exists():
        title = 'Подтверждение регистрации'
        if request.POST:
            if request.POST['password1'] == request.POST['password2']:
                user = User.objects.get(token=token)
                user.set_password(request.POST['password1'])
                user.is_active = True
                user.save()

                user_request = db_sentry.user_request.objects.get(email=user.email, status='allowed')
                user_request.user_id = user.id
                user_request.status = 'registered'
                user_request.save()

                #logout(request)
                user = authenticate( username = user.username, password = request.POST['password1'] )
                login(request, user)

                done = True
            else:
                error = 'Пароли не совпадают'

        return render_to_response('cabinet/get_access_confirm.html', locals(), RequestContext(request) )

    else:
        return render_to_response('404.html', RequestContext(request) )


def confirm_restore(request, token=None):
    user = db_sentry.user.objects.filter(token=token)
    if user.exists():
        title = 'Восстановление пароля'
        if request.POST:
            if request.POST['password1'] == request.POST['password2']:
                user = User.objects.get(token=token)
                user.set_password(request.POST['password1'])
                user.is_active = True
                user.save()
                user = authenticate( username = user.username, password = request.POST['password1'] )
                login(request, user)
                done = True
            else:
                error = 'Пароли не совпадают'

        return render_to_response('cabinet/get_access_confirm_restore.html', locals(), RequestContext(request) )

    else:
        return render_to_response('404.html', RequestContext(request) )
'''