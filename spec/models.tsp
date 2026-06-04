import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@doc("Error response body")
@error
model Error {
  @doc("Machine-readable error code")
  code: string;
  @doc("Human-readable description")
  message: string;
}

@doc("Full event type resource returned to the owner")
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
  @doc("Whether this event type is visible to guests")
  isActive: boolean;
  @doc("Creation timestamp (ISO 8601, UTC)")
  createdAt: utcDateTime;
}

@doc("Payload to create a new event type")
model CreateEventTypeRequest {
  @doc("Display name")
  @maxLength(1000)
  name: string;
  @doc("Long description")
  @maxLength(1000)
  description: string;
  @doc("IANA timezone identifier (default: UTC)")
  timezone?: string;
}

@doc("Payload to partially update an event type")
model UpdateEventTypeRequest {
  @doc("Display name")
  @maxLength(1000)
  name?: string;
  @doc("Long description")
  @maxLength(1000)
  description?: string;
  @doc("IANA timezone identifier")
  timezone?: string;
  @doc("Whether this event type is active")
  isActive?: boolean;
}

@doc("Public subset of event type fields shown in guest list")
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
}

@doc("Full booking resource returned to the owner")
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
  @doc("End time (ISO 8601, UTC) — derived from startTime + 30 minutes")
  endTime: utcDateTime;
  @doc("Creation timestamp (ISO 8601, UTC)")
  createdAt: utcDateTime;
}

@doc("Payload to create a new booking")
model CreateBookingRequest {
  @doc("ID of the event type to book (must be active)")
  @format("uuid")
  eventTypeId: string;
  @doc("Desired start time (ISO 8601, UTC) — must align with a slot boundary")
  startTime: utcDateTime;
  @doc("Guest's display name")
  @maxLength(1000)
  guestName: string;
  @doc("Optional notes")
  @maxLength(1000)
  notes?: string;
}

@doc("Response returned to the guest after a successful booking")
model GuestBookingResponse {
  @doc("Start time (ISO 8601, UTC)")
  startTime: utcDateTime;
  @doc("End time (ISO 8601, UTC)")
  endTime: utcDateTime;
  @doc("Event type name at time of booking")
  eventTypeName: string;
}

@doc("One-off time range that prevents new bookings")
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
