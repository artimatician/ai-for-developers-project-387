# Delta for guest-booking-flow

## ADDED Requirements

### Requirement: Landing Page Displays Marketing Content
The system SHALL display a landing page at `/` with a hero section and how-it-works steps.

#### Scenario: Landing page loads
- WHEN the guest navigates to `/`
- THEN the page SHALL display a Navbar with variant "landing"
- AND the Navbar SHALL show "Log in" link to `/owner/event-types` and "Book a call" CTA to `/book`
- AND the page SHALL display a HeroSection with heading and tagline
- AND the page SHALL show a 3-step how-it-works guide (Pick event type, Choose date & time, Confirm booking)
- AND the page SHALL have a "Start booking" CTA that navigates to `/book`

### Requirement: Event Type Selection Shows Active Types
The system SHALL display a page at `/book` listing all active event types.

#### Scenario: Event type selection loads
- WHEN the guest navigates to `/book`
- THEN the Navbar SHALL use variant "inner" with links to "Book" and "Owner"
- AND the page SHALL display a ProfileIntroCard with avatar and name
- AND the page SHALL display EventTypeCard components for each active event type
- AND each card SHALL show the event type name, description, and timezone

#### Scenario: Clicking event type navigates to scheduling
- WHEN the guest clicks an EventTypeCard
- THEN the browser SHALL navigate to `/book/{eventTypeId}`

#### Scenario: Loading state
- WHEN the page is fetching event types
- THEN the page SHALL display skeleton placeholders

#### Scenario: Error state
- WHEN the API request fails
- THEN the page SHALL display an ErrorAlert with a retry button

#### Scenario: Empty state
- WHEN no active event types exist
- THEN the page SHALL display "No event types available yet."

### Requirement: Scheduling Page Shows 3-Column Layout
The system SHALL display a scheduling page at `/book/{id}` with a 3-column layout for selecting a date and time slot.

#### Scenario: Scheduling page loads with data
- WHEN the guest navigates to `/book/{id}`
- THEN the page SHALL fetch the event type and slots in parallel
- AND the page SHALL display a 3-column layout

#### Scenario: Meeting summary column
- WHEN the scheduling page loads
- THEN the left column SHALL display MeetingSummary with host avatar, host name, event name, description, duration (30 min), and timezone

#### Scenario: Calendar grid column
- WHEN the scheduling page loads
- THEN the middle column SHALL display a CalendarGrid showing the current month
- AND dates within the 14-day window with available slots SHALL be clickable
- AND past dates SHALL be grayed out and not clickable
- AND dates beyond the 14-day window SHALL be grayed out and not clickable
- AND today SHALL be indicated with a dot

#### Scenario: Time slot list column
- WHEN the scheduling page loads and a date is selected
- THEN the right column SHALL display TimeSlotList with slots for the selected date
- AND available slots SHALL be clickable
- AND unavailable slots SHALL be shown at reduced opacity with not-allowed cursor
- AND the selected slot SHALL have a highlighted border

#### Scenario: 12h/24h time format toggle
- WHEN the TimeSlotList is displayed
- THEN the guest SHALL be able to toggle between 12-hour and 24-hour time format
- AND the toggle SHALL be a pill button

#### Scenario: First available date auto-selected
- WHEN the scheduling page loads with available slots
- THEN the first date with available slots SHALL be automatically selected
- AND the time slots for that date SHALL be displayed

#### Scenario: No slots available for date
- WHEN the selected date has no slots (all unavailable or outside window)
- THEN the TimeSlotList SHALL display "No time slots available for this date"

#### Scenario: Continue button is disabled without selection
- WHEN no slot is selected
- THEN the "Continue" button SHALL be disabled (reduced opacity)

#### Scenario: Continue navigates to confirm page
- WHEN a slot is selected and the guest clicks "Continue"
- THEN the browser SHALL navigate to `/book/{id}/confirm?startTime={iso}&eventTypeName={name}`

#### Scenario: Back button
- WHEN the guest clicks "Back" in TimeSlotList
- THEN the browser SHALL navigate to the previous page via `window.history.back()`

#### Scenario: Loading state
- WHEN the scheduling page is fetching data
- THEN the page SHALL display a 3-column skeleton layout

#### Scenario: Error state
- WHEN the API request fails
- THEN the page SHALL display an ErrorAlert with a retry button

### Requirement: Booking Form Captures Guest Details
The system SHALL display a booking form at `/book/{id}/confirm` that collects guest name and optional notes.

#### Scenario: Booking form loads with summary
- WHEN the guest navigates to `/book/{id}/confirm` with valid startTime and eventTypeName
- THEN the page SHALL display a summary card with Date, Time (in event type's timezone), and Timezone
- AND the page SHALL display a form with guestName (required) and notes (optional) fields

#### Scenario: Successful booking
- WHEN the guest submits the form with valid data
- THEN the system SHALL create the booking via POST `/api/bookings`
- AND the browser SHALL navigate to `/bookings/confirm?startTime={iso}&endTime={iso}&eventTypeName={name}`

#### Scenario: Missing startTime
- WHEN the guest navigates to the confirm page without startTime
- THEN the page SHALL display an error message

#### Scenario: 409 slot conflict
- WHEN the booking conflicts with an existing booking or blackout
- THEN the page SHALL display "This slot was just booked by someone else. Please choose another."
- AND the page SHALL refresh the slot data

### Requirement: Confirmation Page Shows Success
The system SHALL display a booking confirmation page at `/bookings/confirm` with booking details.

#### Scenario: Confirmation displays booking details
- WHEN the guest navigates to `/bookings/confirm` with valid query params
- THEN the page SHALL display a green checkmark icon
- AND the page SHALL display "Booking Confirmed!" heading
- AND the page SHALL display a card with event type name, start time, and end time
- AND the page SHALL display a "Book another slot" link to `/book`

### Requirement: How It Works Page
The system SHALL display an informational page at `/how-it-works`.

#### Scenario: How it works page loads
- WHEN the guest navigates to `/how-it-works`
- THEN the Navbar SHALL use variant "landing"
- AND the page SHALL explain the 3-step booking process in detail
- AND the page SHALL display a "Start booking" CTA to `/book`
