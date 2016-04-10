# -*- coding: utf-8 -*-

from django import forms
from apps.system import models as db_sentry


class dir_device_form(forms.ModelForm):
    class Meta:
        model = db_sentry.dir_device
        fields = [
            'device_console',
            'device_type',
            'name',
            'series',
            'number',
            'belong',
            'comment'
        ]


class dir_service_organization_form(forms.ModelForm):
    class Meta:
        model = db_sentry.dir_service_organization
        fields = [
            'name',
            'license',
            'address_locality',
            'address_placement',
            'address',
            'address_index',
            'phone',
            'fax',
            'bank',
            'bank_account',
            'inn',
            'kpp',
            'director'
        ]


class dir_sim_card_form(forms.ModelForm):
    class Meta:
        model = db_sentry.dir_sim_card
        fields = [
            'number',
            'dir_device',
        ]

