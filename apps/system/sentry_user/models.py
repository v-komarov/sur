# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import Permission



class permission_ext_group(models.Model):
    label = models.CharField(max_length=128)
    name = models.CharField(max_length=512, blank=True)
    position = models.DecimalField(max_digits=5, decimal_places=2, blank=True)
    class Meta:
        db_table = 'auth_permission_ext_group'
        ordering = ['position']


class permission_ext(models.Model):
    auth_permission = models.ForeignKey(Permission)
    permission_group = models.ForeignKey(permission_ext_group)
    position = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.CharField(max_length=512, blank=True)
    class Meta:
        db_table = 'auth_permission_ext'
        ordering = ['permission_group__position','position']
