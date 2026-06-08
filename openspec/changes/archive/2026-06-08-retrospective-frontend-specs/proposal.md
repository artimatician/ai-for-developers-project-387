## Why

The frontend (Next.js 16 + Mantine 7) implements the complete guest booking flow and owner management interface, but these behaviors are not captured as living specs. The existing 3 owner specs (sidebar, layout, dashboard) only cover part of the owner space. This change adds specs for the entire guest booking experience and the remaining owner management pages.

## What Changes

- **New spec: `guest-booking-flow/`** — Full guest journey from landing page through booking confirmation
- **New spec: `owner-event-types/`** — Owner event type management page (CRUD table, create/edit modal, soft-delete toggle)
- **New spec: `owner-bookings/`** — Owner bookings list page (filterable table, pagination)
- **New spec: `owner-blackouts/`** — Owner blackouts management page (create/delete)
- **New `design.md`** — Frontend architecture decisions (component patterns, routing, state management)

## Capabilities

### New Capabilities

- `guest-booking-flow`: Complete guest-facing booking experience
- `owner-event-types`: Owner event type CRUD management UI
- `owner-bookings`: Owner bookings list with filtering and pagination
- `owner-blackouts`: Owner blackout period management UI

## Impact

- **No code changes** — all existing frontend remains unchanged
- **Main specs populated**: `openspec/specs/guest-booking-flow/`, `openspec/specs/owner-event-types/`, `openspec/specs/owner-bookings/`, `openspec/specs/owner-blackouts/`
