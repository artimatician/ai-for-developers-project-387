## Why

Currently all meetings are fixed at 30 minutes with slots only at :00 and :30 boundaries. This is inflexible — guests can't book a quick 15-minute sync or a longer 60-minute workshop. Adding flexible durations (15-min granularity) with 15-min start time alignment gives guests the freedom to book meetings that match their actual needs.

## What Changes

- Event type gains an optional `duration` field (in minutes, default 30) that caps the maximum booking length for that event type
- Guest picks both start time AND duration when booking (instead of picking a fixed 30-min slot)
- Slot generation shifts from fixed 30-min blocks to computing all available 15-min-aligned start times for a given date, filtered by the requested or default duration
- Booking request now accepts a `duration` field alongside `startTime`
- Slot availability check becomes duration-aware: a time range is available only if no existing booking/blackout overlaps it for the requested duration
- Frontend scheduling page adds a duration selector so the user can choose how long their meeting should be
- **BREAKING**: Booking creation — request now includes `duration` from the guest; response `endTime` is computed as `startTime + duration` instead of fixed +30 min
- **BREAKING**: Slot alignment validation changes from `minute % 30 == 0` to `minute % 15 == 0`
- **BREAKING**: Event-type-level max duration enforced; existing event types default to 30 min

## Capabilities

### New Capabilities
- `booking-duration`: Guest picks a meeting duration (15-min increments) capped by the event type's max duration; duration-aware slot availability checking and booking validation

### Modified Capabilities
- `event-types`: Event type model gains an optional `duration` field (default 30, max 480) — owner can set the maximum booking duration per event type
- `bookings`: Booking creation shifts from fixed 30-min slots to flexible start times (15-min boundaries) + flexible duration (15-min increments); slot generation becomes duration-aware; booking validation checks duration against event type max
- `guest-booking-flow`: Scheduling page UI adds duration picker component; MeetingSummary shows variable duration; confirm/confirmation pages compute and display dynamic end time

## Impact

- **Backend**: `EventType` model — add `duration` field; `services.py` — rewrite slot generation and booking validation for duration awareness; `views.py` — accept/use `duration` in booking creation
- **Frontend**: Scheduling page (`/book/[id]`) — add duration picker; MeetingSummary — show selected duration; confirm/confirmation pages — compute end time from startTime + duration
- **Spec**: TypeSpec models — add `duration` to EventType model and CreateEventType/CreateBookingRequest; update Booking model endTime documentation
- **Tests**: Update all 30-min assertions; update `unique_time` fixture; update slot count expectations; update booking creation tests; add new tests for variable duration scenarios
- **OpenSpec specs**: Delta specs for event-types, bookings, guest-booking-flow
