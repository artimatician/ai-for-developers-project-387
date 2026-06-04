from rest_framework import serializers
from appointments.models import EventType, Booking, Blackout


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ['id', 'name', 'description', 'timezone', 'isActive', 'createdAt']
        read_only_fields = ['id', 'createdAt']


class CreateEventTypeSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=1000)
    description = serializers.CharField(max_length=1000)
    timezone = serializers.CharField(max_length=100, default='UTC', required=False)

    def validate_timezone(self, value):
        from appointments.services import is_valid_timezone
        if not is_valid_timezone(value):
            raise serializers.ValidationError(f"Invalid timezone: {value}")
        return value


class UpdateEventTypeSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=1000, required=False)
    description = serializers.CharField(max_length=1000, required=False)
    timezone = serializers.CharField(max_length=100, required=False)
    isActive = serializers.BooleanField(required=False)

    def validate_timezone(self, value):
        from appointments.services import is_valid_timezone
        if not is_valid_timezone(value):
            raise serializers.ValidationError(f"Invalid timezone: {value}")
        return value


class PublicEventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ['id', 'name', 'description', 'timezone']


class BookingSerializer(serializers.ModelSerializer):
    eventTypeId = serializers.UUIDField(source='eventTypeId.id', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'eventTypeId', 'eventTypeName', 'guestName', 'notes', 'startTime', 'endTime', 'createdAt']
        read_only_fields = ['id', 'createdAt']


class CreateBookingSerializer(serializers.Serializer):
    eventTypeId = serializers.UUIDField()
    startTime = serializers.DateTimeField()
    guestName = serializers.CharField(max_length=1000)
    notes = serializers.CharField(max_length=1000, allow_null=True, required=False)


class GuestBookingResponseSerializer(serializers.Serializer):
    startTime = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%SZ')
    endTime = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%SZ')
    eventTypeName = serializers.CharField()


class BlackoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blackout
        fields = ['id', 'startTime', 'endTime', 'reason', 'createdAt']
        read_only_fields = ['id', 'createdAt']


class CreateBlackoutSerializer(serializers.Serializer):
    startTime = serializers.DateTimeField()
    endTime = serializers.DateTimeField()
    reason = serializers.CharField(max_length=1000, allow_null=True, required=False)

    def validate(self, data):
        if data['endTime'] <= data['startTime']:
            raise serializers.ValidationError("endTime must be after startTime")
        return data


class TimeSlotSerializer(serializers.Serializer):
    startTime = serializers.CharField()
    endTime = serializers.CharField()
    available = serializers.BooleanField()


class ErrorSerializer(serializers.Serializer):
    code = serializers.CharField()
    message = serializers.CharField()
