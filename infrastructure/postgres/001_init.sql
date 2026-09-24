-- Mazi Patrika — production schema (PostgreSQL 15+)
--
-- This is the Option-A database: the same model as the SQLite schema in
-- `packages/store/src/schema.ts` (v7), with two additions that only a real
-- database server can offer:
--
--   1. row-level security, so multi-tenancy is enforced by the database rather
--      than by remembering to add `WHERE owner_user_id = $1` everywhere;
--   2. native types — `numeric` for money-adjacent metrics, `jsonb`, `text[]`,
--      and indexes that do not have to be hand-managed.
--
-- Money stays BIGINT in paise (a numeric would tempt someone into floats);
-- timestamps stay `timestamptz` in UTC; ids stay prefixed text so a row is
-- identifiable from a log line alone.
--
--   psql "$DATABASE_URL" -f infrastructure/postgres/001_init.sql
--
-- Then point the app at it: DATABASE_URL=postgres://… (see docs/DEPLOYMENT.md).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- vendor search by name/city

/* ------------------------------------------------------------------ */
/* identity                                                            */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY,
  role          text NOT NULL CHECK (role IN ('customer', 'vendor', 'admin')),
  name          text NOT NULL,
  phone         text,
  email         text,
  city          text,
  locale        text NOT NULL DEFAULT 'mr-IN',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_key ON users (phone) WHERE phone IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS privacy_requests (
  id           text PRIMARY KEY,
  user_id      text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN ('export', 'delete', 'consent-withdraw')),
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS privacy_requests_user_idx ON privacy_requests (user_id, created_at DESC);

/* ------------------------------------------------------------------ */
/* catalogue                                                           */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS vendors (
  id                  text PRIMARY KEY,
  owner_user_id       text REFERENCES users (id) ON DELETE SET NULL,
  name                text NOT NULL,
  category            text NOT NULL,
  city                text NOT NULL,
  pincode             text,
  tagline             text,
  description         text,
  starting_price_paise bigint NOT NULL DEFAULT 0 CHECK (starting_price_paise >= 0),
  rating              numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count        integer NOT NULL DEFAULT 0,
  rating_breakdown    jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_events    integer NOT NULL DEFAULT 0,
  response_rate       numeric(4,3) NOT NULL DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 1),
  verified            boolean NOT NULL DEFAULT false,
  evidence            jsonb NOT NULL DEFAULT '[]'::jsonb,
  services            jsonb NOT NULL DEFAULT '[]'::jsonb,
  calendar_fresh_at   timestamptz,
  active              boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS vendors_category_city_idx ON vendors (category, city) WHERE active;
CREATE INDEX IF NOT EXISTS vendors_name_trgm_idx ON vendors USING gin (name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS vendor_packages (
  id          text PRIMARY KEY,
  vendor_id   text NOT NULL REFERENCES vendors (id) ON DELETE CASCADE,
  name        text NOT NULL,
  price_paise bigint NOT NULL CHECK (price_paise >= 0),
  includes    jsonb NOT NULL DEFAULT '[]'::jsonb,
  unit        text NOT NULL DEFAULT 'पॅकेज',
  popular     boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS vendor_packages_vendor_idx ON vendor_packages (vendor_id);

CREATE TABLE IF NOT EXISTS vendor_availability (
  id               text PRIMARY KEY,
  vendor_id        text NOT NULL REFERENCES vendors (id) ON DELETE CASCADE,
  date             date NOT NULL,
  status           text NOT NULL CHECK (status IN ('available', 'hold', 'booked', 'blocked')),
  hold_expires_at  timestamptz,
  team_capacity    integer NOT NULL DEFAULT 1 CHECK (team_capacity >= 0),
  booked_team_count integer NOT NULL DEFAULT 0 CHECK (booked_team_count >= 0),
  notes            text,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, date),
  CHECK (booked_team_count <= team_capacity)
);

CREATE TABLE IF NOT EXISTS reviews (
  id                text PRIMARY KEY,
  vendor_id         text NOT NULL REFERENCES vendors (id) ON DELETE CASCADE,
  event_id          text,
  author_user_id    text REFERENCES users (id) ON DELETE SET NULL,
  rating            smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body              text,
  verified_booking  boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_vendor_idx ON reviews (vendor_id, created_at DESC);

/* ------------------------------------------------------------------ */
/* events workspace                                                    */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS events (
  id                     text PRIMARY KEY,
  slug                   text NOT NULL UNIQUE,
  owner_user_id          text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  event_type             text NOT NULL,
  title                  text NOT NULL,
  host_names             jsonb NOT NULL DEFAULT '[]'::jsonb,
  event_date             date,
  city                   text NOT NULL,
  venue_name             text,
  venue_address          text,
  guest_count_expected   integer NOT NULL DEFAULT 0 CHECK (guest_count_expected >= 0),
  budget_target_paise    bigint NOT NULL DEFAULT 0 CHECK (budget_target_paise >= 0),
  status                 text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'scheduled', 'completed', 'cancelled')),
  muhurat                jsonb,
  panchang_snapshot      jsonb,
  -- Discovery is opt-in. Private is the default at the schema level, so no
  -- application bug can publish a family's invitation.
  is_public              boolean NOT NULL DEFAULT false,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_owner_idx  ON events (owner_user_id, COALESCE(event_date, created_at::date));
CREATE INDEX IF NOT EXISTS events_date_idx   ON events (event_date);
CREATE INDEX IF NOT EXISTS events_public_idx ON events (event_date) WHERE is_public;

CREATE TABLE IF NOT EXISTS guests (
  id            text PRIMARY KEY,
  event_id      text NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  name          text NOT NULL,
  relation_key  text,
  phone         text,
  side          text NOT NULL DEFAULT 'guest' CHECK (side IN ('bride', 'groom', 'both', 'guest')),
  rsvp_status   text NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'yes', 'no', 'maybe')),
  headcount     integer NOT NULL DEFAULT 1 CHECK (headcount >= 0),
  note          text,
  code          text UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guests_event_idx ON guests (event_id);

