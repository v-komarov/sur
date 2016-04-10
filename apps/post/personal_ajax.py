# -*- coding: utf-8 -*-

import datetime
import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.toolset import date_convert
from apps.system import models as db_sentry


today = datetime.date.today()


def get(request,data):
    user_set = db_sentry.sentry_user.objects.get(id=int(request.GET['user_id']))
    if user_set.birthday: birthday=user_set.birthday.strftime("%d.%m.%Y")
    else: birthday = ''
    data['user'] = {
        'id': user_set.id,
        'username': user_set.username,
        'full_name': user_set.full_name,
        'post_id': user_set.post_id,
        'address': user_set.address,
        'address2': user_set.address2,
        'mobile_phone': user_set.mobile_phone,
        'city_phone': user_set.city_phone,
        'other_phone': user_set.other_phone,
        'passport_series': user_set.passport_series,
        'passport_number': user_set.passport_number,
        'passport_data': user_set.passport_data,
        'birthday': birthday,
        'comment': user_set.comment,
        'is_active': user_set.is_active }
    return data


def get_identity(request,data):
    identity_guard_set = db_sentry.sentry_user_identity.objects.filter(user_id=int(request.GET['user_id']), is_active=1)
    if request.GET['identity_id']!='none':
        identity_focus = identity_guard_set.filter(id=int(request.GET['identity_id'])).first()
    else:
        identity_focus = identity_guard_set.first()
    if identity_guard_set.exists():
        data['identity'] = {
            'id': identity_focus.id,
            'series': identity_focus.series,
            'number': identity_focus.number,
            'date': identity_focus.date.strftime("%d.%m.%Y"),
            'expire_date': identity_focus.expire_date.strftime("%d.%m.%Y"),
            'check_date': identity_focus.check_date.strftime("%d.%m.%Y"),
            'comment': identity_focus.comment }
        if identity_focus.extended_date:
            data['identity']['extended_date'] = identity_focus.extended_date.strftime("%d.%m.%Y"),
        data['identity_list'] = []
        for identity in identity_guard_set:
            if not identity.comment: identity.comment = ''
            data['identity_list'].append({
                'id': identity.id,
                'series': identity.series,
                'number': identity.number,
                'date': identity.date.strftime("%d.%m.%Y"),
                'expire_date': identity.expire_date.strftime("%d.%m.%Y"),
                'comment': identity.comment })
    return data


def get_card(request,data):
    card_set = db_sentry.sentry_user_card.objects.filter(user_id=int(request.GET['user_id']), is_active=1)
    if request.GET['card_id']!='none':
        card_focus = card_set.filter(id=int(request.GET['card_id'])).first()
    else:
        card_focus = card_set.first()
    if card_set.exists():
        data['card'] = {
            'id': card_focus.id,
            'service_organization_id': card_focus.service_organization.id,
            'series': card_focus.series,
            'number': card_focus.number,
            'date': card_focus.date.strftime("%d.%m.%Y"),
            'status': card_focus.get_status(),
            'comment': card_focus.comment }
        data['card_list'] = []
        for card in card_set:
            if not card.comment: card.comment = ''
            data['card_list'].append({
                'id': card.id,
                'service_organization_license': card.service_organization.license,
                'series': card.series,
                'number': card.number,
                'date': card.date.strftime("%d.%m.%Y"),
                'status': card.get_status(),
                'comment': card.comment })
        data['status_list'] = []
        status_set = db_sentry.sentry_user_card_status.objects.filter(card_id=card_focus.id, is_active=1)
        if status_set.exists():
            for status in status_set:
                if not status.comment: status.comment = ''
                data['status_list'].append({
                    'id': status.id,
                    'status': status.status.name,
                    'date': status.date.strftime("%d.%m.%Y"),
                    'comment': status.comment })
    return data


