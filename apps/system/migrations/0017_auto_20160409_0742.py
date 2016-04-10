# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-04-09 07:42
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0016_auto_20160408_1247'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='client_object_task',
            name='contract',
        ),
        migrations.RemoveField(
            model_name='client_object_task',
            name='create_user',
        ),
        migrations.RemoveField(
            model_name='client_object_task',
            name='device',
        ),
        migrations.RemoveField(
            model_name='client_object_task',
            name='doer',
        ),
        migrations.RemoveField(
            model_name='client_object_task',
            name='initiator',
        ),
        migrations.RemoveField(
            model_name='client_object_task',
            name='object',
        ),
        migrations.RemoveField(
            model_name='client_object_task',
            name='status',
        ),
        migrations.RemoveField(
            model_name='client_object_task',
            name='task_type',
        ),
        migrations.RemoveField(
            model_name='client_object_task',
            name='warden',
        ),
        migrations.RemoveField(
            model_name='client_object_task_log',
            name='task',
        ),
        migrations.RemoveField(
            model_name='client_object_task_log',
            name='user',
        ),
        migrations.RemoveField(
            model_name='client_object_task_report',
            name='doer',
        ),
        migrations.RemoveField(
            model_name='client_object_task_report',
            name='security_squad',
        ),
        migrations.RemoveField(
            model_name='client_object_task_report',
            name='status',
        ),
        migrations.RemoveField(
            model_name='client_object_task_report',
            name='task',
        ),
        migrations.RemoveField(
            model_name='client_object_task_report',
            name='user',
        ),
        migrations.RemoveField(
            model_name='client_object_task_report',
            name='warden',
        ),
        migrations.DeleteModel(
            name='client_object_task',
        ),
        migrations.DeleteModel(
            name='client_object_task_log',
        ),
        migrations.DeleteModel(
            name='client_object_task_report',
        ),
        migrations.DeleteModel(
            name='dir_task_status',
        ),
    ]
