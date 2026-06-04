# Schedule a Call — Combined Project Plan

## App Overview

A simplified appointment scheduling service. Calendar owner publishes event types; guests browse, choose an interval, pick an open time slot, and book.

- **Roles:** Owner (single predefined profile, no auth) & Guest (no registration, name only)
- **Stack:** Django backend (REST API) + Next.js frontend
- **API Specification:** TypeSpec → OpenAPI → Django REST Framework (implemented manually, guided by spec)
- **API Style:** REST + JSON
- **Base Path:** All endpoints under `/api` (no version prefix)
- **Resource IDs:** UUIDs (v4)
- **Datetime Format:** ISO 8601, stored in UTC
- **CORS:** Allow all origins (`*`)

---

## Design Decisions Log

### Role & Scope

| # | Topic | Decision |
|---|-------|----------|
| 1 | Owner vs Public Boundaries | Owner endpoints use `/api/owner/` prefix. Guest endpoints use `/api/` prefix. Clean path-based separation. |
| 2 | Owner Auth | None (prototype only — document limitation) |
| 3 | Guest Identity | Only `guestName` (required string). No email, phone, or account. |

### Event Types

| # | Topic | Decision |
|---|-------|----------|
| 4 | Event Type Lifecycle | Soft-delete via `isActive` boolean flag. `PATCH /api/owner/event-types/{id}` with `{ isActive: false }` hides from guests. Existing bookings remain valid. |
| 5 | Update Semantics | `PUT /api/event-types/{id}` with optional fields (partial update). Duration changes only affect future bookings. |
| 6 | No Hard DELETE | No DELETE endpoint. Deactivation only via `PATCH` to `isActive: false`. |
| 7 | Duration Bounds | 15–240 minutes, validated server-side. |
| 8 | Event Type Name | Duplicates allowed. Max 1000 chars. |

### Availability & Slots

| # | Topic | Decision |
|---|-------|----------|
| 9 | Operating Hours | Fixed 09:00–18:00 in the event type's configured timezone (default UTC). |
| 10 | Timezone | Per-event-type IANA timezone identifier (e.g., "America/New_York"). |
| 11 | Slot Generation | On-the-fly computation at request time — no stored slot entities. |
| 12 | Slot Length | Equals event type's `durationMinutes`. Contiguous, non-overlapping slots starting at window start time. Remainder truncated. |
| 13 | Blocking Mechanism | **Blackout** time ranges stored as a separate resource. During slot computation, any slot overlapping a blackout is marked unavailable. This is the on-the-fly equivalent of "slot with `available: false`". |
| 14 | Slot Response | All slots returned (both available and unavailable) — guest UI can visually distinguish. |

### Bookings

| # | Topic | Decision |
|---|-------|----------|
| 15 | Booking Creation | Top-level `POST /api/bookings`. Body: `{ eventTypeId, startTime, guestName, notes? }`. |
| 16 | End Time Storage | Computed server-side as `startTime + eventType.durationMinutes` and stored in `endTime` field. |
| 17 | Guest Booking Response | Limited: returns `{ startTime, endTime, eventTypeName }`. No booking ID (guests cannot cancel). |
| 18 | Guest Cancellation | Not supported in MVP. |
| 19 | Guest Rescheduling | Not supported in MVP. |
| 20 | No Booking Limit | Guests can book unlimited slots. |
| 21 | Instant Booking | No owner confirmation required. |
| 22 | Snapshot Naming | Bookings store `eventTypeName` at time of booking; do not update if event type is renamed. |
| 23 | Conflict Prevention | Database-level unique constraint on time ranges prevents double-booking (any overlap, across all event types). Returns 409 Conflict. |

### Owner Booking List

| # | Topic | Decision |
|---|-------|----------|
| 24 | Pagination | Yes — `limit` (default 20), `offset` (default 0). |
| 25 | Filtering | Query params: `eventTypeId`, `from` (utcDateTime), `to` (utcDateTime). |
| 26 | Sort | By `startTime` ascending. |

### General

| # | Topic | Decision |
|---|-------|----------|
| 27 | API Versioning | None (no version prefix). |
| 28 | Response Format | Direct JSON objects (no `data` wrapper). |
| 29 | Error Format | Standardized: `{ code: string, message: string }`. |
| 30 | Content-Type | `application/json` for all requests/responses. |
| 31 | Text Field Max Length | 1000 characters. |
| 32 | Rate Limiting | Not required for v1. |
| 33 | TypeSpec | Use named models, `@friendlyName` on every operation, standard HTTP codes. |

---

## Data Models

### EventType

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | string (UUID) | server-generated | format: uuid | |
| name | string | yes | max 1000 | duplicates allowed |
| description | string | yes | max 1000 | |
| durationMinutes | integer | yes | min 15, max 240 | slot length |
| timezone | string | no | IANA timezone ID | default: "UTC" |
| isActive | boolean | server-set | | default: true |
| createdAt | string (ISO 8601) | server-generated | | UTC |

