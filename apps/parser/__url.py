#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

from apps.parser import loker

urlpatterns = [
    url(r'^loker/$', loker.index),

#    url(r'^checkpoint/ajax/(?P<action>\w{1,32})/$', checkpoint.ajax),

]