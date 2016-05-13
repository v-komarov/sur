# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-05-12 21:26
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0029_auto_20160509_1206'),
    ]

    operations = [
        migrations.CreateModel(
            name='client_bind_charge',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('charge_type', models.CharField(db_index=True, default=b'auto', max_length=128)),
                ('begin_date', models.DateTimeField(db_index=True)),
                ('end_date', models.DateTimeField(db_index=True)),
                ('value', models.DecimalField(db_index=True, decimal_places=2, default=0.0, max_digits=20)),
                ('total', models.DecimalField(decimal_places=2, default=0.0, max_digits=20)),
                ('comment', models.TextField(blank=True)),
                ('is_active', models.SmallIntegerField(db_index=True, default=1)),
            ],
            options={
                'ordering': ['begin_date'],
                'default_permissions': ('view', 'add', 'change', 'delete'),
                'db_table': 'client_bind_charge',
            },
        ),
        migrations.RemoveField(
            model_name='client_object_charge',
            name='object',
        ),
        migrations.RemoveField(
            model_name='client_object_charge',
            name='warden',
        ),
        migrations.AlterField(
            model_name='client_bind',
            name='client_contract',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='system.client_contract'),
        ),
        migrations.AlterField(
            model_name='client_bind',
            name='client_object',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='system.client_object'),
        ),
        migrations.AlterField(
            model_name='client_bind',
            name='console',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='system.dir_device_console'),
        ),
        migrations.AlterField(
            model_name='client_bind_post',
            name='charge',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='system.client_bind_charge'),
        ),
        migrations.AlterField(
            model_name='sentry_log',
            name='charge',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='system.client_bind_charge'),
        ),
        migrations.DeleteModel(
            name='client_object_charge',
        ),
        migrations.AddField(
            model_name='client_bind_charge',
            name='bind',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='system.client_bind'),
        ),
        migrations.AddField(
            model_name='client_bind_charge',
            name='warden',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='system.sentry_user'),
        ),
    ]
