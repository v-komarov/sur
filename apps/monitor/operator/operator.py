# -*- coding: utf-8 -*-

import json
import datetime
from django.http import HttpResponse
from django.db import connections



def GetOperatorData(request):


    response_data = {}

    ## Фильтр для кнопок
    try:
        filter_btn2 = request.session['filter_btn2']
    except:
        filetr_btn2 = 'all'




    try:
        action = request.GET['start']

        cursor = connections['pg'].cursor()
        cursor.execute("SELECT * FROM client_object_device_log WHERE (current_timestamp - interval '1 day') < create_date ORDER BY create_date DESC")
        row = cursor.fetchall()


        tablegroup1 = {}
        for i in range(1,2):
            key = 'row%s' % i
            tablegroup1[key] = {
                'col1':'%s' % i,
                'col2':'0045',
                'col3':'Ademco',
                'col4':'ул Любая дом 5',
                'col5':'ООО Тестирование',
                'col6':'5-555-555'
            }

        tablegroup2 = {}

        for item in row:

            j = item[2]

            key = '%s' % item[0]
            tablegroup2[key] = {
                'id':"%s" % item[0],
                'col1':item[3].strftime('%d.%m.%Y'),
                'col2':item[3].strftime('%H:%M:%S'),
                'col3':'42000%s' % j['obj'],
                'col4':'Тестовый объект',
                'col5':j['msg'],
                'col6':j['obj'],
                'col7':j['src'],
                'action':j['action'],
                'datetime':'%s' % item[3]
            }

        response_data['tablegroup1'] = tablegroup1
        response_data['tablegroup2'] = tablegroup2

    except:
        pass






    try:

        action = request.GET['update']




        # Последние
        cursor = connections['pg'].cursor()
        cursor.execute("SELECT * FROM client_object_device_log WHERE (current_timestamp - interval '120 second') < create_date ORDER BY create_date DESC")
        row = cursor.fetchall()

        # Общие данные
        cursor = connections['pg'].cursor()
        cursor.execute("SELECT getsummarydata()")
        summarydata = cursor.fetchone()[0]




        buttongroup1 = {
            'Все':'1',
            'Охраняемые':'1',
            'Не под охраной':'0',
            'Тревожные':'0',
            'Неисправности':'0',
            'Проверить':'0',
            'Нет теста':'0',
            'Обслуживание':'0',
            'Не обслуживаемые':'0',
            'Не охраняемые':'0',
        }


        buttongroup2 = {
            'Все':'%s' % summarydata['log_all'],
            'Тревожные':'%s' % summarydata['log_alarm'],
            'На объекте':'0',
            'Неисправности':'0',
            'Система':'0',
            'На обслуживании':'0',
        }


        tablegroup2 = {}

        for item in row:

            j = item[2]

            key = '%s' % item[0]
            tablegroup2[key] = {
                'id':"%s" % item[0],
                'col1':item[3].strftime('%d.%m.%Y'),
                'col2':item[3].strftime('%H:%M:%S'),
                'col3':'42000%s' % j['obj'],
                'col4':'Тестовый объект',
                'col5':j['msg'],
                'col6':j['obj'],
                'col7':j['src'],
                'action':j['action'],
                'datetime':'%s' % item[3]
            }



        response_data['general_status'] = summarydata['general_status']
        response_data['buttongroup1'] = buttongroup1
        response_data['buttongroup2'] = buttongroup2
        response_data['tablegroup2'] = tablegroup2


    except:
        pass





    response = HttpResponse(json.dumps(response_data), content_type="application/json")
    #response['Access-Control-Allow-Origin'] = "*"
    return response


