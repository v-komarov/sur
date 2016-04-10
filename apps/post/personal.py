# -*- coding: utf-8 -*-

import json

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.post import personal_ajax


def index(request):
    title = 'Сотрудники'
    user_post_set = db_sentry.dir_user_post.objects.all()
    user_status_set = db_sentry.dir_user_status.objects.all()
    weapon_set = db_sentry.dir_weapon.objects.filter(is_active=1)
    dir_service_organization_set = db_sentry.dir_service_organization.objects.filter(is_active=1)
    if 'user_id' in request.GET:
        user_full_name = db_sentry.sentry_user.objects.get(id=int(request.GET['user_id'])).full_name

    return render_to_response('sentry/system/post/personal.html', locals(), RequestContext(request))


def ajax(request, action):
    data = {'error':None}

    if action=='search':
        data = personal_ajax.search(request,data)

    elif action=='get':
        data = personal_ajax.get(request,data)

    elif action=='get_identity':
        data = personal_ajax.get_identity(request,data)

    elif action=='get_card':
        data = personal_ajax.get_card(request,data)

    elif action=='get_certificate':
        data = personal_ajax.get_certificate(request,data)

    elif action=='get_weapon':
        data = personal_ajax.get_weapon(request,data)

    elif action=='add':
        data = personal_ajax.add(request,data)

    if action=='save':
        data = personal_ajax.save(request,data)

    elif action=='remove':
        data = personal_ajax.remove(request,data)

    elif action=='card_save':
        data = personal_ajax.card_save(request,data)

    elif action=='card_remove':
        data = personal_ajax.card_remove(request,data)

    elif action=='card_status_remove':
        data = personal_ajax.card_status_remove(request,data)

    elif action=='card_status_save':
        data = personal_ajax.card_status_save(request,data)

    elif action=='identity_update':
        data = personal_ajax.identity_update(request,data)

    elif action=='identity_remove':
        data = personal_ajax.identity_remove(request,data)

    elif action=='certificate_save':
        data = personal_ajax.certificate_save(request,data)

    elif action=='certificate_remove':
        data = personal_ajax.certificate_remove(request,data)

    elif action=='certificate_check_remove':
        data = personal_ajax.certificate_check_remove(request,data)

    elif action=='certificate_check_save':
        data = personal_ajax.certificate_check_save(request,data)

    elif action=='weapon_save':
        data = personal_ajax.weapon_save(request,data)

    elif action=='weapon_remove':
        data = personal_ajax.weapon_remove(request,data)


    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json')



def set_status(request, user_id=None):
    if request.user.has_perm('system.client'):
        if user_id:
            user_set = db_sentry.sentry_user.objects.get(id=user_id)
            user_set.status_id = user_set.get_card_status('id')
            user_set.save()
            return True
        else:
            cnt = 0
            for user in db_sentry.sentry_user.objects.filter(username=None, is_active=1):
                user.status_id = user.get_card_status('id')
                user.save()
                cnt += 1
            return True

        #return render_to_response('sentry/system/post/personal_set_status.html', locals(), RequestContext(request))