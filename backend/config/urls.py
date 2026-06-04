from django.urls import path, include
from appointments.views import health_check

urlpatterns = [
    path('health', health_check),
    path('api/', include('appointments.urls')),
]
