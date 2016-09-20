# -*- coding: utf-8 -*-

import datetime

from apps.system import models as db_sentry
from apps.task import models as db_task
from apps.system.sentry_user import authorize
from apps.toolset import date_convert


def change(request, data):
    sentry_user_id = authorize.get_sentry_user(request)['id']
    bind = db_sentry.client_bind.objects.get(id=int(request.POST['bind_id']))
    contract = db_sentry.client_contract.objects.get(id=int(request.POST['contract_id']))
    contract_new = db_sentry.client_contract.objects.get(id=int(request.POST['contract_new_id']))

    client_object_new = db_sentry.client_object.objects.create(
        name = bind.client_object.name,
        address_building = bind.client_object.address_building,
        address_placement_type = bind.client_object.address_placement_type,
        address_placement = bind.client_object.address_placement,
        referer_type = bind.client_object.referer_type,
        referer_user = bind.client_object.referer_user,
        security_previously = bind.client_object.security_previously,
        security_squad = bind.client_object.security_squad,
        occupation = bind.client_object.occupation,
        comment = bind.client_object.comment,
        password = bind.client_object.password
    )
    client_object_new.dir_tag = bind.client_object.dir_tag.all()
    client_object_new.client_user = bind.client_object.client_user.all()
    client_object_new.save()

    bind_new = db_sentry.client_bind.objects.create(
        client_contract_id = contract_new.id,
        client_object_id = client_object_new.id,
        console_id = bind.console.id,
        console_number = bind.console_number,
        status_id = bind.status.id,
        ovd_status_id = bind.ovd_status.id,
        begin_date = bind.begin_date,
        end_date = bind.end_date,
        charge_month_day = bind.charge_month_day,
        charge_month_id = bind.charge_month.id,
        time24 = bind.time24,
        watch = bind.watch,
        data = bind.data
    )
    bind_new.dir_tag = bind.dir_tag.all()
    bind_new.dir_service_subtype = bind.dir_service_subtype.all()
    bind_new.save()

    for workflow in bind.client_object.client_workflow_set.filter(is_active=1):
        db_sentry.client_workflow.objects.create(
            contract_id = contract_new.id,
            bind_id = bind_new.id,
            object_id = client_object_new.id,
            sentry_user_id = sentry_user_id,
            workflow_type_id = workflow.workflow_type.id
        )
        if workflow.workflow_type.label == 'client_object_connect':
            db_sentry.client_workflow.objects.create(
                contract_id = contract.id,
                #bind_id = bind.id,
                object_id = bind.client_object.id,
                sentry_user_id = sentry_user_id,
                workflow_type_id = 7 #client_object_disconnect
            )
        elif workflow.workflow_type.label == 'client_object_notice':
            db_sentry.client_workflow.objects.create(
                contract_id = contract.id,
                #bind_id = bind.id,
                object_id = bind.client_object.id,
                sentry_user_id = sentry_user_id,
                workflow_type_id = 5 # client_object_notice_off
            )

    install_set = db_sentry.client_object_dir_device.objects.filter(object=bind.client_object.id, uninstall_date=None, is_active=1)
    for install in install_set:
        install.uninstall_date = datetime.datetime.now()
        install.uninstall_user_id = sentry_user_id
        install.save()
        db_sentry.client_object_dir_device.objects.create(
            object_id = bind_new.client_object.id,
            device_id = install.device.id,
            priority = install.priority,
            install_date = install.install_date,
            install_user_id = install.install_user.id,
            password = install.password,
            comment = install.comment
        )

    bind.status_id = 9
    bind.save()



    db_task.task.objects.create( # Task object disconnect
                                 object_id = bind.client_object.id,
                                 contract_id = contract.id,
                                 task_type_id = 5,
                                 create_user_id = sentry_user_id,
                                 create_date = datetime.datetime.now(),
                                 complete_date = date_convert.convert(request.POST['end_date']),
                                 warden_id = sentry_user_id,
                                 doer_id = sentry_user_id,
                                 comment = 'Смена арендатора',
                                 status_id = 3 # done
    )

    db_task.task.objects.create( # Task object connect
                                 object_id = bind_new.client_object.id,
                                 contract_id = contract_new.id,
                                 task_type_id = 2,
                                 create_user_id = sentry_user_id,
                                 create_date = datetime.datetime.now(),
                                 complete_date = date_convert.convert(request.POST['begin_date']),
                                 warden_id = sentry_user_id,
                                 doer_id = sentry_user_id,
                                 comment = 'Смена арендатора',
                                 status_id = 3 # done
    )

    data['answer'] = 'done'

    return data
