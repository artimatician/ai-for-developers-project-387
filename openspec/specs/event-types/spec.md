# event-types Specification

## Purpose

Event type CRUD lifecycle, visibility rules, and validation for both owner and guest endpoints.
## Requirements
### Requirement: Owner Creates Event Type
The system SHALL allow the owner to create an event type with a name, description, and optional timezone.

#### Scenario: Create event type with all fields
- GIVEN the owner provides a name "30 Min Chat", description "Quick sync", and timezone "America/New_York"
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL return status 201
- AND the response SHALL include the event type with id (UUID v4), name, description, timezone, isActive (true), and createdAt (ISO 8601)

#### Scenario: Create event type with defaults
- GIVEN the owner provides only name "30 Min Chat" and description "Quick sync"
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL set timezone to "UTC"
- AND the system SHALL set isActive to true

#### Scenario: Create event type without required fields
- GIVEN the owner omits the name field
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: Create event type with invalid timezone
- GIVEN the owner provides timezone "Invalid/Timezone"
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_TIMEZONE"

### Requirement: Owner Lists All Event Types
The system SHALL allow the owner to list all event types, including both active and inactive.

#### Scenario: List event types includes inactive
- GIVEN there is a deactivated event type
- WHEN the owner sends a GET request to `/api/owner/event-types`
- THEN the system SHALL return status 200
- AND the response SHALL include the deactivated event type in the array

### Requirement: Owner Gets Single Event Type
The system SHALL allow the owner to retrieve a single event type by ID.

#### Scenario: Get existing event type
- GIVEN an event type with a known UUID
- WHEN the owner sends a GET request to `/api/owner/event-types/{id}`
- THEN the system SHALL return status 200
- AND the response SHALL include all event type fields

#### Scenario: Get nonexistent event type
- GIVEN a UUID that does not match any event type
- WHEN the owner sends a GET request to `/api/owner/event-types/{id}`
- THEN the system SHALL return status 404
- AND the error SHALL include code "EVENT_TYPE_NOT_FOUND"

### Requirement: Owner Updates Event Type
The system SHALL allow the owner to partially update an event type. All fields SHALL be optional in the update request. Only provided fields SHALL be updated.

#### Scenario: Update name and description
- GIVEN an existing event type
- WHEN the owner sends a PATCH request to `/api/owner/event-types/{id}` with `{ "name": "New Name", "description": "New description" }`
- THEN the system SHALL return status 200
- AND the response SHALL include the updated fields
- AND unchanged fields SHALL retain their previous values

#### Scenario: Update timezone
- GIVEN an existing event type with timezone "UTC"
- WHEN the owner sends a PATCH request to `/api/owner/event-types/{id}` with `{ "timezone": "America/New_York" }`
- THEN the system SHALL return status 200
- AND the timezone SHALL be updated to "America/New_York"

#### Scenario: Update nonexistent event type
- GIVEN a UUID that does not match any event type
- WHEN the owner sends a PATCH request to `/api/owner/event-types/{id}`
- THEN the system SHALL return status 404
- AND the error SHALL include code "EVENT_TYPE_NOT_FOUND"

#### Scenario: Empty update body
- GIVEN an existing event type
- WHEN the owner sends a PATCH request to `/api/owner/event-types/{id}` with an empty body
- THEN the system SHALL return status 200
- AND the event type SHALL be unchanged

### Requirement: Owner Soft-Deletes Event Type
The system SHALL allow the owner to deactivate an event type by setting isActive to false. There SHALL be no hard DELETE endpoint.

#### Scenario: Deactivate event type
- GIVEN an active event type
- WHEN the owner sends a PATCH request to `/api/owner/event-types/{id}` with `{ "isActive": false }`
- THEN the system SHALL return status 200
- AND the response SHALL include isActive set to false

#### Scenario: Reactivate event type
- GIVEN an inactive event type
- WHEN the owner sends a PATCH request to `/api/owner/event-types/{id}` with `{ "isActive": true }`
- THEN the system SHALL return status 200
- AND the response SHALL include isActive set to true

### Requirement: Guest Lists Only Active Event Types
The system SHALL only expose active event types to guest (public) endpoints.

#### Scenario: Guest lists active event types
- GIVEN there is one active and one inactive event type
- WHEN the guest sends a GET request to `/api/event-types`
- THEN the system SHALL return status 200
- AND the response SHALL include only the active event type
- AND each event type SHALL include only id, name, description, and timezone

### Requirement: Guest Gets Only Active Event Type
The system SHALL return 404 when a guest requests an inactive event type.

#### Scenario: Guest gets active event type
- GIVEN an active event type
- WHEN the guest sends a GET request to `/api/event-types/{id}`
- THEN the system SHALL return status 200
- AND the response SHALL include all event type fields

#### Scenario: Guest gets inactive event type
- GIVEN an inactive event type
- WHEN the guest sends a GET request to `/api/event-types/{id}`
- THEN the system SHALL return status 404
- AND the error SHALL include code "EVENT_TYPE_INACTIVE"

#### Scenario: Guest gets nonexistent event type
- GIVEN a UUID that does not match any event type
- WHEN the guest sends a GET request to `/api/event-types/{id}`
- THEN the system SHALL return status 404
- AND the error SHALL include code "EVENT_TYPE_NOT_FOUND"

### Requirement: Event Type Validation
The system SHALL validate event type fields according to the data model constraints.

#### Scenario: Name exceeds maximum length
- GIVEN a name longer than 1000 characters
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: Description exceeds maximum length
- GIVEN a description longer than 1000 characters
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

### Requirement: Server-Generated Fields
The system SHALL auto-generate the id (UUID v4), isActive (default true), and createdAt (ISO 8601 UTC) fields.

#### Scenario: Event type has auto-generated id
- GIVEN a newly created event type
- THEN the id field SHALL be a non-empty UUID v4 string
- AND the createdAt field SHALL be a valid ISO 8601 UTC datetime
- AND isActive SHALL be true

