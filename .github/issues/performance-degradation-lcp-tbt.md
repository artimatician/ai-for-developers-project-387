# Performance Degradation: LCP and TBT exceed 10% threshold

## Summary

Lighthouse run on `2026-06-24T02:31:48.678Z` shows **two metrics degraded beyond the 10% threshold** compared to the baseline in `docs/performance-baseline.md`.

| Metric | Baseline | Current | Change | Threshold |
|--------|----------|---------|--------|-----------|
| LCP | 1.2s | 6.46s | **+438%** | 10% |
| TBT | 80ms | 89.5ms | **+12%** | 10% |
| CLS | 0.02 | 0 | improved | — |

---

## Likely Culprits

### 1. Mantine CSS bundle bloat (primary cause of LCP)

The landing page loads **195KB of CSS** in a single chunk (`14xpm8pggf08v.css`). This blocks rendering.

**Commit:** `832b9cd` ("Dark scheduling page redesign") and `7c5ed1c` ("Redesign owner space with sidebar...") expanded Mantine usage across scheduling, booking, and owner pages.

Import chain:
- `MantineProviderWrapper.tsx` statically imports `@mantine/core/styles.css`, `@mantine/notifications/styles.css`, `@mantine/dates/styles.css`
- These are loaded on every page, even when unused (e.g., landing page only needs Navbar + HeroSection)

### 2. Heavy JS execution blocking main thread

**Commit:** `5d43a75` ("Redesign /book page to Cal.com-style layout") introduced more client components on booking flow pages.

Main thread breakdown from Lighthouse:
- Script Evaluation: 1,424ms
- Style & Layout: 419ms
- Other: 1,025ms

TBT increased from 80ms → 89.5ms due to long tasks during JS parsing/execution.

### 3. No font preloading

Inter font files are loaded as link-preload but not preconnected:
```
http://localhost:8080/_next/static/media/inter-latin-400-normal.2qdljeg3s-lsl.woff2
http://localhost:8080/_next/static/media/inter-latin-600-normal.2dov6rjg62vru.woff2
http://localhost:8080/_next/static/media/inter-latin-500-normal.1d14jwmkqqa0f.woff2
```

---

## Recommendations

### High Priority

1. **Code-split Mantine CSS** — Replace static CSS imports in `MantineProviderWrapper` with dynamic imports or extract only used component styles. Consider switching to `@mantine/core` + `@mantine/hooks` without the full stylesheet for pages that don't need it.

2. **Load CSS asynchronously on landing page** — The `/` page uses `Navbar` and `HeroSection` which are plain inline-styled components. Avoid loading Mantine CSS on this page by creating a separate lightweight layout or conditionally wrapping only inner pages.

3. **Defer non-critical CSS** — The 195KB `14xpm8pggf08v.css` should be loaded with `media="print"` and swapped via JavaScript, or use Next.js `next/font` with `display: swap`.

### Medium Priority

4. **Tree-shake unused Mantine imports** — Ensure only used Mantine components are imported (e.g., `import { Group } from '@mantine/core'` vs `import { Group, Button, Text, Box } from '@mantine/core'`).

5. **Add `preconnect`** for Google Fonts or self-hosted font origins in `layout.tsx`:
   ```tsx
   <link rel="preconnect" href="http://localhost:8080" />
   ```

6. **Reduce JS bundle size** — Audit `bootup-time` breakdown: `3n7dm2ojtyzwn.js` (228KB) and `0mk1g55o6kl1e.js` (138KB) are loaded but could be code-split further.

### Low Priority

7. **Add `fetchpriority="high"` to LCP element** — The hero heading is the LCP element; ensure it renders above the fold without waiting for CSS.

---

## References

- Lighthouse report: `lighthouse-report.json` (fetchTime: 2026-06-24T02:31:48.678Z)
- Baseline: `docs/performance-baseline.md`
- Commits:
  - `832b9cd` — Dark scheduling page redesign
  - `5d43a75` — Redesign /book page to Cal.com-style layout
  - `7c5ed1c` — Redesign owner space with sidebar, dashboard, visual polish
  - `349110c` — Add Lighthouse CI workflow with OpenCode performance analysis