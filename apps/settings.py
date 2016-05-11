# coding: utf-8

import os
import settings_local

PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))
PROJECT_PATH = str(os.path.split(PROJECT_PATH)[0])

TEMPLATE_DEBUG = settings_local.DEBUG
DEBUG = settings_local.DEBUG

ADMINS = (('Roman', 'tayursky@gmail.com'),)

MANAGERS = ADMINS
DATABASES = settings_local.DATABASES

EMAIL_USE_TLS = False
EMAIL_CODEPAGE = 'utf-8'
EMAIL_SUBJECT_PREFIX = u''

#EMAIL_PORT = 587
#EMAIL_HOST = 'smtp.yandex.ru'
#EMAIL_HOST_USER = 'security.uragan@yandex.ru'
#EMAIL_HOST_USER = 'uragan.news@yandex.ru'
#EMAIL_HOST_USER = 'uragan-security@yandex.ru'
#EMAIL_HOST_USER = 'security.uragan24@yandex.ru'
#EMAIL_HOST_PASSWORD = 'th3ur1gan'

EMAIL_PORT = 25
EMAIL_HOST = 'mx1.uragan-group.ru'
EMAIL_HOST_USER = 'sms@uragan-group.ru'
EMAIL_HOST_PASSWORD = ''


# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['*']

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = False

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'Asia/Krasnoyarsk'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
#LANGUAGE_CODE = 'en-us'
LANGUAGE_CODE = 'ru-RU'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True



ROOT_URL = settings_local.ROOT_URL
MEDIA_ROOT = os.path.join(PROJECT_PATH, 'media')
MEDIA_URL = ROOT_URL+'media/'
STATIC_ROOT = os.path.join(PROJECT_PATH, 'static')
STATIC_URL = ROOT_URL # костыль для static

ADMIN_MEDIA_PREFIX = '/static/admin/'

# Additional locations of static files
STATICFILES_DIRS = (
    # os.path.join(PROJECT_PATH, 'static'),
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Use absolute paths, not relative paths.
)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'ft&d5!54f0#ey$t2!0&qc_v%clql^!+ud*6c=wo-i9*c0)4m*1'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'apps.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'apps.wsgi.application'


TEMPLATE_DIRS = (
    os.path.join(PROJECT_PATH, 'templates/'),
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
)

'''
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(PROJECT_PATH, 'templates/')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
'''

AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
#    'django.contrib.sites',
#    'django.contrib.admindocs',
    'apps.cabinet',
    'apps.parser',
    'apps.post',
    'apps.system',
    'apps.task',
    'apps.monitor',
#    'apps.parse',
#    'apps.profile',
#    'captcha'
)


SESSION_SAVE_EVERY_REQUEST = True


# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}


OPERATOR_EVT_MAX_ROWS = 300
