# -*- coding: utf-8 -*-

import json
#from apps.profile import User
from django.contrib.auth.models import User, UserManager
from django.contrib.auth.models import Group, Permission
from apps.system import models as db_sentry
from apps.cabinet import authorize_permissions


def search(request, data):
    sentry_user_set = db_sentry.sentry_user.objects.filter(is_active=1).exclude(username=None) \
        .values('id','full_name','username','post__name','post_id','is_active')
    if 'full_name' in request.GET and request.GET['full_name'] != '':
        sentry_user_set = sentry_user_set.filter(full_name__icontains=request.GET['full_name'])
    if 'username' in request.GET and request.GET['username'] != '':
        sentry_user_set = sentry_user_set.filter(username__icontains=request.GET['username'])
    if 'is_active' in request.GET and request.GET['is_active'] != '':
        sentry_user_set = sentry_user_set.filter(is_active=int(request.GET['is_active']))
    if 'user_post' in request.GET and request.GET['user_post'] != 'all':
        sentry_user_set = sentry_user_set.filter(post_id=int(request.GET['user_post']))
    if 'post_list' in request.GET:
        sentry_user_set = sentry_user_set.filter(post__in=json.loads(request.GET['post_list']))
    if 'limit' in request.GET:
        sentry_user_set = sentry_user_set[:int(request.GET['limit'])]
    data['user_list'] = [item for item in sentry_user_set]
    return data



def person(request, data):
    data['permissions'] = authorize_permissions.get_all_permissions_list(request)

    sentry_user = db_sentry.sentry_user.objects.get(username=request.user.username, is_active=1)
    data['user'] = {
        'username': request.user.username,
        'full__name': sentry_user.full_name#.decode('utf-8')
    }
    if sentry_user.post:
            data['user']['post'] = sentry_user.post.id
            data['user']['post__name'] = sentry_user.post.name

    return data


def get(request, data):
    data['permission_list'] = []
    data['group_list'] = []
    data['group_list__'] = []

    auth_user = None
    if request.GET['sentry_user'] != 'add':
        sentry_user = db_sentry.sentry_user.objects.get(id=int(request.GET['sentry_user']))
        data['user'] = {
            'id': sentry_user.id,
            'username': sentry_user.username,
            'full_name': sentry_user.full_name,
            'address': sentry_user.address,
            'mobile_phone': sentry_user.mobile_phone,
            'email': sentry_user.email,
            'is_active': sentry_user.is_active
        }
        if sentry_user.post:
            data['user']['post'] = sentry_user.post.id
            data['user']['post__name'] = sentry_user.post.name

        try:
            auth_user = User.objects.get(username=sentry_user.username)
            data['user']['auth_user_id'] = auth_user.id
            data['user']['auth_is_active'] = auth_user.is_active
        except:
            pass


    for perm in Permission.objects.filter(content_type__app_label__in=['system', 'task', 'monitor']):
        choice = 'no'
        try:
            if auth_user.user_permissions.filter(id=perm.id):#.has_perm(perm.content_type.app_label+'.'+perm.codename):
                choice = 'yes'
        except:
            pass
        app_label = perm.content_type.app_label
        if perm.content_type.app_label=='system' and perm.content_type.model=='permissions': app_label = 'settings'
        if app_label == 'monitor': app_label = u'ПЦН'
        elif app_label == 'system': app_label = u'Объекты'
        elif app_label == 'task': app_label = u'Заявки'
        elif app_label == 'settings': app_label = u'Вкладки'
        data['permission_list'].append({
            'app_label': app_label,
            'model': perm.content_type.model,
            'id': perm.id,
            'name': perm.name,
            'codename': perm.codename,
            'choice': choice
        })

    for group in Group.objects.all():
        choice = 'no'
        if auth_user and group in auth_user.groups.filter(id=group.id):
            choice = 'yes'
        data['group_list'].append({
            'id': group.id,
            'name': group.name,
            'choice': choice
        })

    return data


def delete(request, data):
    sentry_user = db_sentry.sentry_user.objects.get(id=int(request.GET['sentry_user']))
    sentry_user.is_active = 0
    sentry_user.save()
    try:
        User.objects.get(username=sentry_user.username).delete()
    except:
        pass
    data['answer'] = 'done'

    return data


def update(request, data):
    auth_user = None
    sentry_user_check = db_sentry.sentry_user.objects.filter(username=request.POST['username'], is_active=1)
    if 'sentry_user' in request.POST:
        sentry_user_check  = sentry_user_check.exclude(id=int(request.POST['sentry_user']))
    if sentry_user_check.count() > 0:
        data['errors'] = {'sentry_user': 'Пользователь с таким логином уже есть'}

    if not data['errors']:
        try:
            sentry_user = db_sentry.sentry_user.objects.get(id = int(request.POST['sentry_user']))
            if sentry_user.username != '':
                auth_user = User.objects.get(username=sentry_user.username)
        except:
            sentry_user = db_sentry.sentry_user.objects.create(full_name=request.POST['full_name'])
            if request.POST['username'] != '':
                auth_user = User.objects.create(username = request.POST['username'])
                data['new_user'] = {'sentry_user': sentry_user.id, 'auth_user_id': auth_user.id}


        if 'full_name' in request.POST:
            sentry_user.full_name = request.POST['full_name']
        if 'username' in request.POST:
            sentry_user.username = request.POST['username']
        if 'user_post' in request.POST and request.POST['user_post'] != '':
            sentry_user.post_id = int(request.POST['user_post'])
        if 'address' in request.POST:
            sentry_user.address = request.POST['address']
        if 'mobile_phone' in request.POST:
            sentry_user.mobile_phone = request.POST['mobile_phone']
        if 'email' in request.POST:
            sentry_user.email = request.POST['email']
        sentry_user.save()

        if auth_user:
            auth_user.is_active = int(request.POST['auth_is_active'])
            auth_user.username = request.POST['username']
            auth_user.groups = json.loads(request.POST['group_list'])
            auth_user.user_permissions = json.loads(request.POST['permission_list'])
            auth_user.save()

            if 'password' in request.POST and request.POST['password']!='':
                u = User.objects.get(username=request.POST['username'])
                u.set_password(request.POST['password'])
                u.save()

    return data