# -*- coding: utf-8 -*-

import datetime

from apps.system import models as db_sentry
from apps.task import models as task_models
from apps.task.extension import task__form
from apps.toolset import weekday
from apps.system.sentry_user import authorize
from apps.toolset import date_convert
from apps.system.sentry_user.extension import sentry_log


def search(request, data):
    data['day_list'] = {}
    data['task_list'] = []
    today = datetime.datetime.today().replace(hour=0, minute=0) - datetime.timedelta(days=1)

    try:
        from_date = datetime.datetime.strptime(request.POST['from_date'], '%d.%m.%Y')
    except:
        from_date = datetime.datetime(1970, 1, 1, 0, 0, 0)
    try:
        to_date = datetime.datetime.strptime(request.POST['to_date'], '%d.%m.%Y')
    except:
        to_date = today + datetime.timedelta(days=365)

    task_set = task_models.task.objects.filter(complete_date__range=(from_date, to_date), is_active=1)

    if 'task_status' in request.POST and request.POST['task_status'] != '':
        task_set = task_set.filter(status=request.POST['task_status'])
    else:
        task_set = task_set.exclude(status__label='done', complete_date__lte=today)

    if 'task_type' in request.POST and request.POST['task_type'] != '':
        task_set = task_set.filter(task_type=request.POST['task_type'])

    if 'uncompleted' in request.POST and request.POST['uncompleted'] == 'true':
        task_set = task_set.exclude(status__label='done')
    if 'expired' in request.POST and request.POST['expired'] == 'true':
        task_set = task_set.exclude(complete_date__lte=today)

    if 'contract' in request.POST and request.POST['contract'] != '':
        task_set = task_set.filter(contract__contract_number=str(request.POST['contract']))

    if 'doer' in request.POST and request.POST['doer'] != '':
        task_set = task_set.filter(doer=int(request.POST['doer']))
    if 'warden' in request.POST and request.POST['warden'] != '':
        task_set = task_set.filter(warden=int(request.POST['warden']))

    if 'locality' in request.POST and request.POST['locality'] != '':
        task_set = task_set.filter(object__address_building__street__locality_id=int(request.POST['locality']))

    if 'order_by' in request.POST:
        task_set = task_set.order_by(request.POST['order_by'])

    for item in task_set:
        if item.status.label!='done' and today > item.complete_date:
            status = 'expired'
        else:
            status = item.status.label
        task = {
            'id': item.id,
            'status_id': item.status_id,
            'status__label': status,
            'task_type_id': item.task_type_id,
            'task_type__name': item.task_type.name,
            'object_id': item.object.id,
            'object_name': item.object.name,
            'create_date': item.create_date.strftime("%H:%M %d.%m.%Y"),
            'complete_date': item.complete_date.strftime("%d.%m.%Y"),
            'doer': item.doer.full_name,
            'address': item.object.get_address(),
            'comment': item.comment }
        if item.contract:
            task['client'] = item.contract.client.id
            task['client__name'] = item.contract.client.name

        task_report_set = task_models.task_report.objects.filter(task=item.id, is_active=1)
        if task_report_set:
            try: doer = task_report_set[0].doer.full_name
            except: doer = ''
            task['report'] = {
                'date': task_report_set[0].create_date.strftime("%d.%m.%Y"),
                'doer': doer,
                'comment': task_report_set[0].comment
            }

        if item.complete_date >= today:
            day_string = item.complete_date.strftime("%Y%m%d")
            task['day'] = day_string
            if day_string not in data['day_list']:
                data['day_list'][day_string] = {}
                data['day_list'][day_string]['day'] = item.complete_date.strftime("%d.%m.%Y")
                data['day_list'][day_string]['weekday'] = weekday.get_weekday(item.complete_date.weekday())
        else:
            task['day'] = 0
            data['day_list'][0] = 'Просроченные заявки'.decode('utf-8')
        data['task_list'].append(task)
    return data


