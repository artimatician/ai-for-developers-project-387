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
| 5 | Update Semantics | Single `PATCH /api/owner/event-types/{id}` accepting any subset of `{ name?, description?, timezone?, isActive? }`. Deactivation via `{ isActive: false }` is the same endpoint — no separate toggle. |
| 6 | No Hard DELETE | No DELETE endpoint for event types. Deactivation only via PATCH to `isActive: false`. |
| 7 | Duration | Fixed at 30 minutes for all event types. |
| 8 | Event Type Name | Duplicates allowed. Max 1000 chars. |

### Availability & Slots

| # | Topic | Decision |
|---|-------|----------|
| 9 | Operating Hours | Fixed 09:00–18:00 in the event type's configured timezone (default UTC). |
| 10 | Timezone | Per-event-type IANA timezone identifier (e.g., "America/New_York"). |
| 11 | Slot Generation | On-the-fly computation at request time — no stored slot entities. |
| 12 | Slot Length | Fixed at 30 minutes for all event types. Contiguous, non-overlapping slots starting at window start time. Remainder truncated. |
| 13 | Blocking Mechanism | **Blackout** time ranges stored as a separate resource. During slot computation, any slot overlapping a blackout is marked unavailable. This is the on-the-fly equivalent of "slot with `available: false`". |
| 14 | Slot Response | All slots returned (both available and unavailable) — guest UI can visually distinguish. |

### Bookings

| # | Topic | Decision |
|---|-------|----------|
| 15 | Booking Creation | Top-level `POST /api/bookings`. Body: `{ eventTypeId, startTime, guestName, notes? }`. |
| 16 | End Time Storage | Computed server-side as `startTime + 30 minutes` and stored in `endTime` field. |
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
| 33 | TypeSpec | Use named models, `@doc` on every model and operation, standard HTTP codes. OpenAPI operation IDs generated automatically from namespace + operation name via emitter defaults. |

---

## Data Models

### EventType

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | string (UUID) | server-generated | format: uuid | |
| name | string | yes | max 1000 | duplicates allowed |
| description | string | yes | max 1000 | |
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
| endTime | string (ISO 8601) | server-derived | UTC | stored, calculated from startTime + 30 minutes |
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

### CreateEventTypeRequest

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| name | string | yes | max 1000 | |
| description | string | yes | max 1000 | |
| timezone | string | no | IANA timezone ID | default: "UTC" |

### UpdateEventTypeRequest

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| name | string | no | max 1000 | |
| description | string | no | max 1000 | |
| timezone | string | no | IANA timezone ID | |
| isActive | boolean | no | | |

### PublicEventType (guest list response subset)

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | |
| name | string | |
| description | string | |
| timezone | string | |

### CreateBookingRequest

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| eventTypeId | string (UUID) | yes | references EventType | must reference an active EventType |
| startTime | string (ISO 8601) | yes | UTC | must align with a computed slot boundary |
| guestName | string | yes | max 1000 | |
| notes | string | no | max 1000 | |

### GuestBookingResponse

| Field | Type | Notes |
|-------|------|-------|
| startTime | string (ISO 8601) | UTC |
| endTime | string (ISO 8601) | UTC |
| eventTypeName | string | snapshot at booking time |

### CreateBlackoutRequest

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| startTime | string (ISO 8601) | yes | UTC | must be before endTime |
| endTime | string (ISO 8601) | yes | UTC | must be after startTime |
| reason | string | no | max 1000 | |

---

## API Endpoints

### Owner API

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| GET | `/api/owner/event-types` | 200 | List all non-deleted event types |
| POST | `/api/owner/event-types` | 201 | Create event type |
| GET | `/api/owner/event-types/{id}` | 200 | Get single event type |
| PATCH | `/api/owner/event-types/{id}` | 200 | Partial update (any subset of fields including isActive) |
| GET | `/api/owner/bookings` | 200 | List bookings (paginated, filtered) |
| GET | `/api/owner/blackouts` | 200 | List all blackouts |
| POST | `/api/owner/blackouts` | 201 | Create blackout |
| DELETE | `/api/owner/blackouts/{id}` | 204 | Delete blackout |

#### POST /api/owner/event-types

- Request body: `{ name, description, timezone? }`
- Response: `EventType`
- Validation: name/description max 1000, timezone valid IANA

#### PATCH /api/owner/event-types/{id}

- Request body: `UpdateEventTypeRequest` — any subset of `{ name?, description?, timezone?, isActive? }`
- Response: `EventType`
- 404 if event type not found
- Duration changes only affect future bookings
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
- Response fields: `{ id, name, description, timezone }`

#### GET /api/event-types/{id}

- 404 if `isActive: false`
- Returns full `EventType`

#### GET /api/event-types/{id}/slots

- 14-day window: from today 00:00:00 UTC to day 13 at 23:59:59 UTC
- Operating hours: 09:00–18:00 in event type's timezone
- Slot length: fixed at 30 minutes
- On-the-fly computation: subtract existing bookings + blackouts → mark unavailable
- Response: array of `TimeSlot` (both available and unavailable)

#### POST /api/bookings

- Request body: `CreateBookingRequest`
- `endTime` derived server-side as `startTime + 30 minutes`
- Response: `GuestBookingResponse` (no booking ID)
- 404 if eventTypeId does not exist or references an inactive event type
- 409 if slot overlaps an existing booking or blackout

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
4. **Fixed 30-Minute Slots:** All slots are 30 minutes long. Contiguous, non-overlapping.
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
Input: eventType (with timezone), existing bookings, blackouts

