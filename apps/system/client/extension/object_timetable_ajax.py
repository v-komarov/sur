# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import date_convert


def get(request, data=None):
    data['timetable'] = []
    data['shifts'] = {}
    for item in db_sentry.client_object_timetable.objects \
            .filter(bind_id=int(request.GET['bind_id'])):

        if item.shift:
            shift = item.shift
        else:
            if data['shifts'].get(item.weekday):
                data['shifts'][item.weekday] += 1
            else:
                data['shifts'][item.weekday] = 1
            shift = data['shifts'][item.weekday]

        data['timetable'].append({
            #'shift_type': item.shift_type,
            'weekday': item.weekday.weekday,
            #'weekday_name': item.weekday.name,
            'shift': shift,#item.shift,
            'begin_time': str(item.begin_time)[:5],
            'end_time': str(item.end_time)[:5],
            'hours': str(item.hours)
        })

    return data


def update(request, data=None):
    db_sentry.client_object_timetable.objects.filter(bind=int(request.POST['bind_id'])).delete()

    shifts = json.loads(request.POST['shifts'])
    for shift, week in shifts.items():
        for weekday, time in week.items():
            hours = date_convert.get_hours(time['begin'], time['end'])
            weekday_id = db_sentry.dir_weekday.objects.get(weekday=weekday).id
            db_sentry.client_object_timetable.objects.create(
                bind_id = int(request.POST['bind_id']),
                shift = shift,
                weekday_id = weekday_id,
                begin_time = time['begin'],
                end_time = time['end'],
                hours = hours
            )

        #data['error'] = 'Временной период пересекается с существующим. Выберите другой.'

    return data

