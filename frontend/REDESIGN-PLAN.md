# Frontend Redesign: 3-Column Scheduling Calendar UI

## Overview

Redesign the guest-facing pages from a plain table/pill UI to a polished 3-column scheduling card. The homepage shows event type cards; selecting one navigates to `/event-types/[id]` which renders a `SchedulingCard` (EventInfo | CalendarGrid | TimeSlotList). After booking, redirect to `/bookings/confirm` unchanged.

## Hardcoded Placeholders

- **Host name**: "Alex Morgan"
- **Avatar**: Initials circle "AM" (styled div, no image)
- **Platform**: "Google Meet" with icon (decorative, no link)

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#F7F7F8` | Page background |
| Surface | `#FFFFFF` | Card surface |
| Border | `#E5E5E5` | Thin separators |
| Text primary | `#1A1A1A` | Headings, selected states |
| Text secondary | `#8C8C8C` | Meta, labels, muted text |
| Accent | `#16A34A` (green.6) | Available dots, active states |
| Radius (md) | `8px` | Buttons, cards, cells |
| Shadow | none or `0 1px 2px rgba(0,0,0,0.04)` | Subtle card shadow only |
| Font | `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif` | System font stack |

## Visual Structure

```
┌─────────────────────────────────────────────────────┐
│                     Page (gray bg)                   │
│   ┌─────────────────────────────────────────────┐   │
│   │  Card (white, rounded, centered, max ~960px) │   │
│   │                                             │   │
│   │ ┌───────────┬──────────┬──────────────────┐ │   │
│   │ │  Event    │ Calendar  │   Time Slots    │ │   │
│   │ │  Info     │  Grid     │                  │ │   │
│   │ │           │           │  Thu, Jun 5      │ │   │
│   │ │  [AM]     │ ◀ Jun  ▶ │                  │ │   │
│   │ │ Alex      │ Su..Sa    │  🟢 9:00 AM     │ │   │
│   │ │ Morgan    │ 1  2  3   │  🟢 9:30 AM     │ │   │
│   │ │           │ 4 [5] 6   │  🟢 10:00 AM    │ │   │
│   │ │ 30 Min    │ 7  8  9   │  ── 10:30 AM    │ │   │
│   │ │ Meeting   │ ...       │  🟢 11:00 AM    │ │   │
│   │ │           │           │  ...             │ │   │
│   │ │ 🕐 30 min │           │                  │ │   │
│   │ │ 📹 Google │           │  [BookingForm   │ │   │
│   │ │ Meet      │           │   expands here]  │ │   │
│   │ │ 🌐 UTC    │           │                  │ │   │
│   │ └───────────┴──────────┴──────────────────┘ │   │
│   └─────────────────────────────────────────────┘   │
│                  brand mark (small)                   │
└─────────────────────────────────────────────────────┘
```

## Responsive Behavior

- **Desktop (≥768px)**: 3 columns side by side
- **Mobile (<768px)**: Columns stack vertically — EventInfo → CalendarGrid → TimeSlotList

## Files to Create

### 1. `src/components/CalendarGrid.tsx`

Custom month calendar grid (NOT using `@mantine/dates` Calendar — need full visual control).

**Props:**
```ts
interface CalendarGridProps {
  timezone: string;
  slots: TimeSlot[];
  selectedDate: string | null;       // YYYY-MM-DD in event type's timezone
  onDateSelect: (date: string) => void;
}
```

**Internal state:**
- `currentMonth` / `currentYear` — for month navigation

**Structure:**
- Header row: `<` button | "June 2026" label | `>` button
- Weekday labels row: Su Mo Tu We Th Fr Sa (muted gray, small, centered)
- 6×7 grid of date cells (Week starts Sunday)

**Cell states:**
- Outside current month: very faint text (`#D4D4D4`), not clickable
- In month but outside 14-day slot window: default gray text, not clickable
- In month, within slot window, has available slots: normal black text, clickable, cursor pointer
- In month, within slot window, all slots unavailable: gray text with red-ish tint, not clickable
- Selected date: `#1A1A1A` background, white text, rounded (`8px`)
- Hover on clickable cells: subtle bg change (`#F0F0F0`)

**Date availability computation:**
- Use `dayjs` with timezone plugin to group `TimeSlot[]` by date in `timezone`
- A date "has available slots" if any slot in that date has `available: true`
- The 14-day window: from today 00:00 UTC to day 13 at 23:59:59 UTC (per API spec)
- Dates outside this window should appear but not be highlighted as available

**Cell sizing:** 36-40px squares, gap 4px between cells, centered within the column.

### 2. `src/components/EventInfo.tsx`

Column 1 (leftmost). Contains:

**Props:**
```ts
interface EventInfoProps {
  eventType: EventType;
}
```

