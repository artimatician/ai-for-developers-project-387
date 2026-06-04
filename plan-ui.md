# Frontend UI — Implementation Plan

## Design Decisions

### Architecture
| Area | Decision |
|------|----------|
| Framework | Next.js 14+ with App Router |
| Language | TypeScript |
| UI library | Mantine (v7) — core, hooks, dates, form, notifications |
| Date library | dayjs (bundled with Mantine dates) + timezone plugin |
| Data fetching | Server Components for reads (load.tsx streaming) |
| Mutations | Direct `fetch` from client components (`"use client"`) |
| API client context | Two env vars (`API_URL` server-side, `NEXT_PUBLIC_API_URL` browser) in single `lib/api.ts` module |
| Error handling | Custom `ApiError` class with `code`, `message`, `status` |
| Post-mutation refresh | `router.refresh()` |
| TypeScript types | Auto-generated from OpenAPI spec via `openapi-typescript` |
| Form validation | Client-side (Mantine `useForm`) + server error display |
| Mock API | Stoplight Prism CLI serving `spec/tsp-output/openapi.yaml` |

### UI Shell
| Area | Decision |
|------|----------|
| App structure | Single Next.js app, owner pages under `/owner/` |
| Owner layout | Mantine `AppShell` with persistent sidebar (icons + labels): Event Types, Bookings, Blackouts |
| Color scheme | Light mode only |
| Loading states | `loading.tsx` with Mantine `Skeleton` per route |
| Error states | `error.tsx` with `ErrorAlert` + retry per route |

### Guest Pages
| Area | Decision |
|------|----------|
| Homepage `/` | Table of active event types (name, description, timezone, "Book" link) |
| Event type page `/event-types/[id]` | Header bar with event type name + timezone, full-width slot picker below |
| Slot picker | Day-by-day tabs with availability dots; available slots are clickable, unavailable are disabled |
| Slot timezone | Display in event type's configured timezone |
| Booking flow | Click slot → inline form expands (guestName + notes) → on submit, create booking |
| Booking success | Redirect to `/bookings/confirm?startTime=...&endTime=...&eventTypeName=...` |
| Confirmation page | Centered success card with checkmark icon, booking details in event type's timezone, "Book another slot" link |

### Owner Pages
| Area | Decision |
|------|----------|
| Event types | Table with inline `isActive` toggle; create/edit via Mantine `Modal` |
| Timezone input | Searchable Mantine `Select` with IANA timezone list from `Intl.supportedValuesOf('timeZone')` |
| Bookings | Table with URL search params for filtering (eventTypeId, from, to) and pagination |
| Bookings timezone | Display in browser's local timezone |
| Blackouts | Table; create via `Modal` (start datetime + end datetime); delete with confirm dialog |
| Blackout timezone | Browser's local timezone, converted to UTC before sending |

---

## Directory Structure

```
frontend/
  src/
    app/
      layout.tsx                              — Root layout (MantineProvider + Notifications)
      page.tsx                                — Guest: list active event types (table)
      loading.tsx                             — Guest homepage skeleton
      error.tsx                               — Guest homepage error boundary
      event-types/
        [id]/
          page.tsx                            — Guest: event type page (slots + booking)
          loading.tsx
          error.tsx
      bookings/
        confirm/
          page.tsx                            — Guest: booking confirmation
      owner/
        layout.tsx                            — Owner sidebar layout (AppShell)
        event-types/
          page.tsx                            — Owner: manage event types
          loading.tsx
          error.tsx
        bookings/
          page.tsx                            — Owner: list/filter/bookings
          loading.tsx
          error.tsx
        blackouts/
          page.tsx                            — Owner: manage blackouts
          loading.tsx
          error.tsx
    components/
      SlotPicker.tsx                          — Slot grid with day tabs + availability dots
      BookingForm.tsx                         — Guest booking form (inline expand)
      ErrorAlert.tsx                          — Error display (code + message + retry)
    lib/
      api.ts                                  — Typed API client (all 13 endpoints)
      api-error.ts                            — ApiError class
      api-types.ts                            — Auto-generated TypeScript types from OpenAPI
    mocks/
      (empty — Prism handles mock data externally)
  .env.development                            — NEXT_PUBLIC_API_URL=http://localhost:4010, API_URL=http://localhost:4010
  .env.local                                  — NEXT_PUBLIC_API_URL=http://localhost:8000, API_URL=http://localhost:8000
  package.json
```

---

## Implementation Steps

