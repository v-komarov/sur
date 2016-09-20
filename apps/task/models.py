# -*- coding: utf-8 -*-

from django.db import models
from apps.system import models as system_models


class task_type(models.Model):
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=128)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        default_permissions = ()


class task_status(models.Model):
    label = models.CharField(max_length=32)
    name = models.CharField(max_length=64)
    class Meta:
        default_permissions = ()


class task(models.Model):
    contract = models.ForeignKey(system_models.client_contract, blank=True, null=True)
    bind = models.ForeignKey(system_models.client_bind, blank=True, null=True)
    object = models.ForeignKey(system_models.client_object, blank=True, null=True)
    device = models.ForeignKey(system_models.dir_device, blank=True, null=True)
    task_type = models.ForeignKey(task_type)
    status = models.ForeignKey(task_status, default=1)
    create_user = models.ForeignKey(system_models.sentry_user, blank=True, null=True, related_name='task_create_user')
    create_date = models.DateTimeField(auto_now_add=True)
    complete_date = models.DateTimeField()
    initiator = models.ForeignKey(system_models.client_user, blank=True, null=True)
    initiator_other = models.CharField(max_length=256, blank=True, null=True)
    warden = models.ForeignKey(system_models.sentry_user, blank=True, null=True, related_name='task_warden')
    doer = models.ForeignKey(system_models.sentry_user, related_name='task_doer')
    comment = models.TextField(blank=True)
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        ordering = ['-complete_date']
        default_permissions = ()
        permissions = (
            ('task', 'Доступ к списку заявок'),
            ('add_task', 'Добавлять заявки'),
            ('change_task', 'Редактировать заявки'),
            ('delete_task', 'Удалять заявки'),
        )

    def get_report(self):
        report_list = []
        report_set = task_report.objects.filter(task=self.id,is_active=1)
        for item in report_set:
            report_list.append(item.weapon_id)
        return report_list


class task_log(models.Model):
    task = models.ForeignKey(task)
    create_date = models.DateTimeField()
    user = models.ForeignKey(system_models.sentry_user)
    old_date = models.DateTimeField()
    new_date = models.DateTimeField()
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        default_permissions = ()


class task_report(models.Model):
    task = models.ForeignKey(task)
    status = models.ForeignKey(task_status)
    create_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(system_models.sentry_user, related_name='task_report_user')
    warden = models.ForeignKey(system_models.sentry_user, related_name='task_report_warden')
    doer = models.ForeignKey(system_models.sentry_user, null=True, related_name='task_report_doer')
    security_squad = models.ForeignKey(system_models.dir_security_squad, null=True)
    comment = models.TextField()
    is_active = models.SmallIntegerField(default=1)
    class Meta:
        ordering = ['-create_date']
        default_permissions = ()
        permissions = (
            ('add_task_report', 'Добавлять отчет заявкам'),
            ('change_task_report', 'Редактировать отчеты у заявок'),
            ('delete_task_report', 'Удалять отчеты заявок'),
        )