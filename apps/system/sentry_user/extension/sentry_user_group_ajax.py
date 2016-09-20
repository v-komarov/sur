# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from django.contrib.auth.models import Group, Permission

from apps.system import models as db_sentry


def search(request,data):
    group_set = Group.objects.all().values('id','name')
    if request.GET['group_name'] != '':
        group_set = group_set.filter(name__icontains=request.GET['group_name'])
    data['groups'] = [item for item in group_set]
    return data


def get_permission(request,data):
    content_type_list = ['system','task','monitor']
    group = Group.objects.get(id=int(request.GET['group']))
    data['permissions'] = []
    for permission in Permission.objects.filter(content_type__app_label__in=content_type_list):
        app_label = permission.content_type.app_label
        if permission.content_type.app_label=='system' and permission.content_type.model=='permissions': app_label = 'settings'
        if app_label == 'monitor': app_label = u'ПЦН'
        elif app_label == 'system': app_label = u'Клиенты'
        elif app_label == 'task': app_label = u'Заявки'
        elif app_label == 'settings': app_label = u'Вкладки'
        if group.permissions.filter(codename=permission.codename).exists():
            choice = 'yes'
        else:
            choice = 'no'
        data['permissions'].append({
            'id': permission.id,
            'app_label': app_label,
            'model': permission.content_type.model,
            'name': permission.name,
            'codename': permission.codename,
            'choice': choice })

    '''
    data['notice_list'] = []
    for notice in db_sentry.auth_permission.objects.filter(content_type__name='notice'):
        if notice.id in group_permissions: choice = 'yes'
        else: choice = 'no'
        data['notice_list'].append({
            'id': notice.id,
            'label': notice.codename,
            'name': notice.name,
            'description': notice.name,
            'position': str(notice.position),
            'choice': choice })
    '''

    return data


def create(request,data):
    if request.GET['group_name'] == '':
        data['error'] = 'Нужно название группы'.decode('utf-8')
    else:
        group_set, created = Group.objects.get_or_create(name = request.GET['group_name'])
        data['groups'] = [{ 'id': group_set.id, 'name': group_set.name }]
    return data


def update(request,data):
    group_set = Group.objects.filter(name=request.POST['group_name']).exclude(id=int(request.POST['group']))
    if group_set.exists():
        data['error'] = 'Уже есть такая группа'.decode('utf-8')
    else:
        Group.objects.filter(id=int(request.POST['group'])).update(name=request.POST['group_name'])
    return data


def update_permission(request, data):
    group = Group.objects.get(id=int(request.POST['group']))
    group.permissions = json.loads(request.POST['permissions'])
    group.save()
    return data


def delete(request,data):
    Group.objects.get(id=int(request.GET['group'])).delete()
    data['answer'] = 'done'
    return data