# -*- coding: utf-8 -*-

import datetime
import math


def convert(string):
    #30.12.1990
    try: date = datetime.datetime.strptime(string, '%d.%m.%Y')
    except: date = None
    return date


def convert2datetime(string):
    #30.12.1990 12:00
    data = {'error':None}
    if len(string) < 16:
        string = '0'+string
    try:
        data['datetime'] = datetime.datetime(
        int(string[6:10]),
        int(string[3:5]),
        int(string[0:2]),
        int(string[11:13]),
        int(string[14:16]) )
    except:
        data['datetime'] = datetime.datetime.now()
        data['error'] = 'error'

    return data


def get_minutes(begin_datetime,end_datetime):
    return (end_datetime - begin_datetime).seconds / 60


def get_hours(begin_str,end_str):
    #begin_str = '09:00' end_str = '18:00'
    begin_datetime = datetime.datetime( 1, 1, 1, int(begin_str[:2]), int(begin_str[3:]) )
    end_datetime = datetime.datetime( 1, 1, 1, int(end_str[:2]), int(end_str[3:]) )
    if begin_datetime == end_datetime:
        rr = 24
    elif begin_datetime > end_datetime:
        delta = str(begin_datetime - end_datetime)
        pos = delta.find(':')
        hh = float(delta[:pos])
        mm = float(delta[pos+1:pos+3])/60
        rr = hh+mm
        rr = 24-round(rr, 2)
    else:
        delta = str(end_datetime - begin_datetime)
        pos = delta.find(':')
        hh = float(delta[:pos])
        mm = float(delta[pos+1:pos+3])/60
        rr = round(hh+mm, 2)

    return rr