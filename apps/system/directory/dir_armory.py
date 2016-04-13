# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from apps.system import models as db_sentry


def index(request, client_id=None):
    if request.user.has_perm('cabinet.client'):

        if request.is_ajax() and request.method == 'GET':
            data = {}
            data['error'] = None

            if request.GET['action'] == 'get':
                armory_set = db_sentry.dir_armory.objects.filter(id=int(request.GET['armory_id']))\
                    .values('id','series','number','weapon_id','security_company_id','comment')
                data['armory'] = [item for item in armory_set]

            elif request.GET['action'] == 'search':
                armory_set = db_sentry.dir_armory.objects.filter(is_active=1)\
                    .values('id','series','number','weapon__name','security_company__name','comment')
                if request.GET['series'] != '':
                    armory_set = armory_set.filter(series__icontains=request.GET['series'])
                if request.GET['number'] != '':
                    armory_set = armory_set.filter(number__icontains=request.GET['number'])
                if request.GET['weapon_id'] != 'all':
                    armory_set = armory_set.filter(weapon_id=int(request.GET['weapon_id']))
                if request.GET['company_id'] != 'all':
                    armory_set = armory_set.filter(security_company=int(request.GET['company_id']))
                if request.GET['comment'] != '':
                    armory_set = armory_set.filter(comment__icontains=request.GET['comment'])

                data['armory'] = [item for item in armory_set]

            elif request.GET['action'] == 'add':
                if request.GET['series'] == '':
                    data['error'] = 'Нужна серия.'.decode('utf-8')

                else:
                    armory_set, created = db_sentry.dir_armory.objects.get_or_create(
                        series = request.GET['series'],
                        number = request.GET['number'],
                        weapon_id = request.GET['weapon_id'],
                        security_company_id = request.GET['company_id'],
                        comment = request.GET['comment'],
                        is_active=1 )
                    data['armory_id'] = armory_set.id

            elif request.GET['action'] == 'save':
                armory_set = db_sentry.dir_armory.objects\
                    .filter(series=request.GET['series'], number=request.GET['number']).exclude(id=int(request.GET['armory_id']))
                if armory_set.exists():
                    data['error'] = 'Уже есть оружие с такой серией и номером.'.decode('utf-8')
                else:
                    db_sentry.dir_armory.objects.filter(id=int(request.GET['armory_id'])).update(
                        series=request.GET['series'],
                        number=request.GET['number'],
                        weapon=request.GET['weapon_id'],
                        security_company=request.GET['company_id'],
                        comment=request.GET['comment'] )

            elif request.GET['action'] == 'remove':
                client = db_sentry.client_object_calculation.objects.filter(armory_id=int(request.GET['armory_id']))
                if client.exists():
                    data['error'] = 'Невозможно удалить эту запись'.decode('utf-8')
                else:
                    db_sentry.dir_armory.objects.get(id=int(request.GET['armory_id'])).delete()

            data = json.dumps(data, ensure_ascii=False)
            return HttpResponse(data)

        else:
            title = 'Справочник оружия'
            weapon_set = db_sentry.dir_armory_weapon.objects.filter(is_active=1)
            company_set = db_sentry.dir_security_company.objects.filter(is_active=1)

            return render_to_response('system/directory/dir_armory.html', locals(), RequestContext(request))
    else:
        return render_to_response('404.html', RequestContext(request))

