# -*- coding: utf-8 -*-

from apps.system.client.extension import client__form

from apps.system import models as db_sentry

def get(request,data=None):
    pass

def update(request,data=None):
    form = client__form.Client_requisite(request.POST)
    if form.is_valid():
        client_set = db_sentry.client.objects.get(id=int(request.POST['client_id']))
        try:
            client_set.bank_id = int(request.POST['bank_id'])
        except:
            client_set.bank_id = None
        if request.POST['bank__name']=='' and request.POST['bank__bik']=='':
            client_set.bank_id = None

        client_set.inn = request.POST['inn']
        try: client_set.kpp = int(request.POST['kpp'])
        except: client_set.kpp = None
        client_set.ogrn = request.POST['ogrn']
        client_set.rs4et = request.POST['rs4et']
        client_set.ks4et = request.POST['ks4et']
        client_set.save()
    else:
        data['error'] = form.errors

    return data

