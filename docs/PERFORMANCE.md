# Performance

The charter's SLOs: public TTFB < 300–400 ms, LCP < 2.0 s, INP < 200 ms, CLS < 0.1, hot API p95 < 200 ms, with four levels of caching and asynchronous PDF rendering. This document says what was measured, on what, and where the numbers come from.

## Measured — production build, this machine

Reproduce with `npm run build`, then `npx next start -p 3100` in `apps/web`, then:

```bash
npm run measure          # BASE_URL=http://localhost:3100 SAMPLES=12
```

12 requests per route after one warm-up; server response time, no network latency:

| Route | p50 | p95 | max |
| --- | --- | --- | --- |
| `/` | 53.0 ms | 95.5 ms | 95.5 ms |
| `/create` | 3.8 ms | 5.6 ms | 5.6 ms |
| `/vendors` | 24.4 ms | 52.6 ms | 52.6 ms |
| `/vendors/[id]` | 26.3 ms | 33.2 ms | 33.2 ms |
| `/vendor` (vendor OS) | 16.7 ms | 44.9 ms | 44.9 ms |
| `/panchang` | 38.1 ms | 51.8 ms | 51.8 ms |
| `/events` | 17.3 ms | 22.2 ms | 22.2 ms |
| `/admin` | 30.0 ms | 74.7 ms | 74.7 ms |
| `/studio/[slug]` | 32.8 ms | 39.1 ms | 39.1 ms |
| `/e/[slug]` (public page) | 24.9 ms | 37.2 ms | 37.2 ms |
| **`/api/vendors` (hot path)** | **5.1 ms** | **10.0 ms** | 10.0 ms |
| `/api/health` | 2.5 ms | 4.0 ms | 4.0 ms |
| `/api/panchang` | 2.0 ms | 6.2 ms | 6.2 ms |

**Result: every server-rendered route answers in under 100 ms p95, and the hot discovery API is 10.0 ms p95 against a 200 ms SLO** — 20× headroom on the API and 4× on the slowest page (the home page, which inlines the invitation artwork as SVG). On a real deployment TTFB = server time + network RTT, so a Pune user on 4G sees roughly 80–200 ms TTFB, inside the 300–400 ms budget. (An earlier run of the same harness on the same code measured 34/55 ms for `/` and 3.8/7.1 ms for `/api/vendors`; the spread between runs is machine load, not code, which is why the harness is in the repository and the table is regenerated rather than quoted.)

## Payload budget

| Asset | Compressed | Notes |
| --- | --- | --- |
| `/` HTML | 45.9 KB | includes inline SVG invitation artwork (259 KB uncompressed) |
| `/panchang` HTML | 26.2 KB | 31-day grid with per-day tithi/nakshatra/score |
| `/api/vendors` JSON | 9.4 KB | 9 ranked vendors with packages, badges, availability |
| Shared JS (first load) | 102 KB | React + the app shell; route chunks add 1.6–4.1 KB |
| Devanagari font (serif, 400) | 51 KB woff2 | self-hosted, `immutable` for a year, `font-display: swap` |

The invitation artwork is inline SVG rather than a raster image on purpose: it is resolution-independent for print, it costs one gzip-friendly text payload instead of a second request, and it renders even before any JavaScript runs.

## The four cache levels

| Level | Mechanism | Job | Invalidation story |
| --- | --- | --- | --- |
| **1. In-process** | `panchangFor()` memo keyed by `(city, date)`; store singleton per process | the wedding page's panchang is computed once for ten thousand guests | none needed — the key is the entire input |
| **2. Database** | SQLite with 29 purpose-built indexes, WAL mode | durable reads in single-digit milliseconds | transactional writes with `revalidatePath` |
| **3. HTTP** | `/api/vendors`: `private, max-age=15, stale-while-revalidate=45`; `/fonts`: `immutable, 1 year`; `/icons`: `30 days + SWR`; `/sw.js`: `must-revalidate` | stops a phone re-downloading 51 KB of Devanagari per navigation | short TTLs on data, immutable on content-addressed assets |
| **4. Edge/CDN** | static output + immutable assets | serves the shell from the edge | dynamic pages are `no-store` deliberately: a five-minute-stale RSVP count is a bug a family will notice |

Explicitly **not** cached: RSVP results, booking state, ledger figures, and any page that shows a guest their own data.

## Rendering strategy per route

| Strategy | Routes | Why |
| --- | --- | --- |
| Static prerender | `/create`, `/offline`, `/manifest.webmanifest`, `/icon.svg` | identical for everyone |
| Server-rendered on demand, streamed | `/`, `/events`, `/vendors`, `/vendors/[id]`, `/vendor`, `/vendor/leads/[id]`, `/panchang`, `/admin` | per-request data, HTML-first so it works without JS |
| Server-rendered with client islands | `/studio/[slug]`, `/studio/[slug]/invitation`, `/e/[slug]` | the editor and the canvas need client state; the page shell does not |
| Route handlers (JSON) | `/api/*` | consumed by the app and by partners |

Client components are kept at the leaves (`quote-builder`, `vendor-calendar`, `panchang-month`, `discovery-feed`, `rsvp-form`) so the interactive parts hydrate without making the page a client bundle. The `readiness-panel`, `guest-panel`, `task-panel` and `vendor-desk-panel` are server components that render on the server and ship no JavaScript.

## Engine performance

| Operation | Time |
| --- | --- |
| `computePanchang`, one day (unmemoised, 200 distinct inputs) | **0.2 ms** |
| `findMuhurats`, 60-day window — what `/panchang` asks for | **10.3 ms** (51 results) |
| `findMuhurats`, full year (365 results, unmemoised) | 51.2 ms |
| `findMuhurats`, repeated window | memoised per `(city, date)` by the page cache, so a wedding page computes once |
| `rankForDiscovery` + availability filter over the vendor table | < 2 ms |
| `priceQuote` | arithmetic only, microseconds |

The muhurat engine is fast enough that `/panchang` computes a 31-day grid *and* a 60-day muhurat scan inside one request without a cache tier of its own — 10 ms of a 38 ms page.

## INP and CLS posture

- **INP:** the interactive surfaces are form posts and small client components; there are no long tasks on the main thread, no layout reads in loops, and the editor's heavy work (SVG generation) happens on the server. The month grid's day switching is local state — no navigation, no spinner.
- **CLS:** no web fonts loaded from a third party, no late-inserted images, fixed-ratio SVG artwork, and skeletons only where a component is genuinely streaming in. `font-display: swap` is paired with metric-compatible fallbacks so a swap does not shift text blocks.
- **Offline:** the service worker is network-first with a 4 s budget, then cache, then `/offline`. It never serves stale page content on purpose.

## How to reproduce

```bash
npm run build -w @mazi/web
npx next start -p 3100          # in apps/web
# then the measurement in this document's source, or:
for i in $(seq 1 20); do curl -s -o /dev/null -w '%{time_total}\n' http://localhost:3100/api/vendors?limit=9; done
```

## Where performance work continues

1. **Brotli at the edge.** Next serves gzip; Cloudflare/CDN brotli takes the home page from 45.9 KB to roughly 38 KB.
2. **Streaming the studio panels** with `Suspense` so the readiness score arrives before the task board on a slow connection.
3. **Postgres + PgBouncer** when the marketplace leaves single-node territory; every query is already index-backed and prepared.
4. **Async print PDFs** on a queue (the renderer is pure, so this is a worker, not a rewrite).
5. **Image/text budget on `/e/[slug]`** for very large guest lists — virtualise the wish wall beyond 60 entries (already capped server-side).
