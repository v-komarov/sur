# -*- coding: utf-8 -*-

import datetime

from apps.system import models as db_sentry
from apps.system.sentry_user import authorize
from apps.toolset import date_convert


def change(request,data):
    object_id = int(request.POST['object_id'])
    sentry_user_id = authorize.get_sentry_user(request)['id']
    object_1_set = db_sentry.client_object.objects.get(id=object_id)
    object_2_set = db_sentry.client_object.objects.create(
        client_id = int(request.POST['client_id']),
        name = object_1_set.name,
        status_id = 1,
        address_building_id = object_1_set.address_building_id,
        address_apartment = object_1_set.address_apartment,
        referer_type_id = object_1_set.referer_type_id,
        referer_user_id = object_1_set.referer_user_id,
        security_before = object_1_set.security_before,
        security_squad_id = object_1_set.security_squad_id,
        comment = object_1_set.comment
    )
    event_1_set = db_sentry.client_object_event.objects.filter(
        object_id = object_1_set.id,
        event_type_id__in = [1,2,3,4,5,9], # warden, programming
        is_active = 1 )
    for event in event_1_set:
        event_2_set = db_sentry.client_object_event.objects.create(
            object_id = object_2_set.id,
            event_type_id = event.event_type_id,
            sentry_user_id = event.sentry_user_id,
            event_date = event.event_date,
            comment = event.comment )
        for log in event.sentry_log_set.all():
            db_sentry.sentry_log.objects.create(
                log_type_id = 2616,
                log_date = log.date,
                object_event_id = event_2_set.id,
                sentry_user_id = log.user_id,
                comment = log.comment )

    service_1_set = db_sentry.client_object_service.objects.filter(
        object_id = object_1_set.id,
        is_active = 1 )
    for service in service_1_set:
        service_2 = db_sentry.client_object_service.objects.create(
            object_id = object_2_set.id,
            name = service.name,
            password = service.password,
            contract_number = service.contract_number,
            status = service.status,
            service_type_id = service.service_type_id,
            begin_date = service.begin_date,
            end_date = service.end_date,
            security_company_id = service.security_company_id,
            armed = service.armed,
            comment = service.comment )
        for subtype in service.dir_service_subtype.all():
            db_sentry.client_object_service_dir_service_subtype.objects.create(
                client_object_service_id = service_2.id,
                dir_service_subtype_id = subtype.id )
        for cost in service.client_object_service_cost_set.filter(is_active=1):
            cost_2 = db_sentry.client_object_service_cost.objects.create(
                service_id = service_2.id,
                cost_type_id = cost.cost_type_id,
                begin_date = cost.begin_date,
                end_date = cost.end_date,
                calculation_month_day = cost.calculation_month_day,
                calculation_month_id = cost.calculation_month_id,
                cost = cost.cost,
                comment = cost.comment )
            for log in cost.sentry_log_set.all():
                db_sentry.sentry_log.objects.create(
                    log_type_id = 2613,
                    cost_id = cost_2.id,
                    sentry_user = log.sentry_user,
                    date = log.date,
                    comment = log.comment )


    try:
        service_1_id = db_sentry.client_object_service.objects.filter(object_id=object_id, is_active=1)[0].id
    except:
        service_1_id = db_sentry.client_object_event.objects.get(object_id=object_id, event_type_id=2, is_active=1).service_id
    try:
        service_2_id = db_sentry.client_object_service.objects.filter(object_id=object_2_set.id, is_active=1)[0].id
    except:
        service_2_id = db_sentry.client_object_event.objects.get(object_id=object_2_set.id, event_type_id=2, is_active=1).service_id
    # Task disconnect
    db_sentry.client_object_task.objects.create(
        object_id = object_1_set.id,
        service_id = service_1_id,
        task_type_id = 5,
        status_id = 1,
        create_user_id = sentry_user_id,
        create_date = datetime.datetime.now(),
        completion_date = date_convert.convert(request.POST['end_date']),
        warden_id = sentry_user_id,
        doer_id = sentry_user_id,
        comment = 'Смена арендатора')
    # Task connect
    db_sentry.client_object_task.objects.create(
        object_id = object_2_set.id,
        service_id = service_2_id,
        task_type_id = 2,
        status_id = 1,
        create_user_id = sentry_user_id,
        create_date = datetime.datetime.now(),
        completion_date = date_convert.convert(request.POST['begin_date']),
        warden_id = sentry_user_id,
        doer_id = sentry_user_id,
        comment = 'Смена арендатора' )

    data['answer'] = 'done'

    return data
