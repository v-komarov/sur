# -*- coding: utf-8 -*-

import json
import datetime
from apps.system import models as db_sentry
from apps.system.client.extension import client__form


def search(request, data):
    limit = 10
    client_user_set = db_sentry.client_user.objects.all()
    if 'limit' in request.GET:
        limit = int(request.GET['limit'])
    if 'object' in request.GET:
        client_user_set = db_sentry.client_object.objects \
            .get(id=int(request.GET['object'])).client_user.get_query_set()
    if 'full_name' in request.GET:
        client_user_set = db_sentry.client_user.objects.filter(
            full_name__icontains = request.GET['full_name'],
            is_active = 1
        )

    client_user_set = client_user_set.values('id', 'full_name')[:limit]
    data['client_user'] = [item for item in client_user_set]
    return data


def get(request, data):
    data['client_user_list'] = []

    if 'client_user' in request.GET and request.GET['client_user'] != '':
        client_user = db_sentry.client_user.objects.get(id=int(request.GET['client_user']))
        data['client_user_list'].append(each_client_user(client_user))

    elif 'contract' in request.GET and request.GET['contract'] != '':
        for bind in db_sentry.client_bind.objects.filter(client_contract_id=int(request.GET['contract']), is_active=1):
            object = db_sentry.client_object.objects.get(id=bind.client_object.id)
            for client_user in object.client_user.all():
                profile = each_client_user(client_user)
                profile['object'] = object.id
                profile['object__name'] = object.name
                data['client_user_list'].append(profile)

    elif 'client' in request.GET and request.GET['client'] != '':
        for client_user in db_sentry.client.objects.get(id=int(request.GET['client'])).client_user.all():
            data['client_user_list'].append(each_client_user(client_user))

    else:
        data['error'] = 'no many no hany'

    return data


def each_client_user(client_user):
    profile = {}
    profile['general'] = {
        'client_user': client_user.id,
        'full_name': client_user.full_name,
        'priority': client_user.priority,
        'passport': client_user.passport,
        'address': client_user.address,
        'comment': client_user.comment,
        }
    if client_user.birthday:
        profile['general']['birthday'] = client_user.birthday.strftime("%d.%m.%Y")
    if client_user.post:
        profile['general']['post'] = client_user.post.id

    profile['phone_list'] = []
    for phone in client_user.client_user_phone.all():
        profile['phone_list'].append({
            'client_user_phone': phone.id,
            'client_user_phone__code': phone.code,
            'client_user_phone__phone': phone.phone,
            'client_user_phone__phone_type': phone.phone_type,
            'client_user_phone__comment': phone.comment
        })

    profile['email_list'] = []
    for email in client_user.client_user_email.all():
        profile['email_list'].append({
            'client_user_email': email.id,
            'client_user_email__email': email.email
        })
    return profile


def update(request, data):
    try:
        client_user = db_sentry.client_user.objects.get(id=request.POST['client_user'])
    except:
        client_user = db_sentry.client_user.objects.create(full_name=request.POST['full_name'])
    client_form = client__form.client_user(request.POST, instance=client_user)

    if client_form.is_valid():
        client_form.save()
        try:
            object = db_sentry.client_object.objects.get(id=int(request.POST['object']))
            object.client_user.add(client_user.id)
            object.save()
        except:
            client = db_sentry.client.objects.get(id=int(request.POST['client']))
            client.client_user.add(client_user.id)
            client.save()


        client_user.client_user_phone.clear()
        for phone in json.loads(request.POST['phone_list']):
            phone_set, created = db_sentry.client_user_phone.objects.get_or_create(phone=phone['phone'])
            phone_set.phone_type = phone['phone_type']
            phone_set.comment = phone['comment']
            phone_set.save()
            client_user.client_user_phone.add(phone_set.id)

        client_user.client_user_email.clear()
        for email in json.loads(request.POST['emails']):
            email_set, created = db_sentry.client_user_email.objects.get_or_create(email=email['email'])
            client_user.client_user_email.add(email_set.id)

        client_user.save()
    else:
        data['errors'] = form.errors

    return data



def delete(request,data):
    try:
        object_set = db_sentry.client_object.objects.get(id=int(request.POST['object']))
    except:
        object_set = db_sentry.client.objects.get(id=int(request.POST['client']))
    object_set.client_user.remove(int(request.POST['client_user']))

    return data