def get_task_type(request, data):
    task_type = task_models.task_type.objects.all().values('id', 'label', 'name')
    data['task_type_set'] = [item for item in task_type]

    return data


def get(request, data):
    datetime_now = datetime.datetime.today().replace(hour=0, minute=0) - datetime.timedelta(days=1)
    task_set = task_models.task.objects.get(id=int(request.GET['task']))
    if task_set.status.label != 'done' and datetime_now > task_set.complete_date:
        status = 'expired'
    else:
        status = task_set.status.label
    data['task'] = {
        'id': task_set.id,
        'status_id': task_set.status_id,
        'status__label': status,
        'task_type': task_set.task_type_id,
        'task_type__name': task_set.task_type.name,
        'object': task_set.object.id,
        'object__name': task_set.object.name,
        'object_map_yandex': task_set.object.get_map_yandex(),
        'create_user': task_set.create_user.id,
        'create_user__full_name': task_set.create_user.full_name,
        'create_date': task_set.create_date.strftime("%H:%M %d.%m.%Y"),
        'complete_date': task_set.complete_date.strftime("%d.%m.%Y"),
        'warden': task_set.warden.id,
        'warden__full_name': task_set.warden.full_name,
        'doer': task_set.doer.id,
        'doer__full_name': task_set.doer.full_name,
        'address': task_set.object.get_address(),
        'comment': task_set.comment }
    if task_set.contract:
        data['task']['contract'] = task_set.contract.id
        data['task']['client'] = task_set.contract.client.id
        data['task']['client__name'] = task_set.contract.client.name

    if task_set.initiator_id:
        data['task']['initiator'] = task_set.initiator.id
    elif task_set.initiator_other:
        data['task']['initiator_other'] = task_set.initiator_other
    data['task']['client_user_list'] = {}

    for client_user in task_set.object.client_user.filter(is_active=1):
        data['task']['client_user_list'][client_user.id] = {
            'full_name': client_user.full_name
        }
        if client_user.post:
            data['task']['client_user_list'][client_user.id]['post'] = client_user.post.id
            data['task']['client_user_list'][client_user.id]['post__name'] = client_user.post.name

    for client_user in db_sentry.client_bind.objects.get(client_object=task_set.object.id).client_contract.client.client_user.filter(is_active=1):
        data['task']['client_user_list'][client_user.id] = {
            'full_name': client_user.full_name
        }
        if client_user.post:
            data['task']['client_user_list'][client_user.id]['post'] = client_user.post.id
            data['task']['client_user_list'][client_user.id]['post__name'] = client_user.post.name


    if task_set.device:
        data['task']['device'] = task_set.device.id
        data['task']['device__name'] = task_set.device.name

    task_report_set = task_models.task_report.objects.filter(task=task_set.id, is_active=1)
    if task_report_set:
        data['task']['report_list'] = []
        for item in task_report_set:
            report = {
                'id': item.id,
                'time': item.create_date.strftime("%Y%m%d%H%M%S"),
                'status': item.status.id,
                'status__label': item.status.label,
                'status__name': item.status.name,
                'create_date': item.create_date.strftime("%d.%m.%Y %H:%M"),
                'comment': item.comment
            }
            if item.doer:
                report['doer'] = item.doer.id
                report['doer__full_name'] = item.doer.full_name
            elif item.security_squad:
                report['security_squad'] = item.security_squad.id
                report['security_squad__name'] = item.security_squad.name
            data['task']['report_list'].append(report)

    task_log_set = task_models.task_log.objects.filter(task=task_set.id,is_active=1)
    if task_log_set:
        data['task']['log_list'] = []
        for item in task_log_set:
            log = {
                'id': item.id,
                'time': item.create_date.strftime("%Y%m%d%H%M%S"),
                'create_date': item.create_date.strftime("%d.%m.%Y %H:%M"),
                'user': item.user.full_name,
                'old_date': item.old_date.strftime("%d.%m.%Y"),
                'new_date': item.new_date.strftime("%d.%m.%Y"),
                'comment': item.comment
            }
            data['task']['log_list'].append(log)

    return data