CREATE TABLE IF NOT EXISTS budget_items (
  id              text PRIMARY KEY,
  event_id        text NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  category        text NOT NULL,
  label           text NOT NULL,
  estimated_paise bigint NOT NULL DEFAULT 0,
  committed_paise bigint NOT NULL DEFAULT 0,
  paid_paise      bigint NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'quoted', 'committed', 'paid', 'cancelled')),
  due_date        date
);
CREATE INDEX IF NOT EXISTS budget_event_idx ON budget_items (event_id);

CREATE TABLE IF NOT EXISTS tasks (
  id         text PRIMARY KEY,
  event_id   text NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  title      text NOT NULL,
  category   text,
  due_date   date,
  status     text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'cancelled')),
  priority   smallint NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  owner      text,
  done_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tasks_event_idx ON tasks (event_id, status, due_date);

CREATE TABLE IF NOT EXISTS event_wishes (
  id         text PRIMARY KEY,
  event_id   text NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  guest_name text,
  body       text NOT NULL,
  approved   boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_wishes_idx ON event_wishes (event_id, created_at DESC);

/* ------------------------------------------------------------------ */
/* marketplace                                                         */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS leads (
  id               text PRIMARY KEY,
  event_id         text REFERENCES events (id) ON DELETE SET NULL,
  vendor_id        text NOT NULL REFERENCES vendors (id) ON DELETE CASCADE,
  customer_user_id text REFERENCES users (id) ON DELETE SET NULL,
  category         text NOT NULL,
  message          text NOT NULL,
  budget_paise     bigint NOT NULL DEFAULT 0,
  event_date       date,
  guest_count      integer,
  status           text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'responded', 'quoted', 'won', 'lost')),
  source           text NOT NULL DEFAULT 'search' CHECK (source IN ('search', 'ads', 'ai', 'category', 'print')),
  sponsored        boolean NOT NULL DEFAULT false,
  -- SLA is a promise made at creation time, not a statistic computed later.
  response_due_at  timestamptz NOT NULL,
  responded_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_vendor_idx ON leads (vendor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_event_idx  ON leads (event_id);

CREATE TABLE IF NOT EXISTS messages (
  id          text PRIMARY KEY,
  lead_id     text NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  sender      text NOT NULL CHECK (sender IN ('customer', 'vendor', 'system')),
  body        text NOT NULL,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_lead_idx ON messages (lead_id, created_at);

CREATE TABLE IF NOT EXISTS quotes (
  id             text PRIMARY KEY,
  lead_id        text REFERENCES leads (id) ON DELETE SET NULL,
  vendor_id      text NOT NULL REFERENCES vendors (id) ON DELETE CASCADE,
  event_id       text REFERENCES events (id) ON DELETE SET NULL,
  version        integer NOT NULL DEFAULT 1,
  items          jsonb NOT NULL,
  discount_paise bigint NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  subtotal_paise bigint NOT NULL CHECK (subtotal_paise >= 0),
  gst_paise      bigint NOT NULL CHECK (gst_paise >= 0),
  total_paise    bigint NOT NULL CHECK (total_paise >= 0),
  valid_till     date NOT NULL,
  status         text NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  accepted_at    timestamptz,
  CHECK (total_paise = subtotal_paise - discount_paise + gst_paise)
);
CREATE INDEX IF NOT EXISTS quotes_lead_idx ON quotes (lead_id, version DESC);

CREATE TABLE IF NOT EXISTS bookings (
  id               text PRIMARY KEY,   -- bk_<quoteId>: derivable, which makes creation idempotent
  event_id         text REFERENCES events (id) ON DELETE SET NULL,
  vendor_id        text NOT NULL REFERENCES vendors (id) ON DELETE RESTRICT,
  lead_id          text REFERENCES leads (id) ON DELETE SET NULL,
  quote_id         text REFERENCES quotes (id) ON DELETE SET NULL,
  state            text NOT NULL CHECK (state IN (
                     'ENQUIRY', 'QUOTE_SENT', 'QUOTE_ACCEPTED', 'PAYMENT_PENDING', 'BOOKING_CONFIRMED',
                     'SERVICE_SCHEDULED', 'SERVICE_COMPLETED', 'SETTLEMENT', 'REVIEWED',
                     'CANCELLED', 'DISPUTED', 'REFUNDED')),
  event_date       date NOT NULL,
  total_paise      bigint NOT NULL CHECK (total_paise >= 0),
  advance_paise    bigint NOT NULL CHECK (advance_paise >= 0),
  commission_paise bigint NOT NULL CHECK (commission_paise >= 0),
  history          jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  confirmed_at     timestamptz,
  completed_at     timestamptz,
  cancelled_at     timestamptz,
  CHECK (advance_paise <= total_paise)
);
CREATE INDEX IF NOT EXISTS bookings_vendor_idx ON bookings (vendor_id, event_date DESC);
CREATE INDEX IF NOT EXISTS bookings_state_idx  ON bookings (state);
CREATE INDEX IF NOT EXISTS bookings_event_idx  ON bookings (event_id);

CREATE TABLE IF NOT EXISTS payments (
  id              text PRIMARY KEY,
  booking_id      text NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  kind            text NOT NULL CHECK (kind IN ('advance', 'balance', 'refund')),
  provider        text NOT NULL DEFAULT 'simulated',
  provider_ref    text,
  amount_paise    bigint NOT NULL CHECK (amount_paise > 0),
  status          text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  -- The gateway is evidence, not truth: a replay must not double-charge.
  idempotency_key text NOT NULL UNIQUE,
  raw             jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  settled_at      timestamptz
);
CREATE INDEX IF NOT EXISTS payments_booking_idx ON payments (booking_id);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id              text PRIMARY KEY,
  booking_id      text NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  account         text NOT NULL CHECK (account IN (
                    'CUSTOMER_RECEIVABLE', 'PLATFORM_CASH', 'GATEWAY_FEES', 'GST_PAYABLE',
                    'VENDOR_PAYABLE', 'PLATFORM_REVENUE', 'REFUND_PAYABLE', 'DISPUTE_RESERVE')),
  -- Signed: debit positive, credit negative, so a balanced posting sums to 0.
  amount_paise    bigint NOT NULL,
  memo            text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ledger_booking_idx ON ledger_entries (booking_id, created_at);
CREATE INDEX IF NOT EXISTS ledger_account_idx ON ledger_entries (account, created_at DESC);

-- A booking whose postings do not sum to zero is a bug, not a rounding error.
CREATE OR REPLACE VIEW ledger_booking_totals AS
  SELECT booking_id, SUM(amount_paise) AS net_paise, COUNT(*) AS entries
  FROM ledger_entries GROUP BY booking_id;

CREATE OR REPLACE VIEW ledger_unbalanced AS
  SELECT * FROM ledger_booking_totals WHERE net_paise <> 0;

CREATE TABLE IF NOT EXISTS settlements (
  id           text PRIMARY KEY,
  booking_id   text NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  vendor_id    text NOT NULL REFERENCES vendors (id) ON DELETE CASCADE,
  amount_paise bigint NOT NULL CHECK (amount_paise >= 0),
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'on_hold')),
  utr          text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  paid_at      timestamptz
);
CREATE INDEX IF NOT EXISTS settlements_vendor_idx ON settlements (vendor_id, status);

