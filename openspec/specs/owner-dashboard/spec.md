# Owner Dashboard

## Purpose

Display a dashboard landing page at `/owner` with summary information about event types, bookings, and blackouts.

## Requirements

### Requirement: Dashboard displays summary cards
The system SHALL display a dashboard page at `/owner` with three summary cards showing counts for event types, bookings, and blackouts.

#### Scenario: Dashboard loads with data
- **WHEN** the owner navigates to `/owner`
- **THEN** the dashboard SHALL display three cards: Event Types, Bookings, Blackouts
- **AND** each card SHALL show the current count from the API
- **AND** each card SHALL link to its corresponding management section

#### Scenario: Dashboard loads with zero data
- **WHEN** the owner navigates to `/owner` and no event types, bookings, or blackouts exist
- **THEN** each card SHALL display "0"
- **AND** each card SHALL show a CTA to create or view the corresponding section

### Requirement: Dashboard cards match guest design tokens
Dashboard cards SHALL use the same visual style as the guest space EventTypeCard.

#### Scenario: Card visual style
- **WHEN** the dashboard renders summary cards
- **THEN** each card SHALL have `backgroundColor: #FFFFFF`, `borderRadius: 10`, `border: 1px solid #E5E7EB`, and an orange left border (`3px solid #F97316`)
- **AND** each card SHALL have a subtle box shadow matching the guest space cards

### Requirement: Dashboard loading state
The dashboard SHALL show loading skeletons while fetching data.

#### Scenario: Dashboard loading
- **WHEN** the dashboard is fetching data from the three API endpoints
- **THEN** the dashboard SHALL display three skeleton card placeholders with matching dimensions
