# -*- coding: utf-8 -*-

from django.core.context_processors import csrf
from django.template import RequestContext
from django.shortcuts import render_to_response
import models


def test(request):
    articles = models.article.objects.all()[0:10]
    pizzas = models.pizza.objects.all()\
        .values('title','id','toppings__title')
    return render_to_response('test.html', locals(), RequestContext(request) )

