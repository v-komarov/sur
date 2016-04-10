#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

import dir_address_1_region, dir_address_3_street, dir_address_2_locality, dir_address_4_building
import dir_bank
import dir_bonus
import dir_console_interval
import dir_contract_interval
import dir_device
import dir_device_console
import dir_device_communication
import dir_device_type
import dir_holding
import dir_incident_type
import dir_service_organization
import dir_security_squad
import dir_service_type
import dir_sim_card
import dir_user_post
import dir_weapon
import dir_weapon_type

# Справочники
urlpatterns = [
    url(r'^region/$', dir_address_1_region.index),
    url(r'^region/ajax/(?P<action>\w{1,32})/$', dir_address_1_region.ajax),
    url(r'^locality/$', dir_address_2_locality.index),
    url(r'^locality/ajax/(?P<action>\w{1,32})/$', dir_address_2_locality.ajax),
    url(r'^street/$', dir_address_3_street.index),
    url(r'^street/ajax/(?P<action>\w{1,32})/$', dir_address_3_street.ajax),
    url(r'^building/$', dir_address_4_building.index),
    url(r'^building/ajax/(?P<action>\w{1,32})/$', dir_address_4_building.ajax),

    url(r'^bank/$', dir_bank.index),
    url(r'^bank/ajax/(?P<action>\w{1,32})/$', dir_bank.ajax),
    url(r'^bonus/$', dir_bonus.index),
    url(r'^bonus/ajax/(?P<action>\w{1,32})/$', dir_bonus.ajax),
    url(r'^console_interval/$', dir_console_interval.index),
    url(r'^console_interval/ajax/(?P<action>\w{1,32})/$', dir_console_interval.ajax),
    url(r'^contract_interval/$', dir_contract_interval.index),
    url(r'^contract_interval/ajax/(?P<action>\w{1,32})/$', dir_contract_interval.ajax),

    url(r'^device/$', dir_device.index),
    url(r'^device/ajax/(?P<action>\w{1,32})/$', dir_device.ajax),
    url(r'^device_communication/$', dir_device_communication.index),
    url(r'^device_communication/ajax/(?P<action>\w{1,32})/$', dir_device_communication.ajax),
    url(r'^device_console/$', dir_device_console.index),
    url(r'^device_console/ajax/(?P<action>\w{1,32})/$', dir_device_console.ajax),
    url(r'^device_type/$', dir_device_type.index),
    url(r'^device_type/ajax/(?P<action>\w{1,32})/$', dir_device_type.ajax),

    url(r'^sim_card/$', dir_sim_card.index),
    url(r'^sim_card/ajax/(?P<action>\w{1,32})/$', dir_sim_card.ajax),

    url(r'^holding/$', dir_holding.index),
    url(r'^holding/ajax/(?P<action>\w{1,32})/$', dir_holding.ajax),

    url(r'^incident_type/$', dir_incident_type.index),
    url(r'^incident_type/ajax/(?P<action>\w{1,32})/$', dir_incident_type.ajax),
    url(r'^service_organization/$', dir_service_organization.index),
    url(r'^service_organization/ajax/(?P<action>\w{1,32})/$', dir_service_organization.ajax),
    url(r'^security_squad/$', dir_security_squad.index),
    url(r'^security_squad/ajax/(?P<action>\w{1,32})/$', dir_security_squad.ajax),
    url(r'^service_type/$', dir_service_type.index),
    url(r'^service_type/ajax/(?P<action>\w{1,32})/$', dir_service_type.ajax),
    url(r'^user_post/$', dir_user_post.index),
    url(r'^user_post/ajax/(?P<action>\w{1,32})/$', dir_user_post.ajax),
    url(r'^weapon/$', dir_weapon.index),
    url(r'^weapon/ajax/(?P<action>\w{1,32})/$', dir_weapon.ajax),
    url(r'^weapon_type/$', dir_weapon_type.index),
    url(r'^weapon_type/ajax/(?P<action>\w{1,32})/$', dir_weapon_type.ajax),
    ]