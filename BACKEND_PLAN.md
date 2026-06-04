# Backend Implementation Plan — Schedule a Call

> This document contains the full, decision-locked plan for implementing the Django backend.
> All design decisions have been resolved. Implementation should follow this document directly.

---

## 1. Stack & Infrastructure

| Component | Choice |
|-----------|--------|
| Framework | Django 5.2 + Django REST Framework 3.15 |
| CORS | django-cors-headers (allow all origins `*`) |
| Database | SQLite `:memory:` — resets on every server restart |
| Port | 4010 (matches frontend default `NEXT_PUBLIC_API_URL`) |
| Response format | JSON only (no browsable API renderer) |
| IDs | UUID v4, auto-generated |
| Datetimes | ISO 8601 UTC strings (`2026-01-15T10:00:00Z`) |

## 2. Dependencies (`requirements.txt`)

```
django>=5.2
djangorestframework>=3.15
django-cors-headers>=4.6
```

## 3. Project Structure

```
backend/
  manage.py
  requirements.txt
  run.sh                     — migrate + runserver --noreload on :4010
  config/
    __init__.py
    settings.py              — Django settings
    urls.py                  — root URL config
    wsgi.py
  appointments/
    __init__.py
    apps.py
    models.py                — EventType, Booking, Blackout
    serializers.py           — DRF serializers for all models + requests/responses
    views.py                 — all 13 API view functions
    urls.py                  — URL routing matching spec exactly
    services.py              — slot generation algorithm, conflict checks, validation helpers
    tests/
      __init__.py
      test_health.py
      test_event_types.py
      test_bookings.py
      test_blackouts.py
      test_slots.py
```

## 4. Django Settings (`config/settings.py`)

Key settings:

```python
SECRET_KEY = 'dev-only-insecure-key'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'appointments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'config.urls'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

USE_TZ = True
TIME_ZONE = 'UTC'
```

**Auto-migration on startup**: Use `appointments/apps.py` `AppConfig.ready()` to run `call_command('migrate', '--run-syncdb', verbosity=0)` so the in-memory tables are created on every process start.

**Dev server**: Must run with `--noreload` to avoid the reloader spawning a new process (which would lose the in-memory DB).

## 5. URL Routing (`config/urls.py`)

```python
from django.urls import path, include
from appointments.views import health_check

urlpatterns = [
    path('health', health_check),
    path('api/', include('appointments.urls')),
]
```

## 6. URL Routing (`appointments/urls.py`)

```python
from django.urls import path
from appointments import views

urlpatterns = [
    # Guest / Public endpoints
    path('event-types', views.list_active_event_types),
    path('event-types/<uuid:id>', views.get_active_event_type),
    path('event-types/<uuid:id>/slots', views.get_slots),
    path('bookings', views.create_booking),

    # Owner endpoints
    path('owner/event-types', views.list_event_types),
    path('owner/event-types', views.create_event_type),          # POST on same path
    path('owner/event-types/<uuid:id>', views.get_event_type),
    path('owner/event-types/<uuid:id>', views.update_event_type), # PATCH
    path('owner/bookings', views.list_bookings),
    path('owner/blackouts', views.list_blackouts),
    path('owner/blackouts', views.create_blackout),               # POST
    path('owner/blackouts/<uuid:id>', views.delete_blackout),
]
```

**Implementation note**: Since Django URL patterns don't dispatch by HTTP method, views that share a path (e.g., GET/POST on same URL) are handled inside the view function using `request.method`. Alternatively, combine them into a single view that routes by method. The simplest approach: use `@api_view(['GET', 'POST'])` decorators and branch on `request.method` inside the view, or use separate views and reference the same path — but Django doesn't allow duplicate `path()` entries. Instead, make single view functions per URL that handle multiple methods.

**Final URL design — combine views per shared path**:

```python
urlpatterns = [
    # Guest / Public
    path('event-types', views.event_types_public),
    path('event-types/<uuid:id>', views.event_type_detail_public),
    path('event-types/<uuid:id>/slots', views.get_slots),
    path('bookings', views.create_booking),

    # Owner
    path('owner/event-types', views.event_types_owner),
    path('owner/event-types/<uuid:id>', views.event_type_detail_owner),
    path('owner/bookings', views.list_bookings),
    path('owner/blackouts', views.blackouts_owner),
    path('owner/blackouts/<uuid:id>', views.delete_blackout),
]
```

