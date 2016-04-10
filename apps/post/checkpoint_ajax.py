# -*- coding: utf-8 -*-

import json
import datetime

from apps.system import models as db_sentry
from apps.toolset import date_convert
from apps.post import shifts


def get(request,data):
    now = datetime.datetime.now()
    begin_date = now - datetime.timedelta(hours=5)
    end_date = now + datetime.timedelta(hours=5)
    status_list = json.loads(request.GET['status_list'])

    post_set = db_sentry.client_object_service_post.objects.filter(
        planned_begin_date__range = (begin_date, end_date),
        is_active = 1) \
        .exclude(sentry_user = None) \
        .order_by('service__name','sentry_user__full_name','planned_begin_date')
    if request.GET['service_organization_id']!='all':
        post_set = post_set.filter(
            service__service_organization_id = int(request.GET['service_organization_id']) )

    data['count'] = post_set.count()
    data['post_arrival'] = []
    data['post_watch'] = []
    data['post_completed'] = []
    for item in post_set:
        try: user_name = item.sentry_user.full_name
        except: user_name = None
        try: user_post = item.sentry_user.post.name
        except: user_post = None
        if item.comment: comment = item.comment
        else: comment = ''

        if 'arrival' in status_list and not item.reason_begin_id:
            data['post_arrival'].append({
                'post_id': item.id,
                'armed': item.service.armed,
                'client_id': item.service.object.client.id,
                'object_id': item.service.object.id,
                'object_name': item.service.object.name,
                'service_id': item.service.id,
                'service__name': item.service.name,
                'service__short_name': item.service.password,
                'service_organization_id': item.service.service_organization_id,
                'user_id': item.sentry_user_id,
                'user__full_name': user_name,
                'user__post': user_post,
                'hours': str( item.hours ),
                'year': item.planned_begin_date.strftime("%Y"),
                'begin_date': item.planned_begin_date.strftime("%d.%m.%Y %H:%M"),
                'end_date': item.planned_end_date.strftime("%d.%m.%Y %H:%M"),
                'comment': comment })

        elif 'watch' in status_list and item.reason_begin_id and not item.reason_end_id:
            data['post_watch'].append({
                'post_id': item.id,
                'armed': item.service.armed,
                'client_id': item.service.object.client.id,
                'object_id': item.service.object.id,
                'object_name': item.service.object.name,
                'service_id': item.service.id,
                'service__name': item.service.name,
                'service__short_name': item.service.password,
                'service_organization_id': item.service.service_organization_id,
                'user_id': item.sentry_user_id,
                'user__full_name': user_name,
                'user__post': user_post,
                'hours': str( item.hours ),
                'year': item.planned_begin_date.strftime("%Y"),
                'begin_date': item.completed_begin_date.strftime("%d.%m.%Y %H:%M"),
                'end_date': item.planned_end_date.strftime("%d.%m.%Y %H:%M"),
                'reason_begin_id': item.reason_begin_id,
                'comment': comment })

        elif 'completed' in status_list and item.reason_end_id:
            data['post_completed'].append({
                'post_id': item.id,
                'armed': item.service.armed,
                'client_id': item.service.object.client.id,
                'object_id': item.service.object.id,
                'object_name': item.service.object.name,
                'service_id': item.service.id,
                'service__name': item.service.name,
                'service__short_name': item.service.password,
                'service_organization_id': item.service.service_organization_id,
                'user_id': item.sentry_user_id,
                'user__full_name': user_name,
                'user__post': user_post,
                'hours': str( item.hours ),
                'year': item.planned_begin_date.strftime("%Y"),
                'begin_date': item.completed_begin_date.strftime("%d.%m.%Y %H:%M"),
                'end_date': item.completed_end_date.strftime("%d.%m.%Y %H:%M"),
                'reason_begin_id': item.reason_begin_id,
                'reason_end_id': item.reason_end_id,
                'comment': comment })

    return data


def shift_by_plan(request,data):
    post_set = db_sentry.client_object_service_post.objects.get(id=int(request.POST['post_id']))
    post_set.reason_begin_id = 1
    post_set.save()
    data['answer'] = 'done'
    return data


