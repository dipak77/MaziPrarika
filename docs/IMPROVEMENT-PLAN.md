# Improvement Plan — Mazi Patrika (review Sep 2026)

This pass fixed P0 gaps and lifted the UI to a unified royal design system. What remains is ordered by commercial risk.

## What was fixed in this pass

### P0 — correctness
- `vendor/leads/[id]/page.tsx`: `lead.city` does not exist on `Lead` → now `event?.city ?? vendor?.city`. Typecheck unblocked.
- `api/panchang`: `limit=NaN` possible, `eventType` unvalidated, `from/to` unvalidated → allow-list + clamp 1–30 + date-range check (max 366 days).
- `vendor/actions.saveQuoteAction`: negative discount overcharged (`taxable = subtotal - neg`), unchecked `category` → `NaN` commission → clamp discount 0–1Cr, allow-list categories.
- `vendor/actions.acceptQuote`: expired/rejected quotes could be accepted → status + `validTill` guard, idempotent early-return for `accepted`.
- `vendor/actions.setVacation`: unchecked status/vendor → allow-list + vendor existence check.
- `invitation/actions`: unchecked `templateId/schemeId/paper/finishing/quantity`, `Math.random()` order id → allow-lists, quantity 25–10000, time-based order id, status allow-list.

### P0 — missing app shell
- Added `not-found.tsx`, `loading.tsx` (skeleton + `role=status`), `error.tsx`, `global-error.tsx`, `sitemap.ts` (public events), `robots.ts` (disallow `/vendor/, /admin, /studio/, /api/`).
- `generateMetadata` for `e/[slug]` (WhatsApp-share critical) and `vendors/[id]`; enriched home metadata + OG/Twitter.

### P1 — UI/UX top-class pass
- `globals.css` v2: single source of truth — `--color-gold-ink` for contrast-safe gold text, `btn-gold/btn-maroon/btn-outline/btn-ghost` unified buttons (`gold-btn/maroon-btn` kept as aliases), `kicker`, `card-pad`, `table-wrap + table.data-table`, `skeleton`, `overflow-x: clip`, `prefers-reduced-motion` kill-switch, focus-visible preserved.
- Fixed `hover:scale-102` (no-op) → `hover:scale-[1.02]`; `h-18` → `h-[4.5rem]`; hero `overflow-x-clip`; pillar emoji `aria-hidden`; `kicker` replaces low-contrast `text-gold-deep` kickers.
- Budget table → `table-wrap + data-table` with `<caption>` + `scope`; Panchang month → 44px+ tap targets (`min-h-[3rem]`), `aria-label` per day, visible selected ring, no color-only meaning; RSVP toggle → `aria-pressed` + min-height.
- New `src/components/ui.tsx`: `UIButton/UILink/Kicker/SectionHead/Card/Badge/EmptyState/SkeletonCard` — use for all new screens.

## Next — P1 (do within 2 weeks)

1. **Auth + ownership (biggest commercial blocker).** Every write action trusts the caller (`actor: vendorId | usr_c_ramesh | guest`). Add session (e.g. NextAuth or signed cookie + `SESSION_SECRET` rotation), scope `vendorDeskId()` to session, check `event.ownerUserId` / `lead.vendorId` / `design.ownerUserId` on every mutation. Until then do not expose write endpoints publicly.
2. **Rate-limit + spam.** RSVP/wish/enquiry have no throttling. Add per-IP + per-entity limits (Upstash or in-DB token bucket), honeypot + turnstile on public forms, longer RSVP codes (`nanoid` 12+).
3. **Ledger completeness.** `postingForRefund` never reverses GST/payables; `postingForSettlement` never called; no refund/dispute write path. Implement settlement + refund postings with reconciliation tests.
4. **State machine enforcement.** `bookings.updateState` accepts any string; wire `commerce.transitionBooking` allow-list.
5. **Cache correctness.** `api/designs/[id]/svg` sends `immutable 1y` but `designs.save` keeps same id → versioned URL (`?v=`) or ETag.
6. **GET with side effects.** `api/vendors` writes ad impressions on GET → move to `POST /api/ads/event` or beacon.
7. **Secrets rotation.** `SESSION_SECRET=change-me…`, `PAYMENT_ADAPTER=simulated` — fail boot in production if placeholders; document Razorpay cutover.

## Next — P2 (polish, 1 month)

- Streaming + Suspense per section (studio, vendor desk) instead of `force-dynamic` whole pages.
- `PanchangMonth` legend + pattern (not color-only) for muhurat bands; admin chart keyboard-accessible table fallback.
- `line-clamp` cards get expand affordance; all tables get captions; Marathi `aria-labels` audit.
- Image/SVG `loading=lazy`, `next/image` where raster; preconnect fonts already self-hosted — verify.
- `measure` SLOs into CI; add e2e for RSVP spam, refund, expired-quote rejection.
- Postgres cutover: `lib/store.ts` still ignores `DATABASE_URL` — implement adapter switch + RLS session user.

## Design debt retired / rules going forward

- Never add hex in components — tokens only.
- Buttons: `btn-gold` (primary festive), `btn-maroon` (primary trust), `btn-outline` (secondary), `btn-ghost` (tertiary). No ad-hoc `bg-maroon/border-maroon` CTAs.
- Surfaces: `surface` (content), `surface-elevated` (cards), `surface-royal` (dark hero/CTA only), `surface-gold` (festive highlight, sparingly).
- Radius: `rounded-2xl` cards, `rounded-full` pills/CTAs; no `rounded-xl/3xl` drift without reason.
- Borders: `border-gold/25–40` only; shadows `shadow-soft/lift/gold`.
- Every color-coded UI needs text/pattern backup; every `table` needs `table-wrap` on mobile.

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e   # needs dev server + db:reset
```