def get_certificate(request,data):
    certificate_set = db_sentry.sentry_user_certificate.objects.filter(user_id=int(request.GET['user_id']), is_active=1)
    if request.GET['certificate_id']!='none':
        certificate_focus = certificate_set.filter(id=int(request.GET['certificate_id'])).first()
    else:
        certificate_focus = certificate_set.first()
    if certificate_set.exists():
        data['certificate'] = {
            'id': certificate_focus.id,
            'category': certificate_focus.category,
            'series': certificate_focus.series,
            'number': certificate_focus.number,
            'date': certificate_focus.date.strftime("%d.%m.%Y"),
            'expire_date': certificate_focus.expire_date.strftime("%d.%m.%Y"),
            'check_date': certificate_focus.check_date.strftime("%d.%m.%Y"),
            'comment': certificate_focus.comment }
        data['certificate_list'] = []
        for certificate in certificate_set:
            if not certificate.comment: certificate.comment = ''
            data['certificate_list'].append({
                'id': certificate.id,
                'series': certificate.series,
                'number': certificate.number,
                'date': certificate.date.strftime("%d.%m.%Y"),
                'expire_date': certificate.expire_date.strftime("%d.%m.%Y"),
                'comment': certificate.comment })
        data['check_list'] = []
        check_set = db_sentry.sentry_user_certificate_check.objects.filter(certificate_id=certificate_focus.id, is_active=1)
        if check_set.exists():
            for check in check_set:
                if check.real_check_date: real_check_date = check.real_check_date.strftime("%d.%m.%Y")
                else: real_check_date = ''
                if not check.comment: check.comment = ''
                data['check_list'].append({
                    'id': check.id,
                    'plan_check_date': check.plan_check_date.strftime("%d.%m.%Y"),
                    'real_check_date': real_check_date,
                    'comment': check.comment })
    return data


def get_weapon(request,data):
    weapon_set = db_sentry.sentry_user_weapon.objects.filter(user_id=int(request.GET['user_id']), expire_date__gte=today, is_active=1)
    if request.GET['weapon_id']!='none':
        weapon_focus = weapon_set.filter(id=int(request.GET['weapon_id']))
    else:
        weapon_focus = weapon_set
    if weapon_focus:
        data['weapon'] = {
            'today': today.strftime("%d.%m.%Y"),
            'id': weapon_focus.last().id,
            'weapon_id': weapon_focus.last().weapon_id,
            'number': weapon_focus.last().number,
            'date': weapon_focus.last().date.strftime("%d.%m.%Y"),
            'expire_date': weapon_focus.last().expire_date.strftime("%d.%m.%Y"),
            'comment': weapon_focus.last().comment }
        data['weapon_list'] = []
        for weapon in weapon_set:
            data['weapon_list'].append({
                'id': weapon.id,
                'weapon_id': weapon.weapon_id,
                'weapon_name': weapon.weapon.weapon_type.name,
                'weapon_series': weapon.weapon.series,
                'weapon_number': weapon.weapon.number,
                'number': weapon.number,
                'date': weapon.date.strftime("%d.%m.%Y"),
                'expire_date': weapon.expire_date.strftime("%d.%m.%Y"),
                'comment': weapon.comment
            })
    return data


