# Calendar (Schedule a Call)

Project structure: **TypeSpec API spec** (done), **Next.js frontend** (done), **Django backend** (done).

## Commands

```sh
cd spec && npm install && npm test                    # compile TypeSpec + run 32 validation checks
cd backend && python3 manage.py test                  # run 54 backend tests
./start.sh                                            # start backend (4010) + frontend (3000)
cd frontend && npm run dev                            # start Next.js dev server only (port 3000)
cd frontend && npm run build                          # production build
cd frontend && npm run build:spec                     # compile TypeSpec → OpenAPI YAML
cd frontend && npm run gen:types                      # regenerate TypeScript types from OpenAPI spec
```

## Structure

- `spec/*.tsp` — TypeSpec API spec (entrypoint `main.tsp`, models, owner/guest ops)
- `backend/` — Django + DRF REST API (port 4010)
- `frontend/` — Next.js 16 + Mantine 7 app (port 3000)
- `PLAN.md` — full design doc (data models, endpoints, business rules, slot algorithm)
- `BACKEND_PLAN.md` — backend implementation plan

## Key conventions

- Backend: Django + DRF REST API under `/api/`, SQLite `:memory:` (resets on restart)
- Frontend: Next.js 16 (App Router), Mantine 7, `@tabler/icons-react`, `dayjs` with timezone plugin
- Frontend proxies `/api/*` to backend via `next.config.ts` rewrite
- All endpoints under `/api`, no version prefix
- Owner endpoints prefixed `/api/owner/`, guest endpoints `/api/`
- UUID v4 resource IDs, ISO 8601 UTC datetimes
- 30-min fixed slot duration, 09:00–18:00 operating hours (per-event-type timezone)
- No auth, no guest cancellation, no hard DELETE on event types (soft-delete via `isActive`)
- Generated build artifacts: `spec/tsp-output/` (gitignored), `frontend/.next/` (gitignored)

## Frontend conventions

- **Routes**: `/` (landing page with HeroSection), `/book` (event type selection grid), `/book/[id]` (scheduling page), `/book/[id]/confirm` (booking form), `/bookings/confirm` (post-booking confirmation), `/how-it-works`, `/owner/*` (owner pages)
- **Landing page** uses `Navbar` (variant `"landing"`) + `HeroSection` with embedded how-it-works steps
- **Scheduling page** (`/book/[id]`) uses a **3-column layout**: MeetingSummary | CalendarGrid | TimeSlotList
- Components live in `frontend/src/components/` — `Navbar`, `HeroSection`, `EventTypeCard`, `ProfileIntroCard`, `MeetingSummary`, `SchedulingPage`, `CalendarGrid`, `TimeSlotList`, `BookingForm`, `ErrorAlert`
- API client in `frontend/src/lib/api.ts`, types in `frontend/src/lib/api-types.ts` (auto-generated)
- Design tokens: landing bg `#FFFFFF`, page bg `#F8FAFC`, card surface `#FFFFFF`, border `#E5E7EB`, text primary `#111827`, text secondary `#6B7280`, accent orange `#F97316`, success green `#16A34A`
- Calendar is a custom component (NOT `@mantine/dates`) for full visual control
- Slots are computed on-the-fly by the API; frontend groups by date in event type's timezone
- Owner pages (`/owner/*`) — event types CRUD, bookings list, blackout management — unchanged

## Backend conventions

- **Stack**: Django 6.0 + DRF, SQLite `:memory:` (shared cache URI), port 4010
- **Models**: EventType, Booking, Blackout — all with UUID v4 PKs
- **Slot algorithm**: 14-day window starting from today in event type's timezone, 09:00–18:00 operating hours, 30-min slots
- **Conflict model**: Booking and blackout conflicts are global (across all event types)
- **Error format**: All errors return `{ "code": "...", "message": "..." }`
- **Error codes**: `INVALID_INPUT` (400), `EVENT_TYPE_NOT_FOUND` (404), `EVENT_TYPE_INACTIVE` (404), `BLACKOUT_NOT_FOUND` (404), `SLOT_UNAVAILABLE` (409)
- **Auto-migration**: Tables created on startup via `AppConfig.ready()`
- **No migrations directory**: Uses `--run-syncdb` instead of Django migrations
- **54 tests** across 5 test suites: health, event types, bookings, blackouts, slots

## Spec conventions

- TypeSpec `namespace` blocks (not `interface`), `@route` for path prefixing (no `@autoRoute`)
- `@doc` on every model + operation
- `Error` model marked `@error`; operations return union types for error responses
- Server-generated fields (`id`, `createdAt`, etc.) omitted from request models

## Validation

`npm test` in `spec/` compiles `.tsp` → OpenAPI YAML and asserts:
- 13 operations with exact `operationId` values (e.g. `Owner_listEventTypes`)
- 11 schemas, 5 path params, 3 POST endpoints
