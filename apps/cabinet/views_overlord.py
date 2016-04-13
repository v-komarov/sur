# -*- coding: utf-8 -*-

from django.db.models import Q
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.shortcuts import redirect
#from apps.parse import models as models_security


def set_client(request):
    if request.user.has_perm('cabinet.overlord_interface') and request.method == 'GET':
        request.session['client_id'] = request.GET['client_id']

    return redirect('/cabinet/')

'''
def list(request):
    if request.user.has_perm('cabinet.manager_interface'):

        cab_set = models_security.client_person_.objects.using('security')\
            .exclude(
                Q(email='') | Q(email='нет') | Q(email='нету') | Q(email='net') | Q(email='-')
            )

        return render_to_response('cabinet/overlord_list.html', locals(), RequestContext(request) )
    else:
        return render_to_response('404.html', RequestContext(request) )
'''