import os

from rest_framework.throttling import AnonRateThrottle


class ClientAnonRateThrottle(AnonRateThrottle):
    def get_ident(self, request):
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        if xff:
            return xff.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')

    def allow_request(self, request, view):
        if os.environ.get('DISABLE_RATE_LIMIT', '').lower() in ('true', '1'):
            return True
        return super().allow_request(request, view)
