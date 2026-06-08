# booking-duration Specification

## Purpose

Defines how guests select a meeting duration, how the system validates it, and how duration-aware slot availability works.

## ADDED Requirements

### Requirement: Guest Selects Booking Duration
The system SHALL allow a guest to select a meeting duration in 15-minute increments when booking a slot, capped by the event type's maximum duration.

#### Scenario: Guest selects 15-minute duration
- **WHEN** the guest chooses a duration of 15 minutes on the scheduling page
- **THEN** the slots endpoint SHALL return start times where a 15-minute meeting fits within operating hours without conflicts
- **AND** the booking SHALL be created with endTime = startTime + 15 minutes

#### Scenario: Guest selects 60-minute duration
- **WHEN** the guest chooses a duration of 60 minutes on the scheduling page
- **THEN** the slots endpoint SHALL return start times where a 60-minute meeting fits within operating hours without conflicts
- **AND** the booking SHALL be created with endTime = startTime + 60 minutes

#### Scenario: Guest selects duration exceeding event type max
- **WHEN** the guest sends a booking request with a duration greater than the event type's `duration` field
- **THEN** the system SHALL return status 400
- **AND** the error SHALL include code "INVALID_INPUT"

#### Scenario: Guest selects duration not multiple of 15
- **WHEN** the guest sends a booking request with a duration of 22 minutes
- **THEN** the system SHALL return status 400
- **AND** the error SHALL include code "INVALID_INPUT"

#### Scenario: Guest selects duration less than 15
- **WHEN** the guest sends a booking request with a duration of 5 minutes
- **THEN** the system SHALL return status 400
- **AND** the error SHALL include code "INVALID_INPUT"

### Requirement: Slots Endpoint Accepts Duration Parameter
The system SHALL accept an optional `duration` query parameter on the slots endpoint to compute availability for a specific meeting length.

#### Scenario: Slots with duration param returns duration-aware availability
- **GIVEN** an existing booking from 14:00 to 14:30
- **WHEN** the guest requests slots with `?duration=15`
- **THEN** the 14:00 slot SHALL be unavailable (the 15-min meeting from 14:00 would overlap the 14:00-14:30 booking)
- **AND** the 14:15 slot SHALL be available (meeting 14:15-14:30 fits before the existing booking ends)
- **AND** the 14:30 slot SHALL be available

#### Scenario: Slots without duration param uses event type default
- **WHEN** the guest requests slots without a duration parameter
- **THEN** the system SHALL use the event type's `duration` field value as the default
- **AND** slots SHALL be generated with 15-min boundary start times checked against that duration

#### Scenario: Duration param exceeds event type max returns 400
- **WHEN** the guest requests slots with a duration exceeding the event type's `duration` field
- **THEN** the system SHALL return status 400
- **AND** the error SHALL include code "INVALID_INPUT"

### Requirement: Duration Falls Within Operating Hours
The system SHALL ensure the requested duration does not extend beyond the end of operating hours.

#### Scenario: Start time + duration exceeds 18:00
- **GIVEN** an event type with timezone "UTC" and duration 60
- **WHEN** the guest selects startTime 17:45 with duration 60 (would end at 18:45)
- **THEN** the system SHALL mark the 17:45 slot as unavailable
- **AND** the system SHALL reject a booking request for that time
- **AND** the error SHALL include code "INVALID_INPUT"
