#!/bin/bash
cd "$(dirname "$0")"
python manage.py migrate --run-syncdb 2>/dev/null
python manage.py runserver 0.0.0.0:4010 --noreload
