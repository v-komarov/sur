# -*- coding: utf-8 -*-

import datetime

from apps.system.sentry_user import authorize
from apps.system import models as db_sentry


def create(request, **kwargs):
    #log_type = db_sentry.auth_permission.objects.get(codename=kwargs['log_type'])
    log = db_sentry.sentry_log.objects.create(
        #log_type_id = log_type.id,
        sentry_user_id = authorize.get_sentry_user(request)['id'],
        #comment = log_type.name
    )
    if 'client_contract_id' in kwargs:
        log.client_contract_id = kwargs['client_contract_id']
    if 'client_object_id' in kwargs:
        log.client_object_id = kwargs['client_object_id']
    if 'client_workflow_id' in kwargs:
        log.client_workflow_id = kwargs['client_workflow_id']
    if 'charge_id' in kwargs:
        log.charge_id = kwargs['charge_id']
    if 'comment' in kwargs:
        log.comment = kwargs['comment']
    log.save()
    return log.id


def client_object_(request,client_object_id,log_type):
    #log_type = db_sentry.auth_permission.objects.get(codename=log_type)
    sentry_log = db_sentry.sentry_log.objects.create(
        #log_type_id = log_type.id,
        log_date = datetime.datetime.now(),
        sentry_user_id = authorize.get_sentry_user(request)['id'],
        client_object_id = client_object_id,
        #comment = log_type.name
    )
    return sentry_log.id


def client_object_event(request, client_object_id, event_type):
    sentry_log_type = None
    if event_type == 'warden': sentry_log_type = 'object_warden'
    elif event_type == 'register': sentry_log_type = 'object_contract_register'
    elif event_type == 'return': sentry_log_type = 'object_contract_return'
    elif event_type == 'notice': sentry_log_type = 'object_contract_notice'
    elif event_type == 'notice_off': sentry_log_type = 'object_contract_notice_off'
    elif event_type == 'connect': sentry_log_type = 'object_connected'
    elif event_type == 'disconnect': sentry_log_type = 'object_disconnected'
    if sentry_log_type:
        client_object_(request, client_object_id, sentry_log_type)
    return sentry_log_type


def task(request,task_set):
    sentry_log_type = None
    if task_set.task_type.label == 'connect': sentry_log_type = 'object_task_connect'
    elif task_set.task_type.label == 'disconnect': sentry_log_type = 'object_task_disconnect'
    elif task_set.task_type.label == 'initial_examination': sentry_log_type = 'object_task_initial_examination'
    elif task_set.task_type.label == 'recovery': sentry_log_type = 'object_task_recovery'
    elif task_set.task_type.label == 'additional_installation': sentry_log_type = 'object_task_additional_installation'
    elif task_set.task_type.label == 'object_task_device_connect': sentry_log_type = 'object_task_device_connect'
    elif task_set.task_type.label == 'object_task_device_disconnect': sentry_log_type = 'object_task_device_disconnect'
    elif task_set.task_type.label == 'service': sentry_log_type = 'object_task_service'
    elif task_set.task_type.label == 'marketing': sentry_log_type = 'object_task_marketing'
    elif task_set.task_type.label == 'head_security': sentry_log_type = 'object_task_head_security'
    if sentry_log_type:
        sentry_log_id = client_object(request,task_set.object_id,sentry_log_type)
        # Notice for doer
        db_sentry.sentry_log_notice.objects.create(
            sentry_log_id = sentry_log_id,
            sentry_user_id = task_set.doer_id
        )
    return sentry_log_type


def object_incident(request,incident_set,log_type):
    log_type = db_sentry.auth_permission.objects.get(codename=log_type)
    sentry_log = db_sentry.sentry_log.objects.create(
        log_type_id = log_type.id,
        log_date = datetime.datetime.now(),
        sentry_user_id = authorize.get_sentry_user(request)['id'],
        client_object_id = incident_set.object_id,
        incident_id = incident_set.id,
        comment = log_type.name
    )
    return True

