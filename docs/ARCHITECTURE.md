# Architecture

## The shape of the system

One Next.js application, one modular core, one database. The plan called for "no 20 microservices, no K8s, no Kafka" at this stage, and the architecture earns that: every cross-module call inside a request is an ordinary function call, so the whole platform is debuggable with a stack trace and deployable on a single box.

```
apps/web (Next.js 15 App Router, React 19)
  │
  │  server components render pages; server actions and route handlers are the
  │  only code allowed to write
  ▼
packages/store          persistence + invariants (node:sqlite today, Postgres next)
packages/commerce       money: pricing, commission, ranking, ads, ledger reconciliation
packages/panchang       astronomy: panchang, choghadiya, muhurat suitability
packages/marathi        language: taxonomy, vocabulary, relations, formatting
packages/renderer       design JSON → deterministic SVG → print/social output
packages/design-schema  canonical Design JSON v3 types + validation
packages/ai-gateway     Marathi intent parsing with a hard spend ceiling
```

**Why a monorepo instead of a service split.** The domain is one graph: a booking references a quote which references a lead, a vendor, an event and a panchang snapshot; the ledger references the booking's price breakdown. Splitting that graph across network hops at this scale buys distributed-systems problems and nothing else. The boundaries that matter are *module* boundaries — they are enforced by types, by the `Store` interface, and by the rule that pricing lives in exactly one place.

**Package rules**

- `@mazi/panchang` and `@mazi/marathi` are pure: no I/O, no store access, deterministic for a given input.
- `@mazi/commerce` is pure arithmetic with no I/O. Given a quote it returns the same breakdown every time, which is what makes the seeded marketplace and the live marketplace agree.
- `@mazi/store` owns all SQL. Nothing else in the tree contains a query.
- `apps/web` owns sessions, forms, caching and presentation. Server actions are the only write path — there is no public write API to secure separately.

## Request lifecycles

### 1. A guest opens an invitation (`/e/[slug]`)

```
GET /e/patil-patil-vivah-2027
  → getStore()                    (process-wide singleton, seeded once)
  → events.bySlug(slug)           one indexed read
  → panchangFor(city, date)       memoised per (city, date) — thousands of guests, one computation
  → renderSvg(invitation design)  deterministic; identical bytes for identical input
  → streamed HTML                 no client-side data fetching, works without JavaScript
```

The page is server-rendered because the audience is a guest on a phone with one bar of signal at a wedding venue. RSVP is a progressive-enhancement form: it posts to `/e/[slug]/rsvp` (a route handler) so it works even if the client bundle never loads.

### 2. A vendor answers an enquiry (`/vendor/leads/[id]`)

```
POST (server action) respondToLeadAction
  → validate + look up the lead
  → messages.insert            one row per reply
  → leads.update(status, responded_at)   the SLA clock
  → audit.record('lead.responded')
  → revalidatePath('/vendor'), revalidatePath('/vendor/leads/<id>')
```

### 3. A customer accepts a quote — the money path

```
POST (server action) acceptQuoteAsCustomerAction
  └─ store.transaction(() => {
       1. idempotency guard: does bk_<quoteId> already exist?  → return
       2. priceQuote(quote)              → full waterfall (subtotal, GST, gateway, commission, payout)
       3. bookings.create(... PAYMENT_PENDING ...)
       4. bookings.appendLedger(postingForPayment(...).entries)   ← debits = credits
       5. bookings.recordPayment({ idempotencyKey: `<booking>:pay:advance` })
       6. bookings.updateState(BOOKING_CONFIRMED, actor: 'system')
       7. vendors.setAvailability(... 'booked' ...)   only if bookable
       8. quotes.update(accepted), leads.update(won)
       9. audit.record('booking.confirmed'), audit.record('payment.captured')
     })
```

Two design notes worth stating out loud:

1. **The ledger posting comes from `@mazi/commerce`, not from the app.** `postingForPayment()` is the same function the tests use, so the arithmetic can not drift between the product and its checks.
2. **The booking id is derived from the quote id (`bk_<quoteId>`).** Idempotency is a property of the identifier, not of a hopeful `SELECT` before insert. A double tap, a retry after a timeout, and a duplicated webhook all collapse into the same row.

### 4. A family builds an invitation (`/studio/[slug]/invitation`)

