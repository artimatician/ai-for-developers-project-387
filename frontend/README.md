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

The guest-facing UI uses a polished 3-column scheduling layout:

- **Homepage** (`/`): Landing page with `HeroSection` (hero heading + embedded how-it-works steps). Uses `Navbar` with `variant="landing"`. "Start booking" button navigates to `/book`.
- **How it works** (`/how-it-works`): Dedicated page explaining the 3-step booking process.
- **Event type selection** (`/book`): `ProfileIntroCard` at top + grid of `EventTypeCard` components. Clicking a card navigates to `/book/[id]`.
- **Scheduling page** (`/book/[id]`): `SchedulingPage` with three columns:
  - **MeetingSummary** — host avatar/name, event title, description, duration, selected date/time
  - **CalendarGrid** — custom month calendar with date availability coloring (14-day window)
  - **TimeSlotList** — scrollable time slots with Back/Continue buttons
- **Booking form** (`/book/[id]/confirm`): Shows event summary + `BookingForm` (guest name, notes). Submits via API, redirects to confirmation on success.
- **Booking confirmation** (`/bookings/confirm`): Post-booking summary with checkmark, event details, and "Book another slot" link.

### Component Structure

| Component | File | Purpose |
|---|---|---|
| `Navbar` | `src/components/Navbar.tsx` | Top nav bar (landing/inner variants) |
| `HeroSection` | `src/components/HeroSection.tsx` | Landing page hero + how-it-works steps |
| `EventTypeCard` | `src/components/EventTypeCard.tsx` | Clickable card for an event type |
| `ProfileIntroCard` | `src/components/ProfileIntroCard.tsx` | Host profile intro on `/book` |
| `MeetingSummary` | `src/components/MeetingSummary.tsx` | Left column: event metadata + selections |
| `SchedulingPage` | `src/components/SchedulingPage.tsx` | 3-column layout orchestrator |
| `CalendarGrid` | `src/components/CalendarGrid.tsx` | Center column: custom month calendar |
| `TimeSlotList` | `src/components/TimeSlotList.tsx` | Right column: time slot list + Back/Continue |
| `BookingForm` | `src/components/BookingForm.tsx` | Guest name/notes form with submit |
| `ErrorAlert` | `src/components/ErrorAlert.tsx` | Error display with optional retry |

### Design Tokens

| Token | Value | Usage |
|---|---|---|
| Landing background | `#FFFFFF` | Landing page / how-it-works |
| Page background | `#F8FAFC` | Inner pages (book, scheduling, etc.) |
| Surface | `#FFFFFF` | Card surface |
| Border | `#E5E7EB` | Card borders, thin separators |
| Text primary | `#111827` | Headings, labels, body text |
| Text secondary | `#6B7280` | Meta, muted text, descriptions |
| Accent orange | `#F97316` | Continue/Confirm buttons, selected highlights |
| Success green | `#16A34A` | Available slot indicator, confirmation checkmark |
| Radius | `14px` / `8px` | Cards / buttons, cells |
