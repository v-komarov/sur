# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-04-15 09:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0020_auto_20160415_0931'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client_user_phone',
            name='code',
            field=models.CharField(blank=True, max_length=4),
        ),
    ]
