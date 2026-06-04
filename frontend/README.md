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

## Environment

| File | Purpose |
|---|---|
| `.env.development` | Used by `next dev`. Points `NEXT_PUBLIC_API_URL` to `http://localhost:4010` (mock API) |
| `.env.local` | Create this to override for the real Django backend (`http://localhost:8000`) |

## UI Overview

The guest-facing UI uses a polished 3-column scheduling card layout:

- **Homepage** (`/`): Grid of event type cards (`EventTypeList`). Clicking a card navigates to `/event-types/[id]`.
- **Scheduling page** (`/event-types/[id]`): `SchedulingCard` with three columns:
  - **EventInfo** — host avatar/name, event title, duration, platform, timezone
  - **CalendarGrid** — custom month calendar with date availability coloring
  - **TimeSlotList** — scrollable time slots with inline `BookingForm` on selection
- **Booking confirmation** (`/bookings/confirm`): post-booking summary.

### Component Structure

| Component | File | Purpose |
|---|---|---|
| `EventTypeList` | `src/components/EventTypeList.tsx` | Card grid of active event types |
| `SchedulingCard` | `src/components/SchedulingCard.tsx` | 3-column card shell |
| `EventInfo` | `src/components/EventInfo.tsx` | Left column: event metadata |
| `CalendarGrid` | `src/components/CalendarGrid.tsx` | Center column: month calendar |
| `TimeSlotList` | `src/components/TimeSlotList.tsx` | Right column: slots + booking |
| `BookingForm` | `src/components/BookingForm.tsx` | Guest name/notes form |

### Design Tokens

| Token | Value | Usage |
|---|---|---|
| Background | `#F7F7F8` | Page background |
| Surface | `#FFFFFF` | Card surface |
| Border | `#E5E5E5` | Thin separators |
| Text primary | `#1A1A1A` | Headings, selected states |
| Text secondary | `#8C8C8C` | Meta, labels, muted text |
| Accent | `#16A34A` (green.6) | Available dots, active states |
| Radius (md) | `8px` | Buttons, cards, cells |
