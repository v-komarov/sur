# -*- coding: utf-8 -*-

import json
import datetime
import calendar
from django.db.models import Q

from apps.toolset import month_name
from apps.toolset import date_convert
from apps.system import models as db_sentry

def check_service_shift(service_id,sentry_user_id,post_id,begin_date,end_date):
    pack = {}
    pack['error'] = None
    post_set = db_sentry.client_object_service_post.objects.filter(
        Q(sentry_user_id = sentry_user_id,
          planned_begin_date__lt = begin_date,
          planned_end_date__gt = begin_date,
          is_active = 1 ) |
        Q(sentry_user_id = sentry_user_id,
          planned_begin_date__lt = end_date,
          planned_end_date__gt = end_date,
          is_active = 1 ) |
        Q(sentry_user_id = sentry_user_id,
          planned_begin_date__gt = begin_date,
          planned_end_date = end_date,
          is_active = 1 ) |
        Q(sentry_user_id = sentry_user_id,
          planned_begin_date = begin_date,
          planned_end_date__lt = end_date,
          is_active = 1 ) |
        Q(sentry_user_id = sentry_user_id,
          planned_begin_date = begin_date,
          planned_end_date = end_date,
          is_active = 1 ) ) \
        .exclude(id=post_id)
    if post_set.exists():
        day = begin_date.strftime("%d.%m.%Y")
        full_name = post_set[0].sentry_user.full_name.encode('utf-8')
        service_name = post_set[0].service.name.encode('utf-8')
        pack['error'] = [ full_name+' '+day+' уже имеет смену на посту: '+service_name+'.' ]

    try:
        db_sentry.client_object_service_timetable.objects.get(
            service_id = service_id,
            weekday_id = begin_date.weekday()+1,
            begin_time = begin_date.strftime("%H:%M")+':00',
            end_time = end_date.strftime("%H:%M")+':00' )
        if db_sentry.client_object_service_post.objects.filter(
                service_id = service_id,
                planned_begin_date = begin_date,
                planned_end_date = end_date,
                is_active = 1 ).exclude(id=post_id).exists():
            pack['plan'] = 'unplanned'
        else:
            pack['plan'] = 'planned'
    except: pack['plan'] = 'unplanned'

    try: pack['cost'] = db_sentry.client_object_service_cost.objects.filter(
        Q(service=service_id, end_date__gte=datetime.datetime.now(), is_active=1) |
        Q(service=service_id, end_date=None, is_active=1) )[0].cost
    except: pack['error'] = ['Не определена стоимость услуги']

    try: pack['salary'] = db_sentry.client_object_service_salary.objects.filter(
        service_id = service_id,
        begin_date__lte = begin_date,
        is_active = 1 ).order_by('-begin_date')[0].salary
    except: pack['error'] = ['Не определена зарплата']

    return pack
