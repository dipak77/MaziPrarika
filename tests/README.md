# Tests

Three layers, each with a different job. All of them run on a laptop with no services.

## 1. Unit — `npm test` (vitest, 205 tests / 7 files)

| File | Covers |
| --- | --- |
| `packages/store/src/store.test.ts` (34) | migrations, every repository, booking state machine, ledger balance, idempotency, privacy export/delete, seed integrity |
| `packages/commerce/src/commerce.test.ts` (34) | pricing waterfall, GST/gateway/commission arithmetic, ranking, trust badges, ad ROAS, `reconcileLedger`, refunds |
| `packages/panchang/src/panchang.test.ts` (29) | sunrise/sunset, Lahiri ayanamsa, tithi/nakshatra boundaries, choghadiya, rahu kaal, muhurat scoring (including the 98 ceiling and per-event पौर्णिमा handling) |
| `packages/marathi/src/marathi.test.ts` (27) | taxonomy, 25 vendor categories, relation honourifics, Devanagari digits, date and clock formatting |
| `packages/renderer/src/renderer.test.ts` (33) | SVG determinism, presets, bleed/crop maths, gold-foil minimum stroke, QR payloads, print HTML |
| `packages/design-schema/src/schema.test.ts` (21) | Design JSON v3 validation, migration of older documents |
| `packages/ai-gateway/src/gateway.test.ts` (27) | Marathi intent parsing, Devanagari digits, month names, budget phrasing, cost ceiling |

```bash
npm test            # once
npm run test:watch  # while working
npx vitest run packages/panchang   # one package
```

## 2. End-to-end — `npm run test:e2e` (40 checks)

`tests/vendor-flow.e2e.mjs` drives the **real HTTP surface** against a running server and then reads the database to prove what happened:

```bash
npm run dev &        # or npm run start -w @mazi/web
npm run db:reset     # the test needs a seeded marketplace
npm run test:e2e
BASE_URL=http://localhost:3100 npm run test:e2e   # against a production build
```

What it asserts, in order:

1. **Reply leg** — a vendor's reply posts through the same action the browser uses, writes exactly **one** message, and stamps `responded_at` (the SLA clock).
2. **Quote leg** — a quote is created with subtotal, 18 % GST on the taxable value and the customer total recomputed from the live rate table, the lead moves to `quoted`, and the quote is audited.
3. **Money leg** — accepting the quote creates exactly one booking (`bk_<quoteId>`) in `BOOKING_CONFIRMED`, entering through `PAYMENT_PENDING`; six balanced ledger entries across cash/gateway/GST/payable/revenue; one idempotent captured advance; the quote marked accepted; the lead marked won; the vendor's calendar day held.
4. **Double tap** — the accept action is posted twice and nothing extra is created.
5. **Integrity + routes** — every booking still balances, the ledger is zero-sum overall, and eleven routes (`/`, `/create`, `/vendors`, `/vendor`, `/panchang`, `/events`, `/admin`, `/offline`, `/manifest.webmanifest`, `/api/health`) answer 200.

Two details that make the test trustworthy rather than decorative:

- **Action ids are discovered from the build**, not pasted in. If `app/vendor/actions.ts` is refactored, the test fails loudly instead of passing against a stale id.
- **Both transports are exercised**: the no-JS form post (the reply form's progressive-enhancement path) and React's client encoding — multipart with the referenced `FormData` part mapped by `$K1` before the argument list. That distinction caused two real bugs during development, which is why the test covers it.

## 3. Manual walkthrough

The demo script in the root `README.md` (12 steps) is the acceptance test a person performs: create → studio → public page → discovery → vendor desk → quote → booking → admin.

## Conventions

- A test that needs a database uses `openStore({ filename: ':memory:' })` — no fixtures on disk, no shared state.
- Deterministic seeds: `seedStore(store, { today: new Date('2026-09-24T00:00:00Z') })` keeps assertions stable.
- Money is asserted in paise as integers, never as floats with a tolerance.
- The E2E suite is stateful by design (it writes); it resets expectations from the database rather than assuming a pristine seed, except for the two legs that require an unquoted lead.
