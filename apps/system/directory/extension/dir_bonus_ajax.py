# -*- coding: utf-8 -*-

import decimal

from apps.system import models as db_sentry


def get(request,data):
    bonus_set = db_sentry.dir_client_workflow_type.objects.get(id=int(request.GET['bonus_id']))
    data['bonus'] = {
        'id': bonus_set.id,
        'label': bonus_set.label,
        'name': bonus_set.name,
        'description': bonus_set.description }
    if bonus_set.cost: data['bonus']['cost'] = str(bonus_set.cost)
    if bonus_set.sentry_user_id:
        data['bonus']['sentry_user_id'] = bonus_set.sentry_user_id
        data['bonus']['sentry_user'] = bonus_set.sentry_user.full_name
    return data


def search(request,data):
    bonus_set = db_sentry.dir_client_workflow_type.objects.filter(type='bonus',is_active=1) \
        .values('id','label','name','description')
    if request.GET['name'] != '':
        bonus_set = bonus_set.filter(name__icontains=request.GET['name'])
    data['bonus_list'] = [item for item in bonus_set]
    return data


def update(request,data):
    if 'bonus_id' in request.POST:
        bonus_set = db_sentry.dir_client_workflow_type.objects.get(id=request.POST['bonus_id'])
    else:
        bonus_set = db_sentry.dir_client_workflow_type.objects.create(type='bonus')
    bonus_set.label = request.POST['label']
    bonus_set.name = request.POST['name']
    if 'description' in request.POST: bonus_set.description = request.POST['description']
    else: bonus_set.description = None
    if 'cost' in request.POST: bonus_set.cost = decimal.Decimal(request.POST['cost'])
    else: bonus_set.cost = None
    if 'sentry_user_id' in request.POST: bonus_set.sentry_user_id = int(request.POST['sentry_user_id'])
    else: bonus_set.sentry_user_id = None
    bonus_set.save()
    data['answer'] = 'done'
    return data


def delete(request,data):
    if db_sentry.client_workflow.objects \
            .filter(workflow_type=int(request.GET['bonus_id']), is_active=1) \
            .exists():
        data['error'] = 'Этот бонус используется и не может быть удален'.decode('utf-8')
    else:
        db_sentry.dir_client_workflow_type.objects \
            .filter(id=int(request.GET['bonus_id'])) \
            .update(is_active=0)
    return data
