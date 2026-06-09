# Schedule a Call

A simplified appointment scheduling service. The calendar owner publishes event types; guests browse, pick a time slot, and book — no account required.

## Quick Start

```bash
./start.sh
```

This starts both servers with a single command:
1. Django backend on port **4010**
2. Next.js frontend on port **3000**

Open [http://localhost:3000](http://localhost:3000) to use the app. Press `Ctrl+C` to stop both servers.

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `backend/` | Django REST API |
| `frontend/` | Next.js 16 + Mantine 7 web app |
| `spec/` | TypeSpec API specification |

## Running Servers Separately

```bash
# Terminal 1 — Backend
cd backend && bash run.sh

# Terminal 2 — Frontend
cd frontend && npm run dev
```

## Commands

### Root

| Command | Description |
|---------|-------------|
| `./start.sh` | Start backend + frontend (both ports) |

### Backend

| Command | Description |
|---------|-------------|
| `cd backend && bash run.sh` | Start Django API on port 4010 |
| `cd backend && python3 manage.py test` | Run 54 backend tests |

### Frontend

| Command | Description |
|---------|-------------|
| `cd frontend && npm run dev` | Start Next.js dev server on port 3000 |
| `cd frontend && npm run build` | Production build |
| `cd frontend && ./start-mock.sh` | Mock API (Prism) + Next.js |
| `cd frontend && npm run build:spec` | Compile TypeSpec → OpenAPI YAML |
| `cd frontend && npm run gen:types` | Regenerate TypeScript types |
| `cd spec && npm test` | Validate OpenAPI spec |

## Architecture

- The backend uses SQLite `:memory:` — data resets on every restart
- No auth, no registration, no guest cancellation
- 30-minute fixed slot duration, 09:00–18:00 operating hours (per-event-type timezone)
- Slot availability window: next 14 days starting from today
- Booking and blackout conflicts are global (across all event types)

## API Overview

| Method | Path | Role |
|--------|------|------|
| GET | `/api/event-types` | Guest — list active event types |
| GET | `/api/event-types/{id}` | Guest — get event type |
| GET | `/api/event-types/{id}/slots` | Guest — get available slots |
| POST | `/api/bookings` | Guest — create booking |
| GET/POST | `/api/owner/event-types` | Owner — list/create event types |
| GET/PATCH | `/api/owner/event-types/{id}` | Owner — get/update event type |
| GET | `/api/owner/bookings` | Owner — list bookings |
| GET/POST | `/api/owner/blackouts` | Owner — list/create blackouts |
| DELETE | `/api/owner/blackouts/{id}` | Owner — delete blackout |

### Hexlet tests and linter status:
[![Actions Status](https://github.com/artimatician/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/artimatician/ai-for-developers-project-386/actions)
