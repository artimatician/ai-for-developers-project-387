# Guest Flow Redesign — Implementation Plan

## Route Structure

| Route | Screen | Page File |
|-------|--------|-----------|
| `/` | Landing page (hero + functional booking mockup) | `app/page.tsx` |
| `/book` | Event type selection (profile + cards) | `app/book/page.tsx` |
| `/book/[id]` | Scheduling page (3-card layout) | `app/book/[id]/page.tsx` |
| `/bookings/confirm` | Booking confirmation | `app/bookings/confirm/page.tsx` |
| `/event-types/:id` | **Permanent redirect →** `/book/:id` | `next.config.ts redirects[]` |
| `/owner/*` | Owner dashboard (unchanged) | — |

## Assumptions

1. **Duration is hardcoded "30 min"** — API `PublicEventType` lacks a duration field; the spec mandates 30-min fixed slots. All cards show "30 min".
2. **Owner name/avatar is hardcoded** — "Tota" with "T" initial, no API endpoint for owner profile.
3. **BookingForm opens in a Modal** after clicking "Continue" on the scheduling page (cleaner than inline expansion).
4. **No footer** on any page — design schemas omit it.
5. **Owner pages untouched** — only guest-facing pages change.
6. **Mantine kept** — styling via inline `style` objects + Mantine components + injected `<style>` for CalendarGrid.
7. **No Tailwind** — keep the current styling approach.

## Dependencies Between Phases

```
Phase 1 (Foundation)       — no deps
  ↓
Phase 2 (Navbar)           — depends on Phase 1
  ├──→ Phase 3 (Landing)   — depends on Phase 1+2
  ├──→ Phase 4 (Book page) — depends on Phase 1+2
  └──→ Phase 5 (Scheduling) — depends on Phase 1+2
                               + CalendarGrid & TimeSlotList restyle
Phase 6 (Confirmation restyle) — independent (any time)
Phase 7 (Cleanup/redirect)     — depends on all above
Phase 8 (Verification)         — depends on all above
```

Phases 3–6 can run in any order once 1+2 are done.

---

## Phase 1 — Foundation

### 1.1 Install Inter font

```sh
cd frontend && npm install @fontsource/inter
```

### 1.2 Update `app/layout.tsx`

Import Inter CSS files:
```ts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
```

### 1.3 Update Mantine theme (`MantineProviderWrapper.tsx`)

Replace the entire `createTheme` call with:

```ts
const theme = createTheme({
  primaryColor: 'dark',
  defaultRadius: 'md',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },
  colors: {
    dark: [
      '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E',
      '#757575', '#616161', '#424242', '#212121',
      '#111827', '#0A0A0A',
    ],
    peach: [
      '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74',
      '#FB923C', '#F97316', '#EA580C', '#C2410C',
      '#9A3412', '#7C2D12',
    ],
    green: [
      '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC',
      '#4ADE80', '#22C55E', '#16A34A', '#15803D',
      '#166534', '#14532D',
    ],
  },
  radius: {
    xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '14px',
  },
});
```

Keep the existing Mantine CSS imports and `<Notifications />` component.

### 1.4 Update `globals.css`

```css
* { box-sizing: border-box; padding: 0; margin: 0; }
a { color: inherit; text-decoration: none; }

body {
  background-color: #FFFFFF;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #111827;
}
```

### 1.5 CSS variable reference (not in code, just for authoring)

| Token | Value | Usage |
|-------|-------|-------|
| `--page-bg` | `#FFFFFF` | Landing page |
| `--page-bg-alt` | `#F8FAFC` | Booking pages |
| `--text-primary` | `#111827` | Headings, body text |
| `--text-secondary` | `#6B7280` | Muted text, descriptions |
| `--surface` | `#FFFFFF` | Card backgrounds |
| `--border` | `#E5E7EB` | Borders, dividers |
| `--border-light` | `#E5E7EB` | Light borders |
| `--peach` | `#F97316` | Primary CTA (screen 3) |
| `--peach-bg` | `#FFF7ED` | Peach tint bg (calendar selection, info panels) |
| `--peach-border` | `#FDBA74` | Peach border (selected states) |
| `--peach-text` | `#C2410C` | Text on peach bg |
| `--radius-sm` | `8px` | Buttons |
| `--radius-md` | `12px` | Cards |
| `--radius-lg` | `14px` | Event type cards |
| `--radius-xl` | `16px` | Hero mockup, profile card |
| `--shadow-soft` | `0 1px 2px rgba(16,24,40,0.04)` | Card shadow |

---

