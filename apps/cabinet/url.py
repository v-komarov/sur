#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import patterns, url

import apps.cabinet.ajax
import apps.cabinet.views_auth
from apps.cabinet import views_confirm, roadside_confirm, views_auth, ajax, views_overlord
import apps.cabinet.views_overlord
from apps.cabinet.client import info as client_info, objects, payments, payment_account, reports, objects_calc
from apps.cabinet.client import objects as client_objects
from apps.cabinet.client import objects_calc as client_objects_calc
from apps.cabinet.client import payments as client_payments
from apps.cabinet.client import payment_account as client_payment_account
from apps.cabinet.client import reports as client_reports
import apps.cabinet.roadside_confirm
from apps.cabinet.requests import requests_cabinet as mng_requests_cabinet


urlpatterns = patterns('apps.cabinet',
    url(r'^$', client_info.info),

    url(r'^list/$', views_overlord.list),
    url(r'^overlord/set_client/$', views_overlord.set_client),

    url(r'^auth/$', views_auth.cabinet_auth),
    url(r'^logout/$', views_auth.cabinet_logout),

    url(r'^get_access/$', views_auth.get_access),
    url(r'^get_restore/$', views_auth.get_restore),
    url(r'^get_peoples/$', mng_requests_cabinet.get_peoples),
    url(r'^confirm/(?P<token>\w{32})/$', views_confirm.confirm),
    url(r'^confirm_restore/(?P<token>\w{32})/$', views_confirm.confirm_restore),
    url(r'^confirm_roadside/(?P<token>\w{32})/$', roadside_confirm.confirm),

    # Client interface
    url(r'^objects/$', client_objects.objects_list),
    url(r'^objects/(?P<object_id>\d{1,11})/$', client_objects_calc.object),
    url(r'^objects/(?P<object_id>\d{1,11})/(?P<year>\d{1,4})/$', client_objects_calc.object),
    url(r'^payments/$', client_payments.payments),
    url(r'^payments/(?P<year>\d{1,10})/$', client_payments.payments),
    url(r'^payment_account/$', client_payment_account.accounts),
    url(r'^reports/$', client_reports.report),
    url(r'^reports/(?P<object_id>\d{1,10})/$', client_reports.report),
    url(r'^reports/(?P<object_id>\d{1,10})/(?P<period>\d{1,10})/$', client_reports.report),


    url(r'^ajax/get_order_num/$', ajax.get_order_num),
    url(r'^ajax/check_email/$', ajax.check_email),
)
