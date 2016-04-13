# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry
from apps.toolset import lunchbox


def index(request, client_id=None, object_id=None):
    if request.user.has_perm('cabinet.manager_objects'):
        request.session['lunchbox'] = lunchbox.get(request)
        contract_id = db_sentry.client_object_service.objects.filter(contract_id=None,object_id=object_id,is_active=1).first().id
        status_list = ['новый','подключен']
        client_name = db_sentry.client.objects.get(id=client_id).name
        objects_set = db_sentry.client_object.objects.filter(id=object_id, is_active=1)
        service_set = db_sentry.client_object_service.objects.filter(
            object__client = client_id,
            status__name__in = status_list,
            is_active = 1 )

        return render_to_response('system/client/object_armory.html', locals(), RequestContext(request))
    else:
        return render_to_response('404.html', RequestContext(request))


def action(request, client_id=None, object_id=None, action=None):
    if request.user.has_perm('cabinet.manager_objects'):
        data = {}
        data['error'] = None

        if request.is_ajax() and request.method == 'GET':
            if action=='get_armory':
                data['armory'] = {}
                data['armory_select'] = {}
                service_id = int(request.GET['select_id'])
                security_company_id = db_sentry.client_object_service.objects.get(id=service_id).security_company_id
                for armory in db_sentry.dir_armory.objects.filter(security_company=security_company_id, is_active=1):
                    data['armory_select'][armory.id] = {
                        'name': armory.weapon.name,
                        'number': armory.number,
                        'series': armory.series }
                if request.GET['select_level']=='service':
                    for armory in db_sentry.client_object_service_armory.objects.filter(service_id=service_id, is_active=1):
                        data['armory'][armory.armory.id] = {
                            'id': armory.id,
                            'name': armory.armory.weapon.name,
                            'series': armory.armory.series,
                            'number': armory.armory.number,
                            'comment': armory.comment }
                        #del data['armory_select'][armory.armory.id]

            return HttpResponse( json.dumps(data, ensure_ascii=False))


        elif request.is_ajax() and request.method=='POST':

            if action=='save_armory':
                if request.POST['service_armory_id']=='add':
                    service_armory_set = db_sentry.client_object_service_armory.objects \
                        .create(
                        service_id = int(request.POST['service_id']),
                        armory_id = int(request.POST['armory_id']),
                        comment = request.POST['comment'],
                        is_active = 1 )
                    data['service_armory_id'] = service_armory_set.id
                else:
                    db_sentry.client_object_service_armory.objects \
                        .filter( id = int(request.POST['service_armory_id'])) \
                        .update(
                        armory = int(request.POST['armory_id']),
                        comment = request.POST['comment'] )
                armed = 1

            elif action=='remove_armory':
                db_sentry.client_object_service_armory.objects \
                    .get(id=int(request.POST['service_armory_id'])) \
                    .delete()

                if db_sentry.client_object_service_armory.objects \
                        .filter(service_id=int(request.POST['service_id']), is_active=1) \
                        .exists():
                    armed = 1
                else: armed = 0

            db_sentry.client_object_service.objects \
                .filter(id=int(request.POST['service_id'])) \
                .update(armed=armed)

            return HttpResponse( json.dumps(data, ensure_ascii=False) )
