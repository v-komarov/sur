# -*- coding: utf-8 -*-

from apps.system import models as db_sentry
from apps.system.directory.extension import forms
#import lxml.html


def search(request,data):
    bank_set = db_sentry.dir_bank.objects.all().values('id', 'name', 'bik', 'correspondent_account', 'locality')
    if 'id' in request.GET:
        bank_set = bank_set.filter(id=request.GET['id'])
    else:
        if 'bik' in request.GET and request.GET['bik']!='':
            bank_set = bank_set.filter(bik__icontains=request.GET['bik'])
        if 'name' in request.GET and request.GET['name']!='':
            bank_set = bank_set.filter(name__icontains=request.GET['name'])
        if 'correspondent_account' in request.GET and request.GET['correspondent_account']!='':
            bank_set = bank_set.filter(correspondent_account__icontains=request.GET['correspondent_account'])
        if 'locality' in request.GET and request.GET['locality']!='':
            bank_set = bank_set.filter(locality__icontains=request.GET['locality'])
        if 'limit' in request.GET and request.GET['limit']!='':
            bank_set = bank_set[:int(request.GET['limit'])]
    data['bank_list'] = [item for item in bank_set]
    return data


def create(request,data):
    if db_sentry.dir_bank.objects.filter(bik=request.POST['bik']).exists():
        data['error'] = 'Банк с таким БИК уже есть.'.decode('utf-8')
    else:
        bank_set = db_sentry.dir_bank.objects.create(
            bik = request.GET['bik'],
            name = request.GET['name'],
            locality = request.GET['locality'] )
        data['bank'] = [{
                            'id': bank_set.id,
                            'bik': bank_set.bik,
                            'name': bank_set.name,
                            'locality': bank_set.locality }]
    return data


def update(request,data):
    bank_set = None
    try:
        if db_sentry.dir_bank.objects.filter(bik=request.POST['bik']).exclude(id=int(request.POST['bank_id'])).exists():
            data['error'] = 'Уже есть банк с таким БИК.'.decode('utf-8')
        else:
            bank_set = db_sentry.dir_bank.objects.get(id=int(request.POST['bank_id']))
    except:
        if db_sentry.dir_bank.objects.filter(bik=request.POST['bik']).exists():
            data['error'] = 'Уже есть банк с таким БИК.'.decode('utf-8')
        else:
            bank_set = db_sentry.dir_bank.objects.create()

    if bank_set:
        try: bank_set.bik = request.POST['bik']
        except: bank_set.bik = ''
        try: bank_set.name = request.POST['name']
        except: bank_set.name = ''
        try: bank_set.correspondent_account = request.POST['correspondent_account']
        except: bank_set.correspondent_account = ''
        try: bank_set.locality = request.POST['locality']
        except: bank_set.locality = ''
        bank_set.save()
    return data


def delete(request,data):
    if db_sentry.client.objects \
            .filter(bank_id=int(request.GET['id'])) \
            .exists():
        data['error'] = 'Невозможно удалить эту запись'.decode('utf-8')
    else:
        db_sentry.dir_bank.objects \
            .get(id=int(request.GET['id'])).delete()

    return data


'''
def parser(data):
    url_base = 'http://www.bik-info.ru/bik_'
    bank_set = db_sentry.dir_bank.objects.all()
    for bank in bank_set:
        url = url_base + bank.bik + '.html'
        page = urllib.urlopen(url).read()
        page = lxml.html.document_fromstring(page)

        try:
            name = page.xpath('/html/body/div[2]/table/tbody/tr[2]/td')[0].text
            locality = page.xpath('/html/body/div[2]/table/tbody/tr[5]/td')[0].text
            db_sentry.dir_bank.objects.filter(id=bank.id) \
                .update(name=name, locality=locality)
        except:
            data['error'] = 'no bank'

            data = json.dumps(data, ensure_ascii=False)
            return HttpResponse(data, content_type='application/json')

    return data
'''
