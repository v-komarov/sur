#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url
from apps.post import timetable, personal, checkpoint

urlpatterns = [
    url(r'^checkpoint/$', checkpoint.index),
    url(r'^checkpoint/ajax/(?P<action>\w{1,32})/$', checkpoint.ajax),

    url(r'^timetable/$', timetable.index),
    url(r'^timetable/(?P<action>\w{1,32})/$', timetable.ajax),

    url(r'^personal/$', personal.index),
    url(r'^personal/ajax/(?P<action>\w{1,32})/$', personal.ajax),
    url(r'^personal/set_status/$', personal.set_status),
]