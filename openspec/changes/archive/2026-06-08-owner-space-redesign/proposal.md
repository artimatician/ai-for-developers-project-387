## Why

The owner space (event types, bookings, blackouts management) is visually flat and lacks navigation structure. It has no Navbar, no way to switch between sections, and uses bare Mantine default styling — a stark contrast to the guest space which has a coherent visual identity with consistent navigation, card-based design, and shared design tokens. This makes the owner space harder to use and feel like a separate, unfinished app.

## What Changes

- **New `/owner` dashboard page** — landing page with at-a-glance summary cards (event types count, bookings count, blackouts count), each linking to its section
- **Owner sidebar** — persistent 4-item sidebar (Dashboard, Event Types, Bookings, Blackouts) with active-state highlighting using orange accent, matching guest space design language
- **Navbar integration** — Navbar variant="inner" added to all owner pages; "Owner" link target changed from `/owner/event-types` to `/owner`
- **Layout restructure** — replace bare Mantine `<Container>` with a full-page wrapper: Navbar + sidebar + content area, using guest space background color (`#F8FAFC`)
- **Visual polish** — apply guest space design tokens (border radius, border colors, shadows, orange accents) to owner tables, modals, buttons, loading states, and empty states
- **Page wrapper cleanup** — remove redundant `<Container>` and `<Title>` from individual section pages (event-types, bookings, blackouts); layout provides the structure
- **Loading/error state updates** — update all 3 loading.tsx and 3 error.tsx files to match new layout and visual tokens

## Capabilities

### New Capabilities

- `owner-dashboard`: at-a-glance summary page for the owner space with counts and quick links to each management section

### Modified Capabilities

- `owner-layout`: restructured to include Navbar and sidebar; adopts guest space visual identity
- `owner-sidebar`: persistent navigation between all owner sections with active-state highlighting

## Impact

- **Frontend files**: ~15 files created/modified across `frontend/src/components/`, `frontend/src/app/owner/`, and its subdirectories
- **Routing**: Navbar "Owner" link target changes; `/owner` becomes a real dashboard page (currently non-existent)
- **No backend changes** — all changes are frontend-only
- **No API changes** — owner API endpoints remain unchanged
