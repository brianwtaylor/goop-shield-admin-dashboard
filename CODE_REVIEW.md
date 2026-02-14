# Shield Dashboard Code Review

## 1. Performance Findings

### Issues Identified and Fixed

**A. No Route-Level Code Splitting (Critical)**

`src/router.tsx` statically imported all 8 page components, forcing the browser to download and parse the entire application as a single 698 KB JavaScript bundle before rendering anything.

**Fix:** Converted all 8 page imports to `React.lazy()` with dynamic `import()` and wrapped each route's component in a `<Suspense>` boundary with a skeleton fallback. Each page is now a separate chunk loaded on demand.

**B. Monolithic D3 Bundle (High)**

Every chart component used `import * as d3 from 'd3'`, pulling the entire D3 library (~250 KB uncompressed) into the main bundle even though each component only uses a handful of functions. Tree-shaking cannot eliminate unused exports from `import *`.

**Fix:** Replaced `import * as d3` with targeted submodule imports:
- `d3-selection` for DOM manipulation
- `d3-scale` for scales
- `d3-shape` for line/area/arc/pie generators
- `d3-array` for min/max/sum/extent
- `d3-axis` for axes
- `d3-geo` for map projections (GeoMap only)
- `d3-interpolate` for color interpolation (Heatmap only)

**C. Eagerly Loaded World Atlas Topology (High)**

`GeoMap.tsx` imported `topojson-client` at the top level and fetched ~108 KB of topology JSON from a CDN on every load. This data is only needed on the Threat Intelligence page.

**Fix:** Converted both `topojson-client` and `world-atlas/countries-110m.json` to dynamic imports inside a `useEffect`. The topology data now loads as a separate chunk only when the Threat Intel page is visited, and is served from the local bundle (no external CDN dependency).

**D. No Vendor Chunk Splitting (Medium)**

Vite's default bundling produced a single 698 KB chunk. The browser cannot cache vendor libraries independently of application code.

**Fix:** Added `build.rollupOptions.output.manualChunks` to `vite.config.ts`:
- `vendor-router`: @tanstack/react-router (82 KB)
- `vendor-query`: @tanstack/react-query (44 KB)
- `vendor-motion`: framer-motion (124 KB)
- `vendor-d3`: D3 submodules (85 KB)

These vendor chunks are stable across deploys and will be cached by the browser.

**E. No React.memo on Chart Components (Medium)**

D3 chart components (Heatmap, AreaChart, DonutChart, Sparkline, GaugeChart, BetaCurve, GeoMap) re-rendered and cleared/rebuilt their entire SVG DOM whenever a parent re-rendered, even if props hadn't changed. This is expensive because `useD3` clears all SVG children and re-executes the D3 render function on every render.

**Fix:** Wrapped all 7 chart components with `React.memo()` to skip re-renders when props are referentially equal.

**F. Font Import (Low)**

Changed `@import '@fontsource/jetbrains-mono'` to `@import '@fontsource/jetbrains-mono/400.css'` for clarity. Both resolve to the same weight-400 CSS with `font-display: swap` already set, but the explicit path makes the intent clear and avoids any future fontsource packaging changes.

### Bundle Size Results

| Metric | Before | After |
|--------|--------|-------|
| JS chunks | 1 | 25+ |
| Largest chunk | 698 KB (220 KB gz) | 210 KB (67 KB gz) |
| Initial page load JS | ~698 KB | ~263 KB (core) + ~6 KB (page) |
| World atlas data | In main bundle | Lazy (108 KB, only on Threat Intel) |
| Vite chunk warning | Yes (>500 KB) | No |

The initial load for Command Center now requires ~269 KB of JS (gzipped: ~84 KB), down from 698 KB (gzipped: 220 KB) -- a **62% reduction** in initial bundle size.

## 2. Architecture Assessment

### Strengths

