# Delta for bookings

## ADDED Requirements

### Requirement: Guest Creates Booking
The system SHALL allow a guest to create a booking by providing eventTypeId, startTime, guestName, and optional notes.

#### Scenario: Create booking with all fields
- GIVEN an active event type
- WHEN the guest sends a POST request to `/api/bookings` with `{ "eventTypeId": "<uuid>", "startTime": "2026-06-10T14:00:00Z", "guestName": "Alice", "notes": "Looking forward" }`
- THEN the system SHALL return status 201
- AND the response SHALL include startTime, endTime (startTime + 30 minutes), and eventTypeName (snapshot)
- AND the response SHALL NOT include id, notes, eventTypeId, or guestName

#### Scenario: Create booking without notes
- GIVEN an active event type
- WHEN the guest sends a POST request with only eventTypeId, startTime, and guestName
- THEN the system SHALL return status 201
- AND the booking SHALL be created successfully with notes as null

#### Scenario: Create booking with nonexistent event type
- GIVEN a UUID that does not match any event type
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 404
- AND the error SHALL include code "EVENT_TYPE_NOT_FOUND"

#### Scenario: Create booking with inactive event type
- GIVEN an inactive event type
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 404
- AND the error SHALL include code "EVENT_TYPE_INACTIVE"

#### Scenario: Create booking with missing required fields
- GIVEN the request omits guestName
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

### Requirement: Booking Validates Slot Alignment
The system SHALL validate that startTime aligns with a 30-minute slot boundary within operating hours in the event type's timezone.

#### Scenario: Start time not on 30-minute boundary
- GIVEN a startTime of "2026-06-10T14:15:00Z"
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: Start time outside operating hours
- GIVEN a startTime of "2026-06-10T19:00:00Z" (outside 09:00-18:00 in event type's timezone)
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: Start time in the past
- GIVEN a startTime that is in the past
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

### Requirement: Booking Prevents Double-Booking
The system SHALL enforce that no two bookings overlap in time. Conflict detection SHALL be global across all event types.

#### Scenario: Overlapping booking rejected
- GIVEN an existing booking from 14:00 to 14:30
- WHEN the guest sends a POST request with startTime 14:00 on the same day
- THEN the system SHALL return status 409
- AND the error SHALL include code "SLOT_UNAVAILABLE"

#### Scenario: Non-overlapping booking accepted
- GIVEN an existing booking from 14:00 to 14:30
- WHEN the guest sends a POST request with startTime 14:30 on the same day
- THEN the system SHALL return status 201
- AND the booking SHALL be created successfully

#### Scenario: Booking on different event type is blocked
- GIVEN an existing booking on EventType A from 14:00 to 14:30
- WHEN the guest sends a POST request with the same startTime for EventType B
- THEN the system SHALL return status 409
- AND the error SHALL include code "SLOT_UNAVAILABLE"

### Requirement: Booking Blocked by Blackout
The system SHALL reject bookings that overlap with a blackout period.

#### Scenario: Booking during blackout rejected
- GIVEN a blackout from 14:00 to 15:00
- WHEN the guest sends a POST request with startTime 14:00
- THEN the system SHALL return status 409
- AND the error SHALL include code "SLOT_UNAVAILABLE"

### Requirement: Booking Returns Guest Response
The system SHALL return a limited response to the guest after booking creation.

#### Scenario: Guest booking response shape
- GIVEN a successfully created booking
- THEN the response SHALL include startTime (ISO 8601 UTC), endTime (startTime + 30 min, ISO 8601 UTC), and eventTypeName (string)
- AND the response SHALL NOT include id, eventTypeId, guestName, notes, or createdAt

#### Scenario: Event type name is snapshot
- GIVEN a booking was created with eventTypeName "Original Name"
- WHEN the owner renames the event type to "New Name"
- THEN the booking SHALL still have eventTypeName "Original Name"

### Requirement: Owner Lists Bookings
The system SHALL allow the owner to list bookings with pagination and filtering.

#### Scenario: List bookings with defaults
- GIVEN there are 25 bookings
- WHEN the owner sends a GET request to `/api/owner/bookings`
- THEN the system SHALL return status 200
- AND the response SHALL include up to 20 bookings
- AND the bookings SHALL be sorted by startTime ascending

#### Scenario: List bookings with pagination
- GIVEN there are 25 bookings
- WHEN the owner sends a GET request with `?limit=5&offset=10`
- THEN the system SHALL return 5 bookings starting from the 11th

#### Scenario: Filter bookings by event type
- GIVEN bookings on two different event types
- WHEN the owner sends a GET request with `?eventTypeId=<uuid>`
- THEN the system SHALL return only bookings matching that event type

#### Scenario: Filter bookings by date range
- GIVEN bookings on multiple days
- WHEN the owner sends a GET request with `?from=2026-06-10T00:00:00Z&to=2026-06-12T23:59:59Z`
- THEN the system SHALL return only bookings with startTime within the range

### Requirement: Slots Generated On-the-Fly
The system SHALL compute available time slots at request time for a 14-day window.

#### Scenario: Slot window is 14 days
- GIVEN today is June 8, 2026 in the event type's timezone
- WHEN the guest sends a GET request to `/api/event-types/{id}/slots`
- THEN the response SHALL include slots from June 8 through June 21, 2026

#### Scenario: Operating hours produce correct slot count
- GIVEN an event type with timezone "UTC"
- WHEN the guest sends a GET request to `/api/event-types/{id}/slots` for a future date
- THEN each day SHALL have exactly 18 slots (09:00 to 18:00, 30-min intervals)

#### Scenario: Past slots are unavailable
- GIVEN a slot that started in the past
- WHEN the guest sends a GET request to `/api/event-types/{id}/slots`
- THEN the slot SHALL have `available: false`

#### Scenario: Booked slot is unavailable
- GIVEN an existing booking at 14:00-14:30 on a future date
- WHEN the guest requests slots for that date
- THEN the 14:00 slot SHALL have `available: false`
- AND the 14:30 slot SHALL have `available: true`

#### Scenario: Blacked out slot is unavailable
- GIVEN a blackout from 14:00 to 15:00 on a future date
- WHEN the guest requests slots for that date
- THEN the 14:00 and 14:30 slots SHALL have `available: false`

#### Scenario: All slots returned
- GIVEN both available and unavailable slots exist
- WHEN the guest requests slots
- THEN both available and unavailable slots SHALL be returned in the response

#### Scenario: Slot generation accounts for timezone
- GIVEN an event type with timezone "America/New_York" (UTC-4 during EDT)
- WHEN the guest requests slots
- THEN operating hours 09:00-18:00 EDT SHALL be converted to UTC
- AND the first slot of the day SHALL start at 13:00 UTC (09:00 EDT)
- AND the last slot SHALL end at 22:00 UTC (18:00 EDT)

#### Scenario: Inactive event type returns 404
- GIVEN an inactive event type
- WHEN the guest sends a GET request to `/api/event-types/{id}/slots`
- THEN the system SHALL return status 404

#### Scenario: Guest slot response slot shape
- GIVEN a valid event type
- WHEN the guest requests slots
- THEN each slot SHALL have startTime (ISO 8601 UTC), endTime (ISO 8601 UTC), and available (boolean) fields
