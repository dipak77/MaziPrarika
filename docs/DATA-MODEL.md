# Data model

29 tables, schema **v7**, defined as an ordered list of migrations in `packages/store/src/schema.ts`. `LATEST_SCHEMA_VERSION` is the single source of truth: the app records every applied migration in `schema_migrations` and refuses to guess.

## Conventions that hold everywhere

| Rule | Why |
| --- | --- |
| **Money is `INTEGER` paise** | ₹1,234.56 is `123456`. No float ever touches money — a rounding error in a wedding budget is a customer complaint. |
| **Time is ISO-8601 UTC text** | One format, sortable, unambiguous. Marathi formatting (`formatMarathiDate`, `दुपारी १२:२५`) happens only at the display edge. |
| **Ids are prefixed and meaningful** | `evt_`, `usr_`, `vnd_`, `lead_`, `qt_`, `bk_`, `dsg_`, `led_`, `pay_`, `stl_`, `disp_`. `bk_<quoteId>` is deliberately derivable, which is what makes booking creation idempotent. |
| **Append-only tables** | `audit_log`, `ledger_entries`, `design_versions` — corrections are new rows, never edits. |
| **Foreign keys are on** | `PRAGMA foreign_keys = ON`; the seed is written to satisfy them, so a broken reference fails loudly at seed time rather than silently in production. |
| **Soft state, hard history** | Rows carry current state (`bookings.state`); the journey lives in `bookings.history` (JSON array of `{at, actor, from, to, reason?}`). |

## Table map

```
identity            users · privacy_requests
marketplace         vendors · vendor_packages · vendor_availability · reviews
                    leads · messages · quotes · bookings · payments · settlements · ledger_entries · disputes
events              events · guests · budget_items · tasks · event_wishes
designs             designs · design_versions · print_orders
ads & analytics     ad_campaigns · ad_events · metrics_daily
assistant           assistant_conversations · assistant_messages
governance          audit_log · schema_migrations
```

### Identity

- `users(id, role, name, phone, city, locale, deleted_at)` — roles are `customer | vendor | admin`. `users_phone_idx` keeps OTP lookup O(log n).
- `privacy_requests(id, user_id, kind, status, note, created_at, completed_at)` — DPDP Act requests (`export`, `delete`, `consent-withdraw`), with the handler in `packages/store` (`privacy.exportUser`, `privacy.deleteUser`).

### Events workspace

- `events(id, slug, owner_user_id, event_type, title, host_names, event_date, city, venue_name, venue_address, guest_count_expected, budget_target_paise, status, muhurat, panchang_snapshot, is_public, created_at, updated_at)`
  - `event_type` comes from the Marathi taxonomy (`@mazi/marathi`): wedding, engagement, sakharpuda, haldi, sangeet, birthday, naming, annaprashan, jawal, munja, gruhapravesh, satyanarayan, ganpati, navratri, bhoomipujan, punyatithi, corporate, school, social, other.
  - `muhurat` and `panchang_snapshot` are **stored JSON snapshots**. A guest opening the page in February must see the tithi the family chose the date by — not a recomputation six weeks later against a changed engine version.
  - **`is_public` defaults to `0`.** Discovery is opt-in at the data layer, so no UI bug can ever publish a family's invitation. `events_public_idx` keeps `/events` cheap.
- `guests(id, event_id, name, relation_key, phone, side, rsvp_status, headcount, note, code)` — `relation_key` is a *relational path* (`father.elderBrother` → काका), because Marathi honorifics depend on whose brother it is. `code` is the per-guest RSVP token.
- `budget_items(id, event_id, category, label, estimated_paise, committed_paise, paid_paise, status, due_date)`
- `tasks(id, event_id, title, category, due_date, status, priority, owner, done_at)`
- `event_wishes(id, event_id, guest_name, body, approved, created_at)` — the public wish wall; newest first, capped in the query.

### Marketplace

- `vendors(id, owner_user_id, name, category, city, pincode, tagline, description, starting_price_paise, rating, review_count, rating_breakdown, completed_events, response_rate, verified, evidence, calendar_fresh_at, services, active)`
  - `evidence` is JSON: what we actually checked (GST, Udyam, portfolio, past clients). Trust badges in `@mazi/commerce` are derived from this evidence — a badge that cannot be traced to a row does not exist.
- `vendor_packages(id, vendor_id, name, price_paise, includes, unit, popular)`
- `vendor_availability(id, vendor_id, date, status, hold_expires_at, team_capacity, booked_team_count, notes)` — `status ∈ available | hold | booked | blocked`; unique on `(vendor_id, date)`.
- `leads(id, event_id, vendor_id, customer_user_id, category, message, budget_paise, event_date, guest_count, status, source, sponsored, response_due_at, responded_at, created_at)`
  - `status ∈ new | viewed | responded | quoted | won | lost`; `source ∈ search | ads | ai | category | print`.
  - **`response_due_at` is written at creation** — SLA is a commitment made to the customer, not a statistic computed after the fact.