- **Clean separation of concerns:** API client (`src/api/`), hooks (`src/hooks/`), components, and pages are well-organized. Each hook wraps a single TanStack Query with appropriate polling intervals.
- **Type safety:** Zod schemas in `src/api/schemas.ts` define all API response types with runtime validation capability. TypeScript types are derived from schemas via `z.infer`.
- **Consistent design system:** `Card`, `Badge`, `Button`, `Skeleton` components provide uniform styling. Color constants in `lib/colors.ts` ensure visual consistency.
- **Good polling strategy:** Health (5s), defense stats (10s), audit events (15s), BroRL/drift/threat actors (30s), red team/supply chain (60s) -- appropriate intervals based on data volatility.
- **WebSocket integration:** Real-time event feed with automatic reconnection (5s backoff), bounded event buffer (200 max), clean context-based API.
- **Reusable chart hook:** `useD3` provides a clean SVG lifecycle pattern -- select, clear, render.

### Areas for Improvement

- **No runtime schema validation:** Zod schemas are defined but never called with `.parse()` or `.safeParse()`. API responses are cast directly via `.json<Type>()`. Consider validating at least in development mode.
- **API client singleton pattern:** `api` is a module-level mutable variable reassigned by `refreshApi()`. This works but is fragile -- consider using a factory function or React context instead.
- **WebSocket URL derivation:** `shieldUrl.replace(/^http/, 'ws')` in WebSocketContext reads directly from localStorage rather than using the AuthContext value, creating a potential sync issue.
- **No error boundaries:** If a page component throws during render, the entire app crashes. Each lazy-loaded page should ideally have an error boundary.

## 3. Remaining Recommendations

### Performance (Not Fixed)

- **Audit log table lacks pagination/virtualization:** Loading 200 rows into a DOM table is manageable but could become slow at higher limits. Consider `@tanstack/react-virtual` for windowed rendering if the limit increases.
- **Live event feed renders all 50 items with Framer Motion:** Each event gets `initial/animate` props. For a high-frequency feed, consider only animating the newest event and rendering the rest statically.
- **AnimatedNumber creates springs on every value change:** The Framer Motion spring animation triggers on every poll update (every 5-10s). This is acceptable for 4 stat cards but would not scale to many instances.
- **DefenseMatrix generates random sparkline data on every render:** `Math.random()` in the render body means sparklines change on each re-render. This should be memoized or seeded.

### Code Quality (Not Fixed)

- **Duplicated nav items:** `navItems` is defined in both `DashboardLayout.tsx` and `lib/constants.ts` (`NAV_ITEMS`). The layout should import from constants.
- **`CodeBlock` component is unused** -- no page imports it. Can be removed or kept for future use.
- **Audit log volume chart has a date bug:** `volumeData` creates `new Date()` for every bucket instead of using the actual bucket timestamp, making the x-axis meaningless.

## 4. Security Notes

- **API key stored in localStorage:** `shield_api_key` is stored in plain text in localStorage, accessible to any JavaScript running on the same origin. This is standard for SPAs but should be documented as a known trade-off. Consider sessionStorage for shorter-lived sessions.
- **No XSS concerns found:** All dynamic content is rendered through React's JSX (which auto-escapes), D3's `.text()` method (which escapes), or Tailwind classes. No use of `dangerouslySetInnerHTML` or direct DOM insertion of user content.
- **No CSRF concerns:** The dashboard is a read-heavy SPA. The only mutation (`POST /redteam/probe`) requires the API key header, which is not sent automatically by the browser.
- **External CDN dependency removed:** The original GeoMap fetched world topology from `cdn.jsdelivr.net`, which could be a supply chain risk and a privacy concern (leaking user IPs to a third party). This is now bundled locally.

## 5. Files Modified

| File | Change |
|------|--------|
| `src/router.tsx` | Added React.lazy() code splitting for all 8 pages |
| `src/index.css` | Explicit font-weight-400 import path |
| `vite.config.ts` | Added manualChunks for vendor splitting |
| `src/components/charts/useD3.ts` | Import d3-selection instead of d3 |
| `src/components/charts/Heatmap.tsx` | Targeted D3 imports + React.memo |
| `src/components/charts/AreaChart.tsx` | Targeted D3 imports + React.memo |
| `src/components/charts/DonutChart.tsx` | Targeted D3 imports + React.memo |
| `src/components/charts/Sparkline.tsx` | Targeted D3 imports + React.memo |
| `src/components/charts/GaugeChart.tsx` | Targeted D3 imports + React.memo |
| `src/components/charts/BetaCurve.tsx` | Targeted D3 imports + React.memo |
| `src/components/charts/GeoMap.tsx` | Dynamic import for topojson + world-atlas + React.memo + d3-geo |
