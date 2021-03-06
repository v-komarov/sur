# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-04-08 11:08
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0009_auto_20160408_1105'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client_bind',
            name='client_contract',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='system.client_contract'),
        ),
        migrations.AlterField(
            model_name='client_bind',
            name='client_object',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='system.client_object'),
        ),
        migrations.AlterField(
            model_name='client_bind',
            name='console',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='system.dir_device_console'),
        ),
    ]