Where:
- `event_types_public` handles GET only (list active)
- `event_type_detail_public` handles GET only (get active by id)
- `get_slots` handles GET only
- `create_booking` handles POST only
- `event_types_owner` handles GET (list all) and POST (create)
- `event_type_detail_owner` handles GET (get by id) and PATCH (update)
- `list_bookings` handles GET only
- `blackouts_owner` handles GET (list) and POST (create)
- `delete_blackout` handles DELETE only

## 7. Models (`appointments/models.py`)

### EventType

| Field | Type | Notes |
|-------|------|-------|
| `id` | `UUIDField` (primary_key=True, default=uuid.uuid4) | Auto-generated UUID v4 |
| `name` | `CharField` (max_length=1000) | Required |
| `description` | `CharField` (max_length=1000) | Required |
| `timezone` | `CharField` (max_length=100, default='UTC') | IANA timezone ID |
| `isActive` | `BooleanField` (default=True) | Soft-delete flag |
| `createdAt` | `DateTimeField` (auto_now_add=True) | Set on creation |

- No hard DELETE support
- `isActive=False` hides from guest endpoints

### Booking

| Field | Type | Notes |
|-------|------|-------|
| `id` | `UUIDField` (primary_key=True, default=uuid.uuid4) | |
| `eventTypeId` | `ForeignKey(EventType, on_delete=CASCADE, db_column='eventTypeId')` | Must reference active EventType on creation |
| `eventTypeName` | `CharField` (max_length=1000) | Snapshot at booking time |
| `guestName` | `CharField` (max_length=1000) | Required |
| `notes` | `CharField` (max_length=1000, blank=True, null=True) | Optional |
| `startTime` | `DateTimeField` | UTC |
| `endTime` | `DateTimeField` | Computed: startTime + 30 min |
| `createdAt` | `DateTimeField` (auto_now_add=True) | |

### Blackout

| Field | Type | Notes |
|-------|------|-------|
| `id` | `UUIDField` (primary_key=True, default=uuid.uuid4) | |
| `startTime` | `DateTimeField` | UTC, must be before endTime |
| `endTime` | `DateTimeField` | UTC, must be after startTime |
| `reason` | `CharField` (max_length=1000, blank=True, null=True) | Optional |
| `createdAt` | `DateTimeField` (auto_now_add=True) | |

**Model Meta**: No special constraints at DB level (in-memory SQLite). Conflict prevention for bookings is enforced at the application level in `services.py`.

## 8. Serializers (`appointments/serializers.py`)

| Serializer | Fields | Notes |
|------------|--------|-------|
| `EventTypeSerializer` | id, name, description, timezone, isActive, createdAt | Full resource |
| `CreateEventTypeSerializer` | name (required), description (required), timezone (optional, default UTC) | Input only, validates timezone |
| `UpdateEventTypeSerializer` | name?, description?, timezone?, isActive? | All optional, validates timezone if provided |
| `PublicEventTypeSerializer` | id, name, description, timezone | Subset for guest list |
| `BookingSerializer` | id, eventTypeId, eventTypeName, guestName, notes, startTime, endTime, createdAt | Full resource for owner |
| `CreateBookingSerializer` | eventTypeId (required), startTime (required), guestName (required), notes? | Input only, validates event type exists and active |
| `GuestBookingResponseSerializer` | startTime, endTime, eventTypeName | Response subset for guest |
| `BlackoutSerializer` | id, startTime, endTime, reason, createdAt | Full resource |
| `CreateBlackoutSerializer` | startTime (required), endTime (required), reason? | Input only, validates endTime > startTime |
| `TimeSlotSerializer` | startTime, endTime, available | Computed, read-only |
| `ErrorSerializer` | code, message | Error response |

**DateTime format**: All DateTimeField serializers use `format='%Y-%m-%dT%H:%M:%SZ'` to produce ISO 8601 UTC strings.

