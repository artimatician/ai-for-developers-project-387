# Schedule a Call — Frontend

Next.js frontend for the appointment scheduling service.

## Prerequisites

- Node.js >= 18
- npm

## Setup

```bash
npm install
```

## Running with Mock API

Starts both the mock API server (Stoplight Prism) and the Next.js dev server with a single command:

```bash
./start-mock.sh
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

The script:

1. Compiles the TypeSpec spec to OpenAPI YAML
2. Kills any stale processes on ports 3000/4010
3. Starts Prism mock API server on port 4010
4. Waits for the mock server to respond to health checks
5. Starts Next.js dev server on port 3000
6. Cleans up all servers on Ctrl+C

## Running Servers Separately

For more control, run each server in its own terminal:

```bash
# Terminal 1 — Mock API (compiles spec + starts Prism on port 4010)
npm run mock:api

# Terminal 2 — Next.js dev server (port 3000)
npm run dev
```

## Other Commands

```bash
npm run build:spec    # Compile TypeSpec → OpenAPI YAML
npm run gen:types     # Generate TypeScript types from OpenAPI spec
```

## Component Architecture

Guest-facing pages use a polished 3-column scheduling card layout:

| Component | Location | Purpose |
|-----------|----------|---------|
| `EventTypeList` | Homepage (`/`) | Grid of event type cards with name, description, timezone badge |
| `SchedulingCard` | `/event-types/[id]` | 3-column shell assembling the scheduling UI |
| `EventInfo` | SchedulingCard (col 1) | Host avatar, name, event title, duration/platform/timezone |
| `CalendarGrid` | SchedulingCard (col 2) | Custom month calendar with date availability detection |
| `TimeSlotList` | SchedulingCard (col 3) | Scrollable time slot list with inline booking form |
| `BookingForm` | Inside TimeSlotList | Guest name + notes form, creates booking on submit |

Owner pages (event types CRUD, bookings list, blackout management) remain unchanged under `/owner/`.

### Responsive Behavior

- **Desktop (≥768px):** 3 columns side by side (EventInfo | CalendarGrid | TimeSlotList)
- **Mobile (<768px):** Columns stack vertically, borders become horizontal dividers

## Environment

| File | Purpose |
|---|---|
| `.env.development` | Used by `next dev`. Points `NEXT_PUBLIC_API_URL` to `http://localhost:4010` (mock API) |
| `.env.local` | Create this to override for the real Django backend (`http://localhost:8000`) |
