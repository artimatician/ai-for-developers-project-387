from datetime import datetime, timezone, timedelta

from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view
from rest_framework.response import Response

from appointments.models import EventType, Booking, Blackout
from appointments.serializers import (
    EventTypeSerializer,
    CreateEventTypeSerializer,
    UpdateEventTypeSerializer,
    PublicEventTypeSerializer,
    BookingSerializer,
    CreateBookingSerializer,
    GuestBookingResponseSerializer,
    BlackoutSerializer,
    CreateBlackoutSerializer,
    TimeSlotSerializer,
)
from appointments.services import generate_slots, validate_booking


def error_response(code, message, status):
    return Response({'code': code, 'message': message}, status=status)


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok'})


@api_view(['GET'])
def event_types_public(request):
    event_types = EventType.objects.filter(isActive=True)
    serializer = PublicEventTypeSerializer(event_types, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def event_type_detail_public(request, id):
    try:
        event_type = EventType.objects.get(id=id, isActive=True)
    except EventType.DoesNotExist:
        return error_response('EVENT_TYPE_NOT_FOUND', 'Event type not found', 404)
    serializer = EventTypeSerializer(event_type)
    return Response(serializer.data)


@api_view(['GET'])
def get_slots(request, id):
    try:
        event_type = EventType.objects.get(id=id, isActive=True)
    except EventType.DoesNotExist:
        return error_response('EVENT_TYPE_NOT_FOUND', 'Event type not found', 404)
    duration_param = request.query_params.get('duration')
    duration = int(duration_param) if duration_param else None
    if duration is not None:
        if duration < 15:
            return error_response('INVALID_INPUT', 'Duration must be at least 15 minutes', 400)
        if duration > event_type.duration:
            return error_response('INVALID_INPUT', f'Duration must not exceed event type maximum of {event_type.duration} minutes', 400)
        if duration % 15 != 0:
            return error_response('INVALID_INPUT', 'Duration must be a multiple of 15 minutes', 400)
    slots = generate_slots(event_type, duration=duration)
    serializer = TimeSlotSerializer(slots, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_booking(request):
    serializer = CreateBookingSerializer(data=request.data)
    if not serializer.is_valid():
        errors = serializer.errors
        first_error = next(iter(errors.values()))
        return error_response('INVALID_INPUT', str(first_error[0]), 400)

    data = serializer.validated_data
    event_type_id = data['eventTypeId']
    start_time = data['startTime']
    guest_name = data['guestName']
    notes = data.get('notes')
    duration = data.get('duration')

    event_type, err, status = validate_booking(event_type_id, start_time, duration=duration)
    if err:
        return error_response(err['code'], err['message'], status)

    if duration is None:
        duration = event_type.duration
    end_time = start_time + timedelta(minutes=duration)
    booking = Booking.objects.create(
        eventTypeId=event_type,
        eventTypeName=event_type.name,
        guestName=guest_name,
        notes=notes,
        startTime=start_time,
        endTime=end_time,
    )
    response_serializer = GuestBookingResponseSerializer({
        'startTime': booking.startTime,
        'endTime': booking.endTime,
        'eventTypeName': booking.eventTypeName,
        'duration': duration,
    })
    return Response(response_serializer.data, status=201)


@api_view(['GET', 'POST'])
def event_types_owner(request):
    if request.method == 'GET':
        event_types = EventType.objects.all().order_by('createdAt')
        serializer = EventTypeSerializer(event_types, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CreateEventTypeSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            first_error = next(iter(errors.values()))
            return error_response('INVALID_INPUT', str(first_error[0]), 400)

        data = serializer.validated_data
        event_type = EventType.objects.create(
            name=data['name'],
            description=data['description'],
            timezone=data.get('timezone', 'UTC'),
            duration=data.get('duration', 30),
        )
        output = EventTypeSerializer(event_type)
        return Response(output.data, status=201)


@api_view(['GET', 'PATCH'])
def event_type_detail_owner(request, id):
    try:
        event_type = EventType.objects.get(id=id)
    except EventType.DoesNotExist:
        return error_response('EVENT_TYPE_NOT_FOUND', 'Event type not found', 404)

    if request.method == 'GET':
        serializer = EventTypeSerializer(event_type)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = UpdateEventTypeSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            errors = serializer.errors
            first_error = next(iter(errors.values()))
            return error_response('INVALID_INPUT', str(first_error[0]), 400)

        data = serializer.validated_data
        for field, value in data.items():
            setattr(event_type, field, value)
        event_type.save()
        output = EventTypeSerializer(event_type)
        return Response(output.data)


@api_view(['GET'])
def list_bookings(request):
    queryset = Booking.objects.all()

    event_type_id = request.query_params.get('eventTypeId')
    if event_type_id:
        queryset = queryset.filter(eventTypeId__id=event_type_id)

    from_param = request.query_params.get('from')
    if from_param:
        from_dt = datetime.fromisoformat(from_param.replace('Z', '+00:00'))
        queryset = queryset.filter(startTime__gte=from_dt)

    to_param = request.query_params.get('to')
    if to_param:
        to_dt = datetime.fromisoformat(to_param.replace('Z', '+00:00'))
        queryset = queryset.filter(startTime__lte=to_dt)

    limit = int(request.query_params.get('limit', 20))
    offset = int(request.query_params.get('offset', 0))

    queryset = queryset.order_by('startTime')[offset:offset + limit]
    serializer = BookingSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def blackouts_owner(request):
    if request.method == 'GET':
        blackouts = Blackout.objects.all().order_by('startTime')
        serializer = BlackoutSerializer(blackouts, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CreateBlackoutSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            non_field_errors = errors.get('non_field_errors')
            if non_field_errors:
                return error_response('INVALID_INPUT', str(non_field_errors[0]), 400)
            first_error = next(iter(errors.values()))
            return error_response('INVALID_INPUT', str(first_error[0]), 400)

        data = serializer.validated_data
        blackout = Blackout.objects.create(
            startTime=data['startTime'],
            endTime=data['endTime'],
            reason=data.get('reason'),
        )
        output = BlackoutSerializer(blackout)
        return Response(output.data, status=201)


@api_view(['DELETE'])
def delete_blackout(request, id):
    try:
        blackout = Blackout.objects.get(id=id)
    except Blackout.DoesNotExist:
        return error_response('BLACKOUT_NOT_FOUND', 'Blackout not found', 404)
    blackout.delete()
    return Response(status=204)
