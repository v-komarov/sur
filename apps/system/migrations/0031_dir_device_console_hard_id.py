# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-05-16 18:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0030_auto_20160512_2126'),
    ]

    operations = [
        migrations.AddField(
            model_name='dir_device_console',
            name='hard_id',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]