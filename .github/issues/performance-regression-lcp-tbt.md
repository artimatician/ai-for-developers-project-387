## Performance Regression: LCP +448%, TBT +114%

**Date:** 2026-06-24

### Summary

Core Web Vitals on the landing page have regressed significantly since the baseline was established:

| Metric | Baseline | Current | Change |
|--------|----------|---------|--------|
| LCP | 1.2s | 6.58s | **+448%** |
| TBT | 80ms | 171ms | **+114%** |
| CLS | 0.02 | 0.001 | -95% (improved) |

### Likely Culprits

Recent commits that likely contributed:
- `349110c` - Lighthouse CI workflow (adds overhead but shouldn't affect production)
- `c371e99`, `3067cf8` - nginx retry logic changes
- Frontend package updates (`package.json` diff)

The primary performance killer is the **195KB synchronous CSS bundle** (Mantine component styles) loaded before first paint.

### Top 3 Recommendations

1. **Lazy-load Mantine CSS**: Use `next/dynamic` with `ssr: false` for Mantine components or split Mantine's CSS into critical/non-critical chunks. The 195KB `14xpm8pggf08v.css` is currently render-blocking.

2. **Preload critical fonts only**: The `@fontsource/inter` imports in `frontend/src/app/layout.tsx:2-5` load 4 font weights synchronously. Consider using `next/font` or preload only the 400/500 weights needed for above-the-fold content.

3. **Audit component hydration**: TBT at 171ms suggests main-thread blocking. Review `MantineProviderWrapper` hydration - consider deferring non-critical component hydration with `React.lazy` or skeleton loading states.

### Notes

- `lighthouse-report.json` is intentionally excluded from this PR per instructions
- CLS is excellent (0.001) - no layout shift issues
- See `docs/performance-baseline.md` for baseline values