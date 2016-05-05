#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

from config import objects, codes
from apps.monitor.operator import views, operator


import sentry_socket

urlpatterns = [
    #url(r'^$', objects.index),

    # Operator interface
    url(r'^operator/$', views.main),
    url(r'^operator/getdata/$', operator.GetOperatorData),

]
