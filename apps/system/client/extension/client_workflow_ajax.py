# -*- coding: utf-8 -*-

import json
import datetime
import decimal

from apps.system import models as db_sentry
from apps.system.sentry_user import authorize
from apps.toolset import date_convert
from apps.system.client.extension import client__form
from apps.system.sentry_user.extension import sentry_log


def get(request,data):
    workflow = db_sentry.client_workflow.objects.get(id=int(request.GET['event_id']))
    data['event'] = {
        'object_id': workflow.object_id,
        'event_date': workflow.workflow_date.strftime("%d.%m.%Y"),
        'comment': workflow.comment
    }
    if workflow.sentry_user_id:
        data['event']['sentry_user_id'] = workflow.sentry_user_id
        data['event']['sentry_user_name'] = workflow.sentry_user.full_name
    if workflow.contract_id:
        data['event']['contract_id'] = workflow.contract.id
    if workflow.object_id:
        data['event']['object_id'] = workflow.object.id
    if workflow.workflow_type_id:
        data['event']['event_type_id'] = workflow.workflow_type_id
        data['event']['event_type_name'] = workflow.workflow_type.name
    if workflow.cost: data['event']['cost'] = str(workflow.cost)
    return data


def update(request, data):
    if 'workflow' in request.POST:
        comment = 'Update workflow'
        workflow = db_sentry.client_workflow.objects.get(id=int(request.POST['workflow']))
        workflow_form = client__form.workflow_form(request.POST, instance=workflow)
    else:
        comment = 'Create workflow'
        workflow_form = client__form.workflow_form(request.POST)

    if workflow_form.is_valid() and workflow_form.has_changed():
        workflow = workflow_form.save()

        data['event_set.event_type.label'] = workflow.workflow_type.label

        if workflow.contract_id and not workflow.object_id:
            client_contract = db_sentry.client_contract.objects.get(id=workflow.contract.id)
            if workflow.workflow_type.label == 'client_contract_close':
                client_contract.end_date = workflow.workflow_date
            data['status'] = client_contract.check_contract_status()

        elif workflow.contract_id and workflow.object_id:
            client_bind = db_sentry.client_bind.objects.get(client_contract_id=workflow.contract.id, client_object_id=workflow.object.id, is_active = 1)
            if workflow.workflow_type.label == 'client_object_connect':
                client_bind.begin_date = workflow.workflow_date
                # Проверяем если есть стоимость у усулуги, если есть без даты, то дата подключения назначается датой начала стоимости
                object_cost = db_sentry.client_bind_cost.objects \
                    .filter(client_bind=client_bind.id, is_active=1 ) \
                    .exclude(cost_type__label='pause').first()
                if object_cost:
                    object_cost.begin_date = workflow.workflow_date
                    object_cost.save()

                try:
                    db_sentry.client_bind_cost.objects \
                        .filter(client_bind=client_bind.id, cost_type__label='client_object_connect') \
                        .update(begin_date=workflow.workflow_date)
                except:
                    pass

            elif workflow.workflow_type.label == 'client_object_disconnect':
                client_bind.end_date = workflow.workflow_date

            client_bind.save()

        if workflow.workflow_date.replace(hour=0, minute=0, second=0) >= datetime.datetime.now().replace(hour=0, minute=0, second=0):
            workflow.done = False
            data['workflow_date'] = 'future'
        else:
            workflow.done = True
            data['workflow_date'] = str(workflow.workflow_date)
        workflow.save()

        try:
            data['status'] = client_bind.check_bind_status()
            data['status__'] = 'client_bind'
        except:
            data['status'] = workflow.contract.check_contract_status()
            data['status__'] = 'contract'

        sentry_log.create(
            request,
            client_workflow_id = workflow.id,
            comment = comment
        )

    else:
        data['form_errors'] = workflow_form.errors


    '''
    # Task
    if comment == 'Create event':
        if event_set.event_type.label == 'client_object_connect':
            service_set.begin_date = event_set.event_date
            task_type_id = 2
        elif event_set.event_type.label == 'client_object_disconnect':
            service_set.end_date = event_set.event_date
            task_type_id = 5
        else: task_type_id = None
        if task_type_id:
            try:
                task_set = db_sentry.client_object_task.objects.filter(
                    object_id = service_set.object_id,
                    task_type_id = task_type_id,
                    status__in = [1,2],
                    doer_id = event_set.sentry_user_id,
                    is_active = 1
                ).update(status = 3)
                data['task_id'] = task_set.id
            except: pass

    service_set.save()
    '''



    data['answer'] = 'done'
    return data



def delete(request,data):
    workflow = db_sentry.client_workflow.objects.get(id=int(request.POST['workflow']))

    if workflow.workflow_type.label == 'client_object_connect':
        bind = db_sentry.client_bind.objects.filter(client_object_id=workflow.object.id).first()
        bind.begin_date = None
        bind.save()
        # При удалении подключения удаляется дата первой стоимости, такое ТЗ...
        '''
        cost_set = db_sentry.client_bind_cost.objects.filter(client_bind=bind.id, is_active=1).first()
        if cost_set:
            cost_set.begin_date = None
            cost_set.save()
        '''

    elif workflow.workflow_type.label == 'client_object_disconnect':
        db_sentry.client_bind.objects.filter(client_object=workflow.object.id).update(end_date=None)

    workflow.is_active = 0
    workflow.save()

    if workflow.contract_id and not workflow.object_id:
        client_contract = db_sentry.client_contract.objects.get(id = workflow.contract.id)
        if workflow.workflow_type.label == 'client_contract_close':
            client_contract.end_date = None
        data['status'] = client_contract.check_contract_status()

    elif workflow.contract_id and workflow.object_id:
        client_bind = db_sentry.client_bind.objects.get(
            client_contract = workflow.contract.id,
            client_object = workflow.object.id,
            is_active = 1
        )
        data['status'] = client_bind.check_bind_status()

    db_sentry.sentry_log.objects.create(
        #log_type_id = 2616,
        log_date = datetime.datetime.now(),
        client_workflow_id = workflow.id,
        sentry_user_id = authorize.get_sentry_user(request)['id'],
        comment = 'Delete client_workflow'
    )

    data['answer'] = 'done'
    return data
