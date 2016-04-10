#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

import search
import client
import client_charge
import client_contract
import client_payment
import client_requisite
import client_user

import client_object
import object_armory
import object_cost
import object_device
import object_incident
import object_salary
import object_timetable
import object_weapon

from extension import client_charge_recharge

# Клиенты, договора, объекты
urlpatterns = [
    url(r'^$', search.index),
    url(r'^search/$', search.index),
    url(r'^search/ajax/(?P<action>\w{1,32})/$', search.ajax),

    # Client info
    url(r'^add/$', client.add),
    url(r'^(?P<client_id>\d{1,11})/$', client.index),
    url(r'^info/ajax/(?P<action>\w{1,32})/$', client.ajax),
    # Requisite
    url(r'^(?P<client_id>\d{1,11})/requisite/$', client_requisite.index),
    url(r'^requisite/ajax/(?P<action>\w{1,32})/$', client_requisite.ajax),
    # Client & client_user
    url(r'^(?P<client_id>\d{1,11})/users/$', client_user.index),
    url(r'^(?P<client_id>\d{1,11})/contract/(?P<contract_id>\d{1,11})/users/$', client_user.index),
    url(r'^user/ajax/(?P<action>\w{1,32})/$', client_user.ajax),
    #url(r'^(?P<client_id>\d{1,11})/object/(?P<object_id>\d{1,11})/(?P<client_user_id>\d{1,11})/user/$', client_user.index),
    # Payments
    url(r'^(?P<client_id>\d{1,11})/payment/$', client_payment.index),
    url(r'^payment/ajax/(?P<action>\w{1,32})/$', client_payment.ajax),
    # Charge
    url(r'^(?P<client_id>\d{1,11})/charge/$', client_charge.index),
    url(r'^charge/ajax/(?P<action>\w{1,32})/$', client_charge.ajax),
    url(r'^recharge/(?P<client_id>\d{1,32})/$', client_charge_recharge.re),
    #url(r'^balance/(?P<client_id>\d{1,32})/$', client_charge_recharge.client_balance),
    #url(r'^(?P<client_id>\d{1,11})/recharge/(?P<service_id>\d{1,11})/$', client_charge.recharge),

    # Contract
    url(r'^(?P<client_id>\d{1,11})/contract/$', client_contract.list),
    url(r'^(?P<client_id>\d{1,11})/contract/add/$', client_contract.index),
    url(r'^(?P<client_id>\d{1,11})/contract/(?P<contract_id>\d{1,11})/$', client_contract.index),
    url(r'^contract/ajax/(?P<action>\w{1,32})/$', client_contract.ajax),

    # Incidents
    url(r'^(?P<client_id>\d{1,11})/contract/(?P<contract_id>\d{1,11})/incident/$', object_incident.index),
    url(r'^contract/incident/ajax/(?P<action>\w{1,32})/$', object_incident.ajax),


    # Object
    url(r'^(?P<client_id>\d{1,11})/object/(?P<object_id>\d{1,11})/$', client_object.index),
    url(r'^(?P<client_id>\d{1,11})/object/add/$', client_object.index),
    url(r'^object/ajax/(?P<action>\w{1,32})/$', client_object.ajax),

    # Object cost
    url(r'^object/cost/ajax/(?P<action>\w{1,32})/$', object_cost.ajax),
    # Object devices
    url(r'^(?P<client_id>\d{1,11})/object/(?P<object_id>\d{1,11})/device/$', object_device.index),
    url(r'^object/device/ajax/(?P<action>\w{1,32})/$', object_device.ajax),
    # Object salary
    url(r'^(?P<client_id>\d{1,11})/object/(?P<object_id>\d{1,11})/salary/$', object_salary.index),
    url(r'^object/salary/ajax/(?P<action>\w{1,32})/$', object_salary.ajax),
    # Object timetable
    url(r'^(?P<client_id>\d{1,11})/object/(?P<object_id>\d{1,11})/timetable/$', object_timetable.index),
    url(r'^object/timetable/ajax/(?P<action>\w{1,32})/$', object_timetable.ajax),
    # Object weapons
    url(r'^(?P<client_id>\d{1,11})/object/(?P<object_id>\d{1,11})/weapon/$', object_weapon.index),
    url(r'^object/weapon/ajax/(?P<action>\w{1,32})/$', object_weapon.ajax),
    ]