- `quotes(id, lead_id, vendor_id, event_id, version, items, discount_paise, subtotal_paise, gst_paise, total_paise, valid_till, status, created_at, accepted_at)`
  - Every total is the output of `priceQuote()`; the app never writes a total it did not compute.
- `bookings(id, event_id, vendor_id, lead_id, quote_id, state, event_date, total_paise, advance_paise, commission_paise, history, created_at, confirmed_at, completed_at, cancelled_at)`
- `payments(id, booking_id, kind, provider, provider_ref, amount_paise, status, idempotency_key, raw, created_at, settled_at)` — **unique `idempotency_key`**; the gateway reference is evidence, the row is the record.
- `ledger_entries(id, booking_id, account, amount_paise, memo, idempotency_key, created_at)` — double-entry, signed, unique key per posting.
- `settlements(id, booking_id, vendor_id, amount_paise, status, utr, created_at, paid_at)`
- `disputes(id, booking_id, raised_by, reason, evidence, status, resolution, created_at)`
- `reviews(id, vendor_id, event_id, author_user_id, rating, body, verified_booking, created_at)`

### Ads and analytics

- `ad_campaigns(id, vendor_id, placement, budget_paise, spent_paise, active, targeting, metrics, created_at)`
  - `placement ∈ sponsored-search | featured-category | banner | offer | lead-gen`. Unknown values from the database degrade to `sponsored-search` rather than breaking a request.
  - `targeting` is typed JSON: `{city?, pincode?, eventTypes?, minBudgetPaise?, dateFrom?, dateTo?}`.
- `ad_events(id, campaign_id, kind, city, event_id, cost_paise, created_at)` — `kind ∈ impression | profile_view | lead | quote | booking`.
- `metrics_daily(date, leads, quotes, bookings, gmv_paise, commission_paise, …)` — the 60-day history the admin console charts.

### Designs

- `designs(id, event_id, owner_user_id, name, template_id, preset, scheme, doc, thumbnail, status, version, created_at, updated_at)` — `doc` is canonical **Design JSON v3**.
- `design_versions(id, design_id, version, doc, note, created_at)` — every save; a print dispute has forensic evidence.
- `print_orders(id, design_id, event_id, vendor_id, quantity, preset, finishing, subtotal_paise, gst_paise, total_paise, status, due_date, notes, created_at)`

### Governance

- `audit_log(id, actor, action, entity, entity_id, before, after, at)` — appended by every state change: `lead.responded`, `quote.sent`, `booking.confirmed`, `payment.captured`, `calendar.updated`, `wish.posted`, `seed.loaded`, …

## Indexes (why each exists)

| Index | Query it serves |
| --- | --- |
| `events_public_idx`, `events_date_idx` | `/events` discovery, upcoming-first |
| `leads_vendor_idx`, `leads_event_idx` | the vendor's SLA inbox; an event's vendor desk |
| `quotes_lead_idx` | lead detail (version-ordered) |
| `bookings_vendor_idx`, `bookings_state_idx` | vendor earnings; admin funnel by state |
| `ledger_booking_idx`, `ledger_idem_idx` | reconciliation per booking; duplicate-posting detection |
| `payments_idem_idx` (unique) | idempotent capture |
| `messages_lead_idx` | the enquiry thread |
| `vendor_availability_day_idx` | the 21-day calendar and booking holds |
| `vendors_category_city_idx` | discovery filters |
| `guests_event_idx`, `budget_event_idx`, `tasks_event_idx`, `designs_event_idx` | the event workspace, one screen each |
| `audit_entity_idx` | "what happened to this booking?" |
| `ad_events_campaign_idx` | ROAS and cost-per-lead |
| `users_phone_idx` | OTP login |

## Migrations

| Version | Adds |
| --- | --- |
| 1 | identity, vendors, catalogue (users, vendors, vendor_packages, vendor_availability, reviews) |
| 2 | events workspace (events, guests, budget_items, tasks) |
| 3 | marketplace (leads, messages, quotes, bookings) |
| 4 | money (payments, ledger_entries, settlements, disputes) |
| 5 | designs (designs, design_versions, print_orders) |
| 6 | ads, analytics, assistant, governance (ad_campaigns, ad_events, metrics_daily, assistant_*, audit_log, privacy_requests) |
| 7 | opt-in discovery (events.is_public + index, event_wishes + index) |

Migrations are forward-only and idempotent: re-running `migrate()` is a no-op, and the test suite asserts that applying every migration records exactly `LATEST_SCHEMA_VERSION` rows. `npm run db:reset` **drops tables in place** rather than deleting the file — a running `next dev` holds an open handle, and unlinking it would leave the server writing to a ghost database (a bug we hit, documented, and fixed).

## Retention and deletion

- Events and their guests are the family's private data; nothing is public without an explicit flag.
- `privacy.deleteUser()` is the only hard delete in the system and cascades across every table that references the user.
- `privacy.exportUser()` returns a machine-readable copy of everything held — the DPDP answer, implemented rather than promised.
- Audit rows outlive the records they describe on purpose: a deleted account does not erase the fact that a booking was confirmed.