def shift_begin(request,data):
    post_set = db_sentry.client_object_service_post.objects.get(id=int(request.POST['post_id']))
    post_set.sentry_user_id = int(request.POST['sentry_user_id'])
    post_set.reason_begin_id = int(request.POST['reason_id'])
    post_set.completed_begin_date = date_convert.convert2datetime(request.POST['time'])['datetime']
    post_set.comment = request.POST['comment']
    post_set.hours = date_convert.get_hours(request.POST['time'][-5:], post_set.planned_end_date.strftime("%H:%M") )
    post_set.save()
    data['answer'] = 'done'
    return data


def shift_cancel(request,data):
    post_set = db_sentry.client_object_service_post.objects.get(id=int(request.POST['post_id']))
    post_set.reason_begin_id = None
    post_set.hours = date_convert.get_hours(post_set.planned_begin_date.strftime("%H:%M"), post_set.planned_end_date.strftime("%H:%M") )
    post_set.save()
    data['answer'] = 'done'
    return data


def shift_completed(request,data):
    post_set = db_sentry.client_object_service_post.objects.get(id=int(request.POST['post_id']))
    post_set.reason_end_id = int(request.POST['reason_id'])
    post_set.completed_end_date = date_convert.convert2datetime(request.POST['time'])['datetime']
    post_set.comment = request.POST['comment']
    post_set.hours = date_convert.get_hours(post_set.completed_begin_date.strftime("%H:%M"), request.POST['time'][-5:] )
    post_set.save()
    data['answer'] = 'done'
    return data


def shift_user_change(request,data):
    time = date_convert.convert2datetime(request.POST['time'])['datetime']
    post_set = db_sentry.client_object_service_post.objects.get(id=int(request.POST['post_id']))
    post_set.hours = date_convert.get_hours(post_set.planned_begin_date.strftime("%H:%M"), request.POST['time'][-5:])
    post_set.completed_end_date = time
    post_set.reason_end_id = int(request.POST['reason_id'])
    post_set.comment = request.POST['comment']
    post_set.save()

    hours = date_convert.get_hours(request.POST['time'][-5:], post_set.planned_end_date.strftime("%H:%M"))
    shift_data = shifts.check_service_shift(
            post_set.service_id, int(request.POST['sentry_user_id']), None, time, post_set.planned_end_date
        )
    db_sentry.client_object_service_post.objects.create(
        service_id = post_set.service_id,
        sentry_user_id = int(request.POST['sentry_user_id']),
        type = 'post',
        plan = shift_data['plan'],
        planned_begin_date = time,
        planned_end_date = post_set.planned_end_date,
        completed_begin_date = time,
        reason_begin_id = int(request.POST['reason_id']),
        hours = hours,
        armory_id = post_set.armory_id,
        cost = shift_data['cost'],
        cost_result = float(shift_data['cost'])*post_set.hours,
        salary = shift_data['salary'],
        salary_result = round(float(shift_data['salary'])*int(post_set.hours), 2),
        comment = request.POST['comment']
    )
    data['answer'] = 'done'
    return data


def shift_edited_save(request,data):
    begin_date = date_convert.convert2datetime(request.POST['completed_begin_date'])['datetime']
    end_date = date_convert.convert2datetime(request.POST['completed_end_date'])['datetime']
    hours = date_convert.get_hours(request.POST['completed_begin_date'][-5:], request.POST['completed_end_date'][-5:])
    post_set = db_sentry.client_object_service_post.objects.get(id=int(request.POST['post_id']))
    shift_data = shifts.check_service_shift(
            post_set.service_id, int(request.POST['sentry_user_id']), None, begin_date, end_date
        )
    post_set.hours = hours
    post_set.completed_begin_date = begin_date
    post_set.completed_end_date = end_date
    post_set.reason_begin_id = int(request.POST['reason_begin_id'])
    post_set.reason_end_id = int(request.POST['reason_end_id'])
    post_set.plan = shift_data['plan']
    post_set.cost = shift_data['cost']
    post_set.cost_result = float(shift_data['cost'])*hours
    post_set.salary = shift_data['salary']
    post_set.salary_result = round(float(shift_data['salary'])*int(hours), 2)
    post_set.comment = request.POST['comment']
    post_set.save()
    data['answer'] = 'done'
    return data


def shift_uncompleted(request,data):
    post_set = db_sentry.client_object_service_post.objects.get(id=int(request.POST['post_id']))
    post_set.reason_end_id = None
    post_set.hours = date_convert.get_hours(post_set.completed_begin_date.strftime("%H:%M"), post_set.planned_end_date.strftime("%H:%M") )
    post_set.save()
    data['answer'] = 'done'
    return data