**eventTypeId serialization**: The FK field should serialize as `eventTypeId` (not `eventTypeId_id` or `event_type_id`). Use `source='eventTypeId'` on the serializer field if needed to control the JSON key name. The FK model field is named `eventTypeId` and `db_column='eventTypeId'` ensures the column name matches. In the serializer, use `PrimaryKeyRelatedField` for input and write the UUID string for output.

**createdAt**: Auto-generated, read-only. Use `read_only=True, default=None` and set in the view or rely on `auto_now_add`.

**notes**: Nullable — must serialize as `null` when absent, not omit the key. Use `allow_null=True, required=False`.

**reason**: Same as notes — nullable, `allow_null=True, required=False`.

## 9. Services (`appointments/services.py`)

### 9.1 Timezone Validation

```python
import zoneinfo

def is_valid_timezone(tz_string: str) -> bool:
    try:
        zoneinfo.ZoneInfo(tz_string)
        return True
    except Exception:
        return False
```

### 9.2 Slot Generation Algorithm

```python
from datetime import datetime, timedelta, timezone
import zoneinfo

SLOT_DURATION = timedelta(minutes=30)

def generate_slots(event_type):
    """
    Generate all slots for the 14-day window for a given EventType.
    Returns list of dicts: { 'startTime': str, 'endTime': str, 'available': bool }
    """
    tz = zoneinfo.ZoneInfo(event_type.timezone)
    now = datetime.now(timezone.utc)
    
    # Determine "today" in the event type's timezone
    local_now = now.astimezone(tz)
    today = local_now.date()
    
    # Fetch all bookings and blackouts for overlap checks
    bookings = Booking.objects.all()
    blackouts = Blackout.objects.all()
    
    slots = []
    for day_offset in range(14):
        day = today + timedelta(days=day_offset)
        
        # Operating hours: 09:00 - 18:00 in event type's timezone
        window_start_utc = datetime(day.year, day.month, day.day, 9, 0, tzinfo=tz).astimezone(timezone.utc)
        window_end_utc = datetime(day.year, day.month, day.day, 18, 0, tzinfo=tz).astimezone(timezone.utc)
        
        slot_start = window_start_utc
        while slot_start + SLOT_DURATION <= window_end_utc:
            slot_end = slot_start + SLOT_DURATION
            
            available = True
            # Check booking overlap (global — across all event types)
            for booking in bookings:
                if booking.startTime < slot_end and booking.endTime > slot_start:
                    available = False
                    break
            
            # Check blackout overlap (global — across all event types)
            if available:
                for blackout in blackouts:
                    if blackout.startTime < slot_end and blackout.endTime > slot_start:
                        available = False
                        break
            
            # Slots in the past are unavailable
            if slot_start < now:
                available = False
            
            slots.append({
                'startTime': slot_start.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'endTime': slot_end.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'available': available,
            })
            
            slot_start = slot_end
    
    return slots
```

**Key decisions baked in**:
- "Today" is determined in the event type's timezone (not UTC)
- Slots in the past are marked `available: false`
- Booking overlap is global (across all event types)
- Blackout overlap is global (across all event types)
- 14-day window: today (in tz) + 13 more days
- Fixed 30-minute slot duration
- Contiguous, no padding, no gaps

### 9.3 Booking Validation

