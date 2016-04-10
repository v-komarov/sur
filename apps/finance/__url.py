#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

from apps.finance import finance

urlpatterns = [
    url(r'^$', finance.balance),
    url(r'^bonus/$', finance.bonus),
    url(r'^export/$', finance.export),
    url(r'^ajax/(?P<action>\w{1,32})/$', finance.ajax),
]
