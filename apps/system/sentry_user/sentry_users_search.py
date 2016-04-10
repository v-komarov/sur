# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def search(request):
    if request.user.has_perm('system.client'):
        if request.is_ajax():
            data = {}
            data['error'] = None
            if request.method=='GET':
                limit = 10
                if 'limit' in request.GET:
                    limit = int(request.GET['limit'])
                sentry_users = db_sentry.sentry_user.objects.filter(
                    full_name__icontains = request.GET['full_name'],
                    is_active = request.GET['is_active'] ) \
                    .values('id','full_name','post_id','post__name','is_active')[0:limit]
                if request.GET['user_post_id']!='all':
                    sentry_users = sentry_users.filter(post_id = int(request.GET['user_post_id']))
                data['users'] = [item for item in sentry_users]

            data = json.dumps(data, ensure_ascii=False)
            return HttpResponse(data, content_type='application/json')

    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request) )