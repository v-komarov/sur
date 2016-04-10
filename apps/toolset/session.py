# -*- coding: utf-8 -*-

import json
from django.http import HttpResponse

def get(request):
    data = request.session['sentry']

    return HttpResponse( json.dumps(data, ensure_ascii=False) )


def delete(request):


    return True