# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system.sentry_user.extension import notice_ajax
from apps.system import models as db_sentry


def run():
    count = 0
    for log in db_sentry.sentry_log.objects.filter(noticed=0).exclude(client_object=None):
        perm = 'sentry.'+log.log_type.codename
        for user in db_sentry.auth_user.objects.all().exclude(sentry_user=None):
            auth_user = User.objects.get(id=user.id)
            if auth_user.has_perm(perm):
                db_sentry.sentry_log_notice.objects.get_or_create(
                    sentry_log_id = log.id,
                    sentry_user_id = user.sentry_user_id
                )
        count += 1
        log.noticed = 1
        log.save()
    print count
    return count


def check(request):
    if request.user.is_superuser:
        title = 'Notice'
        count = 0
        '''
        for log in db_sentry.sentry_log.objects.filter(noticed=0).exclude(client_object=None):
            perm = 'sentry.'+log.log_type.codename
            for user in db_sentry.auth_user.objects.all().exclude(sentry_user=None):
                auth_user = User.objects.get(id=user.id)
                if auth_user.has_perm(perm):
                    db_sentry.sentry_log_notice.objects.get_or_create(
                        sentry_log_id = log.id,
                        sentry_user_id = user.sentry_user_id
                    )
            count += 1
            log.noticed = 1
            log.save()
        '''
        return render_to_response('system/sentry_user/notice.html', locals(), RequestContext(request))
    else:
        return render_to_response('403.html', locals(), RequestContext(request))


def ajax(request,action=None):
    data = {'error':None}

    if action=='get_notice_list':
        if request.user.has_perm('system.client'):
            data = notice_ajax.get_notice_list(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='notice_all_sight':
        if request.user.has_perm('system.client'):
            data = notice_ajax.notice_all_sight(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='notice_item_sight':
        if request.user.has_perm('system.client'):
            data = notice_ajax.notice_item_sight(request,data)
        else: data['error'] = 'Доступ запрещен'

    elif action=='later':
        if request.user.has_perm('system.client'):
            data = notice_ajax.later(request,data)
        else: data['error'] = 'Доступ запрещен'

    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')

