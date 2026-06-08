# guest-booking-flow Specification (Delta)

## ADDED Requirements

### Requirement: Scheduling Page Shows Duration Selector
The system SHALL display a duration selector on the scheduling page that lets the guest choose their meeting length in 15-minute increments, up to the event type's maximum duration.

#### Scenario: Duration selector shows available options
- GIVEN an event type with duration 60
- WHEN the scheduling page loads
- THEN the page SHALL display a duration selector with options: 15, 30, 45, 60 (in minutes)
- AND the default SHALL be the event type's duration (60)

#### Scenario: Changing duration refreshes slot availability
- GIVEN the scheduling page is loaded with a default duration of 30
- WHEN the guest changes the duration to 60
- THEN the page SHALL re-fetch slots with `?duration=60`
- AND the TimeSlotList SHALL update to show only start times that can accommodate a 60-minute meeting
- AND the selected slot (if any) SHALL be cleared

#### Scenario: Duration selector respects event type max
- GIVEN an event type with duration 30
- WHEN the scheduling page loads
- THEN the duration selector SHALL only show options: 15, 30

### Requirement: Scheduling Page Shows Selected Duration in Summary
The system SHALL display the selected duration in the MeetingSummary column.

#### Scenario: MeetingSummary shows selected duration
- GIVEN a selected duration of 45 minutes
- THEN the MeetingSummary SHALL display "45 min" (not the hardcoded "30 min")

#### Scenario: Duration updates MeetingSummary on change
- GIVEN the guest changes duration from 30 to 60
- THEN the MeetingSummary SHALL update to show "60 min"

## MODIFIED Requirements

### Requirement: Scheduling Page Shows 3-Column Layout

#### Scenario: Meeting summary column
- WHEN the scheduling page loads
- THEN the left column SHALL display MeetingSummary with host avatar, host name, event name, description, duration (event type's default duration), and timezone

#### Scenario: Continue button navigates to confirm page with duration
- WHEN a slot is selected and the guest clicks "Continue"
- THEN the browser SHALL navigate to `/book/{id}/confirm?startTime={iso}&duration={minutes}&eventTypeName={name}`

### Requirement: Booking Form Captures Guest Details

#### Scenario: Booking form loads with summary including dynamic end time
- WHEN the guest navigates to `/book/{id}/confirm` with valid startTime, duration, and eventTypeName
- THEN the page SHALL display a summary card with Date, Start Time, End Time (computed as startTime + duration in event type's timezone), Duration, and Timezone
- AND the page SHALL display a form with guestName (required) and notes (optional) fields

#### Scenario: Successful booking with duration
- WHEN the guest submits the form with valid data
- THEN the system SHALL create the booking via POST `/api/bookings` with startTime and duration
- AND the browser SHALL navigate to `/bookings/confirm?startTime={iso}&endTime={iso}&eventTypeName={name}`

#### Scenario: Missing duration parameter
- WHEN the guest navigates to the confirm page without duration
- THEN the page SHALL default to the event type's duration value
- AND the end time SHALL be computed using that default

### Requirement: Confirmation Page Shows Success

#### Scenario: Confirmation displays booking details with dynamic end time
- WHEN the guest navigates to `/bookings/confirm` with valid query params
- THEN the page SHALL display a green checkmark icon
- AND the page SHALL display "Booking Confirmed!" heading
- AND the page SHALL display a card with event type name, start time, end time, and duration
