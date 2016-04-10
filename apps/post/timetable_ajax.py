# -*- coding: utf-8 -*-

import json
import datetime
import calendar

from apps.toolset import date_convert
from apps.system import models as db_sentry
from apps.post import shifts


def get_services(request, data):
    select_dict = {}
    service_set = db_sentry.client_object_service.objects.filter(service_type=4, is_active=1)
    if 'service_organization_id' in request.GET:
        service_set = service_set.filter(service_organization_id = int(request.GET['service_organization_id']) )

    for service in service_set:
        if not select_dict.get(service.object.id):
            select_dict[service.object.id] = {
                'object_name':service.object.name,
                'services': [] }
        select_dict[service.object.id]['services'].append({
            'service_id': service.id,
            'service_name': service.name,
            })
    data['select'] = select_dict

    return data


def get_users(request, data):
    service_id = int(request.GET['service_id'])
    data['user_list'] = {}
    users_filter = json.loads(request.GET['users_filter'])
    service_set = db_sentry.client_object_service.objects.get(id=service_id)
    data['service'] = {
        'id': service_set.id,
        'object_name': service_set.object.name,
        'service_name': service_set.name,
        'service_password': service_set.password,
        'service_organization_id': service_set.service_organization_id,
        }
    for service_organization in db_sentry.dir_service_organization.objects.filter(is_active=1):
        data['user_list'][service_organization.id] = {
            'service_organization': service_organization.name,
            'list': [] }

    if 'service_organization_id' in request.GET and request.GET['service_organization_id']!='none': service_organization_id = int(request.GET['service_organization_id'])
    else: service_organization_id = service_set.service_organization_id

    user_set = db_sentry.sentry_user.objects.filter(
        post_id = 19,
        is_active = 1,
        #sentry_user_card__service_organization_id = service_organization_id,
        sentry_user_card__is_active = 1 ) \
        .order_by('full_name') \
        .exclude(id__in = json.loads(request.GET['users_exist']))

    today = datetime.date.today()

    if 'work' in users_filter: # Сотрудник со статусом "работает"
        user_set = user_set.filter(status = 1)

    if 'weapon' in users_filter: # Наличие РСЛа на оружие, прописанное в договоре
        data['weapon_list'] = []
        for item in db_sentry.client_object_service_weapon.objects.filter(service_id=service_id):
            data['weapon_list'].append(item.weapon_id)
        user_set = user_set.filter(
            sentry_user_weapon__weapon__in = data['weapon_list'],
            sentry_user_weapon__expire_date__gte = today )

    if 'identity' in users_filter: # Наличие удостоверения
        user_set = user_set.filter(
            sentry_user_identity__expire_date__gte = today,
            sentry_user_identity__is_active = 1 )

    if 'certificate' in users_filter: # Наличие свидетельства
        user_set = user_set.filter(
            sentry_user_certificate__expire_date__gte = today,
            sentry_user_certificate__is_active = 1 )

    users_list = []
    for user in user_set:
        if user.id not in users_list:
            users_list.append(user.id)
            data['user_list'][service_organization_id]['list'].append({
                'user_id': user.id,
                'full_name': user.full_name })
    return data


