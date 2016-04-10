# -*- coding: utf-8 -*-

from apps.profile import User
from apps.system import models as db_sentry


def check():
    count = 0
    '''
    for log in db_sentry.sentry_log.objects.filter(noticed=0).exclude(client_object=None):
        perm = 'sentry.'+log.log_type.codename
        for user in db_sentry.auth_user.objects.all().exclude(sentry_user=None):
            auth_user = User.objects.get(id=user.id)
            if auth_user.has_perm(perm):
                db_sentry.sentry_log_notice.objects.get_or_create(
                    sentry_log_id = log.id,
                    sentry_user_id = user.sentry_user_id
                )
        count += 1
        log.noticed = 1
        log.save()
    '''
    print 'Notice: '+str(count)

