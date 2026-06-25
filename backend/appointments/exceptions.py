from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    if isinstance(exc, Throttled):
        return Response(
            {
                'code': 'RATE_LIMITED',
                'message': f'Too many requests. Try again in {exc.wait} seconds.',
            },
            status=429,
        )
    return exception_handler(exc, context)
