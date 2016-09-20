# -*- coding: utf-8 -*-

from django import forms
from apps.system import models as db_sentry


class client_charge(forms.Form):
    bind_id = forms.IntegerField(required=True)
    begin_date = forms.DateField(required=True)
    end_date = forms.DateField(required=True)
    value = forms.DecimalField(max_digits=20, decimal_places=2)
    comment = forms.CharField(required=False)


class client_form(forms.ModelForm):
    class Meta:
        model = db_sentry.client
        fields = [
            #'holding',
            'name',
            'founding_date',
            'legal_type_base',
            #'address_legal_building',
            'address_legal_index', 'address_legal_placement', 'address_legal_placement_type',
            #'address_actual_building',
            'address_actual_index', 'address_actual_placement', 'address_actual_placement_type',
            #'address_postal_building',
            'address_postal_index', 'address_postal_placement', 'address_postal_placement_type',
            'pay_type',
            'bank', 'bank_account',
            'inn', 'kpp', 'ogrn', 'ogrnip'
        ]

"""
class contractNameField(form_, forms.Field):
    def validate(self, value):
        super(ContactField, self).validate(value)
        # Проверяем на соответствие поля "email"у
        if email_re.search(smart_unicode(value)):
            pass
        # Проверяем на соответствие поля телефонному номеру
        elif re.compile("^([0-9\(\)\/\+ \-]*)$").search(smart_unicode(value)):
            pass
        # Если не соответствует ничему, то вызываем ошибку
        else:
            raise forms.ValidationError(_(u'Enter a valid email or phone number.'), code='invalid')
"""

class contract_form(forms.ModelForm):
    #name = contractNameField(required=True)
    class Meta:
        model = db_sentry.client_contract
        fields = [
            'client',
            'name',
            'service_type',
            'security_previously',
            'service_organization',
            'begin_date',
            'end_date',
            'comment',
            #'dir_tag'
        ]



class client_user(forms.ModelForm):
    class Meta:
        model = db_sentry.client_user
        fields = [
            'full_name',
            'post',
            'birthday',
            'passport',
            #'address_building',
            'address_placement',
            'address',
            'comment'
        ]

    full_name = forms.CharField(widget=forms.TextInput(
        attrs={'class': 'wide'}
    ))
    address = forms.CharField(required=False, widget=forms.TextInput(attrs={'class': 'wide'}))
    #birthday = forms.CharField(required=False, widget=forms.TextInput(attrs={'class': 'datepicker'}))
    passport = forms.CharField(required=False, widget=forms.TextInput(attrs={'class': 'wide'}))
    comment = forms.CharField(required=False, widget=forms.Textarea(
        attrs={'cols': '50', 'rows': '2', }
    ))



class object_form(forms.ModelForm):
    class Meta:
        model = db_sentry.client_object
        fields = [
            'name',
            #'client_bind__console',
            #'client_bind__console_number',
            #'client_bind__charge_month_day',
            #'client_bind__charge_month',
            #'address_building',
            'address_placement',
            'address_placement_type',
            'referer_type',
            'referer_user',
            'security_squad',
            'occupation',
            'comment',
            'password'
        ]


class client_bind(forms.ModelForm):
    class Meta:
        model = db_sentry.client_bind
        fields = [
            'client_contract',
            #'client_object',
            'console',
            'console_number',
            #'status',
            'begin_date',
            'end_date',
            'charge_month_day',
            'charge_month',
            'time24'
        ]


class workflow_form(forms.ModelForm):
    class Meta:
        model = db_sentry.client_workflow
        fields = [
            'contract',
            'bind',
            'object',
            'sentry_user',
            'workflow_type',
            'workflow_date',
            'cost',
            'comment'
        ]


class client_object_dir_device_form(forms.ModelForm):
    class Meta:
        model = db_sentry.client_object_dir_device
        fields = [
            'object',
            'device',
            #'priority',
            'install_date',
            'install_user',
            'uninstall_date',
            'uninstall_user',
            'password',
            'comment'
        ]