### Booking

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | string (UUID) | server-generated | format: uuid | |
| eventTypeId | string (UUID) | yes | references EventType | |
| eventTypeName | string | yes | snapshot | does not change if event type is renamed |
| guestName | string | yes | max 1000 | |
| notes | string | no | max 1000 | |
| startTime | string (ISO 8601) | yes | UTC | |
| endTime | string (ISO 8601) | server-derived | UTC | stored, calculated from startTime + durationMinutes |
| createdAt | string (ISO 8601) | server-generated | | UTC |

### Blackout

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | string (UUID) | server-generated | format: uuid | |
| startTime | string (ISO 8601) | yes | UTC | |
| endTime | string (ISO 8601) | yes | UTC | |
| reason | string | no | max 1000 | |
| createdAt | string (ISO 8601) | server-generated | | UTC |

### TimeSlot (computed, not stored)

| Field | Type | Notes |
|-------|------|-------|
| startTime | string (ISO 8601) | UTC |
| endTime | string (ISO 8601) | UTC |
| available | boolean | false if booked or blacked out |

### Error (standardized)

| Field | Type | Notes |
|-------|------|-------|
| code | string | machine-readable error code |
| message | string | human-readable description |

---

## API Endpoints

### Owner API

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| GET | `/api/owner/event-types` | 200 | List all non-deleted event types |
| POST | `/api/owner/event-types` | 201 | Create event type |
| GET | `/api/owner/event-types/{id}` | 200 | Get single event type |
| PUT | `/api/owner/event-types/{id}` | 200 | Update event type (partial) |
| PATCH | `/api/owner/event-types/{id}` | 200 | Toggle `isActive` |
| GET | `/api/owner/bookings` | 200 | List bookings (paginated, filtered) |
| GET | `/api/owner/blackouts` | 200 | List all blackouts |
| POST | `/api/owner/blackouts` | 201 | Create blackout |
| DELETE | `/api/owner/blackouts/{id}` | 204 | Delete blackout |

#### POST /api/owner/event-types

- Request body: `{ name, description, durationMinutes, timezone? }`
- Response: `EventType`
- Validation: name/description max 1000, duration 15–240, timezone valid IANA

#### PUT /api/owner/event-types/{id}

- Request body: `{ name?, description?, durationMinutes?, timezone? }` (all optional)
- Response: `EventType`
- Duration changes only affect future bookings

#### PATCH /api/owner/event-types/{id}

- Request body: `{ isActive: boolean }`
- Response: `EventType`
- Setting `isActive: false` hides from public endpoints

#### GET /api/owner/bookings

- Query params: `eventTypeId` (optional), `from` (optional UTC datetime), `to` (optional UTC datetime), `limit` (default 20), `offset` (default 0)
- Response: array of `Booking`
- Returns only upcoming bookings (startTime >= now)
- Sorted by startTime ascending

#### POST /api/owner/blackouts

- Request body: `{ startTime, endTime, reason? }`
- Response: `Blackout`
- Blackouts prevent new bookings only; existing bookings unaffected

### Guest / Public API

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| GET | `/api/event-types` | 200 | List active event types only |
| GET | `/api/event-types/{id}` | 200 | Get event type (404 if inactive) |
| GET | `/api/event-types/{id}/slots` | 200 | Get available slots (14-day window) |
| POST | `/api/bookings` | 201 | Create booking (409 if slot taken) |

#### GET /api/event-types

- Returns only event types with `isActive: true`
- Response fields: `{ id, name, description, durationMinutes, timezone }`

#### GET /api/event-types/{id}

- 404 if `isActive: false`
- Returns full `EventType`

#### GET /api/event-types/{id}/slots

- 14-day window: from today 00:00:00 UTC to day 13 at 23:59:59 UTC
- Operating hours: 09:00–18:00 in event type's timezone
- Slot length = event type's `durationMinutes`
- On-the-fly computation: subtract existing bookings + blackouts → mark unavailable
- Response: array of `TimeSlot` (both available and unavailable)

#### POST /api/bookings

- Request body: `{ eventTypeId, startTime, guestName, notes? }`
- `endTime` derived server-side from event type duration
- Response: `{ startTime, endTime, eventTypeName }` — no booking ID
- DB-level unique constraint prevents overlapping bookings; 409 Conflict on overlap

### Health Check

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| GET | `/health` | 200 | Health check |

- Response: `{ "status": "ok" }`

---

## Business Rules

