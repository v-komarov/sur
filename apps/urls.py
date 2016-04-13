# Uncomment the next two lines to enable the admin:
from django.contrib import admin

admin.autodiscover()
from django.conf.urls import include, url
#import ajax.auth as ajax_auth
#import ajax.tags as ajax_tag

from apps.system.sentry_user import authorize
from apps.toolset import session, redirect
from toolset.explorer import views as explorer


urlpatterns = [
    #url(r'^admin/', admin.site.urls),
    url(r'^$', redirect.go,{'url':'/system/'}),
    url(r'^cabinet/', include('apps.cabinet.__url')),
    url(r'^monitor/', include('apps.monitor.url')),

    url(r'^post/', include('apps.post.__url')),
    url(r'^system/', include('apps.system.__url')),
    url(r'^task/', include('apps.task.__url')),

    #url(r'^parse/', include('apps.parse.__url')),
    #url(r'^profile/$', view_profile.registration),
    url(r'^explorer/$', explorer.index),
    url(r'^explorer/(?P<action>\w{1,10})/$', explorer.index),

    # Session
    url(r'^session/get/$', session.get),
    # Captcha
    #url(r'^captcha/', include('captcha.urls')),

    url(r'^logout/', authorize.logout_view ),

    ]