# Calendar (Schedule a Call)

Project structure: **TypeSpec API spec** (done), **Next.js frontend** (done), **Django backend** (not built yet).

## Commands

```sh
cd spec && npm install && npm test       # compile TypeSpec + run 32 validation checks
cd frontend && npm install && npm run dev  # start Next.js dev server (port 3000)
cd frontend && ./start-mock.sh            # full stack: mock API (4010) + Next.js (3000)
cd frontend && npm run build              # production build
cd frontend && npm run build:spec         # compile TypeSpec → OpenAPI YAML
cd frontend && npm run gen:types          # regenerate TypeScript types from OpenAPI spec
```

## Structure

- `spec/*.tsp` — TypeSpec API spec (entrypoint `main.tsp`, models, owner/guest ops)
- `frontend/` — Next.js 16 + Mantine 7 app
- `PLAN.md` — full design doc (data models, endpoints, business rules, slot algorithm)

## Key conventions

- Backend: Django + DRF REST API under `/api/` (not built yet)
- Frontend: Next.js 16 (App Router), Mantine 7, `@tabler/icons-react`, `dayjs` with timezone plugin
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

## Spec conventions

- TypeSpec `namespace` blocks (not `interface`), `@route` for path prefixing (no `@autoRoute`)
- `@doc` on every model + operation
- `Error` model marked `@error`; operations return union types for error responses
- Server-generated fields (`id`, `createdAt`, etc.) omitted from request models

## Validation

`npm test` in `spec/` compiles `.tsp` → OpenAPI YAML and asserts:
- 13 operations with exact `operationId` values (e.g. `Owner_listEventTypes`)
- 11 schemas, 5 path params, 3 POST endpoints
