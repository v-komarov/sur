# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-05-05 09:38
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0024_auto_20160421_2121'),
    ]

    operations = [
        migrations.AddField(
            model_name='client_bind',
            name='dir_tag',
            field=models.ManyToManyField(to='system.dir_tag'),
        ),
    ]
