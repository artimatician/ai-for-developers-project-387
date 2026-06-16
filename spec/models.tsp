import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@doc("Error response body")
@example(#{
  code: "NOT_FOUND",
  message: "The requested resource was not found"
})
@error
model Error {
  @doc("Machine-readable error code")
  code: string;
  @doc("Human-readable description")
  message: string;
}

@doc("Full event type resource returned to the owner")
@example(#{
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  name: "30-min Consultation",
  description: "Quick introductory call to discuss your needs",
  timezone: "America/New_York",
  duration: 30,
  isActive: true,
  createdAt: utcDateTime.fromISO("2026-01-15T10:00:00Z")
})
model EventType {
  @doc("Unique identifier")
  @format("uuid")
  id: string;
  @doc("Display name")
  @maxLength(1000)
  name: string;
  @doc("Long description")
  @maxLength(1000)
  description: string;
  @doc("IANA timezone identifier")
  timezone: string;
  @doc("Maximum booking duration in minutes (default: 30, min: 15, max: 480)")
  @minValue(15)
  @maxValue(480)
  duration?: integer;
  @doc("Whether this event type is visible to guests")
  isActive: boolean;
  @doc("Creation timestamp (ISO 8601, UTC)")
  createdAt: utcDateTime;
}

@doc("Payload to create a new event type")
@example(#{
  name: "30-min Consultation",
  description: "Quick introductory call to discuss your needs",
  timezone: "America/New_York",
  duration: 60
})
model CreateEventTypeRequest {
  @doc("Display name")
  @maxLength(1000)
  name: string;
  @doc("Long description")
  @maxLength(1000)
  description: string;
  @doc("IANA timezone identifier (default: UTC)")
  timezone?: string;
  @doc("Maximum booking duration in minutes (default: 30, min: 15, max: 480)")
  @minValue(15)
  @maxValue(480)
  duration?: integer;
}

@doc("Payload to partially update an event type")
@example(#{
  name: "60-min Deep Dive",
  description: "Extended consultation for detailed discussion",
  timezone: "America/Chicago",
  duration: 60,
  isActive: false
})
model UpdateEventTypeRequest {
  @doc("Display name")
  @maxLength(1000)
  name?: string;
  @doc("Long description")
  @maxLength(1000)
  description?: string;
  @doc("IANA timezone identifier")
  timezone?: string;
  @doc("Maximum booking duration in minutes (min: 15, max: 480)")
  @minValue(15)
  @maxValue(480)
  duration?: integer;
  @doc("Whether this event type is active")
  isActive?: boolean;
}

@doc("Public subset of event type fields shown in guest list")
@example(#{
  id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  name: "30-min Consultation",
  description: "Quick introductory call to discuss your needs",
  timezone: "America/New_York",
  duration: 30
})
model PublicEventType {
  @doc("Unique identifier")
  @format("uuid")
  id: string;
  @doc("Display name")
  @maxLength(1000)
  name: string;
  @doc("Long description")
  @maxLength(1000)
  description: string;
  @doc("IANA timezone identifier")
  timezone: string;
  @doc("Maximum booking duration in minutes (default: 30)")
  duration?: integer;
}

@doc("Full booking resource returned to the owner")
@example(#{
  id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
  eventTypeId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  eventTypeName: "30-min Consultation",
  guestName: "Alice Johnson",
  notes: "Looking forward to discussing the project",
  startTime: utcDateTime.fromISO("2026-02-01T15:00:00Z"),
  endTime: utcDateTime.fromISO("2026-02-01T15:30:00Z"),
  createdAt: utcDateTime.fromISO("2026-02-01T14:00:00Z")
})
model Booking {
  @doc("Unique identifier")
  @format("uuid")
  id: string;
  @doc("ID of the associated event type")
  @format("uuid")
  eventTypeId: string;
  @doc("Snapshot of event type name at booking time")
  eventTypeName: string;
  @doc("Guest's display name")
  @maxLength(1000)
  guestName: string;
  @doc("Optional notes from the guest")
  @maxLength(1000)
  notes?: string;
  @doc("Start time (ISO 8601, UTC)")
  startTime: utcDateTime;
  @doc("End time (ISO 8601, UTC) — derived from startTime + duration")
  endTime: utcDateTime;
  @doc("Creation timestamp (ISO 8601, UTC)")
  createdAt: utcDateTime;
}

