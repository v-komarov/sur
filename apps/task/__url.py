#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

from apps.task import task
import task_renter


# Заявки
urlpatterns = [
    url(r'^$', task.index),
    url(r'^ajax/(?P<action>\w{1,32})/$', task.ajax),
    url(r'^renter/$', task_renter.renter),
    url(r'^renter/ajax/(?P<action>\w{1,32})/$', task_renter.ajax),
    url(r'^add/$', task.add),
    ]