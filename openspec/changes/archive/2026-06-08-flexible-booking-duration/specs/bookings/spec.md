# bookings Specification (Delta)

## MODIFIED Requirements

### Requirement: Guest Creates Booking
The system SHALL allow a guest to create a booking by providing eventTypeId, startTime, guestName, optional notes, and optional duration.

#### Scenario: Create booking with all fields including duration
- GIVEN an active event type with duration 60
- WHEN the guest sends a POST request to `/api/bookings` with `{ "eventTypeId": "<uuid>", "startTime": "2026-06-10T14:00:00Z", "guestName": "Alice", "duration": 45, "notes": "Looking forward" }`
- THEN the system SHALL return status 201
- AND the response SHALL include startTime, endTime (startTime + 45 minutes), and eventTypeName (snapshot)
- AND the response SHALL NOT include id, notes, eventTypeId, guestName, or duration

#### Scenario: Create booking without duration uses event type default
- GIVEN an active event type with duration 30
- WHEN the guest sends a POST request with only eventTypeId, startTime, and guestName (no duration)
- THEN the system SHALL return status 201
- AND the endTime SHALL be startTime + 30 minutes

#### Scenario: Create booking with duration exceeding event type max
- GIVEN an active event type with duration 30
- WHEN the guest sends a POST request with `{ "eventTypeId": "<uuid>", "startTime": "...", "guestName": "Alice", "duration": 60 }`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: Create booking with duration not multiple of 15
- GIVEN an active event type
- WHEN the guest sends a POST request with duration 22
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

### Requirement: Booking Validates Slot Alignment
The system SHALL validate that startTime aligns with a 15-minute slot boundary within operating hours in the event type's timezone, and that startTime + duration is also within operating hours.

#### Scenario: Start time on 15-minute boundary
- GIVEN a startTime of "2026-06-10T14:15:00Z"
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 201

#### Scenario: Start time not on 15-minute boundary
- GIVEN a startTime of "2026-06-10T14:07:00Z"
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: Start time outside operating hours
- GIVEN a startTime of "2026-06-10T19:00:00Z" (outside 09:00-18:00 in event type's timezone)
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: End time outside operating hours due to duration
- GIVEN a startTime of "2026-06-10T17:30:00Z" with duration 60 in UTC timezone
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: Start time in the past
- GIVEN a startTime that is in the past
- WHEN the guest sends a POST request to `/api/bookings`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

### Requirement: Booking Prevents Double-Booking
The system SHALL enforce that no two bookings overlap in time. Conflict detection SHALL be global across all event types and SHALL account for the requested duration.

#### Scenario: Overlapping booking rejected (same start, longer duration)
- GIVEN an existing booking from 14:00 to 14:30
- WHEN the guest sends a POST request with startTime 14:00 and duration 45
- THEN the system SHALL return status 409
- AND the error SHALL include code "SLOT_UNAVAILABLE"

#### Scenario: Non-overlapping booking accepted (adjacent slots)
- GIVEN an existing booking from 14:00 to 14:30
- WHEN the guest sends a POST request with startTime 14:30 and duration 15
- THEN the system SHALL return status 201

### Requirement: Slots Generated On-the-Fly
The system SHALL compute available time slots at request time for a 14-day window, using 15-minute boundary start times and an optional duration parameter.

#### Scenario: Slot window is 14 days
- GIVEN today is June 8, 2026 in the event type's timezone
- WHEN the guest sends a GET request to `/api/event-types/{id}/slots`
- THEN the response SHALL include slots from June 8 through June 21, 2026

#### Scenario: Operating hours produce correct slot start count (15-min boundaries)
- GIVEN an event type with timezone "UTC" and duration 30
- WHEN the guest sends a GET request to `/api/event-types/{id}/slots` for a future date
- THEN each day SHALL have up to 36 start times (09:00 to 17:30, 15-min intervals, filtered by duration)

#### Scenario: Past slots are unavailable
- GIVEN a slot that started in the past
- WHEN the guest sends a GET request to `/api/event-types/{id}/slots`
- THEN the slot SHALL have `available: false`

#### Scenario: Booked slot is unavailable (duration-aware)
- GIVEN an existing booking from 14:00 to 14:30
- WHEN the guest requests slots with `?duration=30`
- THEN the 14:00 slot SHALL have `available: false`
- AND the 14:15 slot SHALL have `available: false` (14:15-14:45 overlaps 14:00-14:30)
- AND the 14:30 slot SHALL have `available: true`

#### Scenario: Shorter duration can fit where longer cannot
- GIVEN an existing booking from 14:00 to 14:30
- WHEN the guest requests slots with `?duration=15`
- THEN the 14:00 slot SHALL have `available: false`
- AND the 14:15 slot SHALL have `available: true` (14:15-14:30 ends exactly when the existing booking ends)
- AND the 14:30 slot SHALL have `available: true`

#### Scenario: Blacked out slot is unavailable
- GIVEN a blackout from 14:00 to 15:00 on a future date
- WHEN the guest requests slots with `?duration=30`
- THEN the 14:00 and 14:15 and 14:30 slots SHALL have `available: false`

#### Scenario: All slots returned
- GIVEN both available and unavailable slots exist
- WHEN the guest requests slots
- THEN both available and unavailable slots SHALL be returned in the response

#### Scenario: Slot generation accounts for timezone (15-min boundaries)
- GIVEN an event type with timezone "America/New_York" (UTC-4 during EDT) and duration 30
- WHEN the guest requests slots
- THEN operating hours 09:00-18:00 EDT SHALL be converted to UTC
- AND the first slot of the day SHALL start at 13:00 UTC (09:00 EDT)
- AND start times SHALL be at 15-minute boundaries (13:00, 13:15, 13:30, ...)
- AND the last slot SHALL end at 22:00 UTC (18:00 EDT)

#### Scenario: Duration param affects slot count
- GIVEN an event type with timezone "UTC" and duration 30
- WHEN the guest requests slots with `?duration=60`
- THEN each day SHALL have fewer available start times because 60-min meetings require starting by 17:00
- AND the 17:00 slot SHALL be available (17:00-18:00)
- AND the 17:15 slot SHALL be unavailable (17:15-18:15 exceeds operating hours)