@doc("Payload to create a new booking")
@example(#{
  eventTypeId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  startTime: utcDateTime.fromISO("2026-02-01T15:00:00Z"),
  guestName: "Alice Johnson",
  duration: 45,
  notes: "Looking forward to the call"
})
model CreateBookingRequest {
  @doc("ID of the event type to book (must be active)")
  @format("uuid")
  eventTypeId: string;
  @doc("Desired start time (ISO 8601, UTC) — must align with a slot boundary")
  startTime: utcDateTime;
  @doc("Guest's display name")
  @maxLength(1000)
  guestName: string;
  @doc("Optional meeting duration in minutes (default: event type's duration, must be 15-min increment)")
  @minValue(15)
  @maxValue(480)
  duration?: integer;
  @doc("Optional notes")
  @maxLength(1000)
  notes?: string;
}

@doc("Response returned to the guest after a successful booking")
@example(#{
  startTime: utcDateTime.fromISO("2026-02-01T15:00:00Z"),
  endTime: utcDateTime.fromISO("2026-02-01T15:45:00Z"),
  eventTypeName: "30-min Consultation",
  duration: 45
})
model GuestBookingResponse {
  @doc("Start time (ISO 8601, UTC)")
  startTime: utcDateTime;
  @doc("End time (ISO 8601, UTC)")
  endTime: utcDateTime;
  @doc("Event type name at time of booking")
  eventTypeName: string;
  @doc("Meeting duration in minutes")
  duration: integer;
}

@doc("One-off time range that prevents new bookings")
@example(#{
  id: "d4e5f6a7-b8c9-0123-defa-234567890123",
  startTime: utcDateTime.fromISO("2026-02-15T09:00:00Z"),
  endTime: utcDateTime.fromISO("2026-02-15T17:00:00Z"),
  reason: "Company offsite",
  createdAt: utcDateTime.fromISO("2026-02-10T12:00:00Z")
})
model Blackout {
  @doc("Unique identifier")
  @format("uuid")
  id: string;
  @doc("Start of blackout period (ISO 8601, UTC)")
  startTime: utcDateTime;
  @doc("End of blackout period (ISO 8601, UTC)")
  endTime: utcDateTime;
  @doc("Optional reason for the blackout")
  @maxLength(1000)
  reason?: string;
  @doc("Creation timestamp (ISO 8601, UTC)")
  createdAt: utcDateTime;
}

@doc("Payload to create a blackout period")
@example(#{
  startTime: utcDateTime.fromISO("2026-02-15T09:00:00Z"),
  endTime: utcDateTime.fromISO("2026-02-15T17:00:00Z"),
  reason: "Company offsite"
})
model CreateBlackoutRequest {
  @doc("Start of blackout period (ISO 8601, UTC)")
  startTime: utcDateTime;
  @doc("End of blackout period (ISO 8601, UTC) — must be after startTime")
  endTime: utcDateTime;
  @doc("Optional reason")
  @maxLength(1000)
  reason?: string;
}

@doc("Computed time slot (not stored)")
@example(#{
  startTime: utcDateTime.fromISO("2026-02-01T15:00:00Z"),
  endTime: utcDateTime.fromISO("2026-02-01T15:30:00Z"),
  available: true
})
model TimeSlot {
  @doc("Slot start time (ISO 8601, UTC)")
  startTime: utcDateTime;
  @doc("Slot end time (ISO 8601, UTC)")
  endTime: utcDateTime;
  @doc("Whether the slot can be booked")
  available: boolean;
}

@doc("Query parameters for listing owner bookings")
model OwnerBookingsParams {
  @query
  @doc("Filter by event type ID")
  @format("uuid")
  eventTypeId?: string;
  @query
  @doc("Filter by start time (inclusive, ISO 8601, UTC)")
  from?: utcDateTime;
  @query
  @doc("Filter by start time (inclusive, ISO 8601, UTC)")
  to?: utcDateTime;
  @query
  @doc("Maximum number of results (default: 20)")
  limit?: integer;
  @query
  @doc("Number of results to skip (default: 0)")
  offset?: integer;
}
