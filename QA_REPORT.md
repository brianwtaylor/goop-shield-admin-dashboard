# Shield Dashboard QA Report

## Test Results Summary

| Metric | Count |
|--------|-------|
| Total issues found | 10 |
| Issues fixed | 8 |
| Remaining (documented) | 2 |

## Build Status

- **TypeScript compilation**: PASS (0 errors, strict mode)
- **Vite production build**: PASS (0 errors, 0 warnings besides chunk size advisory)
- Code-split output: 37 chunks, largest 458 KB (framework bundle)

---

## Per-Page Bug Report

### Command Center (`src/pages/command-center/CommandCenter.tsx`)

**No bugs found.** Well-implemented with:
- Proper null guards on `health?.` and `stats?.` data
- Empty state handling for LiveEventFeed (`events.length === 0`)
- Empty state for Top Attack Types and Top Defenses
- Heatmap conditionally rendered only when `heatmapData.length > 0`
- AnimatedNumber handles 0 correctly via spring animation

### Defense Matrix (`src/pages/defense-matrix/DefenseMatrix.tsx`)

| # | Severity | Bug | Fix |
|---|----------|-----|-----|
| 1 | P2 | Heatmap rendered with empty data array when no defense stats available | Added `heatmapData.length > 0` guard with fallback text |

### Threat Intel (`src/pages/threat-intel/ThreatIntel.tsx`)

**No bugs found.**
- GeoMap handles missing geo data via `.filter((a) => a.geo?.lat && a.geo?.lon)`
- Actor table shows empty state when `actors?.length === 0`
- MITRE grid renders static data correctly

### Audit Log (`src/pages/audit-log/AuditLog.tsx`)

| # | Severity | Bug | Fix |
|---|----------|-----|-----|
| 2 | P1 | Volume chart `volumeData` created all entries with `new Date()` instead of reconstructing from bucket key, causing all data points to overlap at the same timestamp | Reconstructed proper `Date` from the `year-month-day-hour` bucket key |

### Red Team (`src/pages/red-team/RedTeam.tsx`)

**No bugs found.**
- Trigger button calls `probe.mutate(undefined)` which correctly triggers `postRedTeamProbe(undefined)` sending `{}`
- GaugeChart bypass rates guarded with `total > 0` check
- Empty results table shows placeholder text
- Mutation invalidates query cache on success

### Agent Protection (`src/pages/agent-protection/AgentProtection.tsx`)

| # | Severity | Bug | Fix |
|---|----------|-----|-----|
| 3 | P1 | `drift!.alerts.length` used non-null assertion (`!`) on potentially null `drift` data when computing `driftData` array | Extracted `drift?.alerts || []` to local variable, removed `drift!` assertion |

### BroRL Explorer (`src/pages/brorl/BroRLExplorer.tsx`)

**No bugs found.** Properly handles:
- Empty curves/weights with fallback text
- Weight table shows `-` for missing alpha/beta

### Settings (`src/pages/settings/SettingsPage.tsx`)

**No bugs found.**
- API key saved to localStorage via AuthContext
- Connection test calls `getHealth()` (which hits `/api/v1/health`)
- JsonTree handles null, undefined, nested objects, arrays
- Config viewer shows fallback text when config unavailable

---

## Component Issues

### Charts

| # | Severity | Component | Bug | Fix |
|---|----------|-----------|-----|-----|
| 4 | P1 | `Heatmap.tsx` | Import error: `max` imported from `d3-scale` instead of `d3-array` (introduced by tree-shaking refactor) | Moved `max` import to `d3-array` |
| 5 | P2 | `Heatmap.tsx` | No guard for empty data/rows arrays | Added early return when `data.length === 0 || rows.length === 0` |
| 6 | P2 | `AreaChart.tsx` | No guard for single data point causing `scaleTime` with zero-width domain | Added `if (data.length < 2) return` guard in D3 render function |
| 7 | P2 | `GaugeChart.tsx` | Value not clamped to [0, 1] range; negative values would render backwards arc | Added `Math.max(0, Math.min(value, 1))` clamping |
| 8 | P2 | `BetaCurve.tsx` | `betaPDF` crashes with alpha=0 or beta=0 (produces NaN via `Math.log(0)` and `lgamma(0)`) | Added `if (a <= 0 || b <= 0) return 0` guard |

### UI Components

- `Badge.tsx` — OK, handles unknown variant via fallback to `variants.default`
- `Button.tsx` — OK, disabled state handled
- `Skeleton.tsx` — OK, simple
- `CodeBlock.tsx` — OK
- `JsonTree.tsx` — OK, handles null, undefined, boolean, number, string, array, object recursively
- `Card.tsx` — OK, motion variant only on hover=true
- `AnimatedNumber.tsx` — OK, handles 0 via spring starting at 0
- `StatusDot.tsx` — OK
- `StatCard.tsx` — OK
- `SeverityBadge.tsx` — OK, falls back to 'default' variant for unknown levels

### D3 Cleanup

The `useD3` hook calls `svg.selectAll('*').remove()` before each render, ensuring proper cleanup on re-render. No memory leaks from D3 selections.

---

## Integration Issues

### WebSocket

| # | Severity | Bug | Fix |
|---|----------|-----|-----|
| 9 | P2 | WebSocket connection did not include API key for authentication | Added `?token=` query parameter to WebSocket URL when API key is configured |

- Reconnection: Implemented with 5-second delay on close
- Error handling: `ws.onerror` closes the socket, triggering `onclose` -> reconnect
- Event buffer: Capped at 200 events via `MAX_EVENTS`

### API Layer

- `client.ts` — Auth header injection works via `beforeRequest` hook
- `endpoints.ts` — All endpoints use correct paths and methods
- `schemas.ts` — Zod schemas match expected API response types; schemas defined but not used for runtime validation (types only)

### Router

| # | Severity | Bug | Fix |
|---|----------|-----|-----|
| 10 | P2 | No 404/catch-all route; direct URL access to undefined paths shows blank page | Added `notFoundComponent` to root route |

### Auth Context

- Handles missing localStorage gracefully (defaults to empty string / default URL)
- `refreshApi()` called on key/URL change to recreate ky client

---

## Severity Classification

### P0 (Crash) — 0 issues

No crash-level bugs found.

### P1 (Broken Feature) — 3 issues (all fixed)

1. **Heatmap import error** — Build failure from incorrect d3 tree-shaking
2. **Audit Log volume chart** — All data points at same timestamp, chart useless
3. **Agent Protection drift data** — Non-null assertion on potentially null data

### P2 (Minor) — 5 issues (all fixed)

4. Heatmap empty data rendering
5. AreaChart single-point guard
6. GaugeChart value clamping
7. BetaCurve alpha/beta=0 NaN crash
8. WebSocket missing auth token
9. Router missing 404 page

### P3 (Cosmetic) — 2 issues (not fixed, documented)

1. `NAV_ITEMS` in `constants.ts` is never imported; `DashboardLayout` uses its own duplicate array
2. `Sparkline` in DefenseMatrix uses `Math.random()` in render, causing different sparkline shapes on every re-render (intentional synthetic data, but non-deterministic)

---

## Final Verification

```
$ npm run build           -> PASS (0 errors)
$ npx tsc --noEmit --strict -> PASS (0 errors)
```
