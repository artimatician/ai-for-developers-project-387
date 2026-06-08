## 1. Component Creation

- [x] 1.1 Create `OwnerSidebar` component with 4 navigation items (Dashboard, Event Types, Bookings, Blackouts) using `usePathname()` for active state detection
- [x] 1.2 Style sidebar to match guest design tokens: 220px width, white bg, right border, orange active state, icon + label per item

## 2. Layout Restructure

- [x] 2.1 Rewrite `owner/layout.tsx` — add Navbar (variant="inner"), bg wrapper (#F8FAFC, minHeight: 100vh), flex container with sidebar + content area
- [x] 2.2 Update Navbar "Owner" link target from `/owner/event-types` to `/owner`

## 3. Dashboard Page

- [x] 3.1 Create `owner/page.tsx` — fetch event types, bookings, blackouts in parallel via Promise.all
- [x] 3.2 Render 3 summary cards in a row, styled like EventTypeCard (white bg, border-radius 10, orange left border, shadow)
- [x] 3.3 Handle loading state with skeleton card placeholders
- [x] 3.4 Handle error state with ErrorAlert + retry
- [x] 3.5 Handle empty state (all zeros) with encouraging CTAs

## 4. Page Wrapper Cleanup

- [x] 4.1 Remove `<Container>` wrapper from `owner/event-types/page.tsx`, keep `<Title order={2}>Event Types</Title>` + client component
- [x] 4.2 Remove `<Container>` wrapper from `owner/bookings/page.tsx`
- [x] 4.3 Remove `<Container>` wrapper from `owner/blackouts/page.tsx`

## 5. Visual Polish — Client Components

- [x] 5.1 Update `OwnerEventTypesClient.tsx` — apply guest design tokens to table, modal, buttons, empty state
- [x] 5.2 Update `OwnerBookingsClient.tsx` — apply guest design tokens to table, filters, pagination, empty state
- [x] 5.3 Update `OwnerBlackoutsClient.tsx` — apply guest design tokens to table, modal, buttons, empty state

## 6. Loading & Error States

- [x] 6.1 Rewrite `owner/event-types/loading.tsx` — remove Container dependency, use skeleton pattern matching new layout
- [x] 6.2 Rewrite `owner/bookings/loading.tsx`
- [x] 6.3 Rewrite `owner/blackouts/loading.tsx`
- [x] 6.4 Remove Container from `owner/event-types/error.tsx`, `owner/bookings/error.tsx`, `owner/blackouts/error.tsx`

## 7. Verification

- [x] 7.1 Run `cd frontend && npm run build` to verify no compilation errors
- [x] 7.2 Visually confirm sidebar + Navbar render on all `/owner/*` pages
- [x] 7.3 Confirm all navigation links work (sidebar items, Navbar links, dashboard cards)

## 8. Tests

- [x] 8.1 Add browser test for dashboard page: navigate to `/owner`, verify 3 summary cards visible with correct counts
- [x] 8.2 Add browser test for sidebar navigation: click each sidebar item, verify URL updates and page content changes
- [x] 8.3 Verify existing `test_event_type_list_browser` still passes after layout changes
- [ ] 8.4 Run `python3 -m pytest tests/ -v -m browser --tb=short` to confirm all browser tests pass (requires Playwright browser)