def search(request,data):
    users_set = db_sentry.sentry_user.objects.all()
    data['users_list'] = []

    if 'is_active' in request.GET:
        users_set = users_set.filter(is_active=int(request.GET['is_active']))
    if 'user_status' in request.GET:
        users_set = users_set.filter(status_id=int(request.GET['user_status']))
    if 'user_post' in request.GET:
        users_set = users_set.filter(post_id=int(request.GET['user_post']))
    if 'address' in request.GET:
        users_set = users_set.filter(address__icontains=request.GET['address'])
        users_set = users_set.filter(address2__icontains=request.GET['address'])
    if 'full_name' in request.GET:
        users_set = users_set.filter(full_name__icontains=request.GET['full_name'])

    if 'service_organization' in request.GET:
        service_organization_set = db_sentry.sentry_user_card.objects.filter(service_organization=int(request.GET['service_organization']), is_active=1)
        data['service_organization_list'] = [item.user_id for item in service_organization_set]
        users_set = users_set.filter(id__in=data['service_organization_list'])
    if 'category' in request.GET:
        certificate_set = db_sentry.sentry_user_certificate.objects.filter(category=int(request.GET['category']), is_active=1)
        data['category_list'] = [item.user_id for item in certificate_set]
        users_set = users_set.filter(id__in=data['category_list'])


    if 'identity_expire' in request.GET:
        user_identity_set = db_sentry.sentry_user_identity.objects.filter(
            expire_date__gte = datetime.datetime.strptime(request.GET['identity_expire'], '%d.%m.%Y'),
            is_active = 1 )
        data['identity_list'] = [item.user_id for item in user_identity_set]
        users_set = users_set.exclude(id__in=data['identity_list'])

    if 'certificate_expire' in request.GET:
        user_certificate_set = db_sentry.sentry_user_certificate.objects.filter(
            expire_date__gte = datetime.datetime.strptime(request.GET['certificate_expire'], '%d.%m.%Y'),
            is_active = 1 )
        data['certificate_list'] = [item.user_id for item in user_certificate_set]
        users_set = users_set.exclude(id__in=data['certificate_list'])

    if 'certificate_check' in request.GET:
        user_certificate_set = db_sentry.sentry_user_certificate.objects.filter(
            check_date__gte = datetime.datetime.strptime(request.GET['certificate_check'], '%d.%m.%Y'),
            is_active = 1 )
        data['certificate_list'] = [item.user_id for item in user_certificate_set]
        users_set = users_set.exclude(id__in=data['certificate_list'])


    if 'weapon_expire' in request.GET:
        user_weapon_set = db_sentry.sentry_user_weapon.objects.filter(
            expire_date__gte = datetime.datetime.strptime(request.GET['weapon_expire'], '%d.%m.%Y'),
            is_active = 1 )
        data['weapon_list'] = [item.user_id for item in user_weapon_set]
        users_set = users_set.exclude(id__in=data['weapon_list'])



    data['users'] = []
    for user in users_set:
        try:
            identity_guard_set = db_sentry.sentry_user_identity.objects.filter(user_id=user.id).last()
            identity_guard_date = identity_guard_set.expire_date.strftime("%d.%m.%Y")
        except:
            identity_guard_date = ''

        certificate = db_sentry.sentry_user_certificate.objects.filter(user_id=user.id, is_active=1).first()
        if certificate:
            try: certificate_date = certificate.expire_date.strftime("%d.%m.%Y")
            except: certificate_date = ''
            try: certificate_check_date = db_sentry.sentry_user_certificate_check.objects \
                .filter(certificate_id=certificate.id, is_active=1).first().plan_check_date.strftime("%d.%m.%Y")
            except: certificate_check_date = ''
        else:
            certificate_date = ''
            certificate_check_date = ''

        try: weapon_date = db_sentry.sentry_user_weapon.objects \
            .filter(user_id=user.id, expire_date__gte=today, is_active=1).last().expire_date.strftime("%d.%m.%Y")
        except: weapon_date = ''

        data['users'].append({
            'id': user.id,
            'full_name': user.full_name,
            'post__name': user.post.name,
            'status__name': user.get_status(),
            'get_card_status': user.get_card_status(),
            'is_active': user.is_active,
            'identity_guard_date': identity_guard_date,
            'certificate_date': certificate_date,
            'certificate_check_date': certificate_check_date,
            'weapon_date': weapon_date
        })

    return data


def add(request,data):
    if request.GET['username'] == '': data['error'] = 'Необходим логин.'.decode('utf-8')
    else:
        user_set, created = db_sentry.sentry_user.objects.get_or_create(
            username = request.GET['username'],
            full_name = int(request.GET['full_name']),
            post_id = int(request.GET['user_post_id']),
            is_active=1 )
        data['users'] = \
            [{ 'id': user_set.id,
               'username': user_set.username,
               'full_name': user_set.full_name,
               'post_id': user_set.post_id,
               'post__name': user_set.post.name }]
    return data


