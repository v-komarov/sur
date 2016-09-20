#! /usr/bin/python
#coding: utf-8

from django.conf.urls import url

from config import objects, codes
from apps.monitor.operator import views, operator
from apps.monitor.archive import views as arch,jsondata
from apps.monitor.technician import views as techincian
from apps.monitor.android import jsondata as android
from apps.monitor.maps import views as maps, jsondata as mapsdata
from apps.monitor.manager import views as manager
from apps.monitor.manager import jsondata as managerdata



urlpatterns = [
    #url(r'^$', objects.index),

    # Operator interface
    url(r'^operator/$', views.main),
    url(r'^archive/$', arch.main),
    url(r'^technician/$', techincian.main),
    url(r'^operator/getdata/$', operator.GetOperatorData),
    url(r'^archive/getdata/$', jsondata.GetData),
    url(r'^android/$', android.GetJson),
    url(r'^maps/$', maps.main),
    url(r'^maps/getdata/$', mapsdata.GetData),
    url(r'^manager/$', manager.main),
    url(r'^manager/getdata/$', managerdata.GetData),

]
