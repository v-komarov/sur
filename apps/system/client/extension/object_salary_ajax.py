# -*- coding: utf-8 -*-

import datetime
from decimal import *

from apps.system import models as db_sentry
from apps.system.client.extension import client__form


def get(request,data):
    service_id = request.POST['service_id']
    service_salary_id = request.POST['service_salary_id']
    service_salary_set = db_sentry.client_object_service_salary.objects.get(id=service_salary_id)
    try: begin_date = service_salary_set.begin_date.strftime("%d.%m.%Y")
    except: begin_date = None
    data['service_salary'] = {
        'service__name': service_salary_set.service.name,
        'salary_type': service_salary_set.salary_type,
        'salary': str(service_salary_set.salary),
        'begin_date': begin_date
    }
    if request.POST['from_log']=='false' :
        service_salary_set = db_sentry.client_object_service_salary.objects \
            .filter(service_id=service_id, is_active=1).order_by('-begin_date')
        data['service_salary_log_cnt'] = service_salary_set.count()-1
        data['service_salary_log'] = []
        for item in service_salary_set:
            data['service_salary_log'].append({
                'service_salary_id': item.id,
                'salary': str(item.salary),
                'salary_type': item.salary_type,
                'begin_date': item.begin_date.strftime("%d.%m.%Y")
            })

    return data


def update(request,data):
    form = client__form.service_salary(request.POST)
    if form.is_valid():
        if request.POST['service_salary_id'] == 'None':
            service_salary_set = db_sentry.client_object_service_salary.objects.create(
                service_id = int(request.POST['service_id']),
                salary = Decimal(request.POST['salary']),
                begin_date = datetime.date(int(request.POST['begin_date'][-4:]),int(request.POST['begin_date'][3:5]),int(request.POST['begin_date'][:2])),
                salary_type = request.POST['salary_type'],
                is_active = 1 )
            service_salary_id = service_salary_set.id
            data['service_salary_new_id'] = service_salary_id
        else:
            service_salary_id = int(request.POST['service_salary_id'])
            service_salary_set = db_sentry.client_object_service_salary.objects.get(id=service_salary_id)
        service_salary_set.salary_type = request.POST['salary_type']
        service_salary_set.salary = float(Decimal(request.POST['salary']))
        service_salary_set.begin_date = datetime.date(int(request.POST['begin_date'][-4:]),int(request.POST['begin_date'][3:5]),int(request.POST['begin_date'][:2]))
        service_salary_set.save()

    else:
        data['error'] = form.errors

    return data

