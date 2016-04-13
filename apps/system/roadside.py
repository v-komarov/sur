# -*- coding: utf-8 -*-

from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry
from apps.toolset import send_mail


def show(request, status='wait'):
    if request.user.has_perm('cabinet.roadside_show'):
        title = 'Автомобили зарегистрированные в системе'
        car_set = db_sentry.site_roadside.objects.filter(status='registered')

        return render_to_response('system/roadside.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def reg_response(request, request_id=None, response=None):
    req = db_sentry.site_roadside.objects.get(id=request_id)
    if response == 'allow':
        req.status = 'registered'
        req.save()
        title = 'Регистрация в программе «Помощь на дороге»'
        message = 'Ваша заявка одобрена, Ваш автомобиль зарегистрирован в программе «Помощь на дороге».'
        send_mail.send([req.email], title, message)
    elif response == 'deny':
        req.status = 'denied'
        req.save()

    return redirect('/manager/requests/roadside/')