**Layout:** `Stack` with `gap="sm"`. Content from top to bottom:
1. **Avatar circle**: 48px diameter, `#F0F0F0` background, initials "AM" centered, font-weight 600, font-size 16px, `#5C5C5C` text color
2. **Host name**: "Alex Morgan" — font-size 14px, `#8C8C8C` (secondary text)
3. **Event title**: `eventType.name` — font-size 24px, font-weight 700, `#1A1A1A`
4. **Divider**: 1px, `#E5E5E5`
5. **Duration row**: `IconClock` (16px) + "30 min" — font-size 14px, `#5C5C5C`
6. **Platform row**: `IconVideo` (16px) + "Google Meet" — font-size 14px, `#5C5C5C` (decorative, no link)
7. **Timezone row**: `IconGlobe` (16px) + `eventType.timezone` — font-size 14px, `#5C5C5C`

Icons from `@tabler/icons-react`.

**Column width:** Fixed ~220-240px on desktop. Full width on mobile.

### 3. `src/components/TimeSlotList.tsx`

Column 3 (rightmost). Shows time slots for the selected date.

**Props:**
```ts
interface TimeSlotListProps {
  eventTypeId: string;
  eventTypeName: string;
  timezone: string;
  selectedDate: string | null;       // YYYY-MM-DD
  slots: TimeSlot[];
  selectedSlot: string | null;       // ISO 8601 startTime
  onSlotSelect: (startTime: string) => void;
  onBookingSuccess: () => void;
}
```

**Layout:**
- **Header**: Day label e.g. "Thursday, June 5" — font-size 16px, font-weight 600, `#1A1A1A`. If no date selected, show "Select a date" in muted text.
- **Slot list**: Vertical list, scrollable if overflow (max-height ~400px, `overflow-y: auto`), evenly spaced rows.
- **Each slot row**: Rounded button (`radius: md`), `8px` padding vertically, full width of the column.
  - Available slot: green dot (8px circle, `#16A34A`) on left + time label in 12h format ("9:00 AM") — outlined style (border `#E5E5E5`, bg white)
  - Unavailable slot: gray dot (`#D4D4D4`) + time label in gray text (`#8C8C8C`), disabled, slight opacity
  - Selected slot (clicked to book): filled `#1A1A1A` background, white text, no green dot
  - Hover on available: subtle border darkening (`#CCCCCC`)

**Time format**: 12-hour format (e.g., "9:00 AM", "2:30 PM") using `dayjs(slot.startTime).tz(timezone).format('h:mm A')`.

**BookingForm integration**: When `selectedSlot` is set, render `BookingForm` below the selected slot button (inside a `Collapse`). Pass `eventTypeId`, `eventTypeName`, `startTime={selectedSlot}`, `onSuccess={onBookingSuccess}`. `BookingForm` should NOT have its own `Paper` wrapper — it lives inside the column.

### 4. `src/components/SchedulingCard.tsx`

3-column card shell. Assembles `EventInfo`, `CalendarGrid`, `TimeSlotList`.

**Props:**
```ts
interface SchedulingCardProps {
  eventType: EventType;
  slots: TimeSlot[];
}
```

**Internal state:**
- `selectedDate: string | null` — YYYY-MM-DD in event type's timezone
- `selectedSlot: string | null` — ISO 8601 startTime

**Layout:**
- Outer wrapper: centered on page, `max-width: 960px`, `margin: 0 auto`, `padding: 40px 16px`
- Card: white background (`#FFFFFF`), `border-radius: 12px`, `border: 1px solid #E5E5E5`, `box-shadow: 0 1px 2px rgba(0,0,0,0.04)`, `overflow: hidden`
- Inner: flex row, `min-height: 480px`
  - Column 1 (EventInfo): width ~240px, `border-right: 1px solid #E5E5E5`, `padding: 24px`
  - Column 2 (CalendarGrid): width ~320px, `border-right: 1px solid #E5E5E5`, `padding: 24px`
  - Column 3 (TimeSlotList): `flex: 1`, `padding: 24px`, `overflow-y: auto`, `max-height: 560px`

**Mobile (<768px):** Use CSS `@media (max-width: 767px)` via Mantine's responsive styles or CSS module:
- Flex direction changes to column
- Remove column borders, add horizontal dividers between sections
- Each section takes full width

**Brand mark:** Below the card, centered, small text "Schedule a Call" in `#8C8C8C`, font-size 12px.

**Date selection flow:**
1. User clicks a date in `CalendarGrid` → `setSelectedDate(date)`, `setSelectedSlot(null)`
2. `TimeSlotList` filters slots for that date and shows them
3. User clicks a time slot → `setSelectedSlot(startTime)` → `BookingForm` expands inline
4. On booking success → `onBookingSuccess` → `router.push(/bookings/confirm?...)` (handled inside `BookingForm`)

### 5. `src/components/EventTypeList.tsx`

Replaces the current table on the homepage.

**Props:**
```ts
interface EventTypeListProps {
  eventTypes: PublicEventType[];
}
```

**Layout:** Grid of cards using Mantine `SimpleGrid` with `cols={3}` on desktop, `cols={1}` on mobile. Each card:
- `Paper` with `withBorder`, `radius="md"`, `padding="lg"`
- Event type name as `Title order={3}` — `#1A1A1A`
- Description truncated to 2 lines (CSS `line-clamp: 2`), `#5C5C5C`, font-size 14px
- Timezone badge: small `Badge` variant="light" color="gray" — positioned bottom-left
- "Book" action: `Button` variant="subtle" color="green" with `IconChevronRight` — positioned bottom-right
- Hover: subtle border color change or shadow (`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`)

