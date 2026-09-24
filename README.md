# माझी पत्रिका · Mazi Patrika

**An event operating + commerce platform for Marathi families — create, plan, discover, book, print, manage and celebrate in one connected workspace.**

A family in Pune plans a wedding across ten WhatsApp groups, four notebooks and a folder of print proofs. A photographer in Kolhapur answers enquiries at midnight and never knows which will become work. An advertiser pays for clicks that never book. Mazi Patrika is the one workspace where those three sides meet — with Marathi typography, a deterministic Panchang engine, print-perfect invitations and a marketplace whose money flows are provable down to the paisa.

```
Create  →  Plan  →  Discover  →  Book  →  Print  →  Manage  →  Celebrate
  ↑                                                                  ↓
  └──────────────── one connected workspace, three sides ────────────┘
```

---

## What is actually built

| Pillar | Where it lives | What it does |
| --- | --- | --- |
| **Invitation Studio** | `apps/web/src/app/studio/[slug]/invitation` | 12 template presets × 8 colour schemes, WYSIWYP canvas, bleed/crop/CMYK-safe print export, gold-foil preview, deterministic SVG renderer, GST-accurate print pricing |
| **Event workspace** | `apps/web/src/app/studio/[slug]` | Readiness scoring, budget ledger, guest list with respect-correct Marathi relations, task board with what's-overdue-first ordering, vendor desk on the same page |
| **Public digital page** | `apps/web/src/app/e/[slug]` | Server-rendered invitation page with its own panchang snapshot, RSVP endpoint, wish wall, calendar download, share/QR |
| **Panchang & Muhurat engine** | `packages/panchang` | Tithi, nakshatra, yoga, karana, choghadiya, rahu kaal, abhijit, sunrise/sunset per city; Muhurat *suitability scoring* with published methodology — never a "good/bad day" verdict |
| **Discovery marketplace** | `apps/web/src/app/vendors`, `/api/vendors` | Ranked, filtered vendor discovery with trust evidence, sponsored placement that must clear the organic floor and is always labelled |
| **Vendor OS** | `apps/web/src/app/vendor` | SLA-first lead inbox, quote builder, working-hours calendar, earnings and commission split, ad ROAS, disputes |
| **Money** | `packages/commerce`, `packages/store` | Own double-entry ledger (the gateway is never the source of truth), bookings state machine, idempotent payments, settlements, commission waterfall |
| **Admin console** | `apps/web/src/app/admin` | Marketplace health: GMV, take rate, conversion funnel, ledger integrity, SLA breaches, ad performance, dispute queue |
| **PWA** | `apps/web/public/sw.js`, `manifest.ts` | Installable, offline shell, immutable asset caching — no native apps, per the product charter |