def get_timetable(request, data):
    year = int(request.GET['year'])
    month = int(request.GET['month'])
    data['month'] = {}
    mdays = calendar.mdays[datetime.date(year,month,1).month]
    for day in xrange(mdays):
        day += 1
        data['month'][day] = datetime.date(year,month,day).weekday()

    service_set = db_sentry.client_object_service.objects \
        .filter(service_type=4, is_active=1) \
        .order_by('name')
    post_set = db_sentry.client_object_service_post.objects \
        .filter(planned_begin_date__year=year, planned_begin_date__month=month, is_active=1) \
        .exclude(sentry_user = None) \
        .order_by('service__name','sentry_user__full_name','planned_begin_date')

    if 'select_id' in request.GET:
        if request.GET['select_level']=='object':
            service_set = service_set.filter(object_id=int(request.GET['select_id']))
            post_set = post_set.filter(service__object_id=int(request.GET['select_id']))
        elif request.GET['select_level']=='service':
            service_set = service_set.filter(id=int(request.GET['select_id']))
            post_set = post_set.filter(service_id=int(request.GET['select_id']))

    if 'service_organization_id' in request.GET:
        data['filter'] = 'service_organization'
        post_set = post_set.filter(service__service_organization_id = int(request.GET['service_organization_id']) )
        service_set = service_set.filter(service_organization_id = int(request.GET['service_organization_id']) )

    if 'sentry_user' in request.GET:
        pass


    data['shifts'] = {}
    data['post'] = {}
    data['weapon_list'] = {}
    data['weapon_list']['users'] = {}
    data['weapon_list']['services'] = {}
    for service in service_set:
        # Посты
        if not data['post'].get(service.id):
            data['weapon_list']['services'][service.id] = service.get_weapon_list()
            data['post'][service.id] = {
                'client_id': service.object.client.id,
                'object_id': service.object.id,
                'service_name': service.name,
                'service__short_name': service.password,
                'service_organization': service.service_organization_id,
                'armed': service.armed,
                'users': {}
            }
        # Расписание для постов
        if not data['shifts'].get(service.id):
            data['shifts'][service.id] = {}
        for day in db_sentry.client_object_service_timetable.objects.filter(service_id=service.id):
            begin_time = str(day.begin_time)[:5]
            end_time = str(day.end_time)[:5]
            hours = str(day.hours)
            if not data['shifts'][service.id].get(day.weekday.weekday):
                data['shifts'][service.id][day.weekday.weekday] = {}
            data['shifts'][service.id][day.weekday.weekday][day.shift] = {
                'begin_time': begin_time,
                'end_time': end_time,
                'hours': hours
            }


    data['post_error_list'] = []
    for post in post_set:
        try:
            try: user_name = post.sentry_user.full_name
            except: user_name = ''

            # Охранник
            if not data['post'][post.service_id]['users'].has_key(post.sentry_user_id):
                data['weapon_list']['users'][post.sentry_user_id] = post.sentry_user.get_weapon_list()
                user_service_organization_list = []
                for card in db_sentry.sentry_user_card.objects.filter(user_id=post.sentry_user_id):
                    user_service_organization_list.append(card.service_organization_id)
                data['post'][post.service_id]['users'][post.sentry_user_id] = {
                    'user_id': post.sentry_user_id,
                    'full_name': user_name,
                    'service_organization_list': user_service_organization_list,
                    'month': {}
                }

            # Смены за месяц
            monthday = post.planned_begin_date.day
            if post.completed_begin_date: completed_begin_date = post.completed_begin_date.strftime("%d.%m.%Y %H:%M")
            else: completed_begin_date = None
            if post.completed_end_date: completed_end_date = post.completed_end_date.strftime("%d.%m.%Y %H:%M")
            else: completed_end_date = None
            try: reason_begin = post.reason_begin.id
            except: reason_begin = None
            try: reason_end = post.reason_end.id
            except: reason_end = None
            data['post'][post.service_id]['users'][post.sentry_user_id]['month'][monthday] = {
                'post_id': post.id,
                'plan': post.plan,
                'planned_begin_date': post.planned_begin_date.strftime("%d.%m.%Y %H:%M"),
                'planned_end_date': post.planned_end_date.strftime("%d.%m.%Y %H:%M"),
                'completed_begin_date': completed_begin_date,
                'completed_end_date': completed_end_date,
                'reason_begin': reason_begin,
                'reason_end': reason_end,
                'weapon_id': post.weapon_id,
                'hours': str( post.hours ),
                'salary': str(post.salary),
                'comment': post.comment
            }
        except:
            data['post_error_list'].append(post.id)

    return data


