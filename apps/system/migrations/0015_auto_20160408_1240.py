# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-04-08 12:40
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0014_auto_20160408_1137'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client_object_task',
            name='create_date',
            field=models.DateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AlterField(
            model_name='client_object_task',
            name='create_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='task_create_user', to='system.sentry_user'),
        ),
    ]