# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-04-08 11:37
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0013_auto_20160408_1135'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='client_object_task',
            options={'ordering': ['-complete_date']},
        ),
        migrations.RenameField(
            model_name='client_object_task',
            old_name='completion_date',
            new_name='complete_date',
        ),
    ]
