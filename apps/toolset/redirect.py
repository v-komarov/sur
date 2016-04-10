# -*- coding: utf-8 -*-

from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from apps import settings
from apps.toolset import send_mail


def go(request,url):
    return redirect(url)