```python
def validate_booking(event_type_id, start_time):
    """
    Validate a booking request.
    Returns (event_type, error_response, status_code) or (event_type, None, None) on success.
    """
    # 1. Check event type exists and is active
    try:
        event_type = EventType.objects.get(id=event_type_id)
    except EventType.DoesNotExist:
        return None, {'code': 'EVENT_TYPE_NOT_FOUND', 'message': 'Event type not found'}, 404
    
    if not event_type.isActive:
        return None, {'code': 'EVENT_TYPE_INACTIVE', 'message': 'Event type is not active'}, 404
    
    # 2. Check slot boundary alignment
    #    startTime must land on an exact 30-min boundary within operating hours
    tz = zoneinfo.ZoneInfo(event_type.timezone)
    local_start = start_time.astimezone(tz)
    
    # Must be on a 30-minute mark
    if local_start.minute % 30 != 0 or local_start.second != 0 or local_start.microsecond != 0:
        return None, {'code': 'INVALID_INPUT', 'message': 'Start time must align with a 30-minute slot boundary'}, 400
    
    # Must be within operating hours (09:00-18:00 in event type's timezone)
    if local_start.hour < 9 or local_start.hour >= 18:
        return None, {'code': 'INVALID_INPUT', 'message': 'Start time must be within operating hours (09:00-18:00)'}, 400
    
    # Must be today or in the future (in event type's timezone)
    now = datetime.now(timezone.utc)
    if start_time < now:
        return None, {'code': 'INVALID_INPUT', 'message': 'Cannot book a slot in the past'}, 400
    
    # 3. Check global booking conflict (any event type)
    end_time = start_time + timedelta(minutes=30)
    conflicting_booking = Booking.objects.filter(
        startTime__lt=end_time,
        endTime__gt=start_time,
    ).exists()
    if conflicting_booking:
        return None, {'code': 'SLOT_UNAVAILABLE', 'message': 'This time slot is already booked'}, 409
    
    # 4. Check blackout conflict
    conflicting_blackout = Blackout.objects.filter(
        startTime__lt=end_time,
        endTime__gt=start_time,
    ).exists()
    if conflicting_blackout:
        return None, {'code': 'SLOT_UNAVAILABLE', 'message': 'This time slot is blocked by a blackout'}, 409
    
    return event_type, None, None
```

### 9.4 Helper: Parse ISO 8601 datetime strings

```python
from datetime import datetime, timezone

def parse_datetime(dt_string: str) -> datetime:
    """Parse ISO 8601 datetime string to timezone-aware UTC datetime."""
    # Handle both 'Z' suffix and '+00:00' format
    dt_string = dt_string.replace('Z', '+00:00')
    dt = datetime.fromisoformat(dt_string)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)
```

## 10. Views (`appointments/views.py`)

### 10.1 Health Check

```
GET /health → { "status": "ok" }
```

### 10.2 Guest Endpoints

**`event_types_public(request)`** — GET `/api/event-types`

- Returns only `EventType` objects where `isActive=True`
- Serialized with `PublicEventTypeSerializer` (id, name, description, timezone)

**`event_type_detail_public(request, id)`** — GET `/api/event-types/{id}`

- Returns full `EventType` (all fields) if `isActive=True`, 404 otherwise
- 404 also if not found at all
- Error code: `EVENT_TYPE_NOT_FOUND`

**`get_slots(request, id)`** — GET `/api/event-types/{id}/slots`

- Returns 404 if event type doesn't exist
- Returns 404 if event type is inactive (same as "not found" for guests)
- Calls `generate_slots(event_type)` from services
- Returns array of `TimeSlot` objects

**`create_booking(request)`** — POST `/api/bookings`

- Parse request body with `CreateBookingSerializer`
- Validates required fields (eventTypeId, startTime, guestName)
- Validates eventTypeId references an active EventType → 404
- Validates startTime alignment and past check → 400
- Checks booking conflict → 409
- Checks blackout conflict → 409
- Creates Booking: `endTime = startTime + 30min`, `eventTypeName = eventType.name` (snapshot)
- Returns `GuestBookingResponse` (startTime, endTime, eventTypeName) with status 201

### 10.3 Owner Endpoints

**`event_types_owner(request)`** — handles GET/POST on `/api/owner/event-types`

- GET: Returns ALL event types (including inactive), serialized with `EventTypeSerializer`
- POST: Create new event type from `CreateEventTypeSerializer`, validates timezone, returns 201

**`event_type_detail_owner(request, id)`** — handles GET/PATCH on `/api/owner/event-types/{id}`

- GET: Returns full event type by id, 404 if not found
- PATCH: Partial update using `UpdateEventTypeSerializer`, validates timezone if provided, 404 if not found

**`list_bookings(request)`** — GET `/api/owner/bookings`

- Query params: `eventTypeId`, `from`, `to`, `limit` (default 20), `offset` (default 0)
- Filter by `eventTypeId` if provided
- Filter by `startTime >= from` if provided
- Filter by `startTime <= to` if provided
- Order by `startTime` ascending
- Apply limit/offset pagination
- Return array of `BookingSerializer`

