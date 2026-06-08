# Owner Sidebar

## Purpose

Provide persistent sidebar navigation on all `/owner/*` pages for switching between Dashboard, Event Types, Bookings, and Blackouts sections.

## Requirements

### Requirement: Sidebar is visible on all owner pages
The system SHALL display a sidebar on all `/owner/*` pages, providing navigation between Dashboard, Event Types, Bookings, and Blackouts sections.

#### Scenario: Sidebar appears with all items
- **WHEN** the owner navigates to any `/owner/*` page
- **THEN** the sidebar SHALL be visible on the left side of the page
- **AND** the sidebar SHALL contain four navigation items: Dashboard, Event Types, Bookings, Blackouts
- **AND** each item SHALL have an icon and a label

### Requirement: Sidebar highlights active section
The sidebar SHALL visually indicate which section is currently active using an orange left border and background color.

#### Scenario: Active item styling
- **WHEN** the owner is on `/owner/event-types`
- **THEN** the "Event Types" sidebar item SHALL have `borderLeft: 3px solid #F97316` and `backgroundColor: #FFF7ED`
- **AND** other items SHALL NOT have the active styling

### Requirement: Sidebar items navigate on click
Clicking a sidebar item SHALL navigate to the corresponding section.

#### Scenario: Clicking sidebar items
- **WHEN** the owner clicks "Bookings" in the sidebar
- **THEN** the browser SHALL navigate to `/owner/bookings`
- **WHEN** the owner clicks "Blackouts" in the sidebar
- **THEN** the browser SHALL navigate to `/owner/blackouts`
- **WHEN** the owner clicks "Dashboard" in the sidebar
- **THEN** the browser SHALL navigate to `/owner`

### Requirement: Sidebar styling matches guest design tokens
The sidebar SHALL use guest space design tokens for colors, borders, and typography.

#### Scenario: Sidebar visual style
- **WHEN** the sidebar is rendered
- **THEN** it SHALL have `width: 220px`, `backgroundColor: #FFFFFF`, and `borderRight: 1px solid #E5E7EB`
- **AND** inactive items SHALL use text color `#6B7280`
- **AND** inactive items on hover SHALL use text color `#111827`
