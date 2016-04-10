# -*- coding: utf-8 -*-

from threading import Thread
import time
from django.shortcuts import render_to_response

from apps.system import models as db_sentry


def start(request):
    if request.user.is_superuser:
        interval = 1 * 60
        while 1:
            start_time = time.time()

            # Cron
            db_sentry.sentry_log_notice.objects.create(
                sentry_log_id = 31047,
                sentry_user_id = 94,
                sight = 1 )

            time.sleep(max(0, start_time + interval - time.time()))
        Thread(target=start_parser)
    else:
        return render_to_response('sentry/403.html', locals(), RequestContext(request))