def create(request, data):
    form = task__form.task_form(request.POST)
    if form.is_valid():
        task = form.save()
        task.create_user_id = authorize.get_sentry_user(request)['id']
        task.save()
        data['sentry_log'] = sentry_log.task(request, task)
        data['answer'] = 'done'
    else:
        data['errors'] = form.errors

    return data


def update(request, data):
    task_pre = task_models.task.objects.get(id=int(request.POST['task']))
    contract_id = task_pre.contract_id
    object_id = task_pre.object_id
    form = task__form.task_form(request.POST, instance=task_pre)

    if form.is_valid():
        task = form.save(commit=False)
        task.contract_id = contract_id
        task.object_id = object_id
        task.save()
        data['status'] = db_sentry.client_bind.objects.filter(client_object=task.object.id, is_active=1).first().check_bind_status()
        data['answer'] = 'done'
    else:
        data['errors'] = form.errors

    return data


def delete(request, data):
    task = task_models.task.objects.get(id=int(request.GET['task']))
    task.is_active = 0
    task.save()
    data['status'] = db_sentry.client_bind.objects.filter(client_object=task.object.id, is_active=1).first().check_bind_status()
    data['answer'] = 'done'
    return data


def get_report(request,data):
    report_set = task_models.task_report.objects.get(id=int(request.GET['report_id']))
    data['report'] = {
        'id': report_set.id,
        'status_id': report_set.status_id,
        'status': report_set.status.name,
        'create_date': report_set.create_date.strftime("%d.%m.%Y %H:%M"),
        'create_user_id': report_set.user.id,
        'create_user': report_set.user.full_name,
        'warden_id': report_set.warden.id,
        'warden': report_set.warden.full_name,
        'comment': report_set.comment
    }
    if report_set.doer:
        data['report']['doer'] = report_set.doer.id
        data['report']['doer__full_name'] = report_set.doer.full_name
    elif report_set.security_squad:
        data['report']['security_squad'] = report_set.security_squad.id
        data['report']['security_squad__name'] = report_set.security_squad.name
    return data


