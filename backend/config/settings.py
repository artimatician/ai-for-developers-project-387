import os
import secrets
import dj_database_url

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-only-insecure-key')
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 'yes')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'appointments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'config.urls'

PRODUCTION_DB = os.environ.get('PRODUCTION_DB', '').lower() in ('true', '1', 'yes')

if PRODUCTION_DB:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': '/data/db.sqlite3',
            'OPTIONS': {
                'timeout': 2,
                'init_command': 'PRAGMA journal_mode=WAL',
            },
        }
    }
    if not os.environ.get('SECRET_KEY'):
        SECRET_KEY = secrets.token_urlsafe(50)
else:
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL:
        DATABASES = {'default': dj_database_url.parse(DATABASE_URL)}
    else:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': 'file:memory?mode=memory&cache=shared',
                'OPTIONS': {'uri': True},
            }
        }

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

USE_TZ = True
TIME_ZONE = 'UTC'

import os
import dj_database_url

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-only-insecure-key')
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 'yes')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'appointments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'config.urls'

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.parse(DATABASE_URL)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'file:memory?mode=memory&cache=shared',
            'OPTIONS': {'uri': True},
        }
    }

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

USE_TZ = True
TIME_ZONE = 'UTC'
