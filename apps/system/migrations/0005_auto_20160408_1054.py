# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-04-08 10:54
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0004_auto_20160408_1053'),
    ]

    operations = [
        migrations.CreateModel(
            name='client_bind_post',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plan', models.CharField(default=b'planned', max_length=128)),
                ('planned_begin_date', models.DateTimeField()),
                ('planned_end_date', models.DateTimeField()),
                ('completed_begin_date', models.DateTimeField()),
                ('completed_end_date', models.DateTimeField()),
                ('hours', models.DecimalField(decimal_places=2, max_digits=5, null=True)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
                ('salary', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
                ('comment', models.TextField(blank=True)),
                ('is_active', models.SmallIntegerField(default=1)),
                ('bind', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='system.client_bind')),
                ('charge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='system.client_object_charge')),
                ('reason_begin', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='client_object_post_reason_begin', to='system.dir_post_reason')),
                ('reason_end', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='client_object_post_reason_end', to='system.dir_post_reason')),
                ('sentry_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='system.sentry_user')),
                ('weapon', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='system.dir_weapon')),
            ],
            options={
                'ordering': ['completed_begin_date'],
                'db_table': 'client_bind_post',
            },
        ),
        migrations.RemoveField(
            model_name='client_object_post',
            name='charge',
        ),
        migrations.RemoveField(
            model_name='client_object_post',
            name='object',
        ),
        migrations.RemoveField(
            model_name='client_object_post',
            name='reason_begin',
        ),
        migrations.RemoveField(
            model_name='client_object_post',
            name='reason_end',
        ),
        migrations.RemoveField(
            model_name='client_object_post',
            name='sentry_user',
        ),
        migrations.RemoveField(
            model_name='client_object_post',
            name='weapon',
        ),
        migrations.DeleteModel(
            name='client_object_post',
        ),
    ]