#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

from apps.system.setting import event_groups, contract_string, search, general

# Настройки
urlpatterns = [
    url(r'^$', general.index),
    url(r'^general/$', general.index),
    url(r'^general/ajax/(?P<action>\w{1,32})/$', general.ajax),
    url(r'^contract_string/$', contract_string.index),
    url(r'^contract_string/ajax/(?P<action>\w{1,32})/$', contract_string.ajax),
    url(r'^event_groups/$', event_groups.index),
    url(r'^event_groups/ajax/(?P<action>\w{1,32})/$', event_groups.ajax),
    url(r'^search/$', search.index),
    url(r'^search/ajax/(?P<action>\w{1,32})/$', search.ajax),
]