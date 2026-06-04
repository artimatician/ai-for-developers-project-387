from django.urls import path
from appointments import views

urlpatterns = [
    path('event-types', views.event_types_public),
    path('event-types/<uuid:id>', views.event_type_detail_public),
    path('event-types/<uuid:id>/slots', views.get_slots),
    path('bookings', views.create_booking),

    path('owner/event-types', views.event_types_owner),
    path('owner/event-types/<uuid:id>', views.event_type_detail_owner),
    path('owner/bookings', views.list_bookings),
    path('owner/blackouts', views.blackouts_owner),
    path('owner/blackouts/<uuid:id>', views.delete_blackout),
]
