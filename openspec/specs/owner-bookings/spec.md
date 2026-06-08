# owner-bookings Specification

## Purpose

Owner bookings list page with filtering by event type and date range, pagination, and consistent visual styling.
## Requirements
### Requirement: Owner Bookings List Page
The system SHALL display a page at `/owner/bookings` with a filterable, paginated list of bookings.

#### Scenario: Bookings page loads
- WHEN the owner navigates to `/owner/bookings`
- THEN the page SHALL display the title "Bookings" as an `<Title order={2}>`
- AND the page SHALL display filter controls for Event Type and Date Range
- AND the page SHALL display a table with columns for Event Type, Guest, Start Time, End Time, and Notes

#### Scenario: Table shows bookings
- GIVEN there are bookings
- WHEN the owner navigates to `/owner/bookings`
- THEN each row SHALL show the event type name, guest name, start time, end time, and notes
- AND bookings SHALL be sorted by startTime ascending

### Requirement: Owner Filters Bookings
The system SHALL allow the owner to filter bookings by event type and date range.

#### Scenario: Filter by event type
- WHEN the owner selects a specific event type from the filter dropdown
- THEN the table SHALL update to show only bookings for that event type
- AND the URL SHALL update to reflect the filter

#### Scenario: Filter by date range
- WHEN the owner selects a from and to date
- THEN the table SHALL update to show only bookings within that range
- AND the URL SHALL update to reflect the filter

#### Scenario: Filter combines event type and date range
- WHEN the owner selects both an event type and a date range
- THEN the table SHALL show only bookings matching both filters

### Requirement: Owner Paginates Bookings
The system SHALL paginate the bookings list with 20 items per page.

#### Scenario: Pagination controls
- GIVEN there are more than 20 bookings
- WHEN the owner navigates to `/owner/bookings`
- THEN the page SHALL display pagination controls
- AND the first page SHALL show up to 20 bookings

#### Scenario: Navigate to next page
- WHEN the owner clicks the next page button
- THEN the table SHALL show the next set of bookings
- AND the URL SHALL update to reflect the page offset

### Requirement: Owner Bookings Uses Design Tokens
The bookings page SHALL use guest space design tokens for visual styling.

#### Scenario: Visual styling
- WHEN the bookings page is rendered
- THEN the table, filters, and pagination SHALL use consistent styling matching the guest space
- AND filters SHALL be inline with proper spacing

