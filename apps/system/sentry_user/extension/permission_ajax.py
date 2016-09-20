# -*- coding: utf-8 -*-

import json
from django.contrib.auth.models import User, UserManager
from django.contrib.auth.models import Group, Permission
from apps.system import models as db_sentry


def search(request,data):
    sentry_user_set = db_sentry.sentry_user.objects.exclude(username=None) \
        .values('id','full_name','username','post__name','post_id','is_active')
    if 'full_name' in request.GET:
        sentry_user_set = sentry_user_set.filter(full_name__icontains=request.GET['full_name'])
    if 'username' in request.GET:
        sentry_user_set = sentry_user_set.filter(username__icontains=request.GET['username'])
    if 'is_active' in request.GET and request.GET['is_active']!='':
        sentry_user_set = sentry_user_set.filter(is_active=int(request.GET['is_active']))
    if 'user_post_id' in request.GET and request.GET['user_post_id']!='all':
        sentry_user_set = sentry_user_set.filter(post_id=int(request.GET['user_post_id']))
    if 'post_list' in request.GET:
        sentry_user_set = sentry_user_set.filter(post__in=json.loads(request.GET['post_list']))
        data['tt'] = 'tt'
    if 'limit' in request.GET:
        sentry_user_set = sentry_user_set[:int(request.GET['limit'])]
    data['user_list'] = [item for item in sentry_user_set]
    return data


def update(request,data):
    sentry_user_check = db_sentry.sentry_user.objects.filter(username=request.POST['username'], is_active=1)
    if 'sentry_user_id' in request.POST:
        sentry_user_check  = sentry_user_check.exclude(id=int(request.POST['sentry_user_id']))
    if sentry_user_check.exists():
        data['error'] = 'Пользователь с таким логином уже есть'.decode('utf-8')

    if not data['error']:
        pass
        '''
        try:
            sentry_user_set = db_sentry.sentry_user.objects.get(id = int(request.POST['sentry_user_id']))
        except:
            sentry_user_set = db_sentry.sentry_user.objects.create(full_name=request.POST['full_name'])

        try:
            auth_user_set = db_sentry.auth_user.objects.get(id=int(request.POST['auth_user_id']))
        except:
            auth_user_set = db_sentry.auth_user.objects.create(
                username = request.POST['username'],
                sentry_user_id = sentry_user_set.id
            )
            data['new_user'] = {'sentry_user_id': sentry_user_set.id, 'auth_user_id': auth_user_set.id}


        if 'full_name' in request.POST: sentry_user_set.full_name = request.POST['full_name']
        if 'username' in request.POST: sentry_user_set.username = request.POST['username']
        if 'user_post' in request.POST: sentry_user_set.post_id = int(request.POST['user_post'])
        if 'address' in request.POST: sentry_user_set.address = request.POST['address']
        if 'mobile_phone' in request.POST: sentry_user_set.mobile_phone = request.POST['mobile_phone']
        if 'email' in request.POST: sentry_user_set.email = request.POST['email']
        sentry_user_set.is_active = int(request.POST['is_active'])
        sentry_user_set.save()

        auth_user_set.username = request.POST['username']


        db_sentry.auth_user_groups.objects.filter(user_id=auth_user_set.id).delete()
        for group in json.loads(request.POST['group_permissions']):
            db_sentry.auth_user_groups.objects.get_or_create(user_id=auth_user_set.id, group_id=int(group))

        db_sentry.auth_user_user_permissions.objects.filter(user_id=auth_user_set.id).delete()
        for permission in json.loads(request.POST['permissions']):
            db_sentry.auth_user_user_permissions.objects.get_or_create(user_id=auth_user_set.id, permission_id=int(permission))

        if 'password' in request.POST and request.POST['password']!='':
            u = User.objects.get(username=request.POST['username'])
            u.set_password(request.POST['password'])
            u.save()
        '''

    return data

'''
def parse(request, data):
    data['permission_list'] = []
    for permission in Permission.objects.filter(content_type__app_label='system'):
        group = permission_ext_group.objects.get(label = permission.content_type.name)
        permission_ext.objects \
            .filter(auth_permission_id = permission.id) \
            .update(permission_group_id = group.id)

        data['permission_list'].append(permission.id)

    return data
'''