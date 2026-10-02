# PingAtlas

Developer tool that measures live latency from the user's browser to AWS, GCP, Azure and Cloudflare (plus any custom
endpoint the user enters) and shows the results on a zoomable 3D globe with real map imagery. Full spec and build
order: see "Build progress" below.

## Commands

Run from the repo root (npm workspaces):

| Command          | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `npm run dev`    | Vite dev server for the client (port 5173)        |
| `npm run build`  | Production build of the client                    |
| `npm run lint`   | ESLint (flat config in `client/eslint.config.js`) |
| `npm run format` | Prettier write (`format:check` to verify only)    |

Before calling a change done: `npm run lint && npm run format:check && npm run build`, then exercise it in a browser.
Latency and globe code can only be verified in a real browser (no-cors fetch, WebGL, pointer events). Headless
Chromium needs `--enable-unsafe-swiftshader` for WebGL.

## Stack

- **client/**: React 19, Vite 8, Tailwind CSS 4 (configured in CSS via `@theme`, no `tailwind.config.js`),
  react-globe.gl + three.js (globe), motion (UI animation)
- **server/** (step 5+): Node.js + Express, MongoDB via Mongoose

## Architecture

```
client/src/
├── main.jsx                 Entry point
├── app/                     Composition layer: the only place features are wired together
│   ├── App.jsx              State owners (hooks), layout, lazy globe
│   ├── layout/              ExplorerPanel (left: Regions / Your endpoints tabs), InsightsPanel (right)
│   └── selection.js         selectedId → region row | custom endpoint | user
├── config/                  Deployer-editable settings (azureEndpoints.js: per-region overrides)
├── constants/               Every tunable value, enum, color, URL and app-level string
├── data/                    regions.json (all providers), gcpPingUrls.json, cloudflareLocations.json (snapshots)
├── types/                   JSDoc typedefs for shared shapes (Target, TestResult, LatencyMeasurement)
├── services/                Side effects only: network I/O, browser APIs, storage
│   ├── latency/             measureLatency(): warm-up + timed requests → median
│   ├── targets/             Per-provider builders → Target[]; Cloudflare edge loaded at runtime
│   ├── endpoints/           inspectEndpoint(): DNS → IP → location + network owner + CDN guess
│   ├── network/             DNS-over-HTTPS, IP lookup
│   ├── location/            Browser geolocation + IP geolocation for the user
│   └── storage/             Guarded localStorage JSON helpers
├── hooks/                   Shared React hooks (useElementSize, useEscapeKey, usePersistentState)
├── utils/                   Pure helpers: no React, no I/O, no module state
├── components/              Shared, feature-agnostic UI
│   ├── layout/              AppHeader
│   ├── latency/             LatencyBar, LatencyValue, LatencyStat (used by regions and endpoints)
│   └── ui/                  Button, Panel, Tabs, SearchField, CardHeader, icons, …
├── features/<feature>/      Feature-scoped components/, hooks/, utils/. Features never import each other.
│   ├── latency-test/        Region targets + test runner, provider filter, results list, summary cards
│   ├── endpoints/           Custom endpoint search bar, saved list, details card, comparison
│   ├── globe/               3D globe, HTML markers, camera, map controls, legend
│   └── location/            useUserLocation + location card
└── styles/index.css         Tailwind import + design tokens (@theme)
```

Data flow: `useRegionTargets()` gives `Target[]` (AWS + GCP + Azure, plus the user's nearest Cloudflare edge once
detected) → `useLatencyTest().startTest(targets)` measures the provider-filtered subset and merges into
`results: { [targetId]: TestResult }` → `App` derives sorted `allRows`/`visibleRows` once and passes them down.
`useCustomEndpoints()` owns the user's endpoints (persisted to localStorage) and turns located ones into globe pins.
`App` owns `selectedId`, shared by list clicks, globe markers and the details cards.

Layout: on `lg+`, glass panels float over a full-bleed globe. Below `lg`, the globe is on top and panels stack underneath.
`GlobeView` is lazy-loaded (three.js is ~550 KB gzipped) so the panels render first.

Adding a provider: id/label/color in `constants/providers.js`, URL in `constants/externalUrls.js`, regions in
`data/regions.json`, a `build<Provider>Targets()` in `services/targets/` registered in `services/targets/index.js`.

## Conventions

- **No magic values.** Numbers, thresholds, colors, URLs, status strings, and reused text belong in `src/constants/`,
  grouped by domain. Enums use `Object.freeze` and UPPER_SNAKE keys (`TEST_STATUS.DONE`). Derive dependent values
  instead of duplicating them (band labels are built from the thresholds; the methodology note reads the request counts).
- **Units in names**: `medianMs`, `REQUEST_TIMEOUT_MS`, `LATENCY_BAR_MIN_WIDTH_PERCENT`.
- **Component-local copy and Tailwind classes stay in the component.** One-off labels ("Stop", "Run again") read best
  next to their markup. Promote them to `constants/` once they're reused or need to be configurable.
- **Named exports only**, no default exports. One component per file (small private subcomponents are fine).
- **File naming**: components `PascalCase.jsx`; hooks `useCamelCase.js`; everything else `camelCase.js`; folders
  `kebab-case`.
- **Imports** use the `@/` alias (→ `client/src`) across folders. Use relative paths only within the same feature.
- **utils vs services**: a function that touches the network or browser APIs goes in `services/`. Pure logic goes in
  `utils/` (app-wide) or `features/<f>/utils/` (feature-only).
- **JSDoc** on exported functions and shared shapes. Comments explain _why_, not _what_.
- Formatting is owned by Prettier (`.prettierrc.json`: single quotes, trailing commas, width 120).

## Latency measurement (how and why)

- Browsers can't send ICMP, so latency is HTTP round-trip time via `fetch` with `mode: "no-cors"`,
  `cache: "no-store"`, `credentials: "omit"`, and a unique `_pa` cache-bust param. Timing covers request to headers.
- Per target: 1 warm-up request (reported as `coldMs`: DNS + TCP + TLS), then 4 timed requests on the reused
  connection; the median is shown. One failed timed request is skipped. A failed warm-up fails the target.
- 4 targets in flight at once (spec). A full run of all 122 targets takes about a minute.
- Targets: AWS DynamoDB `/ping`; GCP via gcping.com's per-region Cloud Run URLs; Azure via
  `<region>.api.cognitive.microsoft.com` (overridable in `config/azureEndpoints.js`); Cloudflare via its DNS-over-HTTPS resolver
  (`cloudflare-dns.com`), which answers at the edge itself.
- **Custom endpoints measure response time**, not pure network latency: cache-busting sends every request to the
  origin, so server processing is included. The UI says so and suggests testing a light path like `/health`.
- Latency colors: blue < 80 ms, amber 80–200 ms, orange-red > 200 ms (`constants/latency.js`, shared with the globe).

## Globe (how and why)

- Real imagery via the tile engine (`globeTileEngineUrl`): Esri World Imagery, Dark Gray Canvas, or World Street Map.
  Tiles sharpen as you zoom, down to street level. The chosen style persists. Attribution is shown on screen (required).
- Markers are HTML elements (`htmlElementsData`) that React renders through portals, so they stay a constant pixel size
  at every zoom. Region labels appear on hover, on selection, or below `LABELS_ALTITUDE` (a `data-labels` attribute
  written straight to the DOM in `onZoom`, so zooming doesn't re-render React).
- Per measured target: a faint trail arc plus a "packet" dash whose trip time scales with latency. Arc thickness is
  scaled down when zoomed in (`getArcStrokeScale`, snapped to powers of two to limit rebuilds).
- Auto-rotates until the first interaction; flies to the user once located; selecting a marker flies in and zooms to
  `FOCUS_ALTITUDE`. All motion respects `prefers-reduced-motion`.
- **Gotcha: object identity.** three-globe keys layer objects by identity and re-animates any new object. The marker
  and arc builders in `globeLayers.js` cache and reuse objects; marker DOM hosts come from a registry, one per id.
- **Gotcha: accessors.** A string accessor is read as a property name (`arcColor="colors"`), so constants must be
  functions. Pass stable functions; a new function each render rebuilds the layer. Colors for three.js must be hex or
  rgba(), not color-mix().
- **Gotcha: stacking.** The globe gives each HTML marker a z-index; the wrapper uses `isolate` so markers can't paint
  over the panels.
- **Gotcha: pointer events.** The globe treats pointerdown→pointerup anywhere in its container as a scene click, so
  marker hosts stop `pointerdown`/`pointermove`. Hidden (far-side) markers are made `inert`.

## Custom endpoints

- Input accepts http/https URLs or bare domains/IPv4 (`https://` added); validated in `parseEndpointInput`.
- Located entirely client-side: Cloudflare DNS-over-HTTPS → first A/AAAA record → ipwho.is (location, ASN, org).
  CDN detection is a heuristic (known anycast ASNs + org name). Step 5's server inspection (headers, TLS, provider
  region from IP ranges) can replace `inspectEndpoint()` behind the same shape.
- Up to 8 endpoints saved in localStorage; only finished data is persisted.

## Deployment

- Live at https://pingatlas.onrender.com (Render static site, auto-deploys from `main`).
- Render settings: Root Directory empty (the lockfile is at the repo root), Build Command `npm ci && npm run build`,
  Publish Directory `client/dist`, environment variable `NODE_VERSION=22` (Vite 8 needs Node 20.19+).
- `client/index.html` has absolute `og:url` / `og:image` URLs for link previews; update them if the domain changes.

## Brand

- Name: **PingAtlas** ("ping" = latency, "atlas" = world map). Slogan: "Measure · Visualize · Deploy smarter".
- Mark: a globe with an arc hopping from "you" (white dot, lower-left) to a pinged region (amber dot with ripple
  rings, upper-right). Geometry and colors live in `constants/brand.js`. `components/ui/LogoMark.jsx` animates it (a
  packet travels the arc, the destination ripples) and falls back to the static mark with reduced motion.
- Wordmark: "Ping" in white + "Atlas" in the sky→cyan→blue gradient (`components/ui/Wordmark.jsx`), Space Grotesk.
- Files: `brand/pingatlas-mark.svg` (source), `brand/concept-art.png` (original concept banner, not shipped),
  `client/public/favicon.svg` (copy of the mark), `apple-touch-icon.png` (180 px, mark on dark), `og-image.jpg`
  (1200×630 link preview built from the concept art's globe + wordmark). The PNG/JPG were rendered from HTML with
  headless Chromium; if the mark changes, regenerate them.

## Location

- No permission prompt on page load (browsers penalize it). If geolocation is already granted it's used; otherwise IP
  geolocation, plus a "Use precise location" button that prompts on click.
- Precise locations display coordinates rather than the IP-derived city, which can be hundreds of km off.
- IP lookup order: `speed.cloudflare.com/meta` (most accurate, and shared with the Cloudflare edge lookup via
  `services/network/cloudflareMeta.js`), then geojs.io, then ipwho.is.

## Cloudflare edge

- Privacy lists (EasyPrivacy → Brave Shields, uBlock) block `cloudflare.com/cdn-cgi/trace` for third-party sites, so
  it can't be relied on. The edge is identified via `speed.cloudflare.com/meta` (trace + `data/cloudflareLocations.json`
  as fallback) and timed against `cloudflare-dns.com` DoH (~1 ms server time; `speed.cloudflare.com/__down` adds ~30 ms).
- If the edge can't be identified, the target is still listed and measured as "Nearest edge" with no coordinates;
  the globe skips targets without coordinates.

## Per-item control

- Any region or endpoint can be stopped or re-tested on its own (row action, details card), during or outside a run.
- `useLatencyTest` and `useCustomEndpoints` keep one AbortController per item in a Map. Only the registered controller
  may write that item's result, so a stopped or replaced measurement can never overwrite a newer one.
- **Gotcha: toggle buttons need keys.** When Stop and Test/Re-test render in the same spot, give them different `key`s.
  Sharing one `<button>`, a click on Stop re-renders it mid-click: in the search bar it became the form's submit
  button and re-submitted (restarting the test); in rows it animated from one state into the other.

## Build progress

- [x] **1. AWS latency table**: streaming sorted results, stop/rerun, cold time + samples
- [x] **2. Globe + motion UI**: arcs with packets, arrival ripples, selection + fly-to, animated panels/list/numbers
- [x] **3. All providers**: 36 AWS + 43 GCP + 42 Azure regions + nearest Cloudflare edge, provider filters, best per
      provider, real satellite/dark/street tiles with deep zoom, map controls
- [x] **4. Custom endpoints**: search bar with Stop, browser latency (median + cold), client-side location + network
      owner + CDN guess, saved list with side-by-side comparison, comparison line + savings hint
- [ ] 5. Server: `POST /api/inspect` (DNS, IP geo, provider detection from published IP ranges, headers/TLS, SSRF
      protection, rate limit); proxy gcping's region list
- [ ] 6. Undersea cables layer (TeleGeography GeoJSON via `/api/cables`, attribution shown)
- [ ] 7. MongoDB crowd data: `POST /api/results`, `GET /api/heatmap`
- [ ] 8. "Where should I deploy?" mode + shareable image card

## Decisions and notes

- **Region lists** checked 2026-10-01:
  - AWS against `ip-ranges.amazonaws.com/ip-ranges.json` and a live `/ping`. Excluded `us-south-1` (no public DNS
    yet), China, GovCloud and the European Sovereign Cloud. `me-south-1` (Bahrain) resolves but times out; it stays and
    shows "Timed out".
  - GCP from gcping's endpoint list (snapshot, because it has no CORS headers; step 5's server can proxy it).
  - Azure: 42 regions whose AI Services host answers. Connect times were checked to follow geography. Regions without
    one (e.g. `westindia`, `koreasouth`) need a storage URL in `config/azureEndpoints.js` plus an entry in regions.json.
  - Cloudflare locations: snapshot of `speed.cloudflare.com/locations` (bot-protected, so not fetched at runtime).
- **Region coordinates are approximate.** Providers don't publish data-center locations, so each region uses the metro
  area it's named after.
- **Map tiles:** CARTO basemaps now require an API key beyond low zoom (they show an "API KEY REQUIRED" watermark), so
  all styles use Esri's keyless basemaps. For production traffic, Esri recommends an ArcGIS Location Platform key.