**`blackouts_owner(request)`** — handles GET/POST on `/api/owner/blackouts`

- GET: Returns all blackouts, serialized with `BlackoutSerializer`
- POST: Create new blackout from `CreateBlackoutSerializer`, validates `endTime > startTime`, returns 201

**`delete_blackout(request, id)`** — DELETE `/api/owner/blackouts/{id}`

- 204 No Content on success
- 404 if blackout not found, error code: `BLACKOUT_NOT_FOUND`

## 11. Error Response Format

All error responses follow:

```json
{
  "code": "MACHINE_READABLE_CODE",
  "message": "Human-readable description"
}
```

### Error Codes

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | `INVALID_INPUT` | Validation failure (missing fields, bad format, slot misalignment, past time, bad timezone, endTime <= startTime) |
| 404 | `EVENT_TYPE_NOT_FOUND` | Event type ID doesn't exist (owner or guest) |
| 404 | `EVENT_TYPE_INACTIVE` | Guest accesses inactive event type (for GET or booking) |
| 404 | `BLACKOUT_NOT_FOUND` | Blackout ID doesn't exist (on DELETE) |
| 409 | `SLOT_UNAVAILABLE` | Booking conflicts with existing booking or blackout |

**Note**: For guest endpoints accessing inactive event types, we return 404 with `EVENT_TYPE_INACTIVE` code — guests shouldn't distinguish between "doesn't exist" and "inactive". But the error code field reveals this distinction. This is intentional per the spec.

## 12. CORS Configuration

```python
# In settings.py
CORS_ALLOW_ALL_ORIGINS = True
```

This allows the Next.js frontend on any port to communicate with the backend.

## 13. `run.sh`

```bash
#!/bin/bash
cd "$(dirname "$0")"
python manage.py migrate --run-syncdb 2>/dev/null
python manage.py runserver 0.0.0.0:4010 --noreload
```

The `--noreload` flag is critical for in-memory SQLite — the Django reloader spawns a new process which would lose the in-memory database.

## 14. Test Plan

### `test_health.py`
- GET `/health` → 200, `{ "status": "ok" }`

### `test_event_types.py`

**Owner endpoints:**
- `GET /api/owner/event-types` → 200, empty list initially
- `POST /api/owner/event-types` → 201, creates event type with defaults (isActive=true, timezone=UTC)
- `POST /api/owner/event-types` with invalid timezone → 400
- `POST /api/owner/event-types` with missing name → 400
- `GET /api/owner/event-types` after creation → 200, list includes item
- `GET /api/owner/event-types/{id}` → 200, full event type
- `GET /api/owner/event-types/{nonexistent}` → 404
- `PATCH /api/owner/event-types/{id}` → 200, partial update works
- `PATCH /api/owner/event-types/{id}` with `isActive: false` → 200, soft-deletes
- `PATCH /api/owner/event-types/{nonexistent}` → 404
- Verify createdAt is auto-generated and ISO 8601
- Verify id is UUID v4

**Guest endpoints:**
- `GET /api/event-types` → 200, only active event types (excludes inactive)
- `GET /api/event-types/{active_id}` → 200, full event type
- `GET /api/event-types/{inactive_id}` → 404
- `GET /api/event-types/{nonexistent}` → 404

### `test_bookings.py`

**Guest booking creation:**
- `POST /api/bookings` with valid data → 201, returns GuestBookingResponse
- Verify response has startTime, endTime (startTime + 30min), eventTypeName (snapshot)
- Verify response does NOT include id, notes, eventTypeId, guestName
- `POST /api/bookings` with nonexistent eventTypeId → 404
- `POST /api/bookings` with inactive eventTypeId → 404
- `POST /api/bookings` for a past time slot → 400
- `POST /api/bookings` with misaligned startTime (not on 30-min boundary) → 400
- `POST /api/bookings` with startTime outside operating hours → 400
- `POST /api/bookings` that conflicts with existing booking → 409
- `POST /api/bookings` that conflicts with blackout → 409
- `POST /api/bookings` with missing required fields → 400
- `POST /api/bookings` — verify endTime is startTime + 30 minutes
- Notes field is optional — omitting it should work

