## Context

The backend is a Django 6.0 + Django REST Framework 3.15 application with SQLite `:memory:` database, serving a REST API on port 4010. No authentication, no session management — open prototype.

All 13 endpoints are implemented across two namespaces: guest (`/api/`) and owner (`/api/owner/`). The backend was built in a single pass guided by the `BACKEND_PLAN.md` document and `spec/` TypeSpec contract.

## Goals / Non-Goals

**Goals:**
- Capture all API behaviors as OpenSpec specs for future changeability
- Document architecture decisions that aren't externally visible (stack, models, services)
- Provide a foundation for future backend changes (new endpoints, modified behavior, data model changes)

**Non-Goals:**
- No code changes to the backend
- No changes to the TypeSpec spec
- No changes to the test suite

## Decisions

### D1: SQLite `:memory:` with `--noreload`
The database resets on every server restart. The `--noreload` flag is critical — without it, the Django reloader spawns a new process that loses the in-memory DB. This is acceptable for a prototype and makes setup trivial (no migration files, no schema management).

### D2: Auto-migration via `AppConfig.ready()`
Tables are created on startup via `call_command('migrate', '--run-syncdb')` in the `AppConfig.ready()` hook. No migration directory exists. This avoids a separate `manage.py migrate` step and works with the in-memory database.

### D3: URL routing — combined views per path
Since Django URL patterns don't dispatch by HTTP method, views that share a path (GET/POST on `/api/owner/event-types`, GET/POST on `/api/owner/blackouts`) are combined into single view functions that branch on `request.method`. This keeps the URL config clean and avoids duplicating path entries.

### D4: Combined views
- `event_types_owner` handles GET (list all) and POST (create)
- `event_type_detail_owner` handles GET (get by id) and PATCH (update)
- `blackouts_owner` handles GET (list) and POST (create)
- `event_types_public` handles GET only (list active)
- `event_type_detail_public` handles GET only (get active by id)
- `get_slots` handles GET only
- `create_booking` handles POST only
- `list_bookings` handles GET only
- `delete_blackout` handles DELETE only

### D5: Global conflict model
Booking and blackout conflicts are global — any booking or blackout blocks any slot, regardless of event type. This is enforced at the application level in `services.py`, not via DB constraints (SQLite :memory: has limited constraint support).

### D6: No hard DELETE on event types
Event types use soft-delete (`isActive` boolean). PATCH with `{ isActive: false }` hides the type from guest endpoints. Existing bookings remain valid. No DELETE endpoint exists.

### D7: Snapshots on booking
Bookings store `eventTypeName` as a snapshot at creation time. Renaming an event type does not retroactively update existing bookings.

### D8: On-the-fly slot computation
Slots are computed at request time — no stored slot entities. The algorithm iterates the 14-day window in the event type's timezone, generates 30-min contiguous blocks from 09:00-18:00, and checks each against existing bookings and blackouts. Past slots are marked unavailable.

### D9: Response format
All successful responses return direct JSON objects (no `data` wrapper). Errors use `{ code: string, message: string }`. The JSON renderer is configured as the default; the browsable API renderer is disabled.

### D10: DateTime serialization
All DateTime fields serialize as `2026-01-15T10:00:00Z` format. `USE_TZ=True` ensures timezone-aware datetimes throughout.

## Risks / Tradeoffs

- **[Durability] In-memory database** — Data is lost on every server restart. Fine for prototype, but any move to persistence requires migration files and a proper DB setup.
- **[Testing] Database resets** — The :memory: database resets per server process. With `--noreload`, this only happens on explicit restart. Test suites that run against a running server need to be aware of this.
- **[Constraint enforcement] Application-level conflicts** — Conflict checking is in Python code, not DB constraints. A bug in the overlap check could allow double-booking. SQLite :memory: has limited support for exclusion constraints.

## Open Questions

- Should UUID validation on path params return 404 or 400 for non-UUID strings? (Current: 404 via Django's `<uuid:id>` converter)
- Should the `notes` field on bookings be visible to owners only, or also in the guest response? (Current: excluded from GuestBookingResponse)
