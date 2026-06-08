from datetime import datetime, timedelta, timezone

import zoneinfo

from appointments.models import EventType, Booking, Blackout

SLOT_INTERVAL = timedelta(minutes=15)


def is_valid_timezone(tz_string: str) -> bool:
    try:
        zoneinfo.ZoneInfo(tz_string)
        return True
    except Exception:
        return False


def parse_datetime(dt_string: str) -> datetime:
    dt_string = dt_string.replace('Z', '+00:00')
    dt = datetime.fromisoformat(dt_string)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def generate_slots(event_type, duration=None):
    if duration is None:
        duration = event_type.duration
    tz = zoneinfo.ZoneInfo(event_type.timezone)
    now = datetime.now(timezone.utc)

    local_now = now.astimezone(tz)
    today = local_now.date()

    bookings = list(Booking.objects.all())
    blackouts = list(Blackout.objects.all())

    slots = []
    for day_offset in range(14):
        day = today + timedelta(days=day_offset)

        window_start_utc = datetime(day.year, day.month, day.day, 9, 0, tzinfo=tz).astimezone(timezone.utc)
        window_end_utc = datetime(day.year, day.month, day.day, 18, 0, tzinfo=tz).astimezone(timezone.utc)

        slot_start = window_start_utc
        while slot_start + timedelta(minutes=duration) <= window_end_utc:
            slot_end = slot_start + timedelta(minutes=duration)

            available = True

            for booking in bookings:
                if booking.startTime < slot_end and booking.endTime > slot_start:
                    available = False
                    break

            if available:
                for blackout in blackouts:
                    if blackout.startTime < slot_end and blackout.endTime > slot_start:
                        available = False
                        break

            if slot_start < now:
                available = False

            slots.append({
                'startTime': slot_start.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'endTime': slot_end.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'available': available,
            })

            slot_start += SLOT_INTERVAL

    return slots


def validate_booking(event_type_id, start_time, duration=None):
    try:
        event_type = EventType.objects.get(id=event_type_id)
    except EventType.DoesNotExist:
        return None, {'code': 'EVENT_TYPE_NOT_FOUND', 'message': 'Event type not found'}, 404

    if not event_type.isActive:
        return None, {'code': 'EVENT_TYPE_INACTIVE', 'message': 'Event type is not active'}, 404

    if duration is None:
        duration = event_type.duration

    if duration < 15:
        return None, {'code': 'INVALID_INPUT', 'message': 'Duration must be at least 15 minutes'}, 400
    if duration > 480:
        return None, {'code': 'INVALID_INPUT', 'message': 'Duration must not exceed 480 minutes'}, 400
    if duration % 15 != 0:
        return None, {'code': 'INVALID_INPUT', 'message': 'Duration must be a multiple of 15 minutes'}, 400
    if duration > event_type.duration:
        return None, {'code': 'INVALID_INPUT', 'message': f'Duration must not exceed event type maximum of {event_type.duration} minutes'}, 400

    tz = zoneinfo.ZoneInfo(event_type.timezone)
    local_start = start_time.astimezone(tz)

    if local_start.minute % 15 != 0 or local_start.second != 0 or local_start.microsecond != 0:
        return None, {'code': 'INVALID_INPUT', 'message': 'Start time must align with a 15-minute slot boundary'}, 400

    if local_start.hour < 9 or local_start.hour >= 18:
        return None, {'code': 'INVALID_INPUT', 'message': 'Start time must be within operating hours (09:00-18:00)'}, 400

    end_time = start_time + timedelta(minutes=duration)
    local_end = end_time.astimezone(tz)
    if local_end.hour > 18 or (local_end.hour == 18 and local_end.minute > 0):
        return None, {'code': 'INVALID_INPUT', 'message': 'End time must be within operating hours (09:00-18:00)'}, 400

    now = datetime.now(timezone.utc)
    if start_time < now:
        return None, {'code': 'INVALID_INPUT', 'message': 'Cannot book a slot in the past'}, 400

    conflicting_booking = Booking.objects.filter(
        startTime__lt=end_time,
        endTime__gt=start_time,
    ).exists()
    if conflicting_booking:
        return None, {'code': 'SLOT_UNAVAILABLE', 'message': 'This time slot is already booked'}, 409

    conflicting_blackout = Blackout.objects.filter(
        startTime__lt=end_time,
        endTime__gt=start_time,
    ).exists()
    if conflicting_blackout:
        return None, {'code': 'SLOT_UNAVAILABLE', 'message': 'This time slot is blocked by a blackout'}, 409

    return event_type, None, None
