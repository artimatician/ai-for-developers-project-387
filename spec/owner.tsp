import "@typespec/http";
import "@typespec/rest";
import "./models.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@doc("Owner API — management of event types, bookings, and blackouts")
@route("/api/owner")
namespace ScheduleACall.Owner {
  @doc("List all event types (including inactive)")
  @get
  @route("/event-types")
  op listEventTypes(): EventType[];

  @doc("Create a new event type")
  @post
  @route("/event-types")
  op createEventType(@body body: CreateEventTypeRequest): {
    @statusCode _: 201;
    @body result: EventType;
  } | {
    @statusCode _: 400;
    @body body: Error;
  };

  @doc("Get a single event type by ID")
  @get
  @route("/event-types/{id}")
  op getEventType(@path @format("uuid") id: string): EventType | {
    @statusCode _: 404;
    @body body: Error;
  };

  @doc("Partially update an event type")
  @patch
  @route("/event-types/{id}")
  op updateEventType(@path @format("uuid") id: string, @body body: UpdateEventTypeRequest): EventType | {
    @statusCode _: 400;
    @body body: Error;
  } | {
    @statusCode _: 404;
    @body body: Error;
  };

  @doc("List bookings (paginated, filterable)")
  @get
  @route("/bookings")
  op listBookings(...OwnerBookingsParams): Booking[];

  @doc("List all blackout periods")
  @get
  @route("/blackouts")
  op listBlackouts(): Blackout[];

  @doc("Create a blackout period")
  @post
  @route("/blackouts")
  op createBlackout(@body body: CreateBlackoutRequest): {
    @statusCode _: 201;
    @body result: Blackout;
  } | {
    @statusCode _: 400;
    @body body: Error;
  };

  @doc("Delete a blackout period")
  @delete
  @route("/blackouts/{id}")
  op deleteBlackout(@path @format("uuid") id: string): void | {
    @statusCode _: 404;
    @body body: Error;
  };
}