def save(request,data):
    if request.POST['user_id']=='add':
        user_set = db_sentry.sentry_user.objects.create(
            full_name = request.POST['full_name'] )
    else:
        user_set = db_sentry.sentry_user.objects.get(id=int(request.POST['user_id']))
        user_set.full_name = request.POST['full_name']
    user_set.post_id = int(request.POST['user_post_id'])
    user_set.birthday = date_convert.convert(request.POST['birthday'])
    user_set.mobile_phone = request.POST['mobile_phone']
    user_set.city_phone = request.POST['city_phone']
    user_set.other_phone = request.POST['other_phone']
    user_set.passport_series = request.POST['passport_series']
    user_set.passport_number = request.POST['passport_number']
    user_set.passport_data = request.POST['passport_data']
    user_set.address = request.POST['address']
    user_set.save()
    return data


def remove(request,data):
    db_sentry.sentry_user.objects.filter(id=int(request.POST['user_id'])).update(is_active=0)

    return data


def card_save(request,data):
    if request.POST['card_id']=='add':
        card_set = db_sentry.sentry_user_card.objects.create(
            user_id = int(request.POST['user_id']),
            service_organization_id = int(request.POST['service_organization']),
            date = date_convert.convert(request.POST['date']),
            series = request.POST['series'],
            number = request.POST['number']
        )
        data['card_id'] = card_set.id
    else:
        card_set = db_sentry.sentry_user_card.objects.get(id=int(request.POST['card_id']))
        card_set.service_organization_id = int(request.POST['service_organization'])
        card_set.date = date_convert.convert(request.POST['date'])
        card_set.series = request.POST['series']
        card_set.number = request.POST['number']
    if request.POST['comment']=='': card_set.comment = None
    else: card_set.comment = request.POST['comment']
    card_set.save()
    data['answer'] = 'done'

    return data


def card_remove(request,data):
    db_sentry.sentry_user_card.objects \
        .filter(id=int(request.POST['card_id'])) \
        .update(is_active = 0)
    data['answer'] = 'deleted'

    return data

def card_status_remove(request,data):
    status_set = db_sentry.sentry_user_card_status.objects.get(id=int(request.POST['status_id']))
    status_set.is_active = 0
    status_set.save()
    set_status(request,status_set.card.user_id)
    data['answer'] = 'deleted'

    return data

def card_status_save(request,data):
    if request.POST['status_id']=='add':
        status_set = db_sentry.sentry_user_card_status.objects.create(
            card_id = int(request.POST['card_id']),
            status_id = int(request.POST['status']),
            date = date_convert.convert(request.POST['date']),
            is_active = 1 )
    else:
        status_set = db_sentry.sentry_user_card_status.objects.get(id=int(request.POST['status_id']))
        status_set.status_id = request.POST['status']
        status_set.date = date_convert.convert(request.POST['date'])

    if request.POST['comment']=='':
        status_set.comment = None
    else:
        status_set.comment = request.POST['comment']
    status_set.save()
    set_status(request,status_set.card.user_id)
    data['answer'] = 'done'

    return data


def identity_update(request,data):
    if request.POST['identity_id']=='add':
        identity_set = db_sentry.sentry_user_identity.objects.create(
            user_id = int(request.POST['user_id']),
            date = date_convert.convert(request.POST['date']),
            expire_date = date_convert.convert(request.POST['expire_date']),
            check_date = date_convert.convert(request.POST['check_date'])
        )
        data['identity_id'] = identity_set.id
    else:
        identity_set = db_sentry.sentry_user_identity.objects.get(id=int(request.POST['identity_id']))
    identity_set.series = request.POST['series']
    identity_set.number = request.POST['number']
    identity_set.date = date_convert.convert(request.POST['date'])
    if 'extended_date' in request.POST:
        identity_set.extended_date = date_convert.convert(request.POST['extended_date'])
    else:
        identity_set.extended_date = None
    identity_set.expire_date = date_convert.convert(request.POST['expire_date'])
    identity_set.check_date = date_convert.convert(request.POST['check_date'])
    if request.POST['comment']=='': identity_set.comment = None
    else: identity_set.comment = request.POST['comment']
    identity_set.save()
    data['answer'] = 'done'
    return data