### Step 1: Scaffold Next.js + Mantine
- `npx create-next-app@latest frontend --typescript --app --src-dir` (decline Tailwind)
- Install: `@mantine/core @mantine/hooks @mantine/dates @mantine/form @mantine/notifications dayjs dayjs-plugin-utc`
- Install dev: `@stoplight/prism-cli openapi-typescript`
- Set up `MantineProvider` + `ColorSchemeScript` (light) in `src/app/layout.tsx`
- Create `.env.development` with `NEXT_PUBLIC_API_URL=http://localhost:4010` and `API_URL=http://localhost:4010`
- Add scripts:
  - `build:spec: cd ../spec && npx tsp compile main.tsp`
  - `mock:api: npm run build:spec && prism mock ../spec/tsp-output/openapi.yaml --port 4010`
  - `gen:types: openapi-typescript ../spec/tsp-output/openapi.yaml -o src/lib/api-types.ts`

### Step 2: API Client + Types
- Run `build:spec` + `gen:types` to produce `api-types.ts`
- Create `src/lib/api-error.ts` — `ApiError` extends `Error` with `code`, `message`, `status`
- Create `src/lib/api.ts` — typed functions for all 13 operations:
  - Guest: `listActiveEventTypes`, `getActiveEventType`, `getSlots`, `createBooking`
  - Owner: `listEventTypes`, `createEventType`, `getEventType`, `updateEventType`, `listBookings`, `listBlackouts`, `createBlackout`, `deleteBlackout`
  - Detect server vs client context, use correct env var

### Step 3: Root Layout + Shared Components
- Finalize `src/app/layout.tsx` with `MantineProvider`, `Notifications`
- Create `src/components/ErrorAlert.tsx`
- Create `src/app/loading.tsx` + `src/app/error.tsx`

### Step 4: Guest Homepage `/`
- `src/app/page.tsx` — server component calling `listActiveEventTypes()`
- Table: Name, Description, Timezone, Action ("Book" link)
- loading.tsx + error.tsx

### Step 5: Event Type Page `/event-types/[id]`
- `src/app/event-types/[id]/page.tsx` — server component fetches event type + slots
- Header bar: name + timezone badge. Full-width slot picker below
- `src/components/SlotPicker.tsx` — client component:
  - Groups slots by day in event type timezone
  - Day pills with availability dots
  - Grid of 30-min slot buttons per day
  - Selecting a slot reveals BookingForm
- `src/components/BookingForm.tsx` — client component:
  - Mantine useForm: guestName (required) + notes (optional, maxLength 1000)
  - Inline expand via Mantine Collapse
  - On success: `router.push(/bookings/confirm?...)`
  - On 409: show error + `router.refresh()`
  - On other errors: show ApiError

### Step 6: Booking Confirmation `/bookings/confirm`
- `src/app/bookings/confirm/page.tsx` — reads `searchParams`
- Centered success card with details + "Book another slot" link

### Step 7: Owner Layout
- `src/app/owner/layout.tsx` — Mantine AppShell with Navbar
- Nav items: Event Types, Bookings, Blackouts + "Back to guest view"

### Step 8: Owner Event Types `/owner/event-types`
- Server component: `listEventTypes()`
- Table with isActive toggle + Edit button
- Create/edit modal with name, description, timezone (searchable select)
- Client component wrapper for interactive parts

### Step 9: Owner Bookings `/owner/bookings`
- Server component: `listBookings(searchParams)`
- Filter bar: event type select + date range picker
- Table: Event Type, Guest, Start/End Time (local timezone), Notes
- Pagination component
- Client component for filter controls and pagination

### Step 10: Owner Blackouts `/owner/blackouts`
- Server component: `listBlackouts()`
- Table: Start/End Time (local), Reason, Delete action
- Create modal: start datetime, end datetime (local timezone, converted to UTC)
- Delete with confirm dialog
- Client component for interactive parts

### Step 11: Polish & Edge Cases
- Empty states for all lists
- Mobile responsive check
- Consistent date/time display with dayjs timezone plugin
- Verify all maxLength=1000 constraints in forms
- Test against Prism mock server
- Update PLAN.md frontend section

---

## Dependency Graph

```
Step 1 (scaffold)
  └─ Step 2 (API client)
       └─ Step 3 (layout + shared components)
            ├─ Step 4 (guest homepage)
            │    └─ Step 5 (slot picker + booking)
            │         └─ Step 6 (confirmation page)
            └─ Step 7 (owner layout)
                 ├─ Step 8 (owner event types)
                 ├─ Step 9 (owner bookings)
                 └─ Step 10 (owner blackouts)
                      └─ Step 11 (polish)
```