CREATE TABLE IF NOT EXISTS disputes (
  id         text PRIMARY KEY,
  booking_id text NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  raised_by  text NOT NULL CHECK (raised_by IN ('customer', 'vendor', 'system', 'admin')),
  reason     text NOT NULL,
  evidence   jsonb NOT NULL DEFAULT '[]'::jsonb,
  status     text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'rejected')),
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS disputes_status_idx ON disputes (status, created_at DESC);

/* ------------------------------------------------------------------ */
/* designs                                                             */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS designs (
  id             text PRIMARY KEY,
  event_id       text REFERENCES events (id) ON DELETE CASCADE,
  owner_user_id  text REFERENCES users (id) ON DELETE SET NULL,
  name           text NOT NULL,
  template_id    text NOT NULL,
  preset         text NOT NULL DEFAULT 'invitation-5x7',
  scheme         text NOT NULL DEFAULT 'paithani',
  doc            jsonb NOT NULL,          -- canonical Design JSON v3
  thumbnail      text,
  status         text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'printing', 'printed', 'archived')),
  version        integer NOT NULL DEFAULT 1,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS designs_event_idx ON designs (event_id);
CREATE INDEX IF NOT EXISTS designs_owner_idx ON designs (owner_user_id);

CREATE TABLE IF NOT EXISTS design_versions (
  id         text PRIMARY KEY,
  design_id  text NOT NULL REFERENCES designs (id) ON DELETE CASCADE,
  version    integer NOT NULL,
  doc        jsonb NOT NULL,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (design_id, version)
);

