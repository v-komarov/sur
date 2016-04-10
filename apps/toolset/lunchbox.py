# -*- coding: utf-8 -*-

import datetime
import json

from apps.system import models as db_sentry
from apps.system.sentry_user import authorize


def get(request):
    data = {'permissions':[]}
    for permission in request.user.get_all_permissions():
        data['permissions'].append(permission.encode('ascii'))

    setting_set = db_sentry.setting_general.objects.get(user=None)
    sentry_user = authorize.get_sentry_user(request)
    data['setting'] = {
        'sentry_user_id': sentry_user['id'],
        'sentry_user_full_name': sentry_user['full_name'],
        'today': datetime.datetime.now().strftime("%d.%m.%Y"),
        'region': setting_set.region_id,
        'locality': setting_set.locality_id,
        'contract_string': setting_set.contract_string
    }
    try:
        data['setting']['manager'] = setting_set.manager_id
        data['setting']['manager_full_name'] = setting_set.manager.full_name
    except: pass
    try:
        data['setting']['warden'] = setting_set.warden_id
        data['setting']['warden_full_name'] = setting_set.warden.full_name
    except: pass
    try:
        data['setting']['programmer'] = setting_set.programmer_id
        data['setting']['programmer_full_name'] = setting_set.programmer.full_name
    except: pass
    try:
        data['setting']['technician'] = setting_set.technician_id
        data['setting']['technician_full_name'] = setting_set.technician.full_name
    except: pass

    data['setting']['search'] = []
    for item in db_sentry.setting_interface.objects.filter(section='search'):
        data['setting']['search'].append({
            'label': item.label,
            'side': item.side,
            'position': item.position
        })

    data['bonus'] = {}
    for bonus in db_sentry.dir_client_workflow_type.objects.filter(type='bonus', is_active=1):
        data['bonus'][bonus.label] = {
            'name': bonus.name,
            'description': bonus.description }
        try: data['bonus'][bonus.label]['cost'] = str(bonus.cost)
        except: pass
        try:
            data['bonus'][bonus.label]['sentry_user_id'] = bonus.sentry_user_id
            data['bonus'][bonus.label]['sentry_user_full_name'] = bonus.sentry_user.full_name
        except: pass

    return json.dumps(data, ensure_ascii=False)