def set_shift(request, data):
    service_id = int(request.POST['service_id'])
    sentry_user_id = int(request.POST['user_id'])
    #weekday = int(request.POST['weekday'])
    hours = float(request.POST['hours'])
    begin_date = date_convert.convert2datetime(request.POST['begin_date'])['datetime']
    end_date = begin_date + datetime.timedelta(hours=hours)
    try: post_id = int(request.POST['post_id'])
    except: post_id = None

    shift_data = shifts.check_service_shift(
        service_id, sentry_user_id, post_id, begin_date, end_date
    )
    data['error'] = shift_data['error']

    if not data['error']:
        if not post_id:
            post_set = db_sentry.client_object_service_post.objects.create(
                service_id = service_id,
                sentry_user_id = sentry_user_id,
                planned_begin_date = begin_date,
                planned_end_date = end_date
            )
            data['status'] = 'planned'
        else:
            post_set = db_sentry.client_object_service_post.objects.get(id=post_id)
            if request.POST['status']=='worked':
                post_set.completed_begin_date = begin_date
                post_set.completed_end_date = end_date
                post_set.reason_begin_id = int(request.POST['reason_begin'])
                post_set.reason_end_id = int(request.POST['reason_end'])
            else:
                post_set.planned_begin_date = begin_date
                post_set.planned_end_date = end_date
            data['status'] = request.POST['status']
        post_set.plan = shift_data['plan']
        post_set.hours = hours
        #post_set.cost = shift_data['cost']
        post_set.cost = float(shift_data['cost'])*post_set.hours
        #post_set.salary = shift_data['salary']
        post_set.salary = round(float(shift_data['salary'])*int(post_set.hours), 2)
        if 'weapon_id' in request.POST:
            data['weapon_id'] = int(request.POST['weapon_id'])
            post_set.weapon_id = data['weapon_id']
        if request.POST['comment']!='':
            data['comment'] = request.POST['comment']
            post_set.comment = data['comment']
        post_set.save()
        data['post_id'] = post_set.id
        data['salary'] = post_set.salary
        data['end_date'] = end_date.strftime("%d.%m.%Y %H:%M")
        data['plan'] = shift_data['plan']
        data['answer'] = 'done'

    return data


def set_multi_shift(request, data):
    data['shift_valid'] = []
    for shift in json.loads(request.POST['shifts']):
        service_id = int(shift['service_id'])
        sentry_user_id = int(shift['user_id'])
        hours = float(shift['hours'])
        begin_date = date_convert.convert2datetime(shift['begin_date'])['datetime']
        end_date = begin_date + datetime.timedelta(hours=hours)

        shift_data = shifts.check_service_shift(service_id, sentry_user_id, None, begin_date, end_date)
        if shift_data['error']:
            data['error'] = shift_data['error']
        else:
            shift_data['plan'] = check_plan(service_id, begin_date, end_date)
            db_sentry.client_object_service_post.objects.create(
                service_id = service_id,
                sentry_user_id = sentry_user_id,
                plan = shift_data['plan'],
                planned_begin_date = begin_date,
                planned_end_date = end_date,
                hours = hours,
                cost = shift_data['cost'],
                salary = shift_data['salary']
            )
            data['shift_valid'].append({
                'service_id': service_id,
                'sentry_user_id': sentry_user_id,
                'plan': shift_data['plan'],
                'planned_begin_date': begin_date.strftime("%d.%m.%Y %H:%M"),
                'planned_end_date': end_date.strftime("%d.%m.%Y %H:%M"),
                'hours': hours,
                'cost': str(shift_data['cost']),
                'cost_result': str(float(shift_data['cost'])*hours),
                'salary': str(shift_data['salary']),
                'salary_result': str(round(float(shift_data['salary'])*int(hours), 2))
            })

    data['answer'] = 'done'
    return data


def remove_shift(request, data):
    for shift in json.loads(request.POST['shifts']):
        db_sentry.client_object_service_post.objects \
            .filter(id=int(shift)) \
            .update(is_active=0)
    data['answer'] = 'deleted'
    return data


def check_plan(service_id, begin_date, end_date):
    timetable_set = db_sentry.client_object_service_timetable.objects.filter(
        service_id = service_id,
        begin_time = begin_date.strftime('%I:%M:%S'),
        end_time = end_date.strftime('%I:%M:%S')
    )
    post_set = db_sentry.client_object_service_post.objects.filter(
        service_id = service_id,
        planned_begin_date__gte = begin_date,
        planned_end_date__lte = end_date,
        is_active = 1
    )
    if timetable_set.exists() and not post_set.exists():
        answer = 'planned'
    else:
        answer = 'unplanned'

    return answer
