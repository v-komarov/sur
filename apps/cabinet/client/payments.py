# -*- coding: utf-8 -*-

import datetime

from django.template import RequestContext
from django.shortcuts import render_to_response

#from apps.parse import models as db_security
from apps.cabinet import access

'''
def payments(request, year=None):
    title = 'Платежи'
    client_id = access.get_client_id(request)

    today_year = datetime.date.today().year
    if year:
        year = int(year)
    else:
        year = today_year
    date_start = datetime.datetime(year, 1, 1)
    date_end = datetime.datetime(year, 12, 31)


    payments = db_security.payment.objects.using('security')\
        .filter(client=client_id).values('pay_date')\
        .order_by('pay_date')[:1]
    if payments.exists():
        yy = datetime.datetime.fromtimestamp(int(payments[0]['pay_date'])).year

        years_list = []
        for year_ in xrange(yy, today_year+1):
            years_list.append(year_)

    if client_id and request.user.has_perm('cabinet.client_payments'):
        payments_set_ = db_security.payment.objects.using('security')\
            .filter( client=client_id, visible=1 )\
            .values('pay_date','mount','pay_type','comment')

        payments_set = []
        for item in payments_set_:
            # Костыль потому что 'pay_type' имеет тип int
            if datetime.datetime.fromtimestamp( int(item['pay_date']) ) > date_start\
                and datetime.datetime.fromtimestamp( int(item['pay_date']) ) < date_end:

                payments_set.append({
                    'pay_date':datetime.datetime.fromtimestamp( int(item['pay_date']) ),
                    'mount':item['mount'],
                    'pay_type':item['pay_type'],
                    'comment':item['comment'],
                })

        return render_to_response('sentry/cabinet/client/payments.html', locals(), RequestContext(request) )
    else:
        return render_to_response('404.html', RequestContext(request) )
'''