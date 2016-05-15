# -*- coding: utf-8 -*-

import calendar
import datetime
import decimal
import json
from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from apps.toolset.month_name import get_month_name
from apps.toolset import date_convert
from apps.system import models as sentry_models


def re(request, data=None):
    if request.user.has_perm('system.client_object_service_cost_change'):
        bind_set = sentry_models.client_bind.objects.filter(client_contract__client=int(request.POST['client']), is_active=1)
        if 'contract' in request.POST:
            bind_set = bind_set.filter(client_contract=int(request.POST['contract']))
        if 'bind' in request.POST:
            bind_set = bind_set.filter(id=int(request.POST['bind']))

        data['bind_list'] = []
        for bind in bind_set:
            bind.client_bind_charge_set.filter(charge_type='auto').delete()
            data['bind_list'].append(bind.id)
            cost_list = []
            index = 0
            for cost in bind.client_bind_cost_set.filter(is_active=1).order_by('begin_date'):
                cost_item = {
                    'id': cost.id,
                    'begin_date': cost.begin_date.strftime('%d.%m.%Y'),
                    'cost_type': cost.cost_type_id,
                    'cost_type__label': cost.cost_type.label,
                    'charge_month': bind.charge_month_id,
                    'charge_month_day': bind.charge_month_day,
                    'charge_month__name': bind.charge_month.name,
                    }
                if cost.cost_type.label == 'pause':
                    cost_item['end_date'] = cost.end_date.strftime('%d.%m.%Y')
                else:
                    cost_item['cost'] = str(cost.cost_value)

                cost_list.append(cost_item)
                if index > 0:
                    cost_list[index-1]['end_date'] = (cost.begin_date - datetime.timedelta(days=1)).strftime('%d.%m.%Y')
                    if cost.cost_type.label == 'pause':
                        prev_cost = {
                            'id': cost_list[-2]['id'],
                            'begin_date': (cost.end_date + datetime.timedelta(days=1)).strftime('%d.%m.%Y'),
                            'cost_type': cost_list[-2]['cost_type'],
                            'cost_type__label': cost_list[-2]['cost_type__label'],
                            'charge_month': cost_list[-2]['charge_month'],
                            'charge_month_day': cost_list[-2]['charge_month_day'],
                            'cost': cost_list[-2]['cost'],
                            }
                        cost_list.append(prev_cost)
                        index += 1
                index += 1

            if not 'end_date' in cost_list[-1]:
                cost_list[-1]['end_date'] = datetime.datetime.now().strftime('%d.%m.%Y')

            data['cost_list'] = cost_list


            if len(cost_list) > 0:

                # руб./месяц
                for cost_item in cost_list:
                    if cost_item['cost_type__label'] != 'pause':
                        cost_begin_date = datetime.datetime.strptime(cost_item['begin_date'], '%d.%m.%Y')
                        cost_end_date = datetime.datetime.strptime(cost_item['end_date'], '%d.%m.%Y')
                        cost_end_variable = cost_end_date
                        cost = cost_item['cost']
                        cost_days = 0
                        cost_result = 0
                        today = get_charge_day(cost_item['charge_month'])

                        while cost_begin_date.replace(day=cost_item['charge_month_day']) <= today \
                                and cost_begin_date <= cost_end_date:
                            month_days = calendar.monthrange(cost_begin_date.year, cost_begin_date.month)[1]
                            if cost_end_variable <= cost_end_date:
                                if cost_begin_date.replace(day=1) == cost_end_date.replace(day=1):
                                    cost_days = cost_end_date.day - cost_begin_date.day
                                    cost_end_variable = cost_end_date
                                else:
                                    cost_days = month_days - cost_begin_date.day
                                    cost_end_variable = cost_begin_date + datetime.timedelta(cost_days)
                                cost_days += 1
                                cost_result = round((float(cost)/month_days*cost_days), 2)*-1

                            sentry_models.client_bind_charge.objects.create(
                                bind_id = bind.id,
                                begin_date = cost_begin_date, end_date = cost_end_variable,
                                value = cost_result
                            )

                            cost_begin_date += datetime.timedelta(cost_days)
                            #except:
                            #    data['debug'].append(cost_begin_date)


                # Sum total & balance
                #sentry_models.debug.objects.create(sentry_id=service.id, comment='charge_sum_total')

                charge_sum_total(bind_id=bind.id)
                #client_balance(client_id=charge_set[0].object.client_id)

                '''
                # Post
                service_salary_set = sentry_models.client_object_service_salary.objects.filter(service_id=service.id, is_active=1).order_by('-begin_date')
                post_count = 0
                for post in sentry_models.client_object_service_post.objects.filter(service_id=service.id):
                    post_cost = 0
                    post_salary = 0

                    for cost_item in service_cost_set:
                        # Определяем стоимость смены
                        if cost_item.end_date:
                            if post.completed_begin_date >= cost_item.begin_date and post.completed_begin_date <= cost_item.end_date:
                                post_cost = cost_item.cost
                                break
                        elif post.completed_begin_date >= cost_item.begin_date:
                            post_cost = cost_item.cost

                    for salary in service_salary_set:
                        if post.completed_begin_date >= salary.begin_date:
                            post_salary = salary.salary
                            break

                    # Add to charge
                    # Пришло ли время начислять эту смену
                    if post.reason_end_id and post.completed_begin_date <= get_charge_day(cost_item.calculation_month_id) and \
                                    cost_item.cost_type_id in [2]: # руб./час с заступлением
                        # Определяем период для начисления, charge
                        charge_begin_date = post.completed_begin_date.replace(day=1,hour=0,minute=0,second=0)
                        charge_end_date = charge_begin_date.replace(day=calendar.monthrange(charge_begin_date.year, charge_begin_date.month)[1],hour=23,minute=59,second=59)

                        #if not sentry_models.client_object_service_charge.objects.filter( # Проверяем нет ли такой же записи с типом 'manual'
                        #        service_id = service.id, charge_type='manual',
                        #        begin_date = charge_begin_date, end_date = charge_end_date ).exists():

                        try:
                            charge_set = sentry_models.client_object_service_charge.objects.get(
                                service_id = service.id,
                                charge_type='post',
                                begin_date = charge_begin_date,
                                end_date = charge_end_date )
                            charge_set.value -= post.hours*post_cost
                            post_count += 1
                            #post_list.append({post.cost:post.completed_begin_date})
                        except:
                            charge_set = sentry_models.client_object_service_charge.objects.create(
                                service_id = service.id,
                                begin_date = charge_begin_date, end_date = charge_end_date,
                                charge_type = 'post',
                                value = post.hours*post_cost*-1 )
                            post_count = 1
                            #post_list = [{post.cost:post.completed_begin_date}]

                        comment = 'смен: '+str(post_count)
                        charge_set.comment = comment
                        charge_set.save()
                        post.charge_id = charge_set.id

                    post.cost = post.hours*post_cost
                    post.salary = post.hours*post_salary
                    post.save()
                '''

        if data:
            data['answer'] = 'done'
            return data
        else:
            return render_to_response('system/client/client_recalculation.html', locals(), RequestContext(request) )
    else:
        return render_to_response('403.html', locals(), RequestContext(request) )


