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
    client_user_set = None
    data['client_user_list'] = []
    if 'client_user' in request.GET and request.GET['client_user'] != '':
        client_user_set = db_sentry.client_user.objects.filter(id=int(request.GET['client_user']))
    elif 'object' in request.GET and request.GET['object'] != '':
        client_user_set = db_sentry.client_object.objects.get(id=int(request.GET['object'])).client_user.get_query_set()
    elif 'client' in request.GET and request.GET['client'] != '':
        client_user_set = db_sentry.client.objects.get(id=int(request.GET['client'])).client_user.all()
    else:
        data['error'] = 'no many no hany'

    if client_user_set:
        for client_user in client_user_set:
            profile = {}
            try: birthday = client_user.birthday.strftime("%d.%m.%Y")
            except: birthday = None
            try: post_id = client_user.post.id
            except: post_id = None
            profile['general'] = {
                'client_user': client_user.id,
                'full_name': client_user.full_name,
                'priority': client_user.priority,
                'post': post_id,
                'birthday': birthday,
                'passport': client_user.passport,
                'address': client_user.address,
                'comment': client_user.comment,
                }

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
            data['client_user_list'].append(profile)

    return data


def update(request, data):
    try:
        client_user = db_sentry.client_user.objects.get(id=request.POST['client_user'])
    except:
        client_user = db_sentry.client_user.objects.create(full_name=int(request.POST['full_name']))
    client_form = client__form.client_user(request.POST, instance=client_user)

    if client_form.is_valid():
        client_form.save()
        try:
            client = db_sentry.client.objects.get(id=int(request.POST['client']))
            client.client_user.add(client_user.id)
            client.save()
        except:
            object = db_sentry.client_object.objects.get(id=int(request.POST['object']))
            object.client_user.add(client_user.id)
            object.save()

        for phone in json.loads(request.POST['phone_list_delete']):
            try: db_sentry.client_user_phone.objects.get( id=int(phone) ).delete()
            except: pass
        for email in json.loads(request.POST['emails_deleted']):
            try: db_sentry.client_user_email.objects.get( id=int(email) ).delete()
            except: pass

        data['phone_new_list'] = {}
        for phone in json.loads(request.POST['phone_list']):
            try: code = int(phone['code'])
            except: code = None
            try: phone_number = int(phone['phone'])
            except: data['error'] = {"phone": "Номер телефона обязательно цифрами."}

            if phone['id'][:3]=='new' and not data['error']:
                phone_set = db_sentry.client_user_phone.objects.create(
                    code = code,
                    phone = phone_number,
                    phone_type = phone['phone_type'],
                    comment = phone['comment']
                )
                client_user.client_user_phone.add(phone_set.id)
                data['phone_new_list'][phone['id']]=phone_set.id

            elif not data['error']:
                db_sentry.client_user_phone.objects.filter(id=int(phone['id'])).update(
                    code = code,
                    phone = int(phone['phone']),
                    phone_type = phone['phone_type'],
                    comment = phone['comment']
                )

        data['emails_new'] = {}
        for email in json.loads(request.POST['emails']):
            if email['id'][:3]=='new':
                email_set = db_sentry.client_user_email.objects.create(
                    email = email['email']
                )
                client_user.client_user_email.add(email_set.id)
                data['emails_new'][email['id']]=email_set.id
            else:
                db_sentry.client_user_email.objects.filter(id=int(email['id'])).update(
                    email = email['email']
                )

        client_user.save()

        if data['error'] and 'client_user_new_id' in data: client_user.delete() # Костыль

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