# -*- coding: utf-8 -*-

import datetime
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session


### Заготовка ###
#### Количество активных пользователей #### 25.12.2015 заготовка в окончательном варианте не реализована ####
def process_request(self, request):
    now = datetime.datetime.now()
    delta = now - datetime.timedelta(seconds=settings.USER_ONLINE_TIMEOUT)
    users_online = cache.get('django_users_online', {})

    if request.user.is_authenticated():
        users_online[request.user.id] = now

    for user_id in users_online.keys():
        if users_online[user_id] < delta:
            del users_online[user_id]

    cache.set('django_users_online', users_online, 60 * 60 * 24)


###

'''
#### Число авторизованных пользователей #### 25.12.2015 - в "боевых" условиях не протестировано !!!
def authusers():
    return (AuthUser.objects.filter(is_active=1).count())


#### Ограничение по количеству активных пользователей #### 25.12.2015 - в "боевых" условиях не протестировано !!!
def checkactiveusers(request,user):
    if  authusers() > 911:
        user.is_active = 0
        user.save()
        return False
    else:
        return True
'''