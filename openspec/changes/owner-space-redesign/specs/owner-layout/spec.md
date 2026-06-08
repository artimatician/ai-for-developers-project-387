## ADDED Requirements

### Requirement: Owner layout includes Navbar
The owner layout SHALL render the Navbar component with variant="inner" at the top of all `/owner/*` pages.

#### Scenario: Navbar appears on owner pages
- **WHEN** the owner navigates to any `/owner/*` page
- **THEN** the Navbar SHALL be visible at the top of the page with variant="inner"

### Requirement: Owner layout uses guest space background
The owner layout SHALL use `backgroundColor: '#F8FAFC'` and `minHeight: '100vh'`, matching the guest booking flow pages.

#### Scenario: Page background color
- **WHEN** the owner navigates to any `/owner/*` page
- **THEN** the page background SHALL be `#F8FAFC`
- **AND** the background SHALL fill the full viewport height

### Requirement: Owner layout provides content area
The owner layout SHALL render a flex container with the sidebar on the left and a scrollable content area on the right.

#### Scenario: Content area structure
- **WHEN** the owner navigates to any `/owner/*` page
- **THEN** the layout SHALL display the sidebar on the left and the page content on the right
- **AND** the content area SHALL have `padding: 48px 32px` and a max-width of 1120px

### Requirement: Owner pages removed from Container wrapping
Individual owner section pages SHALL NOT wrap their content in Mantine `<Container>` — the layout provides the structural wrapper.

#### Scenario: Page renders without Container
- **WHEN** the owner navigates to `/owner/event-types`, `/owner/bookings`, or `/owner/blackouts`
- **THEN** the page content SHALL render without an additional `<Container>` wrapper
- **AND** each page SHALL render its own `<Title order={2}>` for section heading

### Requirement: Navbar "Owner" link points to /owner
The Navbar "Owner" link SHALL navigate to `/owner` instead of `/owner/event-types`.

#### Scenario: Navbar link updated
- **WHEN** the owner clicks "Owner" in the Navbar
- **THEN** the browser SHALL navigate to `/owner`
