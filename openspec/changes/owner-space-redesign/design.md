## Context

The owner space currently consists of three standalone pages (`/owner/event-types`, `/owner/bookings`, `/owner/blackouts`) wrapped in a minimal layout with a Mantine `<Container>` and `<Title>`. There is no Navbar, no navigation between sections, and the visual styling uses Mantine defaults — contrasting sharply with the guest space's coherent design language (orange accent, card-based UI, consistent typography and spacing).

The owner space needs:
- A persistent navigation structure so users can move between sections without using browser back
- A dashboard landing page for at-a-glance overview
- Visual alignment with the guest space design tokens to feel like part of the same application

## Goals / Non-Goals

**Goals:**
- Add a persistent sidebar navigation on all `/owner/*` pages
- Create a dashboard page (`/owner`) with summary cards showing event types, bookings, and blackouts counts
- Integrate the existing Navbar (variant="inner") into the owner layout
- Apply guest space design tokens (colors, border-radius, shadows, spacing) to owner components
- Clean up redundant page wrappers — move structural concerns into the layout
- Update all loading and error states to match the new visual language

**Non-Goals:**
- No backend or API changes
- No decomposition of the monolithic `*Client.tsx` components (visual polish only)
- No changes to the guest space
- No changes to data models or business logic

## Decisions

### D1: Sidebar over tabs or nav-only
The sidebar is always visible on all `/owner/*` pages, providing persistent orientation and one-click navigation between all four sections (Dashboard, Event Types, Bookings, Blackouts). Tabs were considered but would compete with the Navbar; a sidebar clearly separates owner-internal navigation from the global site navigation in the Navbar. A nav-only approach (just Navbar with dropdown) was rejected because it buries section switching and offers no visual context.

### D2: Navbar variant "inner"
The `"inner"` variant is consistent with the guest booking flow pages (`/book`, `/book/[id]`). This visually connects the owner space to the guest space as part of the same application. The `"dark"` variant was considered but would introduce a third visual style with no precedent in the app.

### D3: Layout-level wrapper, not per-page
The owner layout handles the Navbar, background wrapper (`#F8FAFC`, full viewport), sidebar, and content area. Individual pages only render their title and section content. This mirrors how the guest pages work (each owns its own wrapper) at the layout level — DRY for the owner space since all pages share the same structure.

### D4: Dashboard fetches from 3 endpoints
The dashboard calls `listEventTypes()`, `listBookings()`, and `listBlackouts()` in parallel via `Promise.all`. This adds ~3 simultaneous requests on initial load — acceptable since these are local API calls. An alternative (dedicated dashboard endpoint) would add backend complexity for minimal gain.

### D5: Visual polish, not component decomposition
The three `*Client.tsx` files are updated visually (fonts, colors, borders, spacing to match design tokens) but not decomposed. Decomposition into smaller components is a separate concern and can be done later without changing behavior.

## Risks / Trade-offs

- **[Performance] Dashboard makes 3 API calls** → All calls are to the same local backend (~5-15ms each); impact is negligible
- **[Maintainability] Visual tokens duplicated in inline styles** — The guest space also uses inline styles rather than a CSS-in-JS solution. This is consistent but means tokens aren't centralized. Acceptable for now — the app is small.
- **[Scope creep] Monolithic Client components** — The `*Client.tsx` files mix display, form logic, and data mutation. Tempting to refactor, but this change focuses on visuals and navigation. Decomposition is a future concern.

## Open Questions

- Should the dashboard cards be clickable as whole cards, or use explicit CTA buttons? (Decision: both — card is clickable, plus a "View →" link for discoverability)
- Dashboard empty states — if all counts are zero, show a welcome message? (Decision: show zeros with encouraging CTAs like "Create your first event type →")
