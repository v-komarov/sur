# -*- coding: utf-8 -*-

from django import forms

from apps.system import models as db_sentry


class bankForm(forms.ModelForm):
    class Meta:
        model = db_sentry.dir_bank
        fields = ['bik','name','locality']

    bik = forms.CharField( min_length=3, required=True,
            error_messages={'required': 'БИК обязателен'} )
    name = forms.CharField( min_length=3, required=True )
    locality = forms.CharField( min_length=3, required=False )


class security_companyForm(forms.ModelForm):
    class Meta:
        model = db_sentry.dir_bank
        fields = ['name']

    name = forms.CharField( min_length=3, required=True,
            error_messages={'required': 'Наименование компании обязателено'} )
    locality = forms.CharField( required=True )


class dir_deviceForm(forms.ModelForm):
    class Meta:
        model = db_sentry.dir_device
        fields = ['name','series','number','registration_date']

    name = forms.CharField( required=True )
    registration_date = forms.DateField( required=True,
        widget=forms.DateInput(format = '%d/%m/%Y'),
        input_formats=('%d.%m.%Y',))

    comment = forms.CharField( required=False,
            widget=forms.Textarea( attrs={'cols':'52', 'rows':'3'} ) )