On click, uses `router.push(`/event-types/${et.id}`)` to navigate.

**Empty state:** Centered text "No event types available yet." in `#8C8C8C`.

## Files to Modify

### 6. `src/components/MantineProviderWrapper.tsx`

Add custom Mantine theme using `createTheme`:

```ts
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'green',
  defaultRadius: 'md',
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  colors: {
    green: [
      '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac',
      '#4ade80', '#22c55e', '#16a34a', '#15803d',
      '#166534', '#14532d',
    ],
  },
});
```

Pass `theme={theme}` to `MantineProvider`.

### 7. `src/app/globals.css`

Add:
```css
body {
  background-color: #F7F7F8;
  min-height: 100vh;
}
```

### 8. `src/app/page.tsx`

Replace the current table implementation with `EventTypeList`. Keep the same data fetching pattern (`useEffect` + `useState` calling `listActiveEventTypes()`). Pass `eventTypes` to `EventTypeList`.

Remove imports for `Table`, `Badge`, `Anchor`. Import `EventTypeList` instead.

### 9. `src/app/event-types/[id]/page.tsx`

Replace the current layout (Title + Badge + SlotPicker) with `SchedulingCard`. Keep the same data fetching (`getActiveEventType(id)` + `getSlots(id)`). Pass `eventType` and `slots` to `SchedulingCard`.

Remove imports for `SlotPicker`, `Title`, `Badge`, `Group`. Import `SchedulingCard` instead.

### 10. `src/components/BookingForm.tsx`

Adapt for embedding inside `TimeSlotList`:
- Remove the `Paper` wrapper (the column IS the surface)
- Keep all form logic, validation, and error handling unchanged
- Change outer container from `<Paper withBorder p="md" mt="sm">` to just a `<Box mt="sm">` or `<div>` with appropriate padding
- Keep the `router.push` to `/bookings/confirm` on success
- Keep the 409 conflict error handling with `router.refresh()`

### 11. `src/app/loading.tsx`

Replace table skeleton with a card-shaped skeleton:
- Centered container, `maxWidth: 960px`
- Large `Skeleton` rectangle (height ~480px, radius `md`) to represent the scheduling card
- Below it, small `Skeleton` for the brand mark

## Files to Delete

### 12. `src/components/SlotPicker.tsx`

Fully replaced by `CalendarGrid` + `TimeSlotList`. Delete this file.

## Execution Order

1. Update `MantineProviderWrapper.tsx` with theme tokens
2. Update `globals.css` with page background
3. Create `CalendarGrid.tsx` (standalone, testable)
4. Create `EventInfo.tsx`
5. Create `TimeSlotList.tsx` (integrate with `BookingForm`)
6. Create `SchedulingCard.tsx` (assembles 3 columns)
7. Create `EventTypeList.tsx`
8. Modify `BookingForm.tsx` (remove Paper wrapper)
9. Update `event-types/[id]/page.tsx` to use `SchedulingCard`
10. Update `page.tsx` to use `EventTypeList`
11. Update `loading.tsx` skeleton
12. Delete `SlotPicker.tsx`
13. Run `npm run build` (or `npx next build`) to typecheck and verify

## Key Implementation Details

### CalendarGrid date logic

```ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Get the first day of the month to display
const firstOfMonth = dayjs.tz(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`, timezone);
// Get the day of week for the 1st (0=Sunday)
const startDayOfWeek = firstOfMonth.day();
// Total days in month
const daysInMonth = firstOfMonth.daysInMonth();
// Build 6×7 grid
// Previous month days to fill before the 1st
// Next month days to fill after the last day
```

### Available dates detection

```ts
// Group slots by date in event type timezone
const availableDates = new Set<string>();
const unavailableDates = new Set<string>();
for (const slot of slots) {
  const dateKey = dayjs(slot.startTime).tz(timezone).format('YYYY-MM-DD');
  if (slot.available) {
    availableDates.add(dateKey);
  } else {
    unavailableDates.add(dateKey);
  }
}
// A date is "has available slots" if it's in availableDates
// A date is "has only unavailable slots" if it's in unavailableDates but not in availableDates
```

### 14-day window boundary

Per the API spec, slots are only returned for a 14-day window starting from today 00:00 UTC. Dates outside this window in the calendar grid should not be highlighted as available.

### TimeSlotList scrolling

If there are many time slots (18 slots per day × 9 hours), the list should scroll. Set `max-height: 400px` or similar with `overflow-y: auto` on the slot container.

### Selecting the first available date by default

When the page loads with slots, auto-select the first date that has available slots to improve UX. This logic lives in `SchedulingCard`:

```ts
useEffect(() => {
  if (slots.length > 0 && !selectedDate) {
    const firstAvailable = slots.find(s => s.available);
    if (firstAvailable) {
      const dateKey = dayjs(firstAvailable.startTime).tz(timezone).format('YYYY-MM-DD');
      setSelectedDate(dateKey);
    }
  }
}, [slots]);
```