1. **No Double-Booking:** Any time overlap across all event types blocks a new booking. Enforced via DB constraint. Returns 409 Conflict.
2. **14-Day Window:** Slots displayed for next 14 days from today 00:00:00 UTC.
3. **Operating Hours:** 09:00–18:00 in event type's configured timezone.
4. **Duration-Based Slots:** Slot length equals event type's `durationMinutes`. Contiguous, non-overlapping.
5. **On-the-Fly Computation:** Slots computed dynamically at request time from availability + bookings + blackouts.
6. **Instant Booking:** No owner confirmation required.
7. **No Guest Cancellation:** Bookings are final once created.
8. **No Booking Limit:** Guests can book unlimited slots.
9. **Soft-Delete:** Event types hidden via `isActive: false`. Existing bookings remain valid.
10. **Snapshot Naming:** Bookings store `eventTypeName` at creation; do not update if event type is renamed.
11. **Blackouts:** One-off time ranges that prevent new bookings. Do not cancel existing ones.
12. **Guest-Only Active Types:** Public endpoints return only event types with `isActive: true`.

---

## Slot Generation Algorithm

Computed on-the-fly at `GET /event-types/{id}/slots` request time:

```
Input: eventType (with timezone, durationMinutes), existing bookings, blackouts

For each day D in [today, today + 13 days]:
  1. Convert D 09:00 to UTC using eventType.timezone → windowStart
  2. Convert D 18:00 to UTC using eventType.timezone → windowEnd
  3. slotStart = windowStart
  4. While (slotStart + durationMinutes) <= windowEnd:
     a. slotEnd = slotStart + durationMinutes
     b. available = true
     c. Check if any booking overlaps [slotStart, slotEnd]: → available = false
     d. Check if any blackout overlaps [slotStart, slotEnd]: → available = false
     e. Emit TimeSlot { startTime: slotStart, endTime: slotEnd, available }
     f. slotStart = slotEnd  // contiguous, no padding
```

---

## HTTP Status Codes

| Scenario | Status |
|----------|--------|
| Successful read | 200 |
| Successful creation | 201 |
| Successful deletion | 204 |
| Validation error | 400 |
| Not found | 404 |
| Conflict (double-booking) | 409 |

---

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_INPUT | Request body fails validation |
| EVENT_TYPE_NOT_FOUND | Event type ID does not exist |
| SLOT_UNAVAILABLE | Requested time slot is already booked or blacked out |
| BLACKOUT_NOT_FOUND | Blackout ID does not exist |
| INVALID_TIMEZONE | Timezone is not a valid IANA identifier |
| INVALID_DURATION | Duration outside 15–240 minute range |

---

## TypeSpec File Structure

```
spec/
  main.tsp          — Entry point, imports, service definition
  models.tsp        — Shared models (EventType, Booking, Blackout, TimeSlot, Error)
  owner.tsp         — All /api/owner/* endpoints
  guest.tsp         — All /api/* (public) endpoints
  package.json      — TypeSpec dependencies
  tspconfig.yaml    — OpenAPI emitter configuration
```

### File Purposes

```
models.tsp    — EventType, Booking, Blackout, TimeSlot, Error
owner.tsp     — All /api/owner/* endpoints
guest.tsp     — All /api/* endpoints (public)
main.tsp      — Service definition, imports, metadata
```

---

## Django Project Structure

```
backend/
  manage.py
  config/
    __init__.py
    settings.py
    urls.py
    wsgi.py
  appointments/
    __init__.py
    models.py         — EventType, Booking, Blackout
    serializers.py    — DRF serializers matching OpenAPI spec
    views.py          — DRF viewsets / APIView for all endpoints
    urls.py           — Route definitions (/api/...)
```

---

## Next.js Project Structure

```
frontend/
  pages/
    index.tsx                 — Guest homepage: list active event types
    event-types/[id].tsx      — Guest: view slots & book
    owner/
      event-types.tsx          — Owner: CRUD event types
      bookings.tsx             — Owner: view upcoming bookings
      blackouts.tsx            — Owner: manage blackout periods
  components/
    SlotPicker.tsx             — Calendar/slot selection UI
    BookingForm.tsx            — Name + notes form for guest booking
    OwnerLayout.tsx            — Shared layout for owner pages
  lib/
    api.ts                     — API client (fetch wrapper)
  styles/
    globals.css
```

---

## Next Steps

1. Write `models.tsp` — shared data models
2. Write `owner.tsp` — owner endpoints
3. Write `guest.tsp` — guest endpoints
4. Write `main.tsp` — service definition, imports
5. Configure `tspconfig.yaml` — OpenAPI emitter
6. Compile TypeSpec to OpenAPI (`tsp compile`)
7. Verify OpenAPI output
8. Scaffold Django project (`django-admin startproject`)
9. Configure DRF, set up `appointments` app
10. Implement Django models: `EventType`, `Booking`, `Blackout`
11. Implement DRF serializers + views matching OpenAPI spec
12. Wire Django URLs under `/api/` prefix
13. Scaffold Next.js app (`create-next-app`)
14. Build API client and shared components
15. Build owner pages (event types, bookings, blackouts)
16. Build guest pages (event type list, slot picker, booking form)
17. Connect frontend to backend, test full flow end-to-end

