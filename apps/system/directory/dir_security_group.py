# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect

from apps.system import models as db_sentry

def redirect_(request):
    return redirect('/system/settings/groups/')

def index(request, client_id=None):
    if request.user.has_perm('cabinet.client'):
        
        if request.is_ajax() and request.method == 'GET':
            data = {}
            data['error'] = None
            if request.GET['action'] == 'search':
                group_set = db_sentry.dir_security_group.objects.filter(is_active=1).values('id','name')
                if request.GET['group_name'] != '':
                    group_set = group_set.filter(name__icontains=request.GET['group_name'])
                data['group'] = [item for item in group_set]

            elif request.GET['action'] == 'add':
                if request.GET['group_name'] == '':
                    data['error'] = 'Необходимо название холдинга.'.decode('utf-8')

                else:
                    group_set, created = db_sentry.dir_security_group.objects\
                        .get_or_create(name = request.GET['group_name'], is_active=1)
                    data['group'] = [{ 'id': group_set.id, 'name': group_set.name }]

            elif request.GET['action'] == 'save':
                group = db_sentry.dir_security_group.objects\
                    .filter(name=request.GET['group_name']).exclude(id=int(request.GET['group_id']))
                if group.exists():
                    data['error'] = 'Уже есть такая группа.'.decode('utf-8')
                else:
                    db_sentry.dir_security_group.objects.filter(id=int(request.GET['group_id']))\
                        .update( name = request.GET['group_name'] )

            elif request.GET['action'] == 'remove':
                client = db_sentry.client_object.objects.filter(security_group_id=int(request.GET['group_id']))
                if client.exists():
                    data['error'] = 'Невозможно удалить эту запись'.decode('utf-8')
                else:
                    db_sentry.dir_security_group.objects.get(id=int(request.GET['group_id'])).delete()


            data = json.dumps(data, ensure_ascii=False)
            return HttpResponse(data)

        else:
            title = 'Список ГБР'
            return render_to_response('system/directory/dir_security_group.html', locals(), RequestContext(request))
    else:
        return render_to_response('404.html', RequestContext(request))

