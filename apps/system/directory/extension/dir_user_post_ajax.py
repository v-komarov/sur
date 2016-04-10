# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request,data):
    post_set = db_sentry.dir_user_post.objects.filter(is_active=1) \
        .values('id','name')
    if request.GET['name'] != '':
        post_set = post_set.filter(name__icontains=request.GET['name'])
    data['post'] = [item for item in post_set]
    return data


def create(request,data):
    if request.GET['name'] == '':
        data['error'] = 'Впишите название должности'.decode('utf-8')
    else:
        post_set, created = db_sentry.dir_user_post.objects \
            .get_or_create(name = request.GET['name'], is_active=1)
        data['post'] = [{ 'id': post_set.id, 'name': post_set.name }]
    return data


def update(request,data):
    if db_sentry.dir_holding.objects \
            .filter(name=request.GET['name']) \
            .exists():
        data['error'] = 'Уже есть такая должность'.decode('utf-8')
    else:
        db_sentry.dir_user_post.objects.filter(id=int(request.GET['id'])) \
            .update( name = request.GET['name'] )
    return data


def delete(request,data):
    sentry_user_set = db_sentry.sentry_user.objects.filter(post_id=int(request.GET['id']))
    sentry_user = db_sentry.sentry_user.objects.filter(post_id=int(request.GET['id']))
    client_user_set = db_sentry.client_user.objects.filter(post_id=int(request.GET['id']))
    if sentry_user_set.exists() or sentry_user.exists() or client_user_set.exists():
        data['error'] = 'Эта должность используется'.decode('utf-8')
    else:
        db_sentry.dir_user_post.objects \
            .get(id=int(request.GET['id'])) \
            .delete()
    return data
