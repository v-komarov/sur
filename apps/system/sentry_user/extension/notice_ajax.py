# -*- coding: utf-8 -*-

import datetime

from apps.system.sentry_user import authorize
from apps.system import models as db_sentry


def get_notice_list(request,data):
    data['count'] = 0
    data['notice_list'] = []
    for notice in db_sentry.sentry_log_notice.objects \
            .filter(sentry_user_id=authorize.get_sentry_user(request)['sentry_user_id'], sight=0) \
            .exclude(alert_date__gte=datetime.datetime.now()):
        data['count'] += 1
        data['notice_list'].append({
            'id': notice.id,
            'log_date': notice.sentry_log.log_date.strftime("%d.%m.%Y %H:%M"),
            'client_id': notice.sentry_log.client_object.client_id,
            'client_object': notice.sentry_log.client_object.name,
            'client_object_id': notice.sentry_log.client_object.id,
            'log_type': notice.sentry_log.log_type.name,
            'log_type_id': notice.sentry_log.log_type_id,
            })
    return data


def later(request,data):
    notice_set = db_sentry.sentry_log_notice.objects.get(id=request.POST['notice_id'])
    notice_set.alert_date = notice_set.alert_date + datetime.timedelta(minutes=int(request.POST['minutes']))
    notice_set.save()
    data['answer'] = 'done'
    return data


def notice_all_sight(request,data):
    db_sentry.sentry_log_notice.objects \
        .filter(sentry_user=authorize.get_sentry_user(request)['sentry_user_id']) \
        .update(sight = 1)
    data['answer'] = 'done'
    return data


def notice_item_sight(request,data):
    notice_set = db_sentry.sentry_log_notice.objects.get(id=request.POST['notice_id'])
    notice_set.sight = 1
    notice_set.save()
    data['answer'] = 'done'
    return data

