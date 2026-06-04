from django.apps import AppConfig
from django.core.management import call_command


class AppointmentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'appointments'

    def ready(self):
        call_command('migrate', '--run-syncdb', verbosity=0)
