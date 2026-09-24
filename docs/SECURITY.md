# Security, privacy and the DPDP Act

The platform holds the most sensitive data a Maharashtra family has about an event: guest phone numbers, a wedding date and venue, a budget, and who was invited. The threat model is written from that fact outward.

## 1. Data inventory (what we hold, and why)

| Data | Where | Why we hold it | Default exposure |
| --- | --- | --- | --- |
| Guest names, relation, phone, RSVP | `guests` | invitations, headcount for the caterer | private to the event owner |
| Event date, venue, hosts | `events` | the invitation itself | private unless `is_public = 1` |
| Budget and payments | `budget_items`, `payments`, `ledger_entries` | planning and settlement | private; vendor sees only their own booking |
| Enquiry messages | `messages` | the vendor conversation | the customer and that vendor only |
| Vendor business documents | `vendors.evidence` | trust badges | only what we actually verified is shown, as a badge |
| Audit trail | `audit_log` | dispute resolution, accounting | admins |
| Wish wall posts | `event_wishes` | celebration | public **on a page that is already public**; name only, no phone |

**Discovery is opt-in at the schema level** (`events.is_public` defaults to `0`). A bug in a filter cannot publish a family's wedding; the row itself has to say it is public. The wish wall exists only on a page a family published.

## 2. Access control

- **Write paths:** server actions and route handlers only. There is no public write API, so there is no second surface to secure, and every mutation is a typed function with validated input.
- **Validation:** every action slices and normalises its input (`String(formData.get(...)).slice(0, 80)`, numeric coercion, format checks before use). Nothing from a form is interpolated into SQL — `@mazi/store` uses prepared statements exclusively, and `likeTerm()` escapes `%`, `_` and `\` so a search term can never broaden a query.
- **Row ownership (production):** `infrastructure/postgres/001_init.sql` ships **row-level security** policies: `events`, `guests`, `budget_items`, `tasks`, `messages`, `bookings`, `payments`, `ledger_entries` are all scoped so that a customer sees only their own rows and a vendor only rows where `vendor_id` matches. The app currently runs against SQLite with the same checks expressed in the repository layer; moving to Postgres turns them into database-enforced guarantees rather than application ones.
- **Demo identity:** the walkthrough resolves a fixed demo customer/vendor (`apps/web/src/lib/vendor-desk.ts`). This is explicit, isolated in one module, and is replaced by OTP sessions in production — see the roadmap.

## 3. DPDP Act readiness

| Requirement | Implementation |
| --- | --- |
| Purpose limitation | each table exists for a stated purpose; nothing is collected "just in case" |
| Data minimisation | no Aadhaar, no PAN, no bank credentials; phones are stored as given, not enriched or scraped |
| Right of access | `privacy.exportUser(userId)` returns a machine-readable copy of everything held |
| Right to erasure | `privacy.deleteUser(userId)` is the only hard delete in the system; it cascades and returns the list of tables it touched |
| Consent records | `privacy_requests(kind: 'consent-withdraw')` with status and timestamps |
| Retention | audit rows about a booking survive account deletion (accounting duty) but carry no PII beyond ids |
| Children's data | birthday events store a child's name only, and only as part of an invitation the family wrote |
| Breach posture | append-only `audit_log` gives a complete timeline for any entity (`audit_entity_idx`) |

Two product decisions come from the same principle: **no vendor scraping** (vendors are onboarded with evidence we can point to), and **no public "good/bad day" labelling** for anyone's family event.

## 4. Transport and browser hardening

Set globally in `apps/web/next.config.ts`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

- `poweredByHeader: false` — no version disclosure.
- No third-party scripts, no Google Fonts CDN (Devanagari fonts are self-hosted in `apps/web/public/fonts`), no analytics SDK. Nothing on a family's invitation page phones a third party.
- The geolocation permission is kept `(self)` only because the panchang defaults to the guest's nearest city; it is never read without a user action.
- Service worker scope is `/` with an explicit `Service-Worker-Allowed` header, and it **never** caches API responses or any page other than the offline fallback.

When a CSP is added it must allow `'unsafe-inline'` for styles only until Tailwind's build is audited — the honest note is that a strict CSP is on the roadmap, not shipped.

## 5. Money-path integrity as a security property

A ledger that can be tampered with is a security defect, not an accounting one. So:

- `ledger_entries.idempotency_key` and `payments.idempotency_key` are unique — a replayed gateway webhook cannot double-post.
- Ledger rows are append-only; corrections are new postings (`refund`, `settlement`), never edits.
- `reconcileLedger()` asserts the zero-sum invariant and surfaces duplicate keys; the admin console shows it as a red/green health line, so a tampered ledger is visible rather than silent.
- The gateway is treated as evidence: `payments.provider_ref` and `raw` are stored for reconciliation against our own record.
- Commission is computed by `priceQuote()`, never accepted from a client payload.

## 6. Operational security

- **Secrets** live in environment variables (`.env.example` documents every one). Nothing secret is committed; `.gitignore` covers `.env*`, databases, build output.
- **Migrations** are forward-only and idempotent; `db:reset` drops tables in place rather than unlinking a file a running server still holds (which would leave the server writing to a ghost database).
- **Errors** are thrown as Marathi messages meant for a user, never with stack traces to the browser; Next's production error boundary handles the rest.
- **Logs** contain ids and actions, not guest phone numbers.
- **Backups** (production path): managed Postgres point-in-time recovery, plus a nightly logical dump — see `docs/DEPLOYMENT.md`.

## 7. Known gaps, stated plainly

1. No OTP/session layer yet — the demo identity resolver stands in.
2. No CSP header yet (deliberate: it needs a Tailwind build audit first).
3. Rate limiting is per-route header-based (`cache-control`) rather than a token bucket; there is no WAF in front of the app.
4. Row-level security is enforced in Postgres DDL but not yet exercised in CI, because the app runs on SQLite in dev.

Each of these is in `docs/ROADMAP.md` with the trigger that promotes it from "accepted" to "must ship".
