## Performance Regression: LCP degraded by 444%

**Metrics:**
- LCP: 6.53s (baseline: 1.2s) — **+444% degradation**
- CLS: 0.001 (baseline: 0.02) — improved 93%
- TBT: 72ms (baseline: 80ms) — improved 10%

**Likely culprits from recent commits:**

1. **`832b9cd`** (Dark scheduling page redesign) — Added heavy CSS theming changes across `CalendarGrid`, `MeetingSummary`, `TimeSlotList`, `SchedulingPage`; 195KB CSS bundle loaded on landing page

2. **`7c5ed1c`** (Redesign owner space) — Added owner dashboard components (sidebar, summary cards) potentially increasing JS/CSS weight for all routes

3. **`5d43a75`** (Cal.com-style /book layout) — Added `ProfileIntroCard` with 64px avatar and additional layout components

4. **`349110c`** (Lighthouse CI workflow) — RSC prefetching for `/book` and `/owner/event-types` fetches visible in network timeline (~380ms+ after load); may be competing for bandwidth on initial load

**Top 3 recommendations:**

1. **Audit render-blocking CSS** — The `14xpm8pggf08v.css` chunk is 195KB. Implement code-splitting so landing page only loads critical CSS; defer owner/scheduling styles to their respective routes

2. **Preload LCP element font** — The H1 "Effortless meeting scheduling" is the LCP element. Add `<link rel="preload">` for Inter font variant used and ensure `font-display: swap` is active; currently fonts load ~65ms after page start

3. **Reduce RSC prefetch chain** — The network timeline shows 8+ sequential `_rsc` fetches starting at ~380ms. Consider deferring non-critical prefetches or using `fetchPriority` to avoid competing with LCP content