#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

import apps.analytics.analytics
from apps.analytics import statistics, analytics

urlpatterns = [
    url(r'^$', analytics.incident),
    url(r'^ajax/(?P<action>\w{1,32})/$', analytics.ajax),
    url(r'^statistics/$', statistics.index),
    url(r'^statistics/ajax/(?P<action>\w{1,32})/$', statistics.ajax),
    ]