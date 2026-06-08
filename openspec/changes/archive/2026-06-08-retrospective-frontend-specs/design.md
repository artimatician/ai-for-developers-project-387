## Context

The frontend is a Next.js 16 application using the App Router, Mantine 7 component library, and `@tabler/icons-react`. It proxies `/api/*` requests to the Django backend via `next.config.ts`. The styling approach uses inline styles with design tokens rather than CSS-in-JS or Tailwind.

The guest flow starts at the landing page and guides the user through event type selection, date/time scheduling, booking confirmation, and a post-booking success page. The owner space provides management interfaces for event types, bookings, and blackouts, wrapped in a shared layout with sidebar navigation.

## Goals / Non-Goals

**Goals:**
- Capture all frontend page behaviors as OpenSpec specs
- Document component architecture and routing decisions
- Provide a foundation for future UI changes

**Non-Goals:**
- No code changes to the frontend
- No changes to component decomposition (the existing monolithic client components in the owner space remain as-is)
- No spec for visual identity/design tokens (those are implementation detail captured by scenario assertions)

## Decisions

### D1: App Router with page-based routing
Each route maps to a page file in `src/app/`. Dynamic routes use `[id]` segments. Owner pages use a shared `layout.tsx` that provides Navbar + sidebar + content area.

### D2: 3-column scheduling layout
The `/book/[id]` page uses a custom 3-column layout (MeetingSummary | CalendarGrid | TimeSlotList) that stacks vertically below 900px. This is implemented as the `SchedulingPage` orchestrator component — it manages `selectedDate`, `selectedSlot`, and `timeFormat` state.

### D3: Custom calendar (not Mantine Dates)
The calendar grid is a custom component for full visual control over available date highlighting, date selection states (outside window, past, available, unavailable, selected), and the 14-day window restriction. Mantine's `@mantine/dates` was not flexible enough for the required visual states.

### D4: Client-side state for slot selection
The scheduling flow uses React state (useState) rather than URL search params for slot and date selection. Only when the user clicks "Continue" are the selected slot and event type name serialized as query params to the confirm page. This keeps the scheduling interaction fast and avoids URL flickering.

### D5: Parallel data fetching on scheduling page
`/book/[id]` fetches `getActiveEventType(id)` and `getSlots(id)` in parallel via two separate `use` calls on Promises created in the component body. This avoids sequential waterfall requests.

### D6: Booking form handles 409 conflict
The `BookingForm` component catches `ApiError` with status 409 and displays a conflict message ("This slot was just booked by someone else") and calls `router.refresh()` to re-fetch slots. This is the only error recovery that triggers an automatic re-fetch.

### D7: Owner client components are monolithic
Each owner management page (`OwnerEventTypesClient`, `OwnerBookingsClient`, `OwnerBlackoutsClient`) is a single client component that handles display, form logic, data fetching, and mutation. These were intentionally not decomposed to keep the owner-space-redesign change focused on visual polish.

### D8: Navbar variants
The Navbar has 3 variants: `landing` (white bg, 64px, "Log in" + "Book a call" CTA), `inner` (white bg, 56px, "Book" + "Owner" links), and `dark` (dark bg, 56px, same links). This allows the landing page to have a distinct marketing-oriented header while the rest of the app uses a compact navigation bar.

### D9: URL-based filtering on owner bookings
The owner bookings page serializes filter state (eventTypeId, from, to, page) into URL search params rather than component state. This enables shareable URLs and preserves filter state on browser navigation, but triggers a re-fetch on every param change.

## Risks / Tradeoffs

- **[Maintainability] Owner client components** — The three `*Client.tsx` files mix display, form logic, and data mutation. Future changes will need to decompose these carefully.
- **[Performance] Re-fetch on filter change** — The owner bookings page re-fetches on every URL param change. With local API calls (~5-15ms) this is acceptable, but would be noticeable with a remote backend.
- **[Accessibility] Custom calendar** — The custom CalendarGrid needs manual keyboard navigation handling (Enter/Space for date selection, tabIndex management). Screen reader support relies on Mantine's existing ARIA patterns.

## Open Questions

- Should the scheduling page's column layout be responsive differently (e.g., sidebar becomes a top bar on mobile) rather than just stacking?
- Should the `ProfileIntroCard` be configurable (currently hardcoded to display "Tota")?
