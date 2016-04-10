# -*- coding: utf-8 -*-

from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import send_mail
from apps import settings


def confirm(request, token=None):
    car = db_sentry.site_roadside.objects.get(token=token, status='confirm')
    if car:
        title = 'Подтверждение регистрации'
        car.status = 'wait'
        car.save()

        title = 'Заявка в программе «Помощь на дороге»'
        message = '''Для подтверждения регистрации пройдите по ссылке: {url}
                '''.format(
                    url = settings.ROOT_URL+'manager/requests/roadside/' )
        send_mail.send('managers', title, message)

        return render_to_response('sentry/cabinet/roadside_confirm.html', locals(), RequestContext(request) )

    else:
        return render_to_response('404.html', RequestContext(request) )

