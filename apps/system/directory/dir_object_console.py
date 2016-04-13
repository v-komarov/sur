# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry


def index(request, client_id=None):
    if request.user.has_perm('cabinet.client'):
        if request.is_ajax() and request.method == 'GET':
            data = {}
            data['error'] = None
            if request.GET['action'] == 'search':
                console_set = db_sentry.dir_device_console.objects.filter(is_active=1).values('id','name','description')
                if request.GET['console_name'] != '':
                    console_set = console_set.filter(name__icontains=request.GET['console_name'])
                if request.GET['description'] != '':
                    console_set = console_set.filter(description__icontains=request.GET['description'])
                data['console'] = [item for item in console_set]

            elif request.GET['action'] == 'add':
                if request.GET['console_name'] == '':
                    data['error'] = 'Необходимо название панели.'.decode('utf-8')

                else:
                    console_set, created = db_sentry.dir_device_console.objects\
                        .get_or_create(name=request.GET['console_name'], description=request.GET['description'], is_active=1)
                    data['console'] = [{'id': console_set.id, 'name': console_set.name, 'description': console_set.description }]

            elif request.GET['action'] == 'save':
                console = db_sentry.dir_device_console.objects\
                    .filter(name=request.GET['console_name']).exclude(id=int(request.GET['console_id']))
                if console.exists():
                    data['error'] = 'Уже есть такая панель.'.decode('utf-8')
                else:
                    db_sentry.dir_device_console.objects.filter(id=int(request.GET['console_id']))\
                        .update( name = request.GET['console_name'] )

            elif request.GET['action'] == 'remove':
                client = db_sentry.client_object.objects.filter(console_id=int(request.GET['console_id']))
                if client.exists():
                    data['error'] = 'Невозможно удалить эту запись'.decode('utf-8')
                else:
                    db_sentry.dir_device_console.objects.get(id=int(request.GET['console_id'])).delete()


            data = json.dumps(data, ensure_ascii=False)
            return HttpResponse(data)

        else:
            title = 'Список пультов'
            console_set = db_sentry.dir_device_console.objects.filter(is_active=1)
            return render_to_response('system/directory/dir_object_console.html', locals(), RequestContext(request))
    else:
        return render_to_response('404.html', RequestContext(request))

