# Delta for owner-blackouts

## ADDED Requirements

### Requirement: Owner Blackouts List Page
The system SHALL display a page at `/owner/blackouts` with a list of blackout periods and a create button.

#### Scenario: Blackouts page loads
- WHEN the owner navigates to `/owner/blackouts`
- THEN the page SHALL display the title "Blackouts" as an `<Title order={2}>`
- AND the page SHALL display a "Create Blackout" button
- AND the page SHALL display a table with columns for Start Time, End Time, Reason, and Actions

#### Scenario: Table shows blackouts
- GIVEN there are blackout periods
- WHEN the owner navigates to `/owner/blackouts`
- THEN each row SHALL show the start time, end time, reason, and a delete action

#### Scenario: Empty state
- GIVEN no blackouts exist
- WHEN the owner navigates to `/owner/blackouts`
- THEN the table SHALL display an empty state message

### Requirement: Owner Creates Blackout via Modal
The system SHALL allow the owner to create a blackout period through a modal dialog.

#### Scenario: Create blackout modal
- WHEN the owner clicks "Create Blackout"
- THEN a modal SHALL open with fields for Start Time (required), End Time (required), and Reason (optional)
- WHEN the owner submits the modal with valid data
- THEN the system SHALL create the blackout via POST `/api/owner/blackouts`
- AND the table SHALL update to include the new blackout
- AND a success notification SHALL be displayed

#### Scenario: Create blackout validation
- WHEN the owner submits the modal with endTime before startTime
- THEN the form SHALL show validation errors
- AND the modal SHALL remain open

### Requirement: Owner Deletes Blackout
The system SHALL allow the owner to delete a blackout period.

#### Scenario: Delete blackout
- WHEN the owner clicks the delete action on a blackout row
- THEN the system SHALL delete the blackout via DELETE `/api/owner/blackouts/{id}`
- AND the row SHALL be removed from the table
- AND a success notification SHALL be displayed

### Requirement: Owner Blackouts Uses Design Tokens
The blackouts page SHALL use guest space design tokens for visual styling.

#### Scenario: Visual styling
- WHEN the blackouts page is rendered
- THEN the table, modal, and buttons SHALL use consistent styling matching the guest space
