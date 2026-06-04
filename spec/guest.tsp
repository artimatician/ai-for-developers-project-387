import "@typespec/http";
import "@typespec/rest";
import "./models.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@doc("Guest / Public API — browse event types, check slots, create bookings")
@route("/api")
namespace ScheduleACall.Guest {
  @doc("List active event types only")
  @get
  @route("/event-types")
  op listActiveEventTypes(): PublicEventType[];

  @doc("Get a single event type (only if active)")
  @get
  @route("/event-types/{id}")
  op getActiveEventType(@path @format("uuid") id: string): EventType | {
    @statusCode _: 404;
    @body body: Error;
  };

  @doc("Get available time slots for the next 14 days")
  @get
  @route("/event-types/{id}/slots")
  op getSlots(@path @format("uuid") id: string): TimeSlot[] | {
    @statusCode _: 404;
    @body body: Error;
  };

  @doc("Create a booking for an available slot")
  @post
  @route("/bookings")
  op createBooking(@body body: CreateBookingRequest): {
    @statusCode _: 201;
    @body result: GuestBookingResponse;
  } | {
    @statusCode _: 400;
    @body body: Error;
  } | {
    @statusCode _: 404;
    @body body: Error;
  } | {
    @statusCode _: 409;
    @body body: Error;
  };
}

@doc("Health check endpoint")
@route("/health")
namespace ScheduleACall.Health {
  @doc("Returns OK if the service is running")
  @get
  op health(): {
    @doc("Health status")
    status: "ok";
  };
}
