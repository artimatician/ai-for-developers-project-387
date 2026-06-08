## Why

The backend API (Django REST Framework with SQLite :memory:) implements all 13 endpoints for booking management, but its behavioral contract is not captured as living specs. PLAN.md and BACKEND_PLAN.md served as temporary references — this change replaces them with permanent, changeable specs that describe the observable behavior of the API layer.

## What Changes

- **New spec: `event-types/`** — Event type lifecycle (CRUD, soft-delete, visibility rules, timezone validation)
- **New spec: `bookings/`** — Booking creation, conflict prevention, slot availability algorithm, owner listing with pagination
- **New spec: `blackouts/`** — Blackout CRUD, blocking behavior, conflict model
- **New `design.md`** — Architecture decisions from the backend implementation (stack, models, services, views, URL routing)

## Capabilities

### New Capabilities

- `event-types`: Full API contract for event type management (owner CRUD + guest read)
- `bookings`: Full API contract for booking creation, slot availability, and owner listing
- `blackouts`: Full API contract for blackout management

## Impact

- **No code changes** — all existing backend (54 tests passing) remains unchanged
- **Main specs populated**: `openspec/specs/event-types/`, `openspec/specs/bookings/`, `openspec/specs/blackouts/`
