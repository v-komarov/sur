# -*- coding: utf-8 -*-

from apps.system import models as db_sentry


def search(request,data):
    weapon_set = db_sentry.dir_weapon.objects \
        .filter(is_active=1) \
        .values('id','series','number','weapon_type__name','service_organization__name','comment')
    if request.GET['series']!='':
        weapon_set = weapon_set.filter(series__icontains=request.GET['series'])
    if request.GET['number']!='':
        weapon_set = weapon_set.filter(number__icontains=request.GET['number'])
    if request.GET['weapon_type_id']!='all':
        weapon_set = weapon_set.filter(weapon_type_id=int(request.GET['weapon_type_id']))
    if request.GET['company_id']!='all':
        weapon_set = weapon_set.filter(service_organization=int(request.GET['company_id']))
    if request.GET['comment']!='':
        weapon_set = weapon_set.filter(comment__icontains=request.GET['comment'])
    data['weapon'] = [item for item in weapon_set]
    return data


def get(request,data):
    weapon_set = db_sentry.dir_weapon.objects \
        .filter(id=int(request.GET['weapon_id'])) \
        .values('id','series','number','weapon_type_id','service_organization_id','comment')
    data['weapon'] = [item for item in weapon_set]
    return data


def create(request,data):
    if request.GET['series']=='':
        data['error'] = 'Нужна серия.'.decode('utf-8')
    else:
        weapon_set, created = db_sentry.dir_weapon.objects.get_or_create(
            series = request.GET['series'],
            number = request.GET['number'],
            weapon_type_id = request.GET['weapon_type_id'],
            service_organization_id = request.GET['company_id'],
            comment = request.GET['comment'],
            is_active=1 )
        data['weapon_id'] = weapon_set.id
    return data


def update(request,data):
    if db_sentry.dir_weapon.objects \
            .filter(series=request.GET['series'], number=request.GET['number']) \
            .exclude(id=int(request.GET['weapon_id'])) \
            .exists():
        data['error'] = 'Уже есть оружие с такой серией и номером.'.decode('utf-8')
    else:
        db_sentry.dir_weapon.objects.filter(id=int(request.GET['weapon_id'])) \
            .update(
            series = request.GET['series'],
            number = request.GET['number'],
            weapon_type = request.GET['weapon_type_id'],
            service_organization = request.GET['company_id'],
            comment = request.GET['comment'] )
    return data


def delete(request,data):
    if db_sentry.client_object_service_calculation.objects \
            .filter(weapon_id=int(request.GET['weapon_id'])) \
            .exists():
        data['error'] = 'С этим оружием есть запись в таблице постов'.decode('utf-8')
    else:
        db_sentry.dir_weapon.objects.get(id=int(request.GET['weapon_id'])).delete()
    return data


