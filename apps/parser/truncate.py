# -*- coding: utf-8 -*-

from django.template import RequestContext
from django.shortcuts import render_to_response

from django.db import connections


def index(request, table=None):
    if request.user.is_superuser:
        sql_string = '''
            SET foreign_key_checks = 0;
            TRUNCATE TABLE {table};
            SET foreign_key_checks = 1;'''.format(table = table)
        cursor = connections['default'].cursor()
        cursor.execute(sql_string)
        title = "truncate table '"+table+"'"

        return render_to_response('inside/parse/info.html', locals(), RequestContext(request))
    else:
        return render_to_response('404.html', RequestContext(request))


def table(database=None, table=None):
    sql_string = '''
            SET foreign_key_checks = 0;
            TRUNCATE TABLE {table};
            SET foreign_key_checks = 1;'''.format(table = table)
    cursor = connections[database].cursor()
    cursor.execute(sql_string)
    return True