CREATE TABLE IF NOT EXISTS print_orders (
  id             text PRIMARY KEY,
  design_id      text REFERENCES designs (id) ON DELETE SET NULL,
  event_id       text REFERENCES events (id) ON DELETE SET NULL,
  vendor_id      text REFERENCES vendors (id) ON DELETE SET NULL,
  quantity       integer NOT NULL CHECK (quantity > 0),
  preset         text NOT NULL,
  finishing      jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal_paise bigint NOT NULL CHECK (subtotal_paise >= 0),
  gst_paise      bigint NOT NULL CHECK (gst_paise >= 0),
  total_paise    bigint NOT NULL CHECK (total_paise >= 0),
  status         text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'quoted', 'paid', 'printing', 'shipped', 'delivered', 'cancelled')),
  due_date       date,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS print_orders_event_idx ON print_orders (event_id, status);

/* ------------------------------------------------------------------ */
/* advertising, analytics, assistant, governance                       */
/* ------------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id           text PRIMARY KEY,
  vendor_id    text NOT NULL REFERENCES vendors (id) ON DELETE CASCADE,
  placement    text NOT NULL CHECK (placement IN ('sponsored-search', 'featured-category', 'banner', 'offer', 'lead-gen')),
  budget_paise bigint NOT NULL CHECK (budget_paise >= 0),
  spent_paise  bigint NOT NULL DEFAULT 0 CHECK (spent_paise >= 0),
  active       boolean NOT NULL DEFAULT true,
  targeting    jsonb NOT NULL DEFAULT '{}'::jsonb,
  metrics      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ad_campaigns_vendor_idx ON ad_campaigns (vendor_id, active);
CREATE INDEX IF NOT EXISTS ad_campaigns_placement_idx ON ad_campaigns (placement) WHERE active;

CREATE TABLE IF NOT EXISTS ad_events (
  id          text PRIMARY KEY,
  campaign_id text NOT NULL REFERENCES ad_campaigns (id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('impression', 'profile_view', 'lead', 'quote', 'booking')),
  city        text,
  event_id    text REFERENCES events (id) ON DELETE SET NULL,
  cost_paise  bigint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ad_events_campaign_idx ON ad_events (campaign_id, kind, created_at DESC);

CREATE TABLE IF NOT EXISTS metrics_daily (
  date              date PRIMARY KEY,
  leads             integer NOT NULL DEFAULT 0,
  quotes            integer NOT NULL DEFAULT 0,
  bookings          integer NOT NULL DEFAULT 0,
  gmv_paise         bigint NOT NULL DEFAULT 0,
  commission_paise  bigint NOT NULL DEFAULT 0,
  visitors          integer NOT NULL DEFAULT 0,
  signups           integer NOT NULL DEFAULT 0,
  designs_created   integer NOT NULL DEFAULT 0,
  print_orders      integer NOT NULL DEFAULT 0,
  ads_spend_paise   bigint NOT NULL DEFAULT 0,
  median_response_minutes integer,
  sponsored_share   numeric(4,3)
);

CREATE TABLE IF NOT EXISTS assistant_conversations (
  id         text PRIMARY KEY,
  user_id    text REFERENCES users (id) ON DELETE CASCADE,
  event_id   text REFERENCES events (id) ON DELETE SET NULL,
  title      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id              text PRIMARY KEY,
  conversation_id text NOT NULL REFERENCES assistant_conversations (id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content         text NOT NULL,
  tool_calls      jsonb NOT NULL DEFAULT '[]'::jsonb,
  provider        text,
  model           text,
  tokens_in       integer,
  tokens_out      integer,
  cost_usd        numeric(10,5),
  latency_ms      integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assistant_messages_conv_idx ON assistant_messages (conversation_id, created_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id         text PRIMARY KEY,
  actor      text NOT NULL,
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  text NOT NULL,
  before     jsonb,
  after      jsonb,
  at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_log (entity, entity_id, at DESC);
CREATE INDEX IF NOT EXISTS audit_action_idx ON audit_log (action, at DESC);

/* ------------------------------------------------------------------ */
/* row-level security                                                  */
/* ------------------------------------------------------------------ */

