## 1. Backend — Model & Data Layer

- [x] 1.1 Add `duration` IntegerField to EventType model (default=30, min_value=15, max_value=480)
- [x] 1.2 Update EventType serializer/s to accept and validate `duration`
- [x] 1.3 Update guest-facing EventType serializer to expose `duration`

## 2. Backend — Slot Generation & Booking Validation

- [x] 2.1 Rename `SLOT_DURATION` to `SLOT_INTERVAL` and change from 30 to 15 minutes in `services.py`
- [x] 2.2 Update `generate_slots()` to accept optional `duration` parameter (default: event type's duration)
- [x] 2.3 Update slot iteration to use 15-min steps and check availability against requested duration
- [x] 2.4 Update `validate_booking()` to accept `duration` parameter, validate 15-min alignment, duration constraints, and end-time-within-operating-hours check
- [x] 2.5 Update slot boundary validation from `minute % 30 == 0` to `minute % 15 == 0`

## 3. Backend — Booking Creation API

- [x] 3.1 Update `CreateBookingSerializer` to accept optional `duration` field
- [x] 3.2 Update `create_booking()` view to pass `duration` through validation and compute `end_time = start_time + duration`
- [x] 3.3 Update slot view to pass `duration` query param to `generate_slots()`
- [x] 3.4 Update `GuestBookingResponse` and owner booking responses to include `duration` if needed

## 4. Backend — Owner Event Type API

- [x] 4.1 Update owner event type creation to accept and validate `duration`
- [x] 4.2 Update owner event type update (PATCH) to allow changing `duration`
- [x] 4.3 Add validation for invalid duration values (non-multiple of 15, below 15, above 480)

## 5. Spec — TypeSpec Models

- [x] 5.1 Add `duration` field to EventType model in `spec/models.tsp` (optional, integer, default 30)
- [x] 5.2 Add `duration` field to `CreateEventTypeRequest`
- [x] 5.3 Add `duration` field to `CreateBookingRequest`
- [x] 5.4 Update `Booking` model `endTime` doc from "derived from startTime + 30 minutes" to "derived from startTime + duration"
- [x] 5.5 Update `GuestBookingResponse` to include `duration`
- [x] 5.6 Validate TypeSpec compiles: `cd spec && npm test`

## 6. Frontend — API Client & Types

- [x] 6.1 Regenerate TypeScript types: `cd frontend && npm run gen:types`
- [x] 6.2 Update `api.ts` to support `duration` query param on slots endpoint
- [x] 6.3 Update `api.ts` booking creation to pass `duration` in request body

## 7. Frontend — Duration Picker Component

- [x] 7.1 Create `DurationPicker` component (dropdown/selector with 15-min increment options up to event type's max duration)
- [x] 7.2 Export and integrate into scheduling page layout

## 8. Frontend — Scheduling Page

- [x] 8.1 Pass `duration` state from DurationPicker to slots API call
- [x] 8.2 Re-fetch slots when duration changes; clear any selected slot on duration change
- [x] 8.3 Pass `duration` query param in "Continue" button navigation to confirm page

## 9. Frontend — MeetingSummary Component

- [x] 9.1 Replace hardcoded "30 min" with dynamic duration from props or event type data
- [x] 9.2 Update MeetingSummary to reflect the currently selected duration

## 10. Frontend — Confirm Page

- [x] 10.1 Read `duration` from query params (default to event type's duration if missing)
- [x] 10.2 Compute end time as `startTime + duration` using dayjs
- [x] 10.3 Display duration and computed end time in the summary card
- [x] 10.4 Pass `duration` in the booking creation API call

## 11. Frontend — Confirmation Page

- [x] 11.1 If `duration` is available in query params, display it in the booking details card
- [x] 11.2 Verify end time is displayed correctly

## 12. Backend Tests

- [x] 12.1 Update `test_bookings.py`: fix `test_endtime_is_start_plus_30min` to account for duration; update `test_create_booking_misaligned_start` for 15-min boundaries; add tests for duration validation
- [x] 12.2 Update `test_slots.py`: fix slot count assertions (up to 36/day); fix 30-min boundary assertions; add tests for `?duration` param
- [x] 12.3 Add new tests: booking with custom duration, duration exceeding max, duration not multiple of 15, slots with different duration values
- [x] 12.4 Run backend tests: `cd backend && python3 manage.py test`

## 13. E2E Tests

- [x] 13.1 Update `conftest.py` `unique_time` fixture to support 15-min intervals
- [x] 13.2 Update `future_slot` fixture to use default duration or accept `duration` param
- [x] 13.3 Update guest happy path test: fix "30 min" assertion to match dynamic duration text
- [x] 13.4 Update booking response shape test to include `duration`
- [x] 13.5 Update double-booking and overlap tests to account for variable duration
- [x] 13.6 Add new E2E tests for: booking with custom duration, duration validation errors, slots with duration param
- [x] 13.7 Run E2E API tests: `python3 -m pytest tests/ -v -m "not browser"`

## 14. Browser Tests

- [x] 14.1 Update browser test assertions if "30 min" text is referenced
- [x] 14.2 Run browser tests: `python3 -m pytest tests/ -v -m browser`

## 15. Spec Sync & Cleanup

- [x] 15.1 Sync delta specs back to main specs: run openspec-sync-specs skill
- [x] 15.2 Archive the change: run openspec-archive-change skill
