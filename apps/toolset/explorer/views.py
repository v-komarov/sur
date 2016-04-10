from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

from cmd.execution import Do

def index(request, action=None):
    do = Do()

    if action:
        data = do.execute(action, request)
        return HttpResponse(data)

    else:
        data = do.index()
        return render_to_response( 'explorer/index.html', locals(), RequestContext(request) )
