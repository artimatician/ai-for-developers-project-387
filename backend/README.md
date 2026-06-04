# Schedule a Call — Backend

Django REST API for the appointment scheduling service.

## Prerequisites

- Python >= 3.10

## Setup

```bash
cd backend
python3 -m pip install -r requirements.txt
```

## Running

```bash
# Single command
bash run.sh

# Or manually
python3 manage.py migrate --run-syncdb
python3 manage.py runserver 0.0.0.0:4010 --noreload
```

The server starts on port **4010** with an in-memory SQLite database (resets on restart).  
The `--noreload` flag is required — the reloader would spawn a new process and lose the in-memory DB.

## Testing

```bash
python3 manage.py test appointments.tests --verbosity=2
```

54 tests across 5 test suites: health, event types, bookings, blackouts, slots.

## Project Structure

```
backend/
  manage.py
  requirements.txt
  run.sh
  config/
    settings.py          — Django settings (SQLite :memory:, CORS *, JSON-only)
    urls.py              — root URL config
  appointments/
    models.py            — EventType, Booking, Blackout
    serializers.py       — 11 DRF serializers
    services.py          — slot generation, booking validation, helpers
    views.py             — 13 API endpoints
    urls.py              — guest + owner URL patterns
    tests/               — 5 test files (54 tests)
```

## API Endpoints

### Guest / Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/event-types` | List active event types |
| GET | `/api/event-types/{id}` | Get active event type |
| GET | `/api/event-types/{id}/slots` | Get available slots (14-day window) |
| POST | `/api/bookings` | Create a booking |

### Owner

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/owner/event-types` | List all event types |
| POST | `/api/owner/event-types` | Create event type |
| GET | `/api/owner/event-types/{id}` | Get event type by ID |
| PATCH | `/api/owner/event-types/{id}` | Partial update event type |
| GET | `/api/owner/bookings` | List bookings (with filters) |
| GET | `/api/owner/blackouts` | List blackouts |
| POST | `/api/owner/blackouts` | Create blackout |
| DELETE | `/api/owner/blackouts/{id}` | Delete blackout |

## Slot Algorithm

- 14-day window starting from today (in the event type's timezone)
- Operating hours: 09:00–18:00 in the event type's timezone
- Fixed 30-minute slots (18 per day = 252 total)
- Past slots marked `available: false`
- Bookings and blackouts block slots globally (across all event types)
