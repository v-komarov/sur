#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import include, url

from client import search
from apps.system import roadside
#from apps.cabinet.requests import requests_roadside as mng_requests_roadside


urlpatterns = [
    url(r'^$', search.index),
    # Клиенты / объекты
    url(r'^client/', include('apps.system.client.__url')),
    # Посты
    url(r'^post/', include('apps.post.__url')),
    # Финансы
    url(r'^finance/', include('apps.finance.__url')),
    # Аналитика
    url(r'^analytics/', include('apps.analytics.__url')),
    # Справочники
    url(r'^directory/', include('apps.system.directory.__url')),
    # Пользователи
    url(r'^sentry_user/', include('apps.system.sentry_user.__url')),
    # Настройки
    url(r'^setting/', include('apps.system.setting.__url')),


    #url(r'^requests/roadside/$', mng_requests_roadside.list), # Список заявок «Помощь на дороге»
    #url(r'^requests/roadside/status/(?P<status>\w{1,13})/$', mng_requests_roadside.list),

    #url(r'^roadside_confirm/(?P<response>\w{1,11})/(?P<request_id>\d{1,11})/$', roadside.reg_response),
    #url(r'^roadside/$', roadside.show),

]