**Owner booking list:**
- `GET /api/owner/bookings` → 200, list of bookings
- `GET /api/owner/bookings?eventTypeId=...` → filtered by event type
- `GET /api/owner/bookings?from=...&to=...` → filtered by time range
- `GET /api/owner/bookings?limit=5&offset=0` → paginated
- Verify default limit=20, offset=0
- Verify ordering by startTime ascending

### `test_blackouts.py`

- `GET /api/owner/blackouts` → 200, empty list initially
- `POST /api/owner/blackouts` → 201, creates blackout
- `POST /api/owner/blackouts` with endTime <= startTime → 400
- `POST /api/owner/blackouts` with missing required fields → 400
- `DELETE /api/owner/blackouts/{id}` → 204
- `DELETE /api/owner/blackouts/{nonexistent}` → 404
- Blackout blocks new bookings (verified in test_bookings.py)

### `test_slots.py`

- `GET /api/event-types/{id}/slots` → 200, array of TimeSlot objects
- Verify 14-day window (today through today+13)
- Verify each day has 18 slots (09:00–18:00 / 30 min = 18 slots)
- Verify `available: true` for open slots
- Verify slots are in UTC
- Verify slots for past times are marked `available: false`
- Create a booking → verify its slot is marked `available: false`
- Create a blackout → verify overlapping slots are marked `available: false`
- Cross-event-type: booking on EventType A also marks slot unavailable for EventType B
- `GET /api/event-types/{inactive_id}/slots` → 404
- `GET /api/event-types/{nonexistent}/slots` → 404
- Verify slot generation uses event type's timezone (test with "America/New_York")
- Verify DST boundary handling (if applicable)

## 15. Implementation Order

1. **Project scaffold**: `manage.py`, `config/settings.py`, `config/urls.py`, `config/wsgi.py`, `config/__init__.py`, `appointments/apps.py`
2. **Models**: `appointments/models.py` (EventType, Booking, Blackout)
3. **Serializers**: `appointments/serializers.py` (all serializers listed above)
4. **Services**: `appointments/services.py` (slot generation, validation, helpers)
5. **Views**: `appointments/views.py` (all 13 endpoints)
6. **URL routing**: `appointments/urls.py`
7. **`run.sh`** — start script
8. **Tests**: `appointments/tests/` (all test files)
9. **Manual smoke test**: start server, verify endpoints with curl

## 16. Edge Cases & Gotchas

- **Django `auto_now_add` and serializers**: `createdAt` uses `auto_now_add=True` so it's set by Django on creation. The serializer must mark it `read_only=True`. For creation endpoints, it should not be in the input serializer.
- **UUID in URLs**: Django's `<uuid:id>` path converter matches UUID format. All ID-based lookups use `EventType.objects.get(id=id)` etc.
- **DateTime serialization**: Must produce `2026-01-15T10:00:00Z` format. Configure `DATETIME_FORMAT = '%Y-%m-%dT%H:%M:%SZ'` in DRF settings or use `format=` on serializer DateTimeFields. Note: with `USE_TZ=True`, datetimes are timezone-aware; ensure the 'Z' suffix is always present (not '+00:00').
- **Nullable fields**: `notes` and `reason` can be `null`. DRF should serialize them as `null` in JSON, not omit the key. Use `allow_null=True, required=False` on serializer fields.
- **PATCH semantics**: `UpdateEventTypeRequest` allows any subset of fields. All fields are optional. Only provided fields should be updated. An empty body should return the unchanged event type.
- **In-memory DB and tests**: Django's test runner creates a separate test database. Since we use `:memory:`, the test DB is also in-memory. `migrate --run-syncdb` in `AppConfig.ready()` will create tables for both production and test.
- **`runserver --noreload`**: Essential for in-memory DB. The default Django runserver uses a reloader that restarts the process on code changes — this would wipe the DB. Using `--noreload` prevents this but also disables auto-reload on code changes.
- **Sampling strategy for slots**: For checking if `startTime` aligns with a slot boundary, verify: (1) minutes is :00 or :30 past the hour, (2) it falls within 09:00–18:00 in the event type's timezone, (3) it's not in the past.