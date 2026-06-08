## Context

Currently the system uses fixed 30-min slot durations hardcoded across backend (`SLOT_DURATION = timedelta(minutes=30)`), frontend (hardcoded "30 min" strings, `.add(30, 'minute')`), spec, and tests. Slots align to 30-min boundaries (:00, :30) and booking creation always creates 30-min meetings. The EventType model has no duration field. This design adds flexible booking durations with 15-min granularity for both start times and meeting length, capped per event type.

## Goals / Non-Goals

**Goals:**
- Event type has configurable max `duration` field (minutes, default 30)
- Guests can pick any duration in 15-min increments (15, 30, 45, ... up to event type's max)
- Start times align to 15-min boundaries (:00, :15, :30, :45)
- Slot generation is duration-aware — slots endpoint accepts optional `duration` query param
- Booking creation accepts `duration` from the guest; `endTime` computed as `startTime + duration`
- Frontend scheduling page has a duration picker; confirm/confirmation pages show dynamic end time
- All existing specs/tests updated to reflect 15-min granularity and variable duration

**Non-Goals:**
- No pricing/duration-based billing
- No per-user duration preferences
- No recurring bookings
- No guest cancellation
- Operating hours remain 09:00–18:00 (not made configurable per event type)

## Decisions

**Decision 1: Duration field on EventType model**
- Add `duration` (IntegerField, default=30, min=15, max=480)
- This sets the MAXIMUM booking duration for that event type
- Guest can choose any 15-min increment ≤ this max
- Owner sets it at creation or updates via PATCH
- Rationale: Simple, backward-compatible (existing event types get default 30), no new tables

**Decision 2: Slots endpoint accepts `duration` query param**
- `GET /api/event-types/{id}/slots?duration=30`
- When omitted, defaults to event type's `duration` field
- Backend generates 15-min boundary start times and checks availability for the requested duration
- Rationale: Keeps response manageable (~36 start times/day vs 72+ duration combinations); stateless; frontend can re-fetch when guest changes desired duration
- Alternative considered: Return ALL 15-min start times and let frontend compute — rejected because frontend would need duplicate conflict logic

**Decision 3: Slot generation uses 15-min steps**
- Change `SLOT_DURATION` to `timedelta(minutes=15)` or rename to `SLOT_INTERVAL`
- Iterate operating hours (09:00–18:00) in 15-min steps → up to 36 start times/day
- For each start time, check: `startTime + duration` fits within operating hours AND no booking/blackout overlaps the `[start, start+duration)` range
- Past start times marked unavailable
- Current overlap check (`booking.startTime < slot_end and booking.endTime > slot_start`) already works for any duration

**Decision 4: Booking creation accepts `duration`**
- `CreateBookingRequest` gains optional `duration` field (minutes, default=event type's default)
- Backend computes `endTime = startTime + timedelta(minutes=duration)`
- Validation: duration ≤ event type's `duration` (max), duration ≥ 15, duration % 15 == 0, endTime within operating hours in event type's timezone
- Rationale: Simple extension of existing flow; backward-compatible if client omits duration

**Decision 5: Frontend duration picker**
- On scheduling page (`/book/[id]`), add a duration selector below the MeetingSummary or inline with TimeSlotList
- Options: 15, 30, 45, 60, ... up to event type's `duration`, in 15-min steps
- Default: event type's `duration` value
- Changing duration re-fetches slots via `GET /api/event-types/{id}/slots?duration=N`
- MeetingSummary shows "X min" instead of hardcoded "30 min"
- Confirm page (`/book/[id]/confirm`) passes `duration` as query param; computes end time with `.add(duration, 'minute')`
- Rationale: Simple UX; duration affects which start times are available, so re-fetching is correct

**Decision 6: Backward compatibility**
- Existing event types get `duration=30` via migration/default
- Existing bookings unchanged (already have their endTime stored)
- API change is additive (`duration` is optional in CreateBookingRequest)
- Slots endpoint with no `duration` param behaves like before but with 15-min boundaries (so existing clients that pass startTime to booking will still work — they'll get more granular slots but that's fine)

## Risks / Trade-offs

- [More slots per day] 15-min granularity means up to 36 start times/day (vs 18). Larger API response (~2x). Mitigation: payload is still small (36 × ~100 bytes = ~3.6KB).
- [Frontend re-fetches on duration change] Every duration change triggers a new API call. Mitigation: response is fast (in-memory SQLite, simple computation); add debounce if needed.
- [Guest picks long duration while another guest books] Race condition on long bookings. Mitigation: existing 409 conflict handling already covers this.
- [Breaking change for slot consumers] Slots now return 15-min boundaries. Existing clients expecting 30-min slots will see more options. Mitigation: document as breaking change; keep `duration` default to event type's value so default behavior is close to before.
- [Test fixture changes] `unique_time` generates 30-min intervals; needs updating to 15-min or parameterized. Mitigation: update fixture to be duration-aware.
