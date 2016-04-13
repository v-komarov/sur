# -*- coding: utf-8 -*-

import datetime

from django.template import RequestContext
from django.shortcuts import render_to_response

#from apps.parse import models as models_security
from apps.cabinet import access

'''
def object(request, object_id, year=None):
    title = 'Объекты'
    client_id = access.get_client_id(request)
    if client_id and request.user.has_perm('cabinet.client_objects'):
        objects_set = models_security.client_object_.objects.using('security')\
            .filter(client_id=client_id, status='подключен')\
            .values('id','name','order_num','status','month_pay','client__name',
                    'security_company__name','security_type__name','security_subtype__name',
                    'locality__name','street__name','building')\
            .order_by('order_num')

        today_year = datetime.date.today().year
        if year:
            year = int(year)
        else:
            year = today_year
        date_start = datetime.date(year, 1, 1)
        date_end = datetime.date(year, 12, 31)

        object = models_security.client_object_.objects.using('security')\
            .filter(id=object_id, status='подключен')\
            .values('client_id')

        year_post_calc = models_security.post_calc.objects.using('security')\
            .filter(object=object_id, object_calc__gt=0, visible=1).values('start_time')\
            .order_by('start_time')[:1]
        if year_post_calc.exists():
            yy = year_post_calc[0]['start_time'].year

            years_list = []
            for year_ in xrange(yy, today_year+1):
                years_list.append(year_)


            post_calc = models_security.post_calc.objects.using('security')\
                .filter(object=object_id, visible=1, start_time__range=(date_start, date_end) )\
                .values('id','start_time','end_time','bill_coast','object_calc')\
                .order_by('start_time')

            calc_total = 0
            pay_total = 0

            month_list = []
            for month in xrange(1,13):
                tr_d = datetime.date(year, month, 1)
                start_time = datetime.date(year, month, 2)
                if month < 12:
                    end_time = datetime.date(year, month+1, 1)
                else:
                    end_time = datetime.date(year+1, 1, 1)
                month_calc = {}
                month_calc['start_time'] = start_time
                month_calc['end_time'] = end_time

                post_calc = models_security.post_calc.objects.using('security')\
                    .filter(object=object_id, visible=1, end_time__range=(start_time, end_time))\
                    .values('start_time','end_time','bill_coast','object_calc','calc_type')
                transactions = models_security.transaction.objects.using('security')\
                    .filter(object=object_id, visible=1, tr_d=tr_d)\
                    .values('tr_d','pay_d','create_dt','mount')

                month_calc['calc_mount'] = 0
                calc_list = []
                for calc in post_calc: # начисления за месяц
                    if calc['bill_coast'] and calc['object_calc']:
                        calc_list.append({
                                'start_time' : calc['start_time'],
                                'end_time' : calc['end_time'],
                                'bill_coast' : calc['bill_coast'],
                                'object_calc' : calc['object_calc'],
                                'calc_type' : calc['calc_type']
                        })
                        month_calc['calc_mount'] += calc['object_calc']
                calc_total += month_calc['calc_mount']
                month_calc['calc'] = calc_list

                month_calc['pay_mount'] = 0
                pay_list = []
                for pay in transactions: # оплаты за месяц
                    pay_list.append({
                        'tr_d' : pay['tr_d'],
                        'pay_d' : pay['pay_d'],
                        'create_dt' : pay['create_dt'],
                        'mount' : pay['mount']
                    })
                    month_calc['pay_mount'] += pay['mount']
                pay_total += month_calc['pay_mount']
                month_calc['pay'] = pay_list
                saldo = pay_total - calc_total

                if calc_list or pay_list:
                    month_list.append(month_calc)


        return render_to_response('cabinet/client/objects_calc.html', locals(), RequestContext(request) )
    else:
        return render_to_response('404.html', RequestContext(request) )
'''