# -*- coding: utf-8 -*-

from apps.system import models as db_sentry
from apps.toolset import date_convert
from apps.system.client.extension import client__form
from apps.system.directory.extension import dir_device_ajax


def get(request,data):
    if 'service_id' in request.GET:
        device_install_set = db_sentry.client_object_dir_device.objects \
            .filter(service_id=int(request.GET['service_id']), is_active=1)
    elif 'device_install_id' in request.GET:
        device_install_set = db_sentry.client_object_dir_device.objects \
            .filter(id=int(request.GET['device_install_id']))

    try:
        bind = db_sentry.client_bind.objects.get(id=int(request.GET['bind_id']))
    except:
        bind = None

    data['device_install_list'] = []
    for item in device_install_set:
        try: install_date = item.install_date.strftime("%d.%m.%Y")
        except: install_date = ''
        try:
            uninstall_date = item.uninstall_date.strftime("%d.%m.%Y")
            uninstall_user__full_name = item.uninstall_user.full_name
        except:
            uninstall_date = ''
            uninstall_user__full_name = ''
        install = {
            'id': item.id,
            'device_id': item.device_id,
            'device__name': item.device.name,
            'device__series': item.device.series,
            'device__number': item.device.number,
            'priority': item.priority,
            'install_date': install_date,
            'install_user_id': item.install_user_id,
            'install_user__full_name': item.install_user.full_name,
            'uninstall_date': uninstall_date,
            'uninstall_user_id': item.uninstall_user_id,
            'uninstall_user__full_name': uninstall_user__full_name,
            'password': item.password,
            'comment': item.comment
        }
        if bind:
            install['data'] = bind.data
        data['device_install_list'].append(install)
    return data


def get_device_install_list(service_id):
    device_install_list = []
    for item in db_sentry.client_object_dir_device.objects.filter(service_id=service_id, uninstall_date=None, is_active=1):
        item_array = {
            'device_install_id': item.id,
            'device_id': item.device.id,
            'device__name': item.device.name,
            'priority': item.priority,
            'comment': item.comment
        }
        if item.install_user_id:
            item_array['install_date'] = item.install_date.strftime("%d.%m.%Y")
            item_array['install_user_id'] = item.install_user.id
            item_array['install_user__full_name'] = item.install_user.full_name
        if item.uninstall_user_id:
            item_array['install_date'] = item.install_date.strftime("%d.%m.%Y")
            item_array['uninstall_user_id'] = item.uninstall_user.id
            item_array['uninstall_user__full_name'] = item.uninstall_user.full_name

        try:
            item_array['log_user_id'] = item.client_object_event_log_set.all().first().user.id
            item_array['log_user'] = item.client_object_event_log_set.all().first().user.full_name
            item_array['log_date'] = item.client_object_event_log_set.all().first().date.strftime("%d.%m.%Y %H:%M")
        except: pass
        device_install_list.append(item_array)
    return device_install_list


def install_update(request, data):
    #bind = db_sentry.client_bind.objects.get(id=int(request.POST['bind']))
    object = db_sentry.client_object.objects.get(id=int(request.POST['object']))
    try:
        install = db_sentry.client_object_dir_device.objects.get(id=int(request.POST['device_install']))
        form = client__form.client_object_dir_device_form(request.POST, instance=install)
    except:
        form = client__form.client_object_dir_device_form(request.POST)

    if form.is_valid():
        install = form.save()
        data['priority'] = dir_device_ajax.check_priority(install.device_id)
        data['install.device_id'] = install.device_id

        data['status'] = db_sentry.client_bind.objects.filter(client_object=object.id, is_active=1).first().check_bind_status()

        #bind.data = request.POST['data']
        #bind.save()

        #data['status'] = object.client_bind.check_bind_status()
        #data['status'] = object.check_object_status()
        data['answer'] = 'done'
    else:
        data['errors'] = form.errors

    return data


def install_delete(request,data):
    device_install_set = db_sentry.client_object_dir_device.objects.get(id=int(request.GET['device_install_id']))
    object = db_sentry.client_object.objects.get(id=device_install_set.object_id)
    device_install_set.is_active = 0
    device_install_set.save()
    #device_install_set.object.check_status()
    dir_device_ajax.check_priority(device_install_set.device_id)
    data['status'] = db_sentry.client_bind.objects.filter(client_object=object.id, is_active=1).first().check_bind_status()
    data['answer'] = 'done'
    return data


