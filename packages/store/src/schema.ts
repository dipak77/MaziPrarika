/**
 * @mazi/store — the schema.
 *
 * The same logical model is expressed twice:
 *   • `SQLITE_MIGRATIONS` — the runtime store used for local/preview/SMB scale
 *     (node:sqlite, WAL, FKs on). Zero external services, ₹0 infra.
 *   • `infrastructure/postgres/001_init.sql` — the managed Postgres 18 +
 *     PostGIS + pgvector DDL used once GMV justifies Option A.
 *
 * Conventions enforced here:
 *   • money is INTEGER **paise**, never floating point;
 *   • timestamps are TEXT ISO-8601 UTC;
 *   • every table that a user can lose sleep over is append-friendly (audit,
 *     ledger, design versions) — nothing is destructively overwritten.
 */

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const SQLITE_MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'identity, vendors, catalogue',
    sql: `
CREATE TABLE users (
  id             TEXT PRIMARY KEY,
  role           TEXT NOT NULL CHECK (role IN ('customer','vendor','admin','guest')),
  name           TEXT NOT NULL,
  phone          TEXT,
  email          TEXT,
  city           TEXT,
  locale         TEXT NOT NULL DEFAULT 'mr-IN',
  created_at     TEXT NOT NULL,
  last_seen_at   TEXT
);
CREATE UNIQUE INDEX users_phone_idx ON users(phone) WHERE phone IS NOT NULL;

CREATE TABLE vendors (
  id                    TEXT PRIMARY KEY,
  owner_user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  category              TEXT NOT NULL,
  city                  TEXT NOT NULL,
  pincode               TEXT,
  latitude              REAL,
  longitude             REAL,
  about                 TEXT,
  starting_price_paise  INTEGER NOT NULL DEFAULT 0,
  plan                  TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','growth','pro','enterprise')),
  rating                REAL NOT NULL DEFAULT 0,
  review_count          INTEGER NOT NULL DEFAULT 0,
  bookings_completed    INTEGER NOT NULL DEFAULT 0,
  response_minutes      INTEGER NOT NULL DEFAULT 240,
  identity_verified     INTEGER NOT NULL DEFAULT 0,
  gst_verified          INTEGER NOT NULL DEFAULT 0,
  gst_number            TEXT,
  dispute_count         INTEGER NOT NULL DEFAULT 0,
  calendar_fresh_at     TEXT,
  languages             TEXT NOT NULL DEFAULT '["मराठी","हिंदी","इंग्रजी"]',
  created_at            TEXT NOT NULL
);
CREATE INDEX vendors_category_city_idx ON vendors(category, city);

CREATE TABLE vendor_packages (
  id             TEXT PRIMARY KEY,
  vendor_id      TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  price_paise    INTEGER NOT NULL,
  capacity       INTEGER,
  inclusions     TEXT NOT NULL DEFAULT '[]',
  sort_order     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX vendor_packages_vendor_idx ON vendor_packages(vendor_id);

CREATE TABLE vendor_availability (
  id                TEXT NOT NULL PRIMARY KEY,
  vendor_id         TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date              TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('available','tentative','hold','booked','blocked')),
  hold_expires_at   TEXT,
  team_capacity     INTEGER NOT NULL DEFAULT 1,
  booked_team_count INTEGER NOT NULL DEFAULT 0,
  notes             TEXT,
  updated_at        TEXT NOT NULL
);
CREATE UNIQUE INDEX vendor_availability_day_idx ON vendor_availability(vendor_id, date, status, COALESCE(notes,''));

CREATE TABLE reviews (
  id                TEXT PRIMARY KEY,
  vendor_id         TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  booking_id        TEXT,
  author_name       TEXT NOT NULL,
  rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body              TEXT,
  verified_booking  INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL
);
CREATE INDEX reviews_vendor_idx ON reviews(vendor_id);
`,
  },
  {
    version: 2,
    name: 'events, guests, budget, tasks',
    sql: `
CREATE TABLE events (
  id                    TEXT PRIMARY KEY,
  slug                  TEXT NOT NULL UNIQUE,
  owner_user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type            TEXT NOT NULL,
  title                 TEXT NOT NULL,
  host_names            TEXT NOT NULL DEFAULT '[]',
  event_date            TEXT,
  city                  TEXT NOT NULL,
  venue_name            TEXT,
  venue_address         TEXT,
  guest_count_expected  INTEGER NOT NULL DEFAULT 0,
  budget_target_paise   INTEGER NOT NULL DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','scheduled','completed','cancelled')),
  muhurat               TEXT,
  panchang_snapshot     TEXT,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);
CREATE INDEX events_owner_idx ON events(owner_user_id);
CREATE INDEX events_date_idx ON events(event_date);

CREATE TABLE guests (
  id              TEXT PRIMARY KEY,
  event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  phone           TEXT,
  relation        TEXT,
  side            TEXT CHECK (side IN ('bride','groom','both','host','guest')),
  rsvp_status     TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending','yes','no','maybe')),
  guest_count     INTEGER NOT NULL DEFAULT 1,
  table_no        TEXT,
  code            TEXT NOT NULL UNIQUE,
  invited_at      TEXT,
  responded_at    TEXT,
  notes           TEXT
);
CREATE INDEX guests_event_idx ON guests(event_id);

CREATE TABLE budget_items (
  id               TEXT PRIMARY KEY,
  event_id         TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category         TEXT NOT NULL,
  label            TEXT NOT NULL,
  estimated_paise  INTEGER NOT NULL DEFAULT 0,
  committed_paise  INTEGER NOT NULL DEFAULT 0,
  paid_paise       INTEGER NOT NULL DEFAULT 0,
  vendor_id        TEXT REFERENCES vendors(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','quoted','committed','paid')),
  due_date         TEXT
);
CREATE INDEX budget_event_idx ON budget_items(event_id);

CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  event_id    TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'सामान्य',
  due_date    TEXT,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','skipped')),
  priority    INTEGER NOT NULL DEFAULT 2,
  owner       TEXT,
  created_at  TEXT NOT NULL,
  done_at     TEXT
);
CREATE INDEX tasks_event_idx ON tasks(event_id, status);
`,
  },
  {
    version: 3,
    name: 'designs, versions, print orders',
    sql: `
CREATE TABLE designs (
  id             TEXT PRIMARY KEY,
  event_id       TEXT REFERENCES events(id) ON DELETE SET NULL,
  owner_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  template_id    TEXT,
  preset         TEXT NOT NULL DEFAULT 'invitation-5x7',
  scheme         TEXT NOT NULL DEFAULT 'traditional',
  version        INTEGER NOT NULL DEFAULT 1,
  doc            TEXT NOT NULL,
  preview_svg    TEXT,
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','approved','printing','archived')),
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);
CREATE INDEX designs_event_idx ON designs(event_id);
CREATE INDEX designs_owner_idx ON designs(owner_user_id, updated_at DESC);

CREATE TABLE design_versions (
  id          TEXT PRIMARY KEY,
  design_id   TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL,
  doc         TEXT NOT NULL,
  note        TEXT,
  created_at  TEXT NOT NULL
);
CREATE UNIQUE INDEX design_versions_idx ON design_versions(design_id, version);

CREATE TABLE print_orders (
  id                TEXT PRIMARY KEY,
  event_id          TEXT REFERENCES events(id) ON DELETE SET NULL,
  design_id         TEXT NOT NULL REFERENCES designs(id) ON DELETE RESTRICT,
  vendor_id         TEXT REFERENCES vendors(id) ON DELETE SET NULL,
  quantity          INTEGER NOT NULL,
  paper             TEXT NOT NULL DEFAULT 'मॅट ३०० GSM',
  finishing         TEXT NOT NULL DEFAULT '[]',
  express           INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed','proofing','approved','printing','dispatched','delivered','cancelled')),
  unit_price_paise  INTEGER NOT NULL DEFAULT 0,
  shipping_paise    INTEGER NOT NULL DEFAULT 0,
  total_paise       INTEGER NOT NULL DEFAULT 0,
  proof_url         TEXT,
  tracking          TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
CREATE INDEX print_orders_event_idx ON print_orders(event_id);
`,
  },
  {
    version: 4,
    name: 'marketplace: leads, quotes, threads',
    sql: `
CREATE TABLE leads (
  id                 TEXT PRIMARY KEY,
  event_id           TEXT REFERENCES events(id) ON DELETE SET NULL,
  vendor_id          TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_user_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  category           TEXT NOT NULL,
  message            TEXT,
  budget_paise       INTEGER,
  event_date         TEXT,
  guest_count        INTEGER,
  status             TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','viewed','responded','quoting','quoted','won','lost','expired')),
  source             TEXT NOT NULL DEFAULT 'search' CHECK (source IN ('search','category','ai','ads','referral','print')),
  sponsored          INTEGER NOT NULL DEFAULT 0,
  response_due_at    TEXT NOT NULL,
  responded_at       TEXT,
  created_at         TEXT NOT NULL
);
CREATE INDEX leads_vendor_idx ON leads(vendor_id, status, created_at DESC);
CREATE INDEX leads_event_idx ON leads(event_id);

CREATE TABLE quotes (
  id              TEXT PRIMARY KEY,
  lead_id         TEXT REFERENCES leads(id) ON DELETE SET NULL,
  vendor_id       TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_id        TEXT REFERENCES events(id) ON DELETE SET NULL,
  version         INTEGER NOT NULL DEFAULT 1,
  items           TEXT NOT NULL,
  discount_paise  INTEGER NOT NULL DEFAULT 0,
  subtotal_paise  INTEGER NOT NULL DEFAULT 0,
  gst_paise       INTEGER NOT NULL DEFAULT 0,
  total_paise     INTEGER NOT NULL DEFAULT 0,
  valid_till      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  created_at      TEXT NOT NULL,
  accepted_at     TEXT
);
CREATE INDEX quotes_lead_idx ON quotes(lead_id);

CREATE TABLE messages (
  id           TEXT PRIMARY KEY,
  lead_id      TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sender       TEXT NOT NULL CHECK (sender IN ('customer','vendor','system')),
  body         TEXT NOT NULL,
  attachments  TEXT NOT NULL DEFAULT '[]',
  read_at      TEXT,
  created_at   TEXT NOT NULL
);
CREATE INDEX messages_lead_idx ON messages(lead_id, created_at);
`,
  },
  {
    version: 5,
    name: 'bookings, payments, ledger, settlements, disputes',
    sql: `
CREATE TABLE bookings (
  id             TEXT PRIMARY KEY,
  event_id       TEXT REFERENCES events(id) ON DELETE SET NULL,
  vendor_id      TEXT NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  lead_id        TEXT REFERENCES leads(id) ON DELETE SET NULL,
  quote_id       TEXT REFERENCES quotes(id) ON DELETE SET NULL,
  state          TEXT NOT NULL,
  event_date     TEXT NOT NULL,
  total_paise    INTEGER NOT NULL,
  advance_paise  INTEGER NOT NULL DEFAULT 0,
  commission_paise INTEGER NOT NULL DEFAULT 0,
  history        TEXT NOT NULL DEFAULT '[]',
  created_at     TEXT NOT NULL,
  confirmed_at   TEXT,
  completed_at   TEXT,
  cancelled_at   TEXT
);
CREATE INDEX bookings_vendor_idx ON bookings(vendor_id, event_date);
CREATE INDEX bookings_state_idx ON bookings(state);

CREATE TABLE payments (
  id            TEXT PRIMARY KEY,
  booking_id    TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN ('advance','balance','refund')),
  provider      TEXT NOT NULL DEFAULT 'simulated',
  provider_ref  TEXT,
  amount_paise  INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','authorized','captured','failed','refunded')),
  idempotency_key TEXT NOT NULL,
  raw           TEXT,
  created_at    TEXT NOT NULL,
  settled_at    TEXT
);
CREATE UNIQUE INDEX payments_idem_idx ON payments(idempotency_key);

CREATE TABLE ledger_entries (
  id               TEXT PRIMARY KEY,
  booking_id       TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  account          TEXT NOT NULL,
  amount_paise     INTEGER NOT NULL,
  memo             TEXT NOT NULL,
  idempotency_key  TEXT NOT NULL,
  created_at       TEXT NOT NULL
);
CREATE INDEX ledger_booking_idx ON ledger_entries(booking_id);
CREATE UNIQUE INDEX ledger_idem_idx ON ledger_entries(idempotency_key);

CREATE TABLE settlements (
  id            TEXT PRIMARY KEY,
  booking_id    TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  vendor_id     TEXT NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  amount_paise  INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed')),
  utr           TEXT,
  created_at    TEXT NOT NULL,
  paid_at       TEXT
);

CREATE TABLE disputes (
  id           TEXT PRIMARY KEY,
  booking_id   TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  raised_by    TEXT NOT NULL CHECK (raised_by IN ('customer','vendor','admin')),
  reason       TEXT NOT NULL,
  evidence     TEXT NOT NULL DEFAULT '[]',
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','rejected')),
  resolution   TEXT,
  created_at   TEXT NOT NULL,
  resolved_at  TEXT
);
`,
  },
  {
    version: 6,
    name: 'ads, analytics, assistant, audit',
    sql: `
CREATE TABLE ad_campaigns (
  id             TEXT PRIMARY KEY,
  vendor_id      TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  placement      TEXT NOT NULL,
  budget_paise   INTEGER NOT NULL DEFAULT 0,
  spent_paise    INTEGER NOT NULL DEFAULT 0,
  targeting      TEXT NOT NULL DEFAULT '{}',
  metrics        TEXT NOT NULL DEFAULT '{}',
  active         INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL
);

CREATE TABLE ad_events (
  id           TEXT PRIMARY KEY,
  campaign_id  TEXT NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL CHECK (kind IN ('impression','profile_view','lead','quote','booking')),
  city         TEXT,
  event_id     TEXT,
  occurred_at  TEXT NOT NULL
);
CREATE INDEX ad_events_campaign_idx ON ad_events(campaign_id, kind);

CREATE TABLE metrics_daily (
  date                     TEXT PRIMARY KEY,
  new_events               INTEGER NOT NULL DEFAULT 0,
  active_events            INTEGER NOT NULL DEFAULT 0,
  published_invitations    INTEGER NOT NULL DEFAULT 0,
  leads                    INTEGER NOT NULL DEFAULT 0,
  quotes                   INTEGER NOT NULL DEFAULT 0,
  bookings                 INTEGER NOT NULL DEFAULT 0,
  gmv_paise                INTEGER NOT NULL DEFAULT 0,
  commission_paise         INTEGER NOT NULL DEFAULT 0,
  median_response_minutes  INTEGER NOT NULL DEFAULT 0,
  booking_conversion       REAL NOT NULL DEFAULT 0,
  sponsored_impressions    INTEGER NOT NULL DEFAULT 0,
  organic_impressions      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE assistant_conversations (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  event_id    TEXT REFERENCES events(id) ON DELETE SET NULL,
  title       TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE assistant_messages (
  id               TEXT PRIMARY KEY,
  conversation_id  TEXT NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content          TEXT NOT NULL,
  tool_calls       TEXT NOT NULL DEFAULT '[]',
  provider         TEXT,
  model            TEXT,
  tokens_in        INTEGER NOT NULL DEFAULT 0,
  tokens_out       INTEGER NOT NULL DEFAULT 0,
  cost_usd         REAL NOT NULL DEFAULT 0,
  latency_ms       INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL
);
CREATE INDEX assistant_messages_conv_idx ON assistant_messages(conversation_id, created_at);

CREATE TABLE audit_log (
  id           TEXT PRIMARY KEY,
  actor        TEXT NOT NULL,
  action       TEXT NOT NULL,
  entity       TEXT NOT NULL,
  entity_id    TEXT,
  before       TEXT,
  after        TEXT,
  at           TEXT NOT NULL
);
CREATE INDEX audit_entity_idx ON audit_log(entity, entity_id, at DESC);

CREATE TABLE privacy_requests (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL CHECK (kind IN ('export','delete','consent-withdraw')),
  status       TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','processing','completed','rejected')),
  note         TEXT,
  created_at   TEXT NOT NULL,
  completed_at TEXT
);
`,
  },
  {
    version: 7,
    name: 'event discovery opt-in',
    sql: `
-- Public discovery is opt-in and off by default: a family's wedding is private
-- unless they explicitly choose to showcase it. Guests reach their own event
-- through its secret link, never through a public index.
ALTER TABLE events ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0;
CREATE INDEX events_public_idx ON events(is_public, event_date);

-- Guest wishes left on the public page (kept separate from vendor threads,
-- which are commercial conversations).
CREATE TABLE event_wishes (
  id         TEXT PRIMARY KEY,
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_name TEXT,
  body       TEXT NOT NULL,
  approved   INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX event_wishes_idx ON event_wishes(event_id, created_at DESC);
`,
  },
];

export const LATEST_SCHEMA_VERSION = SQLITE_MIGRATIONS[SQLITE_MIGRATIONS.length - 1]!.version;