Everything above is running: **23 routes build clean**, **205 unit tests** and a **40-check end-to-end test** against the live HTTP surface pass (see [Verification](#verification)).

---

## Quickstart

Requires **Node ≥ 22.5** (the platform uses the built-in `node:sqlite` — no database server, no Docker, no ORM).

```bash
npm install
npm run db:reset        # schema v7 + a complete seeded Maharashtra marketplace
npm run dev             # http://localhost:3000
```

Then walk the demo:

| Step | URL | What to look at |
| --- | --- | --- |
| 1 | `/` | The marquee, the live panchang strip, the four pillars |
| 2 | `/create` | The 5-step wizard: type → date (muhurat-aware) → city → guests → budget |
| 3 | `/studio/patil-patil-vivah-2027` | Readiness 75/100, budget ₹12.59 L spent of ₹18 L, guest list, tasks |
| 4 | `/studio/patil-patil-vivah-2027/invitation` | Studio: switch templates, schemes, print quote, download SVG/print PDF |
| 5 | `/e/patil-patil-vivah-2027` | The page a guest opens: RSVP, wish wall, panchang, map deep-link |
| 6 | `/vendors?city=पुणे` | Discovery with trust badges and labelled sponsored results |
| 7 | `/vendors/vnd_pune_kulkarni_studio` | Vendor profile: packages, 21-day availability, reviews, enquiry form |
| 8 | `/vendor` → `/vendor/leads/lead_2` | Vendor OS: reply to an enquiry, send a quote |
| 9 | `/vendor/leads/lead_12` | Send a quote, then "customer accepted" → booking + balanced ledger |
| 10 | `/panchang` | Month grid, choghadiya, 60-day muhurat windows with every factor shown |
| 11 | `/events` | Opt-in public invitations (only what a family published) |
| 12 | `/admin` | GMV, take rate, funnel, ledger integrity, SLA, ad ROAS, disputes |

---

## Repository map

```
apps/web                     Next.js 15 App Router (React 19, Tailwind 4)
  src/app                    routes: consumer, studio, public page, vendors, vendor OS, admin, API
  src/components             UI: studio panels, vendor desk, discovery feed, panchang month
  src/lib                    server helpers: store singleton, panchang cache, format, vendor desk
packages/
  store         SQLite (node:sqlite) schema v1–v7, repositories, seed, migrations, invariants
  commerce      commissions, quote pricing waterfall, trust/ranking, ad performance, ledger reconciliation
  panchang      astronomy: tithi/nakshatra/yoga/karana, choghadiya, muhurat evaluation & search
  marathi       language layer: event taxonomy, 25 vendor categories, relations, date/time formatting
  renderer      design JSON v3 → deterministic SVG → print HTML / social export; template presets
  ai-gateway    Marathi-aware intent parsing (digits, months, budget phrasing) with a cost ceiling
  design-schema Canonical Design JSON v3 types and validation
scripts/                     db CLI, icon generator, ESM TypeScript resolution hooks
infrastructure/postgres      production DDL + RLS for the managed-Postgres migration path
tests/                      cross-cutting end-to-end tests that drive real HTTP
docs/                       architecture, data model, commerce, panchang, security, performance, deployment
```

## Commands

```bash
npm run dev              # dev server (apps/web)
npm run build            # production build
npm run typecheck        # every package + the app
npm test                 # vitest: store, commerce, panchang, marathi, renderer, design-schema, ai-gateway
npm run test:e2e         # end-to-end against a running server (server must be up)
npm run db:migrate       # apply migrations
npm run db:seed          # seed a marketplace into the current schema
npm run db:reset         # drop, migrate and reseed (safe while the dev server runs)
npm run db:stats         # row counts + ledger integrity
npm run icons            # regenerate PWA/app icons from vector geometry
npm run measure          # SLO table (p50/p95 per route) from a production build
```

---

## Architecture in one screen

```
                        ┌───────────────────────────────────────────────┐
   browser (PWA)  ─────▶│  Next.js App Router — server components        │
                        │  • public pages: HTML first, no client fetch   │
                        │  • actions/route handlers: the only write path │
                        └───────────────┬───────────────────────────────┘
                                        │
             ┌──────────────────────────┼─────────────────────────────┐
             ▼                          ▼                             ▼
   ┌──────────────────┐      ┌────────────────────┐        ┌──────────────────┐
   │ @mazi/panchang   │      │ @mazi/commerce     │        │ @mazi/renderer   │
   │ deterministic    │      │ pricing, commission│        │ design → SVG →   │
   │ astronomy        │      │ ranking, ledger    │        │ print, foil, QR  │
   └──────────────────┘      └────────────────────┘        └──────────────────┘
                                        │
                     ┌──────────────────▼───────────────────┐
                     │ @mazi/store — node:sqlite            │
                     │ schema v7 • money in paise • UTC ISO │
                     │ append-only audit, ledger, versions  │
                     └──────────────────┬───────────────────┘
                                        │  (same interface, one swap)
                     ┌──────────────────▼───────────────────┐
                     │ infrastructure/postgres — managed PG │
                     │ DDL + RLS, when GMV > ₹5 L/月        │
                     └──────────────────────────────────────┘
```

Read next: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) · [`docs/COMMERCE.md`](docs/COMMERCE.md) · [`docs/PANCHANG.md`](docs/PANCHANG.md) · [`docs/SECURITY.md`](docs/SECURITY.md) · [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) · [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) · [`docs/ROADMAP.md`](docs/ROADMAP.md)

---

## Verification

```bash
npm test          # 205 unit tests across 7 packages
npm run test:e2e  # 40 checks against the running server + database
```

`npm run test:e2e` is the one that matters commercially: it posts to the same Server Actions a vendor's browser calls, then reads the database to prove that a reply writes exactly one message and stamps the SLA clock; that a quote is priced by the live commission waterfall; that accepting it creates **one** booking, **one** balanced double-entry posting, **one** idempotent payment and a held calendar day; and that a double tap creates nothing extra. It discovers the action ids from the build, so a refactor cannot make it silently lie.

Production measurements on this machine (`next start`, 12 samples per route):

| Route | p50 | p95 |
| --- | --- | --- |
| `/` | 53 ms | 96 ms |
| `/panchang` | 38 ms | 52 ms |
| `/admin` | 30 ms | 75 ms |
| `/vendor` | 17 ms | 45 ms |
| `/api/vendors` (hot path) | 5.1 ms | **10.0 ms** (SLO 200 ms) |
| `/api/panchang` | 2.0 ms | 6.2 ms |

One day of panchang: 0.2 ms. A 60-day muhurat scan (what `/panchang` renders): 10 ms. Reproduce with `npm run measure`. See [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md).

---

## Deliberately not built

The product charter is explicit about scope, and every one of these is a *decision*, not a gap:

- **No matrimony / spouse discovery.** We start after the decision is made.
- **No 1,000-template library.** Twelve excellent, culturally-specific presets beat a thousand generic ones.
- **No Canva clone.** The editor serves Marathi invitations with print fidelity — that is the wedge.
- **No native apps.** PWA-first.
- **No K8s, no Kafka, no twenty microservices.** One Next.js app, one modular core, one database.
- **No vendor scraping.** Vendors are onboarded, verified and reviewed.
- **No instant booking.** A wedding is a conversation; we make the conversation fast and accountable.
- **No "शुभ/अशुभ दिवस" labels.** We publish muhurat *suitability* with methodology. The decision stays with the family and their guru.
- **No 100 % margin assumptions.** Commission is 3–15 % by category, and the model says so.

## Licence

Private, all rights reserved. Built for the Mazi Patrika product.
