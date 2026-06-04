import uuid

from django.db import models


class EventType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=1000)
    description = models.CharField(max_length=1000)
    timezone = models.CharField(max_length=100, default='UTC')
    isActive = models.BooleanField(default=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_types'


class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    eventTypeId = models.ForeignKey(
        EventType, on_delete=models.CASCADE, db_column='eventTypeId'
    )
    eventTypeName = models.CharField(max_length=1000)
    guestName = models.CharField(max_length=1000)
    notes = models.CharField(max_length=1000, blank=True, null=True)
    startTime = models.DateTimeField()
    endTime = models.DateTimeField()
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bookings'


class Blackout(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    startTime = models.DateTimeField()
    endTime = models.DateTimeField()
    reason = models.CharField(max_length=1000, blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'blackouts'