def identity_remove(request,data):
    db_sentry.sentry_user_identity.objects \
        .filter(id=int(request.POST['identity_id'])) \
        .update(is_active = 0)
    data['answer'] = 'deleted'
    return data


def certificate_save(request,data):
    if request.POST['certificate_id']=='add':
        certificate_set = db_sentry.sentry_user_certificate.objects.create(
            user_id = int(request.POST['user_id']),
            date = date_convert.convert(request.POST['date']),
            expire_date = date_convert.convert(request.POST['expire_date']),
            check_date = date_convert.convert(request.POST['check_date']),
            category = int(request.POST['category'])
        )
        data['certificate_id'] = certificate_set.id
    else:
        certificate_set = db_sentry.sentry_user_certificate.objects.get(id=int(request.POST['certificate_id']))
    certificate_set.series = request.POST['series']
    certificate_set.number = request.POST['number']
    certificate_set.date = date_convert.convert(request.POST['date'])
    certificate_set.expire_date = date_convert.convert(request.POST['expire_date'])
    certificate_set.check_date = date_convert.convert(request.POST['check_date'])
    certificate_set.category = int(request.POST['category'])
    if request.POST['comment']=='': certificate_set.comment = None
    else: certificate_set.comment = request.POST['comment']
    certificate_set.save()
    data['answer'] = 'done'

    return data


def certificate_remove(request,data):
    db_sentry.sentry_user_certificate.objects \
        .filter(id=int(request.POST['certificate_id'])) \
        .update(is_active = 0)
    data['answer'] = 'deleted'

    return data


def certificate_check_remove(request,data):
    check_set = db_sentry.sentry_user_certificate_check.objects \
        .filter(id=int(request.POST['check_id'])) \
        .update(is_active = 0)
    data['answer'] = 'done'

    return data


def certificate_check_save(request,data):
    if request.POST['check_id']=='add':
        check_set = db_sentry.sentry_user_certificate_check.objects.create(
            certificate_id = int(request.POST['certificate_id']),
            plan_check_date = date_convert.convert(request.POST['plan_check_date']),
            real_check_date = date_convert.convert(request.POST['real_check_date']),
            is_active = 1 )
    else:
        check_set = db_sentry.sentry_user_certificate_check.objects.get(id=int(request.POST['check_id']))
        check_set.plan_check_date = date_convert.convert(request.POST['plan_check_date'])
        check_set.real_check_date = date_convert.convert(request.POST['real_check_date'])

    if request.POST['comment']=='': check_set.comment = None
    else: check_set.comment = request.POST['comment']
    check_set.save()

    data['answer'] = 'done'
    return data


def weapon_save(request,data):
    if request.POST['weapon_id']=='add':
        weapon_set = db_sentry.sentry_user_weapon.objects.create(
            user_id = int(request.POST['user_id']),
            weapon_id = int(request.POST['weapon']),
            number = int(request.POST['number']),
            date = date_convert.convert(request.POST['date']),
            expire_date = date_convert.convert(request.POST['expire_date'])
        )
        data['weapon_id'] = weapon_set.id
    else:
        weapon_set = db_sentry.sentry_user_weapon.objects.get(id=int(request.POST['weapon_id']))
    weapon_set.number = int(request.POST['number'])
    weapon_set.date = date_convert.convert(request.POST['date'])
    weapon_set.expire_date = date_convert.convert(request.POST['expire_date'])
    weapon_set.weapon_id = int(request.POST['weapon'])
    if request.POST['comment']=='': weapon_set.comment = None
    else: weapon_set.comment = request.POST['comment']
    weapon_set.save()
    data['answer'] = 'done'
    return data


def weapon_remove(request,data):
    db_sentry.sentry_user_weapon.objects \
        .filter(id=int(request.POST['weapon_id'])) \
        .update(is_active = 0)
    data['answer'] = 'done'
    return data