def charge_sum_total(**kwargs):
    total = decimal.Decimal('0.00')
    charge_set = sentry_models.client_bind_charge.objects.all().order_by('begin_date')
    if 'bind_id' in kwargs:
        charge_set = charge_set.filter(bind_id=kwargs['bind_id'])
    elif 'client_id' in kwargs:
        charge_set = charge_set.filter(service__object__client_id=kwargs['client_id'])
    if charge_set:
        warden_id = charge_set.first().bind.client_object.get_warden()['id']
        for charge in charge_set:
            total += charge.value
            charge.total = total
            charge.warden_id = warden_id
            charge.save()
    return 'done'


def client_balance(**kwargs):
    client_id = int(kwargs['client_id'])
    data = {}
    payment_value = 0
    for payment in sentry_models.client_payment.objects.filter(client_id=client_id, is_active=1):
        payment_value += payment.value
    charge_value = 0
    for charge in sentry_models.client_bind_charge.objects \
            .filter(bind__client_id=client_id, value__gt=0, is_active=1):
        charge_value += charge.value
    balance = payment_value - charge_value
    sentry_models.client.objects.filter(id=client_id).update(balance=balance)
    data['payments'] = str(payment_value)
    data['charges'] = str(charge_value)
    data['balance'] = str(balance)
    return data


def get_charge_day(charge_month_id):
    today = datetime.datetime.now()
    if charge_month_id==2: # Следующего месяца
        today -= datetime.timedelta( calendar.monthrange(today.year, today.month)[1] )
    elif charge_month_id==3: # Через месяц
        today -= datetime.timedelta( calendar.monthrange(today.year, today.month)[1] )
        today -= datetime.timedelta( calendar.monthrange(today.year, today.month)[1] )
    if calendar.monthrange(today.year, today.month)[1]<=today.day:
        today = today.replace(day=calendar.monthrange(today.year, today.month)[1])
    elif today.day!=today.day:
        today = today.replace(day=today.day)

    return today




