# Schedule a Call

A simplified appointment scheduling service. The calendar owner publishes event
types with custom durations; guests browse, pick a time slot, and book — no
account required.

## How it works

1. Owner creates event types (30-min default, 15-min granularity) and sets
   blackouts to block availability
2. Guests see open slots in the owner's timezone — no login needed
3. Booking is instant; conflicts are prevented globally across all event types

## Quick Start

```bash
make dev     # Django :4010 · Next.js :3000
```

## Production

```bash
make docker-prod                         # default port 8080
PORT=9090 make docker-prod               # custom port
```

Uses file-backed SQLite (`/data/db.sqlite3`) via `PRODUCTION_DB=true`.

## Commands

- `make dev` — Start dev servers
- `make test` — Spec validation → backend tests → E2E API tests
- `make docker-prod` — Build & run production Docker
- `make build` — Frontend production build
- `make gen-types` — Regenerate TS types from OpenAPI spec

## Project Structure

- `backend/` — Django REST API (SQLite: `:memory:` dev, file in prod)
- `frontend/` — Next.js 16 + Mantine 7
- `spec/` — TypeSpec → OpenAPI API specification
- `tests/` — 40 API tests (pytest) + 5 browser tests (Playwright)
- `openspec/` — Behavioral specs and change proposals

## Architecture

- 15-min slot granularity, 09:00–18:00 operating hours, 14-day window, per-TZ
- Global conflict model: bookings and blackouts block slots across event types
- Guest endpoints (`/api/event-types`, `/api/bookings`) and owner endpoints
  (`/api/owner/*`) — full spec in `spec/`
- Errors return `{ "code": "...", "message": "..." }`

## Demo

A live instance is deployed at:
[ai-for-developers-project-387-production-f957.up.railway.app](ai-for-developers-project-387-production-f957.up.railway.app)

---

### Hexlet tests and linter status:

[![Actions Status](https://github.com/artimatician/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/artimatician/ai-for-developers-project-386/actions)
