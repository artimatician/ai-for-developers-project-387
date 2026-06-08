# Delta for owner-event-types

## ADDED Requirements

### Requirement: Owner Event Types List Page
The system SHALL display a page at `/owner/event-types` with a titled list of all event types and a create button.

#### Scenario: Event types page loads
- WHEN the owner navigates to `/owner/event-types`
- THEN the page SHALL display the title "Event Types" as an `<Title order={2}>`
- AND the page SHALL display a "Create Event Type" button
- AND the page SHALL display a table with columns for Name, Timezone, Active status, and Actions

#### Scenario: Table shows all event types
- GIVEN there are active and inactive event types
- WHEN the owner navigates to `/owner/event-types`
- THEN the table SHALL include all event types (both active and inactive)
- AND each row SHALL show the event type name, timezone, and a toggle switch for Active status

### Requirement: Owner Creates Event Type via Modal
The system SHALL allow the owner to create a new event type through a modal dialog.

#### Scenario: Create event type modal
- WHEN the owner clicks "Create Event Type"
- THEN a modal SHALL open with fields for Name (required), Description (required), and Timezone (optional, defaults to "UTC")
- WHEN the owner submits the modal with valid data
- THEN the system SHALL create the event type via POST `/api/owner/event-types`
- AND the table SHALL update to include the new event type
- AND a success notification SHALL be displayed

#### Scenario: Create event type validation
- WHEN the owner submits the modal with a missing name
- THEN the form SHALL show validation errors
- AND the modal SHALL remain open

### Requirement: Owner Edits Event Type
The system SHALL allow the owner to edit an event type via a pre-filled modal.

#### Scenario: Edit event type
- WHEN the owner clicks the Edit action on an event type row
- THEN a modal SHALL open with the current values pre-filled
- WHEN the owner modifies the name and submits
- THEN the system SHALL update the event type via PATCH `/api/owner/event-types/{id}`
- AND the table SHALL reflect the updated name
- AND a success notification SHALL be displayed

### Requirement: Owner Toggles Event Type Active Status
The system SHALL allow the owner to toggle the active status of an event type via a switch.

#### Scenario: Deactivate event type
- WHEN the owner toggles the Active switch from on to off
- THEN the system SHALL send a PATCH request with `{ isActive: false }`
- AND the toggle SHALL reflect the inactive state
- AND a success notification SHALL be displayed

#### Scenario: Reactivate event type
- WHEN the owner toggles the Active switch from off to on
- THEN the system SHALL send a PATCH request with `{ isActive: true }`
- AND the toggle SHALL reflect the active state

### Requirement: Owner Event Types Uses Design Tokens
The event types page SHALL use guest space design tokens for visual styling.

#### Scenario: Visual styling
- WHEN the event types page is rendered
- THEN the table SHALL use white background, gray borders, and proper border radius
- AND the modal SHALL use consistent padding and spacing
- AND buttons SHALL match the guest space styling
