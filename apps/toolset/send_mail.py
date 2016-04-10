# -*- coding: utf-8 -*-

from django.core import mail

from apps.system import models as db_sentry


def send(email=None, title=None, message=None):

    if email == 'managers':
        managers = db_sentry.users_groups.objects.filter(group_id=4)
        email = []
        for item in managers:
            email.append(item.user.email.encode('utf-8'))

    connection = mail.get_connection()
    connection.open()

    #email = mail.EmailMessage(title, message, 'security.uragan24@yandex.ru', email, connection=connection)
    email = mail.EmailMessage(title, message, 'sms@uragan-group.ru', email, connection=connection)
    email.content_subtype = 'html'
    email.send()
    connection.close()

#sms@uragan-group.ru