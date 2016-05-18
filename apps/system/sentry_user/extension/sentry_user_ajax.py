# -*- coding: utf-8 -*-

import json
#from apps.profile import User
from django.contrib.auth.models import User, UserManager
from django.contrib.auth.models import Group, Permission
from apps.system import models as db_sentry
from apps.system.sentry_user.models import permission_ext


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


def get(request, data):
    data['permission_list'] = []
    data['group_list'] = []
    data['group_list__'] = []

    if request.GET['sentry_user'] == 'add':
        auth_user = None
    else:
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

    for perm_ext in permission_ext.objects.all().exclude(permission_group__label='notice'):
        choice = 'no'
        try:
            if auth_user.user_permissions.filter(codename=perm_ext.auth_permission.codename):
                choice = 'yes'
        except:
            choice = 'no'
        data['permission_list'].append({
            'id': perm_ext.auth_permission.id,
            'name': perm_ext.auth_permission.name,
            'position': str(perm_ext.position),
            'description': perm_ext.description,
            'model_name': perm_ext.permission_group.label,
            'model_description': perm_ext.permission_group.name,
            'codename': perm_ext.auth_permission.codename,
            'choice': choice
        })

    for group in Group.objects.all():
        choice = 'no'
        try:
            if group in auth_user.groups.all():
                choice = 'yes'
        except:
            choice = 'no'
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
    if sentry_user_check.exists():
        data['error'] = 'Пользователь с таким логином уже есть'.decode('utf-8')

    if not data['error']:
        try:
            sentry_user = db_sentry.sentry_user.objects.get(id = int(request.POST['sentry_user']))
            if sentry_user.username != '':
                auth_user = User.objects.get(username=sentry_user.username)
        except:
            sentry_user = db_sentry.sentry_user.objects.create(full_name=request.POST['full_name'])
            if request.POST['username'] != '':
                auth_user = User.objects.create(username = request.POST['username'])
                data['new_user'] = {'sentry_user': sentry_user.id, 'auth_user_id': auth_user.id}


        if 'full_name' in request.POST: sentry_user.full_name = request.POST['full_name']
        if 'username' in request.POST: sentry_user.username = request.POST['username']
        if 'user_post' in request.POST and request.POST['user_post']!='': sentry_user.post_id = int(request.POST['user_post'])
        if 'address' in request.POST: sentry_user.address = request.POST['address']
        if 'mobile_phone' in request.POST: sentry_user.mobile_phone = request.POST['mobile_phone']
        if 'email' in request.POST: sentry_user.email = request.POST['email']
        sentry_user.save()

        if auth_user:
            auth_user.is_active = int(request.POST['auth_is_active'])
            auth_user.is_superuser = 1
            auth_user.is_staff = 1
            auth_user.username = request.POST['username']
            auth_user.groups = json.loads(request.POST['group_list'])
            auth_user.user_permissions = json.loads(request.POST['permission_list'])
            auth_user.save()

            if 'password' in request.POST and request.POST['password']!='':
                u = User.objects.get(username=request.POST['username'])
                u.set_password(request.POST['password'])
                u.save()

    return data