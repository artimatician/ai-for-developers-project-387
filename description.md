## Schedule a Call project

### Project Description:

“Schedule a Call” is a simplified appointment scheduling service where a user publishes available time slots, and another user selects an open slot and books an appointment. Our app follows the same basic scenario: the owner publishes available times for meetings, and another user selects an open slot and signs up for a call.
The project does not include authorization, personal accounts, or integrations with external calendars. Users can view available 30-minute slots, cselect a time, and book an appointment. The calendar owner can view a list of upcoming meetings.

### App Description:

The project has two roles: calendar owner and guests. There is no registration or login required. The calendar owner is a single predefined profile. This profile is used by default in the admin panel. Guests book slots without creating an account or logging in.

The calendar owner can:
- Create event types. For each event type, they set the ID, name, description, and duration in minutes.
- View the upcoming meetings page, where bookings for all event types are displayed in a single list.

Guest:
- Can view the booking overview page, which displays the name, description, and duration.
- Selects an event type, opens the calendar, and chooses an available slot within the next 14 days.
- Creates a booking for the selected slot.

Booking Rule:
- You cannot create two entries for the same time slot, even if they are different event types.
Default Booking Window:
- Available slots are displayed for the next 14 days, starting from the current date.
- A guest can only book an available slot from this window.

### Stack:

Django backend. React frontend. Other parts of the application can use any other technology.

Internal implementation:
Can be anything. Basic fault tolerance is required.