The editor holds a canonical **Design JSON v3** document. Rendering is a pure function `renderSvg(doc, { preset, scheme })`, so:

- the browser preview, the downloaded SVG, the print PDF and the social export are all produced from one document;
- print maths (bleed, safe margin, crop marks, minimum foil stroke, 300 dpi) is computed in millimetres from the preset, never from pixels;
- a version is written on every save (`design_versions`, append-only) so a print dispute has forensic evidence.

## Data ownership and invariants

| Concern | Owner | Invariant |
| --- | --- | --- |
| Money units | `packages/store` | integers in **paise**; there is no float anywhere in the money path |
| Time | `packages/store` | ISO-8601 UTC strings; formatting to Marathi happens only at the edge |
| Ledger | `packages/store` (postings built by `@mazi/commerce`) | every booking sums to zero; `reconcileLedger()` proves it platform-wide |
| Payments | `packages/store` | unique `idempotency_key`; the gateway record is evidence, not truth |
| Quotes | `packages/commerce` → `packages/store` | a quote's totals are always the output of `priceQuote()`, never typed in |
| Booking state | `packages/store` + `@mazi/commerce` | transitions are validated; history is append-only JSON on the row |
| Panchang | `packages/panchang` | deterministic for (date, city, ayanamsa); snapshots are stored with the event so a page never changes under a guest |
| Audit | `packages/store` | append-only; every state change records actor, action, entity, before/after |

## Caching: four levels, each with a stated job

1. **In-process memo** — `panchangFor()` (`apps/web/src/lib/panchang.ts`) caches computed panchang per `(city, date)`; the store singleton is created once per process. Pure-function memoisation, no invalidation problem because the input is the key.
2. **Database** — everything durable. Indexed reads only; the schema carries the indexes the queries need (see `docs/DATA-MODEL.md`).
3. **HTTP** — `/api/vendors` sends `private, max-age=15, stale-while-revalidate=45`; fonts are `immutable` for a year; icons and the manifest are revalidated in the background.
4. **Edge/CDN** — static assets and the offline shell are immutable and cacheable; dynamic pages are `no-store` on purpose, because an RSVP count that is five minutes stale is a bug a family will notice.

There is deliberately **no service worker cache on navigation beyond the offline fallback**: the SW is network-first with a 4 s budget, then cache, then `/offline`. A stale invitation is worse than a slow one.

## Background work

The plan's async-PDF and settlement jobs run as **server actions that return immediately and record intent**, with the heavy render executed inside `/api/designs/[id]/print`. At this stage there is no queue broker; the seam is one function (`renderPrintHtml`), so moving it to SQS + Lambda later is a deployment change, not a rewrite. This is documented rather than hidden: see `docs/DEPLOYMENT.md`.

## Operational rules learned the hard way

Three failure modes have bitten this codebase, so they are written down rather than
rediscovered:

1. **Dev and production builds use different output directories.** `next build`
   wipes `.next`; if `next dev` is running against the same directory, every route
   then fails with `Cannot find module './383.js'` until the server is restarted.
   `next.config.ts` sets `distDir` to `.next-dev` in development and `.next` for
   builds, so "build, then keep developing" is safe. `tests/vendor-flow.e2e.mjs`
   reads both directories when it discovers Server Action ids.
2. **`db:reset` drops tables in place instead of unlinking the file.** A running
   server holds an open handle; deleting the file would leave it writing to a ghost
   database while the CLI seeded a new one. The CLI now opens a raw connection (no
   migrations), drops every table, closes, and reseeds.
3. **A running dev server serves stale compiled modules.** When a `curl` disagrees
   with a direct SQLite read, distrust the server process first.

## Where the seams are (and what changes at 100× traffic)

| Seam | Today | Migration |
| --- | --- | --- |
| Persistence | `node:sqlite` file | managed Postgres via `infrastructure/postgres/001_init.sql`; the `Store` interface is the only thing the app knows |
| Files (proofs, exports) | served from the app | object storage + signed URLs |
| Heavy render | in-request | queue + worker; the renderer is already a pure function |
| Search | SQL `LIKE` ranking in `rankForDiscovery` | Postgres FTS / Meilisearch behind the same function name |
| Ads | table + `adPerformance()` | unchanged; the campaign model already carries placement, targeting and metrics |
| Sessions | demo identity resolver | OTP + signed cookies (see `docs/SECURITY.md`) |