For each day D in [today, today + 13 days]:
  1. Convert D 09:00 to UTC using eventType.timezone → windowStart
  2. Convert D 18:00 to UTC using eventType.timezone → windowEnd
  3. slotStart = windowStart
  4. While (slotStart + 30 min) <= windowEnd:
     a. slotEnd = slotStart + 30 min
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
| EVENT_TYPE_INACTIVE | Event type exists but is not active (guest booking on inactive type) |

---

## TypeSpec Specification

### Prerequisites

- **Node.js:** ≥22 (required by TypeSpec compiler 1.x)
- **Packages:** @typespec/compiler ^1.12.0, @typespec/http ^1.12.0, @typespec/rest ^0.82.0, @typespec/openapi3 ^1.12.0

### File Structure

```
spec/
  main.tsp          — Entry point, imports, service definition
  models.tsp        — All data models (resource, request, response, error)
  owner.tsp         — All /api/owner/* operations
  guest.tsp         — All /api/* (public) operations
  package.json      — TypeSpec dependencies
  tspconfig.yaml    — OpenAPI3 emitter configuration
```

### package.json

```json
{
  "name": "schedule-a-call-spec",
  "dependencies": {
    "@typespec/compiler": "^1.12.0",
    "@typespec/http": "^1.12.0",
    "@typespec/rest": "^0.82.0",
    "@typespec/openapi3": "^1.12.0"
  }
}
```

### tspconfig.yaml

```yaml
emit:
  - "@typespec/openapi3"
options:
  "@typespec/openapi3":
    "file-type": "yaml"
    "output-file": "openapi.yaml"
```

### TypeSpec Conventions

- **Organization:** Use `namespace` blocks (not `interface`) with `@route` for path prefixing. Do NOT use `@autoRoute` or `@resource` — the API paths are too custom for REST resource auto-routing.
- **Documentation:** Every model and operation must have `@doc("...")` — these become OpenAPI `description` fields.
- **Operation IDs:** Generated automatically by the OpenAPI3 emitter from namespace + operation name (e.g., `Owner_createEventType`). No need for explicit `@operationId` unless a custom name is desired.
- **Error responses:** Define `Error` model marked with `@error`. Operations return union types (e.g., `EventType | Error`).
- **Read-only fields:** Fields like `id`, `createdAt`, `isActive` (on create), `eventTypeName`/`endTime` (on booking) are server-generated. They appear in the full resource model but NOT in request models.
- **Scalar types:** Use TypeSpec built-in `string` with `@format("uuid")` for UUIDs, `utcDateTime` for ISO 8601 timestamps, plain `string` for IANA timezone IDs.

### Model Inventory for models.tsp

| Model | Type | Used By |
|-------|------|---------|
| EventType | Full resource | Owner read responses, Guest GET /event-types/{id} |
| CreateEventTypeRequest | Request body | Owner POST /event-types |
| UpdateEventTypeRequest | Request body | Owner PATCH /event-types/{id} |
| PublicEventType | Response subset | Guest GET /event-types (list) |
| Booking | Full resource | Owner GET /bookings |
| CreateBookingRequest | Request body | Guest POST /bookings |
| GuestBookingResponse | Response subset | Guest POST /bookings response |
| Blackout | Full resource | Owner read responses |
| CreateBlackoutRequest | Request body | Owner POST /blackouts |
| TimeSlot | Computed response | Guest GET /event-types/{id}/slots |
| Error | Error response | All operations (via @error) |
| OwnerBookingsParams | Query params | Owner GET /bookings (eventTypeId?, from?, to?, limit?, offset?) |

### Operation Inventory for owner.tsp

| Operation Name | HTTP | Route | Request | Response | Errors |
|----------------|------|-------|---------|----------|--------|
| listEventTypes | GET | /event-types | — | EventType[] | — |
| createEventType | POST | /event-types | CreateEventTypeRequest | EventType | Error (400) |
| getEventType | GET | /event-types/{id} | — | EventType | Error (404) |
| updateEventType | PATCH | /event-types/{id} | UpdateEventTypeRequest | EventType | Error (400, 404) |
| listBookings | GET | /bookings | OwnerBookingsParams (query) | Booking[] | — |
| listBlackouts | GET | /blackouts | — | Blackout[] | — |
| createBlackout | POST | /blackouts | CreateBlackoutRequest | Blackout | Error (400) |
| deleteBlackout | DELETE | /blackouts/{id} | — | void (204) | Error (404) |

All owner operations are in a namespace with `@route("/api/owner")`.

### Operation Inventory for guest.tsp

| Operation Name | HTTP | Route | Request | Response | Errors |
|----------------|------|-------|---------|----------|--------|
| listActiveEventTypes | GET | /event-types | — | PublicEventType[] | — |
| getActiveEventType | GET | /event-types/{id} | — | EventType | Error (404) |
| getSlots | GET | /event-types/{id}/slots | — | TimeSlot[] | Error (404) |
| createBooking | POST | /bookings | CreateBookingRequest | GuestBookingResponse | Error (400, 404, 409) |

All guest operations are in a namespace with `@route("/api")`.

### main.tsp Structure

```
import "@typespec/http";
import "@typespec/rest";
import "./models.tsp";
import "./owner.tsp";
import "./guest.tsp";

using TypeSpec.Http;

@service({ title: "Schedule a Call" })
@server("http://localhost:8000", "Local development")
namespace ScheduleACall {}
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


