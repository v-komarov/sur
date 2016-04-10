#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

from config import objects, codes
from apps.monitor.operator import index, operator


import sentry_socket

urlpatterns = [
    #url(r'^$', objects.index),

    # Operator interface
    url(r'^operator/$', index.index),
    url(r'^operator/getdata/$', operator.GetOperatorData),
#    url(r'^operator/refresh/events/$', refresh.events),
#    url(r'^operator/refresh/objects/$', refresh.objects),
#    url(r'^operator/alarm/$', event_alarm.index),

#    url(r'^objects/$', objects.index),
#    url(r'^objects/save_wires/$', objects.save_wires),
#    url(r'^codes/$', codes.index),
#    url(r'^codes/save/$', codes.save),

#    url(r'^get/event/$', get.event),
#    url(r'^get/alarm/$', get.event),
#    url(r'^get/object/$', get.object),
#    url(r'^get/search_object/$', get.search_object),

#    url(r'^socket/$', sentry_socket.index),

#    url(r'^test/$', index.test),

#    url(r'^roadside_confirm/(?P<response>\w{1,11})/(?P<request_id>\d{1,11})/$', roadside.reg_response),
#    url(r'^roadside/$', roadside.show),

]
