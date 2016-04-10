# -*- coding: utf-8 -*-

from django import forms
from apps.system import models as system_models
from apps.task import models as task_models


class task_form(forms.ModelForm):
    class Meta:
        model = task_models.task
        fields = [
            'contract',
            'object',
            'task_type',
            'create_user',
            'create_date',
            'complete_date',
            'initiator',
            'initiator_other',
            'device',
            'warden',
            'doer',
            'comment',
            ]
    contract = forms.ModelChoiceField(queryset=system_models.client_contract.objects.filter(is_active=1))
    object = forms.ModelChoiceField(queryset=system_models.client_object.objects.filter(is_active=1))
    task_type = forms.ModelChoiceField(queryset=task_models.task_type.objects.all())
    create_user = forms.ModelChoiceField(queryset=system_models.sentry_user.objects.all())
    #create_date = forms.DateTimeField(required=False)
    #complete_date = forms.DateTimeField(required=False)




