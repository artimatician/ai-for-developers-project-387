# event-types Specification (Delta)

## MODIFIED Requirements

### Requirement: Owner Creates Event Type
The system SHALL allow the owner to create an event type with a name, description, optional timezone, and optional duration.

#### Scenario: Create event type with all fields
- GIVEN the owner provides a name "Consultation", description "One-on-one chat", timezone "America/New_York", and duration 60
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL return status 201
- AND the response SHALL include the event type with id (UUID v4), name, description, timezone (default "UTC"), duration (minutes, integer), isActive (true), and createdAt (ISO 8601)

#### Scenario: Create event type with defaults
- GIVEN the owner provides only name "30 Min Chat" and description "Quick sync"
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL set timezone to "UTC"
- AND the system SHALL set duration to 30
- AND the system SHALL set isActive to true

#### Scenario: Create event type with invalid duration
- GIVEN the owner provides duration 7 (less than 15)
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: Create event type with duration exceeding max
- GIVEN the owner provides duration 600 (exceeds 480 max)
- WHEN the owner sends a POST request to `/api/owner/event-types`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

### Requirement: Owner Updates Event Type
The system SHALL allow the owner to partially update an event type. All fields SHALL be optional in the update request. Only provided fields SHALL be updated.

#### Scenario: Update duration
- GIVEN an existing event type with duration 30
- WHEN the owner sends a PATCH request to `/api/owner/event-types/{id}` with `{ "duration": 60 }`
- THEN the system SHALL return status 200
- AND the response SHALL include duration set to 60
- AND unchanged fields SHALL retain their previous values

#### Scenario: Update duration to invalid value
- GIVEN an existing event type
- WHEN the owner sends a PATCH request with `{ "duration": 0 }`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

## ADDED Requirements

### Requirement: Guest Sees Event Type Duration
The system SHALL expose the `duration` field in the guest-facing event type response.

#### Scenario: Guest gets event type includes duration
- GIVEN an active event type with duration 60
- WHEN the guest sends a GET request to `/api/event-types/{id}`
- THEN the response SHALL include duration set to 60
