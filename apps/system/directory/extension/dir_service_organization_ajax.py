# -*- coding: utf-8 -*-

from apps.system import models as db_sentry
from apps.system.directory.extension import dir__form


def get(request,data):
    company_set = db_sentry.dir_service_organization.objects \
        .filter(id=int(request.GET['company_id'])) \
        .values('id', 'name', 'license',
                'address_locality_id', 'address_locality__name', 'address_locality__region_id', 'address_locality__region__name',
                'address', 'address_index',
                'bank_id', 'bank__name', 'bank__bik', 'bank__correspondent_account',
                'phone', 'fax', 'inn', 'kpp', 'bank_account', 'director')
    data['company'] = [item for item in company_set]
    return data


def search(request,data):
    company_set = db_sentry.dir_service_organization.objects.filter(is_active=1) \
        .values('id','name')
    if request.GET['name'] != '':
        company_set = company_set.filter(name__icontains=request.GET['name'])
    data['company'] = [item for item in company_set]
    return data


def create(request,data):
    form = dir__form.dir_service_organization_form(request.POST)
    if form.is_valid():
        organization = form.save()
        data['answer'] = 'done'
    else:
        data['errors'] = form.errors
    return data


def update(request, data):
    organization = db_sentry.dir_service_organization.objects.get(id=request.POST['service_organization'])
    form = dir__form.dir_service_organization_form(request.POST, instance=organization)
    if form.is_valid():
        organization = form.save()
        data['answer'] = 'done'
    else:
        data['errors'] = form.errors
    return data


def delete(request,data):
    if db_sentry.client_contract.objects.filter(
            service_organization = int(request.GET['service_organization']),
            is_active = 1
    ).exists():
        data['error'] = 'Есть объекты под охраной этой организации'.decode('utf-8')
    else:
        db_sentry.dir_service_organization.objects \
            .filter(id=int(request.GET['service_organization'])) \
            .update(is_active=0)
    return data