## Phase 2 — Navbar Component

### 2.1 File: `components/Navbar.tsx`

**Props:**
```ts
interface NavbarProps {
  variant: 'landing' | 'inner';
}
```

**Landing variant** (64px):
- Container max-width 1200px, centered, horizontal padding 24px
- Left: `IconCalendar` (18px) + "Calendar" (14px semibold #111827)
- Right: "Log in" link (14px medium #6B7280, href `/owner/event-types`) + `Button` near-black bg white text r=8px "Book a call" (href `/book`)

**Inner variant** (56px):
- Container max-width 1120px, centered, horizontal padding 24px
- Left: `IconCalendar` + "Calendar"
- Right: "Book" link (href `/book`) + owner link (href `/owner/event-types`), both 13–14px medium #6B7280

**Implementation:** Use `Group`, `Button`, `Text`, `Anchor` from Mantine. Border-bottom `1px solid #E5E7EB`.

---

## Phase 3 — Landing Page (`/`)

### 3.1 File: `components/HeroSection.tsx`

**Props:** none

**Layout:** Two-column grid `7fr 5fr`, max-width 1200px, centered, padding 96px 24px.

**Left column:**
1. **Eyebrow badge:** `Paper` with bg `#F3F4F6`, px=12, py=4, r=999px, inline-flex. `IconSparkles` (12px) + "Scheduling made simple" (12–13px medium #6B7280)
2. **H1:** "The better way to schedule meetings" (56–64px fw 600 #111827 letter-spacing -0.02em)
3. **P:** "Book meetings without the back-and-forth. Share your availability and let others pick a time that works." (16px #6B7280 max-width 480px)
4. **CTA row:** `Group` gap 12px
   - Primary: `Button` near-black bg white text r=8px "Start booking →" (href `/book`)
   - Secondary: `Button` white bg border #E5E7EB #111827 text r=8px "Learn more" (href `#`)
5. **Trust row:** 3 items, each `IconCheck` (16px #16A34A) + text (14px #6B7280). Items: "No sign-up required", "Instant confirmation", "Free to use"

**Right column:** `<BookingMockup />`

**Mobile (breakpoint < 768px):** Stack columns vertically, left column first. Reduce heading to 40px.

### 3.2 File: `components/BookingMockup.tsx`

**Props:** none (self-contained, fetches own data)

**State:** `eventTypes`, `eventType`, `slots`, `loading`, `error`, `selectedDate`

**Behavior:**
1. On mount: `listActiveEventTypes()` → pick first → `getActiveEventType(id)` + `getSlots(id)`
2. Auto-select first available date from slots
3. Render a white card (r=16px, border, shadow, padding 24px) containing:
   - Month/year header + nav arrows (compact)
   - 7-col weekday strip (Su Mo Tu We Th Fr Sa)
   - Date grid (32x32 cells, available dates clickable, peach highlight when selected)
   - Below: 3–4 available time slot pills
4. Clicking a slot redirects to `/book/[id]?date=YYYY-MM-DD&time=HH:mm` via `router.push()`
5. **Loading:** skeleton card (gray rectangle matching dimensions)
6. **Empty (no event types):** show the card with centered "No event types available yet"
7. **Error:** show card with muted error message (hero text/CTAs still visible)

### 3.3 Update: `app/page.tsx`

Replace entire file content:
```tsx
'use client';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';

export default function HomePage() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar variant="landing" />
      <HeroSection />
    </div>
  );
}
```

No loading/error states needed (client-side, BookingMockup handles its own).

---

## Phase 4 — Event Type Selection (`/book`)

### 4.1 File: `components/ProfileIntroCard.tsx`

**Props:** none (hardcoded)
**Structure:** White card, r=16px, border, shadow, padding 28px, vertical gap 24px, max-width 820px.
- **Profile row:** flex row, gap 14px, align center. Left: 40px circle (#F3F4F6), text "T" (16px semibold #4B5563). Right: "Tota" (16px semibold #111827) + "Schedule a meeting" (13px #6B7280).
- **Heading:** "Choose an event type" (28px fw 700 #111827)
- **Description:** "Select a meeting type to open the booking page." (14px #6B7280 max-width 560px)

### 4.2 File: `components/EventTypeCard.tsx`

**Props:**
```ts
interface EventTypeCardProps {
  eventType: { id: string; name: string; description: string; timezone: string };
}
```

**Structure:** White card, r=14px, border, shadow, padding 20px, vertical gap 10px.
- Header row (flex, justify-between): title (16px semibold #111827) + duration pill ("30 min", bg #F3F4F6, #4B5563 text, 12px medium, px=10 py=6, r=999px)
- Description (14px #6B7280, relaxed line-height)
- Hover: border becomes `#D1D5DB`, shadow increases slightly
- Click: `router.push(\`/book/${id}\`)`

### 4.3 File: `app/book/page.tsx`

```tsx
'use client';
import { useEffect, useState } from 'react';
import { Container, SimpleGrid, Text } from '@mantine/core';
import { Navbar } from '@/components/Navbar';
import { ProfileIntroCard } from '@/components/ProfileIntroCard';
import { EventTypeCard } from '@/components/EventTypeCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { listActiveEventTypes } from '@/lib/api';
import type { components } from '@/lib/api-types';

type PublicEventType = components['schemas']['PublicEventType'];

export default function BookPage() {
  const [eventTypes, setEventTypes] = useState<PublicEventType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true); setError(null);
    listActiveEventTypes()
      .then(setEventTypes)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const content = () => {
    if (loading) return <div style={{ height: 400, backgroundColor: '#E5E5E5', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />;
    if (error) return <ErrorAlert message={error} onRetry={fetchData} />;
    if (eventTypes.length === 0) return <Text ta="center" c="#6B7280" py="xl">No event types available yet.</Text>;
    return (
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
        {eventTypes.map(et => <EventTypeCard key={et.id} eventType={et} />)}
      </SimpleGrid>
    );
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar variant="inner" />
      <Container size={820} py={48}>
        <ProfileIntroCard />
        <div style={{ marginTop: 24 }}>{content()}</div>
      </Container>
    </div>
  );
}
```

### 4.4 File: `app/book/loading.tsx`

Skeleton matching the page: placeholder for profile card (height 200px, gray bg, r=16px) + two placeholder cards (height 120px, gray bg, r=14px).

### 4.5 File: `app/book/error.tsx`

Default error boundary with "Something went wrong" + retry, matching `#F8FAFC` background.

---

## Phase 5 — Scheduling Page (`/book/[id]`)

### 5.1 File: `components/MeetingSummary.tsx`

**Props:**
```ts
interface MeetingSummaryProps {
  eventType: { id: string; name: string; description: string; timezone: string };
  selectedDate: string | null;   // YYYY-MM-DD
  selectedSlot: string | null;   // ISO 8601 UTC
  timezone: string;
}
```

**Structure:** White card, r=14px, border, shadow, padding 24px, full height. Vertical gap 20px.
- **Host row:** 40px circle "T" + "Tota" (14px semibold) + role (12px #6B7280)
- **Title row:** event type name (18px semibold) + "30 min" pill
- **Description:** 14px #6B7280
- **Date panel:** bg `#F0F4FF`, border `1px solid #DDE6F5`, r=8px, padding 12px 16px. Label "Date" (12px #6B7280). Value: `dayjs.tz(selectedDate, timezone).format('dddd, MMMM D, YYYY')` or "Select a date" (#9CA3AF).
- **Time panel:** same styling. Label "Time". Value: `"h:mm A – h:mm A"` (from slot start/end) or "No time selected" (#9CA3AF).

### 5.2 Restyle: `CalendarGrid.tsx`

**No JS logic changes** — only update the injected `calendarGridStyles` CSS string:

```css
.cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cal-nav-btn {
  background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 6px;
  width: 28px; height: 28px; cursor: pointer; font-size: 13px;
  color: #111827; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.cal-nav-btn:hover { background: #F9FAFB; }
.cal-month-label { font-size: 14px; font-weight: 600; color: #111827; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px; }
.cal-weekday {
  text-align: center; font-size: 11px; color: #6B7280; font-weight: 500;
  height: 28px; display: flex; align-items: center; justify-content: center;
}
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.cal-cell {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; border-radius: 8px; cursor: default; transition: background 0.15s;
  border: 1px solid transparent;
}
.cal-outside { color: #D1D5DB; }
.cal-past { color: #9CA3AF; }
.cal-outside-window { color: #9CA3AF; }
.cal-available { color: #111827; cursor: pointer; }
.cal-available:hover { background: #F3F4F6; }
.cal-unavailable { color: #9CA3AF; }
.cal-selected { background: #FFF7ED !important; border-color: #FDBA74 !important; color: #C2410C !important; font-weight: 600; }
```

### 5.3 Restyle: `TimeSlotList.tsx`

**Props update:**
```ts
interface TimeSlotListProps {
  eventTypeId: string;
  eventTypeName: string;
  timezone: string;
  selectedDate: string | null;
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSlotSelect: (startTime: string) => void;
  onBack: () => void;
  onContinue: () => void;
}
```

**Structure:**
Container: flex column, height 100%.
- Title: "Available times" (16px fw 600) or date label in timezone
- Slot list: vertical gap 8px, flex 1, overflow-y auto
- Each slot item: row (flex, justify-between, align-center), padding 10px 14px, border 1px #E5E7EB, r=8px, cursor pointer (if available), hover bg #F9FAFB. Left: time range "9:00 – 9:30 AM" (14px #111827). Right: "Free" (12px #16A34A) or "Busy" (12px #9CA3AF, if `!available`). Selected: bg #FFF7ED, border #FDBA74.
- Bottom action row: pinned to card base via `marginTop: 'auto'`, `Group justify="space-between"`. Back: `Button variant="outline"` → `/book`. Continue: `Button bg="#F97316"` white text, disabled when no slot selected. Both r=8px.

**Time range formatting:** `dayjs(slot.startTime).tz(timezone).format('h:mm A')` + " – " + `dayjs(slot.endTime).tz(timezone).format('h:mm A')`.

### 5.4 Restyle: `BookingForm.tsx`

**New props:**
```ts
interface BookingFormProps {
  eventTypeId: string;
  eventTypeName: string;
  startTime: string;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Structure:** Mantine `Modal`. centered, r=14px, padding 24px. Title "Confirm your booking".
Form: same `useForm` with `guestName` (required) + `notes` (optional, max 1000).
Submit: close modal → call `createBooking()` → on success: `onSuccess()` + navigate to `/bookings/confirm?startTime=...&endTime=...&eventTypeName=...`.
Error: same error handling (409 + retry).
Primary button: peach bg `#F97316`, white text.

### 5.5 File: `components/SchedulingPage.tsx`

**Props:**
```ts
interface SchedulingPageProps {
  eventType: EventType;
  slots: TimeSlot[];
}
```

**State:** `selectedDate`, `selectedSlot`, `bookingModalOpened`

**Logic:**
- `useEffect`: auto-select first available date from slots (same as current `SchedulingCard`)
- `handleDateSelect(date)`: set selectedDate, clear selectedSlot
- `handleSlotSelect(startTime)`: toggle selectedSlot
- `handleBookingSuccess()`: close modal, set selectedSlot = null

**Render:**
```tsx
<div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
  <Navbar variant="inner" />
  <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
    <div style={{ display: 'flex', gap: 20, flexDirection: 'row', alignItems: 'stretch' }}>
      <MeetingSummary ... style={{ flex: 1 }} />
      <CalendarGrid ... style={{ flex: '0 0 320px' }} />
      <TimeSlotList ... style={{ flex: 1, display: 'flex', flexDirection: 'column' }} />
    </div>
  </div>
  <BookingForm opened={bookingModalOpened} onClose={() => setBookingModalOpened(false)} ... />
</div>
```

**Responsive:** `@media (max-width: 900px) { flex-direction: column; }` using a `<style>` tag or inline `window.matchMedia`.

### 5.6 File: `app/book/[id]/page.tsx`

Same pattern as current `event-types/[id]/page.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActiveEventType, getSlots } from '@/lib/api';
import { SchedulingPage } from '@/components/SchedulingPage';
import { ErrorAlert } from '@/components/ErrorAlert';
import type { components } from '@/lib/api-types';

export default function BookEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // ... fetch + states
  // Read searchParams for optional ?date=YYYY-MM-DD pre-selection
  // Loading → skeleton (3 gray rectangles matching card layout)
  // Error → ErrorAlert
  // Success → <SchedulingPage eventType={eventType} slots={slots} />
}
```

### 5.7 File: `app/book/[id]/loading.tsx`

3 gray rectangles in a row (same gap/card dimensions as SchedulingPage).

### 5.8 File: `app/book/[id]/error.tsx`

Error boundary matching page background.

---

## Phase 6 — Confirmation Page

### 6.1 Update: `app/bookings/confirm/page.tsx`

- Wrap page in `#F8FAFC` background
- Update "Book another slot" link → `/book`
- Update check icon: `ThemeIcon color="green"` → uses new green palette (#16A34A)
- Update title styling to new tokens
- Keep all logic (search params, dayjs formatting) unchanged

---

## Phase 7 — Route Redirect & Cleanup

### 7.1 Update: `next.config.ts`

Add `redirects()` in addition to existing `rewrites`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4010/api/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/event-types/:id',
        destination: '/book/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### 7.2 Delete old files

- `frontend/src/components/SchedulingCard.tsx`
- `frontend/src/components/EventInfo.tsx`
- `frontend/src/components/EventTypeList.tsx`
- `frontend/src/app/event-types/` (entire directory)

### 7.3 Update internal links

- `app/bookings/confirm/page.tsx`: link `/` → `/book`
- Check any remaining files for `/event-types/` paths

### 7.4 Update `ErrorAlert.tsx`

Update styling to use new color tokens if needed (mostly inherits from Mantine theme now).

---

## Phase 8 — Verification

### 8.1 Build

```sh
cd frontend && npm run build
```
Must pass with zero errors.

### 8.2 Spec tests

```sh
cd spec && npm test
```
Must pass (no spec changes).

### 8.3 Flow test (manual with mock)

```sh
cd frontend && ./start-mock.sh
```
Verify:
1. `/` → landing renders, mockup loads first event type's calendar
2. `/book` → profile card + event type cards (2-column grid if >1 event type)
3. `/book/[id]` → 3-card layout, date/slot selection, Continue opens modal, submit → confirmation
4. `/event-types/[id]` → redirects to `/book/[id]`
5. Owner pages at `/owner/*` still work

---

## Edge Cases

| Case | Behavior |
|------|----------|
| 0 event types | Landing: hero renders, mockup shows "No event types". Book: profile card + "No event types available yet." |
| API error (landing) | Hero text/CTAs still render; mockup shows muted error inside card |
| API error (book page) | ErrorAlert with retry button |
| API error (scheduling) | ErrorAlert with retry button |
| Booking 409 conflict | Modal shows "This slot was just booked by someone else" + retry |
| `?date=YYYY-MM-DD` param | Pre-select that date in CalendarGrid; scroll to it if needed |
| Mobile (<768px) | Landing: hero columns stack. Book: 1-col grid. Scheduling: cards stack vertically |
| No available slots on date | TimeSlotList shows "No time slots available for this date." MeetingSummary time panel shows "No time selected" |
| Single event type | Landing loads it. Book shows 1 card in grid. All flows work. |
| Calendar month edge | Same behavior as current — prev/next month navigation with window restriction |

---

## File Manifest

| # | Action | File | Notes |
|---|--------|------|-------|
| 1 | INSTALL | `@fontsource/inter` | `npm install` |
| 2 | MODIFY | `app/layout.tsx` | Add font imports |
| 3 | MODIFY | `app/globals.css` | New body styles |
| 4 | MODIFY | `components/MantineProviderWrapper.tsx` | New theme object |
| 5 | CREATE | `components/Navbar.tsx` | Two variants |
| 6 | CREATE | `components/HeroSection.tsx` | Landing hero |
| 7 | CREATE | `components/BookingMockup.tsx` | Functional mockup |
| 8 | MODIFY | `app/page.tsx` | Landing page |
| 9 | CREATE | `components/ProfileIntroCard.tsx` | Owner intro |
| 10 | CREATE | `components/EventTypeCard.tsx` | Event type card |
| 11 | CREATE | `app/book/page.tsx` | Selection page |
| 12 | CREATE | `app/book/loading.tsx` | Skeleton |
| 13 | CREATE | `app/book/error.tsx` | Error boundary |
| 14 | CREATE | `components/MeetingSummary.tsx` | Card 1 |
| 15 | MODIFY | `components/CalendarGrid.tsx` | Restyle CSS |
| 16 | MODIFY | `components/TimeSlotList.tsx` | Restyle + Back/Continue |
| 17 | MODIFY | `components/BookingForm.tsx` | Convert to Modal |
| 18 | CREATE | `components/SchedulingPage.tsx` | 3-card layout + state |
| 19 | CREATE | `app/book/[id]/page.tsx` | Scheduling page |
| 20 | CREATE | `app/book/[id]/loading.tsx` | Skeleton |
| 21 | CREATE | `app/book/[id]/error.tsx` | Error boundary |
| 22 | MODIFY | `app/bookings/confirm/page.tsx` | Restyle + fix link |
| 23 | MODIFY | `next.config.ts` | Add redirects |
| 24 | DELETE | `components/SchedulingCard.tsx` | Replaced |
| 25 | DELETE | `components/EventInfo.tsx` | Replaced |
| 26 | DELETE | `components/EventTypeList.tsx` | Replaced |
| 27 | DELETE | `app/event-types/` | Redirect handles this |
| 28 | VERIFY | `npm run build` | Must pass |
| 29 | VERIFY | `cd spec && npm test` | Must pass |
