#! /usr/bin/python
#  coding: utf-8

from django.conf.urls import url

from apps.system.sentry_user import notice
import sentry_user
import sentry_user_group
import permission

urlpatterns = [
    url(r'^$', sentry_user.index),

    url(r'^ajax/(?P<action>\w{1,32})/$', sentry_user.ajax),
    url(r'^group/$', sentry_user_group.index),
    url(r'^group/ajax/(?P<action>\w{1,32})/$', sentry_user_group.ajax),
    url(r'^permission/$', permission.index),
    url(r'^permission/ajax/(?P<action>\w{1,32})/$', permission.ajax),

    url(r'^notice/$', notice.check),
    url(r'^notice/ajax/(?P<action>\w{1,32})/$', notice.ajax),
    ]