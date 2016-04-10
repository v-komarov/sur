# -*- coding: utf-8 -*-

import datetime
from sentry.models import db_security, db_sentry


def create(object_id=None, event_id=None, previous_dir_event_id=None, dir_event_id=None, user_id=None):
    log = db_sentry.event_log.objects.create(
        object_id = object_id,
        event_id = event_id,
        previous_dir_event_id = previous_dir_event_id,
        dir_event_id = dir_event_id,
        user_id = user_id
    )

    return log.id