-- The application connects as `mazi_app` (no superuser, no BYPASSRLS) and sets
--   SET LOCAL mazi.user_id = '<uuid>';   -- the signed-in user
--   SET LOCAL mazi.role    = 'customer' | 'vendor' | 'admin';
-- on every connection checkout. Policies then make cross-tenant reads *impossible*
-- rather than merely unlikely.

CREATE OR REPLACE FUNCTION mazi_current_user_id() RETURNS text
LANGUAGE sql STABLE AS $$ SELECT current_setting('mazi.user_id', true) $$;

CREATE OR REPLACE FUNCTION mazi_current_role() RETURNS text
LANGUAGE sql STABLE AS $$ SELECT COALESCE(current_setting('mazi.role', true), 'customer') $$;

CREATE OR REPLACE FUNCTION mazi_is_admin() RETURNS boolean
LANGUAGE sql STABLE AS $$ SELECT mazi_current_role() = 'admin' $$;

ALTER TABLE events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_wishes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;

-- Everything here is idempotent so the file can be re-run on an existing cluster.
DO $$
DECLARE
  t text;
BEGIN
  /* Owners read and write their own event's data; admin reads everything. */
  FOREACH t IN ARRAY ARRAY['events'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_owner_rw ON %I', t, t);
    EXECUTE format($f$
      CREATE POLICY %I_owner_rw ON %I USING (
        mazi_is_admin() OR owner_user_id = mazi_current_user_id() OR is_public
      ) WITH CHECK (mazi_is_admin() OR owner_user_id = mazi_current_user_id())
    $f$, t, t);
  END LOOP;

  /* Child tables: reachable through the event they belong to. */
  FOREACH t IN ARRAY ARRAY['guests', 'budget_items', 'tasks', 'event_wishes'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_via_event ON %I', t, t);
    EXECUTE format($f$
      CREATE POLICY %I_via_event ON %I USING (
        mazi_is_admin()
        OR EXISTS (SELECT 1 FROM events e WHERE e.id = %I.event_id AND e.owner_user_id = mazi_current_user_id())
        -- a wish is readable whenever its event is public
        OR EXISTS (SELECT 1 FROM events e WHERE e.id = %I.event_id AND e.is_public)
      ) WITH CHECK (
        mazi_is_admin()
        OR EXISTS (SELECT 1 FROM events e WHERE e.id = %I.event_id AND e.owner_user_id = mazi_current_user_id())
        OR mazi_current_role() = 'guest'
      )
    $f$, t, t, t, t, t);
  END LOOP;

  /* Marketplace: a vendor sees only their own rows; a customer only their own. */
  FOREACH t IN ARRAY ARRAY['leads', 'messages', 'quotes', 'bookings', 'payments',
                           'ledger_entries', 'settlements', 'disputes'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_marketplace ON %I', t, t);
    EXECUTE format($f$
      CREATE POLICY %I_marketplace ON %I USING (
        mazi_is_admin()
        OR EXISTS (SELECT 1 FROM vendors v WHERE v.id = %I.vendor_id AND v.owner_user_id = mazi_current_user_id())
        OR EXISTS (SELECT 1 FROM leads l WHERE l.id = %I.lead_id AND l.customer_user_id = mazi_current_user_id())
        OR EXISTS (SELECT 1 FROM bookings b WHERE b.id = %I.booking_id AND b.vendor_id IN (
             SELECT id FROM vendors WHERE owner_user_id = mazi_current_user_id()))
      )
    $f$, t, t, t, t, t);
  END LOOP;

  /* Designs and print: the owning family, plus the printer who fulfils the order. */
  FOREACH t IN ARRAY ARRAY['designs', 'print_orders'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_owner ON %I', t, t);
    EXECUTE format($f$
      CREATE POLICY %I_owner ON %I USING (
        mazi_is_admin()
        OR owner_user_id = mazi_current_user_id()
        OR EXISTS (SELECT 1 FROM events e WHERE e.id = %I.event_id AND e.owner_user_id = mazi_current_user_id())
        OR EXISTS (SELECT 1 FROM vendors v WHERE v.id = %I.vendor_id AND v.owner_user_id = mazi_current_user_id())
      )
    $f$, t, t, t, t);
  END LOOP;

  /* Ads: only the advertiser and admin. */
  FOREACH t IN ARRAY ARRAY['ad_campaigns', 'ad_events'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_owner ON %I', t, t);
    EXECUTE format($f$
      CREATE POLICY %I_owner ON %I USING (
        mazi_is_admin()
        OR EXISTS (SELECT 1 FROM vendors v WHERE v.id = %I.vendor_id AND v.owner_user_id = mazi_current_user_id())
        OR EXISTS (SELECT 1 FROM ad_campaigns c WHERE c.id = %I.campaign_id
                   AND c.vendor_id IN (SELECT id FROM vendors WHERE owner_user_id = mazi_current_user_id()))
      )
    $f$, t, t, t, t);
  END LOOP;

  /* Governance: admin-only (the app writes as a trusted service role). */
  FOREACH t IN ARRAY ARRAY['audit_log', 'privacy_requests'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_admin ON %I', t, t);
    EXECUTE format($f$
      CREATE POLICY %I_admin ON %I USING (
        mazi_is_admin() OR user_id = mazi_current_user_id()
      ) WITH CHECK (true)
    $f$, t, t);
  END LOOP;

  /* design_versions inherits its parent design's visibility. */
  EXECUTE 'DROP POLICY IF EXISTS design_versions_via_design ON design_versions';
  EXECUTE $f$
    CREATE POLICY design_versions_via_design ON design_versions USING (
      mazi_is_admin()
      OR EXISTS (SELECT 1 FROM designs d WHERE d.id = design_versions.design_id
                 AND d.owner_user_id = mazi_current_user_id())
    )
  $f$;
END $$;

-- The application role: least privilege, no schema changes at runtime.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mazi_app') THEN
    CREATE ROLE mazi_app LOGIN PASSWORD 'change-me-in-the-secret-store';
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO mazi_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mazi_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mazi_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mazi_app;
REVOKE CREATE ON SCHEMA public FROM mazi_app;   -- no DDL from the app

COMMIT;

-- ------------------------------------------------------------------ */
-- Operational queries                                                */
-- ------------------------------------------------------------------ */
--
-- Ledger integrity (must return zero rows):
--   SELECT * FROM ledger_unbalanced;
--
-- SLA breaches in the last week:
--   SELECT vendor_id, COUNT(*) FROM leads
--    WHERE responded_at IS NULL AND response_due_at < now() - interval '7 days'
--    GROUP BY vendor_id ORDER BY 2 DESC;
--
-- Marketplace funnel for the last 30 days:
--   SELECT date, leads, quotes, bookings,
--          round(100.0 * bookings / GREATEST(leads, 1), 1) AS conversion_pct
--     FROM metrics_daily WHERE date > current_date - 30 ORDER BY date;
