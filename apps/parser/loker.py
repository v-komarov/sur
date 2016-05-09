# -*- coding: utf-8 -*-

import json
import datetime

from django.contrib import auth
from django.contrib.auth.models import User, UserManager
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models
from apps.parser import db_loker
from apps.parser import truncate


def index(request):
    title = 'Parser loker'

    if 'client' in request.GET:
        truncate.table('default','client_contract')
        truncate.table('default','client_contract_dir_service_subtype')
        truncate.table('default','client_bind')
        truncate.table('default','client_bind_cost')
        truncate.table('default','client_bind_dir_tag')
        truncate.table('default','client_object_dir_device')
        truncate.table('default','client_workflow')
        truncate.table('default','system_parser_debug')

        models.parser_debug.objects.create(comment='test, start')

        for service in db_loker.client_object_service.objects.using('loker').filter(contract=None):
            contract = models.client_contract.objects.create(
                client_id = service.object.client_id,
                name = service.contract_number,
                service_type_id = service.service_type_id,
                begin_date = service.begin_date,
                end_date = service.end_date,
                service_organization_id = service.service_organization_id,
                comment = service.comment,
                is_active = service.is_active
            )
            for subtype in service.dir_service_subtype.all():
                contract.dir_service_subtype.add(subtype.id)

            if 'event' in request.GET:
                for event in service.client_object_event_set.filter(is_active=1):
                    workflow = models.client_workflow.objects.create(
                        contract_id = contract.id,
                        sentry_user_id = event.sentry_user_id,
                        workflow_type_id = event.event_type_id
                    )
                    if event.event_date: workflow.workflow_date = event.event_date
                    workflow.save()


            for object in db_loker.client_object_service.objects.using('loker').filter(contract=service.id, is_active=1):
                bind = models.client_bind.objects.create(
                    client_contract_id = contract.id,
                    client_object_id = object.object_id,
                    console_id = object.console_id,
                    console_number = object.console_number,
                    is_active = object.is_active
                )
                models.client_object.objects.filter(id=object.object_id).update(
                    security_squad_id = object.security_squad_id,
                    )
                for subtype in object.dir_service_subtype.all():
                    bind.dir_service_subtype.add(subtype.id)
                for dir_tag in object.object.dir_tag.all():
                    bind.dir_tag.add(dir_tag.id)

                if 'cost' in request.GET:
                    for cost in object.client_object_service_cost_set.filter(is_active=1):
                        if cost.charge_month_id and cost.charge_month_day:
                            bind.charge_month_day = cost.charge_month_day
                            bind.charge_month_id = cost.charge_month_id
                        if cost.cost_type:
                            new_cost = models.client_bind_cost.objects.create(
                                client_bind_id = bind.id,
                                end_date = cost.end_date,
                                cost_type_id = cost.cost_type_id,
                                cost_value = cost.cost,
                                charge_month_day = cost.charge_month_day,
                                charge_month_id = cost.charge_month_id,
                                )
                            if contract.begin_date: new_cost.begin_date = contract.begin_date
                            elif cost.begin_date: new_cost.begin_date = cost.begin_date
                            new_cost.save()

                if 'event' in request.GET:
                    for event in object.client_object_event_set.filter(is_active=1):
                        try:
                            workflow = models.client_workflow.objects.create(
                                contract_id = contract.id,
                                object_id = object.id,
                                sentry_user_id = event.sentry_user_id,
                                workflow_type_id = event.event_type_id
                            )
                            if event.event_date: workflow.workflow_date = event.event_date
                            if event.cost: workflow.cost = event.cost
                            workflow.save()
                        except:
                            models.parser_debug.objects.create(sentry_id=event.id, comment='error, client_object_event, event.id')

                if 'device' in request.GET:
                    for device in db_loker.client_object_service_dir_device.objects.using('loker').filter(service=object.id,is_active=1):
                        new_device = models.client_object_dir_device.objects.create(
                            object_id = object.id,
                            device_id = device.device_id,
                            priority = device.priority,
                            install_date = device.install_date,
                            install_user_id = device.install_user_id,
                            #uninstall_date = device.uninstall_date,
                            #uninstall_user_id = device.uninstall_user_id,
                            #password = device.password,
                            #comment = device.comment
                        )

                bind.check_bind_status()
                bind.save()

            contract.set_subtype()
            contract.check_contract_status()
            contract.save()


    return render_to_response('parser/loker.html', locals(), RequestContext(request) )
