# Delta for blackouts

## ADDED Requirements

### Requirement: Owner Creates Blackout
The system SHALL allow the owner to create a blackout period with startTime, endTime, and optional reason.

#### Scenario: Create blackout with all fields
- GIVEN the owner provides startTime "2026-06-10T09:00:00Z", endTime "2026-06-10T17:00:00Z", and reason "Team offsite"
- WHEN the owner sends a POST request to `/api/owner/blackouts`
- THEN the system SHALL return status 201
- AND the response SHALL include id (UUID v4), startTime, endTime, reason, and createdAt (ISO 8601 UTC)

#### Scenario: Create blackout without reason
- GIVEN the owner provides only startTime and endTime
- WHEN the owner sends a POST request to `/api/owner/blackouts`
- THEN the system SHALL return status 201
- AND the blackout SHALL be created successfully with reason as null

#### Scenario: Create blackout with missing required fields
- GIVEN the request omits startTime
- WHEN the owner sends a POST request to `/api/owner/blackouts`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

#### Scenario: Create blackout with endTime before startTime
- GIVEN startTime is after endTime
- WHEN the owner sends a POST request to `/api/owner/blackouts`
- THEN the system SHALL return status 400
- AND the error SHALL include code "INVALID_INPUT"

### Requirement: Owner Lists Blackouts
The system SHALL allow the owner to list all blackout periods.

#### Scenario: List blackouts
- GIVEN there are multiple blackouts
- WHEN the owner sends a GET request to `/api/owner/blackouts`
- THEN the system SHALL return status 200
- AND the response SHALL include all blackouts with id, startTime, endTime, reason, and createdAt

#### Scenario: List blackouts when empty
- GIVEN no blackouts exist
- WHEN the owner sends a GET request to `/api/owner/blackouts`
- THEN the system SHALL return status 200
- AND the response SHALL be an empty array

### Requirement: Owner Deletes Blackout
The system SHALL allow the owner to delete a blackout by ID.

#### Scenario: Delete existing blackout
- GIVEN an existing blackout with a known UUID
- WHEN the owner sends a DELETE request to `/api/owner/blackouts/{id}`
- THEN the system SHALL return status 204
- AND the blackout SHALL be removed

#### Scenario: Delete nonexistent blackout
- GIVEN a UUID that does not match any blackout
- WHEN the owner sends a DELETE request to `/api/owner/blackouts/{id}`
- THEN the system SHALL return status 404
- AND the error SHALL include code "BLACKOUT_NOT_FOUND"

### Requirement: Blackouts Block New Bookings
The system SHALL prevent new bookings that overlap with a blackout period. Existing bookings SHALL NOT be affected.

#### Scenario: Blackout blocks overlapping slot
- GIVEN a blackout from 14:00 to 15:00 on June 10
- WHEN a guest tries to book a slot at 14:00 on June 10
- THEN the system SHALL return status 409
- AND the error SHALL include code "SLOT_UNAVAILABLE"

#### Scenario: Blackout is global across event types
- GIVEN a blackout from 14:00 to 15:00
- WHEN a guest tries to book any event type at 14:00
- THEN the system SHALL return status 409

#### Scenario: Existing bookings survive blackout
- GIVEN an existing booking at 14:00-14:30 on June 10
- WHEN the owner creates a blackout from 14:00 to 15:00 on June 10
- THEN the existing booking SHALL remain valid