def create_report(request, data):
    task_set = task_models.task.objects.get(id=int(request.POST['task']))
    if task_set.status.label == 'done':
        data['errors'] = 'Эта заявка уже выполнена'.decode('utf-8')
    else:
        status_id = int(request.POST['status'])
        report_set = task_models.task_report.objects.create(
            task_id = int(request.POST['task']),
            status_id = status_id,
            create_date = datetime.datetime.now(),
            user_id = authorize.get_sentry_user(request)['id'],
            warden_id = task_set.warden_id,
            comment = request.POST['comment']
        )
        if 'doer' in request.POST and request.POST['doer'] != '':
            report_set.doer_id = int(request.POST['doer'])
        elif 'security_squad' in request.POST and request.POST['security_squad'] != '':
            report_set.security_squad_id = int(request.POST['security_squad'])
        report_set.save()
        task_set.status_id = status_id
        task_set.save()

        if status_id == 3: # Выполнено

            bind = db_sentry.client_bind.objects.get(
                client_contract = task_set.contract_id,
                client_object = task_set.object_id,
                is_active = 1 )

            ### Подключение объекта
            if task_set.task_type_id == 2:
                data['task_type'] = 'Подключение объекта'.decode('utf-8')
                if bind:
                    db_sentry.client_workflow.objects.create(
                        contract_id = task_set.contract_id,
                        bind_id = bind.id,
                        object_id = task_set.object_id,
                        sentry_user_id = report_set.user_id,
                        workflow_type_id = 6,
                        workflow_date = report_set.create_date,
                        comment = report_set.comment
                    )
                if task_set.device:
                    install = db_sentry.client_object_dir_device.objects.create(
                        object_id = task_set.object.id,
                        device_id = task_set.device.id,
                        install_date = task_set.complete_date,
                        install_user_id = task_set.doer.id
                    )
                    install.device.checkPriority()

                if task_set.contract:
                    client_bind = db_sentry.client_bind.objects.filter(client_contract_id=task_set.contract.id, is_active=1).first()
                    client_bind.check_bind_status()
                    #data['contract_status'] = task_set.contract.check_contract_status()

            ### Отключение объекта
            elif task_set.task_type_id == 5:
                data['task_type'] = 'Отключение'.decode('utf-8')
                db_sentry.client_workflow.objects.create(
                    contract_id = task_set.contract_id,
                    bind_id = bind.id,
                    object_id = task_set.object_id,
                    sentry_user_id = report_set.user_id,
                    workflow_type_id = 7,
                    workflow_date = report_set.create_date,
                    comment = report_set.comment
                )

                for install in db_sentry.client_object_dir_device.objects.filter(
                        object_id = task_set.object.id,
                        uninstall_date = None,
                        is_active = 1 ):
                    install.uninstall_date = task_set.complete_date
                    install.uninstall_user_id = report_set.user_id
                    install.device.checkPriority()
                    install.save()

                if task_set.contract:
                    data['contract_status'] = task_set.contract.check_contract_status()

            ### Подключение ОУ
            elif task_set.task_type_id == 7:
                data['task_type'] = 'Подключение ОУ'.decode('utf-8')
                if task_set.device:
                    install = db_sentry.client_object_dir_device.objects.create(
                        object_id = task_set.object.id,
                        device_id = task_set.device.id,
                        install_date = datetime.datetime.now(),
                        install_user_id = task_set.doer.id
                    )
                    install.device.checkPriority()

            ### Снятие ОУ
            elif task_set.task_type_id == 8:
                data['task_type'] = 'Снятие ОУ'.decode('utf-8')
                install = db_sentry.client_object_dir_device.objects.filter(
                    object_id = task_set.object.id,
                    device_id = task_set.device.id,
                    is_active = 1
                )
                install.uninstall_date = task_set.complete_date
                install.uninstall_user_id = report_set.user_id
                install.save()
                install.device.checkPriority()

        data['status'] = db_sentry.client_bind.objects.filter(client_object=task_set.object.id, is_active=1).first().check_bind_status()
        data['answer'] = 'done'
    #object_event_ajax.event_update(request);


    return data


def delete_report(request, data):
    task_report = task_models.task_report.objects.get(id=int(request.GET['report']))
    task_report.is_active = 0
    task_report.save()
    if task_report.status.label == 'done':
        task = task_models.task.objects.get(id=task_report.task.id)
        if not task_models.task_report.objects.filter(task=task.id, is_active=1).exists():
            task.status_id = 2
            task.save()
    data['answer'] = 'done'
    return data


def get_log(request, data):
    log_set = task_models.task_log.objects.get(id=int(request.GET['log_id']))
    data['log'] = {
        'id': log_set.id,
        'create_date': log_set.create_date.strftime("%d.%m.%Y %H:%M"),
        'create_user_id': log_set.user.id,
        'create_user': log_set.user.full_name,
        'old_date': log_set.old_date.strftime("%d.%m.%Y"),
        'new_date': log_set.new_date.strftime("%d.%m.%Y"),
        'comment': log_set.comment
    }
    return data


def change_complete_date(request, data):
    new_date = date_convert.convert(request.POST['new_date'])
    task_set = task_models.task.objects.get(id=int(request.POST['task_id']))
    task_models.task_log.objects.create(
        task_id = task_set.id,
        create_date = datetime.datetime.now(),
        user_id = authorize.get_sentry_user(request)['id'],
        old_date = task_set.complete_date,
        new_date = new_date,
        comment = request.POST['comment']
    )
    task_set.complete_date = new_date
    task_set.save()
    data['answer'] = 'done'
    return data


def delete_log(request, data):
    task_models.task_log.objects.filter(id=int(request.GET['log_id'])).update(is_active=0)
    data['answer'] = 'done'
    return data
