import threading

from django.apps import AppConfig
from django.core.management import call_command
from django.db.backends.signals import connection_created

_migrated = False
_lock = threading.RLock()


def _auto_migrate(sender, connection, **kwargs):
    global _migrated
    if _migrated:
        return
    with _lock:
        if _migrated:
            return
        call_command('migrate', '--run-syncdb', verbosity=0)
        _migrated = True


class AppointmentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'appointments'

    def ready(self):
        connection_created.connect(_auto_migrate, dispatch_uid='appointments_auto_migrate')
