# Latency Globe

Developer tool that measures live latency from the user's browser to AWS, GCP, Azure and Cloudflare regions (plus
custom endpoints) and shows the results on a 3D globe. Full spec and build order: see "Build progress" below.

## Commands

Run from the repo root (npm workspaces):

| Command          | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `npm run dev`    | Vite dev server for the client (port 5173)        |
| `npm run build`  | Production build of the client                    |
| `npm run lint`   | ESLint (flat config in `client/eslint.config.js`) |
| `npm run format` | Prettier write (`format:check` to verify only)    |

Before calling a change done: `npm run lint && npm run format:check && npm run build`, then exercise it in a browser.
Latency code can only be verified in a real browser (no-cors fetch, AbortSignal, streaming state updates).

## Stack

- **client/**: React 19, Vite 8, Tailwind CSS 4 (configured in CSS via `@theme`, no `tailwind.config.js`), react-globe.gl (step 2)
- **server/** (step 5+): Node.js + Express, MongoDB via Mongoose

## Architecture

```
client/src/
├── main.jsx, App.jsx        Entry point and page composition only; no logic
├── constants/               Every tunable value, enum, color, URL and app-level string
├── types/                   JSDoc typedefs for shared data shapes (Target, TestResult, …)
├── data/regions.json        Static region catalog: provider, code, city, lat, lng
├── services/                Side effects: network I/O, browser APIs
│   ├── latency/             measureLatency(): warm-up + timed requests → median
│   └── targets/             Per-provider builders turning regions into measurable Targets
├── utils/                   Pure helpers: no React, no I/O, no module state
├── components/              Shared, feature-agnostic UI
│   ├── layout/              AppHeader, and panels later
│   └── ui/                  Button, ProviderBadge, …
├── features/<feature>/      Feature-scoped code: components/, hooks/, utils/
│   └── latency-test/        Running the test and showing results
└── styles/index.css         Tailwind import + design tokens (@theme)
```

Data flow: `services/targets` builds `Target[]` → `useLatencyTest(targets)` runs `measureLatency` through
`runWithConcurrency` and writes `results: { [targetId]: TestResult }` → components derive sorted rows and summaries
through `features/latency-test/utils/results.js`. The globe (step 2) consumes the same `targets` and `results`.

Adding a provider: add its id/label/color to `constants/providers.js`, its URL to `constants/endpoints.js`, regions to
`data/regions.json`, and a `build<Provider>Targets()` in `services/targets/` registered in `services/targets/index.js`.

## Conventions

- **No magic values.** Numbers, thresholds, colors, URLs, status strings, and reused text belong in `src/constants/`,
  grouped by domain. Enums use `Object.freeze` and UPPER_SNAKE keys (`TEST_STATUS.DONE`). Derive dependent values
  instead of duplicating them (band labels are built from the thresholds; the methodology note reads the request counts).
- **Units in names**: `medianMs`, `REQUEST_TIMEOUT_MS`, `LATENCY_BAR_MIN_WIDTH_PERCENT`.
- **Component-local copy and Tailwind classes stay in the component.** One-off labels ("Stop", "Run again") read best
  next to their markup. Promote them to `constants/` once they're reused or need to be configurable.
- **Named exports only**, no default exports. One component per file.
- **File naming**: components `PascalCase.jsx`; hooks `useCamelCase.js`; everything else `camelCase.js`; folders
  `kebab-case`.
- **Imports** use the `@/` alias (→ `client/src`) across folders. Use relative paths only within the same feature.
- **utils vs services**: a function that touches the network or browser APIs goes in `services/`. Pure logic goes in
  `utils/` (app-wide) or `features/<f>/utils/` (feature-only).
- **JSDoc** on exported functions and shared shapes. Comments explain _why_, not _what_.
- Formatting is owned by Prettier (`.prettierrc.json`: single quotes, trailing commas, width 120).

## Latency measurement (how and why)

- Browsers can't send ICMP, so latency is HTTP round-trip time via `fetch` with `mode: "no-cors"`,
  `cache: "no-store"`, `credentials: "omit"`, and a unique `_lg` cache-bust param. Timing covers request to headers.
- Per target: 1 warm-up request (reported as `coldMs`: DNS + TCP + TLS), then 4 timed requests on the reused
  connection; the median is shown. One failed timed request is skipped. A failed warm-up fails the target.
- 4 targets in flight at once; each result is written to state as soon as it arrives.
- Latency colors: blue < 80 ms, amber 80–200 ms, orange-red > 200 ms (`constants/latency.js`, shared with the globe).

## Build progress

- [x] **1. AWS latency table**: 36 AWS regions, streaming sorted table, stop/rerun, cold time + samples on hover
- [ ] 2. Globe: user point (geolocation → IP fallback), region points, latency-colored arcs
- [ ] 3. GCP (region list from gcping), Azure (placeholder storage URLs in config), Cloudflare (cdn-cgi/trace colo), provider filters
- [ ] 4. Custom endpoint input + browser latency (median + cold)
- [ ] 5. Server: `POST /api/inspect` (DNS, IP geo, provider detection from published IP ranges, SSRF protection)
- [ ] 6. Undersea cables layer (TeleGeography GeoJSON via `/api/cables`, attribution shown)
- [ ] 7. MongoDB crowd data: `POST /api/results`, `GET /api/heatmap`
- [ ] 8. "Where should I deploy?" mode + shareable image card

## Decisions and notes

- **AWS region list** checked 2026-10-01 against `ip-ranges.amazonaws.com/ip-ranges.json` and a live `/ping` to each
  region.
  - Excluded: `us-south-1` (in ip-ranges but no public DNS yet), China (`amazonaws.com.cn`), GovCloud, and the
    European Sovereign Cloud (`amazonaws.eu`).
  - `me-south-1` (Bahrain) resolves but times out. It stays in the list and shows as "Timed out".
- **Region coordinates are approximate.** Providers don't publish data-center locations, so each region uses the metro
  area it's named after. Country-only names (UAE, Bahrain, Saudi Arabia) use the main hub city.
