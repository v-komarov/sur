# -*- coding: utf-8 -*-

from apps.system import models as db_sentry


def search(request,data):
    holding_set = db_sentry.dir_holding.objects.filter(is_active=1).values('id','name')
    if request.GET['holding_name']!='':
        holding_set = holding_set.filter(name__icontains=request.GET['holding_name'])
    if 'limit' in request.GET and request.GET['limit'] != '':
        holding_set = holding_set[:int(request.GET['limit'])]
    data['holding'] = [item for item in holding_set]
    return data


def create(request,data):
    if 'holding_name' not in request.GET or request.GET['holding_name']=='':
        data['error'] = 'Впишите название холдинга.'.decode('utf-8')
    else:
        holding_set, created = db_sentry.dir_holding.objects \
            .get_or_create(name = request.GET['holding_name'], is_active=1)
        data['holding'] = [{
                               'id': holding_set.id,
                               'name': holding_set.name }]
    return data


def update(request,data):
    if db_sentry.dir_holding.objects \
            .filter(name=request.GET['holding_name']) \
            .exclude(id=int(request.GET['holding_id'])) \
            .exists():
        data['error'] = 'Уже есть такой населенный пункт.'.decode('utf-8')
    else:
        db_sentry.dir_holding.objects \
            .filter(id=int(request.GET['holding_id'])) \
            .update( name = request.GET['holding_name'] )
    return data


def delete(request,data):
    if db_sentry.client.objects \
            .filter(holding_id=int(request.GET['holding_id'])) \
            .exists():
        data['error'] = 'Невозможно удалить эту запись'.decode('utf-8')
    else:
        db_sentry.dir_holding.objects \
            .get(id=int(request.GET['holding_id'])) \
            .delete()
    return data



