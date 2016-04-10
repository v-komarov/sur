# -*- coding: utf-8 -*-

import json
import datetime

from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.toolset import month_name
from apps.system import models as db_sentry
from apps.post import timetable_ajax


def index(request, client_id=None):
    title = 'График смен'
    if request.user.has_perm('system.client'):
        dir_service_organization_set = db_sentry.dir_service_organization.objects.filter(is_active=1)
        weapon_set = db_sentry.dir_weapon.objects.filter(is_active=1)
        post_reason_set = db_sentry.dir_post_reason.objects.all()
        user_post_set = db_sentry.dir_user_post.objects.all()
        user_status_set = db_sentry.dir_user_status.objects.all()
        year_now = datetime.date.today().year
        try:
            year_first = db_sentry.client_object_post.objects \
                .filter(is_active=1).exclude(planned_begin_date__year=1970) \
                .order_by('planned_begin_date').first().planned_begin_date.year
        except: year_first = year_now
        years_list = []
        for year in xrange(year_first, year_now+2):
            years_list.append(year)
        months_list = month_name.get_mlist()
        month_now = datetime.date.today().month

        return render_to_response('sentry/system/post/timetable.html', locals(), RequestContext(request))
    else:
        return render_to_response('404.html', RequestContext(request))


def ajax(request, action):
    data = {'error': None}
    if request.is_ajax() and request.method == 'GET' and request.user.has_perm('system.client'):

        if action == 'get_services':
            data = timetable_ajax.get_services(request, data)

        elif action == 'get_users':
            data = timetable_ajax.get_users(request, data)

        elif action == 'get_timetable':
            data = timetable_ajax.get_timetable(request, data)

    if request.is_ajax() and request.method == 'POST' and request.user.has_perm('system.client'):

        if action == 'set_shift':
            data = timetable_ajax.set_shift(request, data)

        elif action == 'set_multi_shift':
            data = timetable_ajax.set_multi_shift(request, data)

        elif action == 'remove_shift':
            data = timetable_ajax.remove_shift(request, data)


    return HttpResponse(json.dumps(data, ensure_ascii=False), content_type='application/json' )

