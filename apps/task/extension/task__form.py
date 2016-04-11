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
            'complete_date',
            'initiator',
            'initiator_other',
            'device',
            'warden',
            'doer',
            'comment',
            ]
    #contract = forms.ModelChoiceField(queryset=system_models.client_contract.objects.filter(is_active=1))
    #object = forms.ModelChoiceField(queryset=system_models.client_object.objects.filter(is_active=1))
    task_type = forms.ModelChoiceField(queryset=task_models.task_type.objects.all())


class task_report_form(forms.ModelForm):
    class Meta:
        model = task_models.task_report
        fields = [
            'task',
            'status',
            'doer',
            'security_squad',
            'comment'
            ]
    task = forms.ModelChoiceField(queryset=task_models.task.objects.all())