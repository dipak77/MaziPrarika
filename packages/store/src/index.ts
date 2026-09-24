/**
 * @mazi/store — persistence behind interfaces.
 *
 * Every repository is declared as an interface and implemented over
 * `node:sqlite`. Swapping in Postgres later means implementing the same
 * interfaces against `DATABASE_URL`; no caller changes.
 *
 * Design rules:
 *   • no SQL string interpolation with user data — everything is parameterised;
 *   • money is integer paise end to end;
 *   • writes that touch more than one row run inside a transaction;
 *   • the ledger and the audit log are append-only.
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { LATEST_SCHEMA_VERSION, SQLITE_MIGRATIONS } from './schema.js';

export * from './schema.js';

/* ------------------------------------------------------------------ */
/* Domain types (rows are mapped to camelCase, never leaked raw)        */
/* ------------------------------------------------------------------ */

export type UserRole = 'customer' | 'vendor' | 'admin' | 'guest';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  locale: string;
  createdAt: string;
  lastSeenAt?: string;
}

export interface Vendor {
  id: string;
  ownerUserId?: string;
  name: string;
  category: string;
  city: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  about?: string;
  startingPricePaise: number;
  plan: 'free' | 'growth' | 'pro' | 'enterprise';
  rating: number;
  reviewCount: number;
  bookingsCompleted: number;
  responseMinutes: number;
  identityVerified: boolean;
  gstVerified: boolean;
  gstNumber?: string;
  disputeCount: number;
  calendarFreshAt?: string;
  languages: string[];
  createdAt: string;
}

export interface VendorPackage {
  id: string;
  vendorId: string;
  title: string;
  pricePaise: number;
  capacity?: number;
  inclusions: string[];
  sortOrder: number;
}

export interface Availability {
  id: string;
  vendorId: string;
  date: string;
  status: 'available' | 'tentative' | 'hold' | 'booked' | 'blocked';
  holdExpiresAt?: string;
  teamCapacity: number;
  bookedTeamCount: number;
  notes?: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  vendorId: string;
  bookingId?: string;
  authorName: string;
  rating: number;
  body?: string;
  verifiedBooking: boolean;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  slug: string;
  ownerUserId: string;
  eventType: string;
  title: string;
  hostNames: string[];
  eventDate?: string;
  city: string;
  venueName?: string;
  venueAddress?: string;
  guestCountExpected: number;
  budgetTargetPaise: number;
  status: 'planning' | 'scheduled' | 'completed' | 'cancelled';
  /** Opt-in showcase listing. Private by default — see schema v7. */
  isPublic?: boolean;
  muhurat?: Record<string, unknown>;
  panchangSnapshot?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  phone?: string;
  relation?: string;
  side?: 'bride' | 'groom' | 'both' | 'host' | 'guest';
  rsvpStatus: 'pending' | 'yes' | 'no' | 'maybe';
  guestCount: number;
  tableNo?: string;
  code: string;
  invitedAt?: string;
  respondedAt?: string;
  notes?: string;
}

export interface EventWish {
  id: string;
  eventId: string;
  guestName?: string;
  body: string;
  approved: boolean;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: string;
  label: string;
  estimatedPaise: number;
  committedPaise: number;
  paidPaise: number;
  vendorId?: string;
  status: 'planned' | 'quoted' | 'committed' | 'paid';
  dueDate?: string;
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  category: string;
  dueDate?: string;
  status: 'open' | 'done' | 'skipped';
  priority: number;
  owner?: string;
  createdAt: string;
  doneAt?: string;
}

export interface DesignRecord<TDoc = unknown> {
  id: string;
  eventId?: string;
  ownerUserId: string;
  name: string;
  templateId?: string;
  preset: string;
  scheme: string;
  version: number;
  doc: TDoc;
  previewSvg?: string;
  status: 'draft' | 'review' | 'approved' | 'printing' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface PrintOrder {
  id: string;
  eventId?: string;
  designId: string;
  vendorId?: string;
  quantity: number;
  paper: string;
  finishing: string[];
  express: boolean;
  status: 'placed' | 'proofing' | 'approved' | 'printing' | 'dispatched' | 'delivered' | 'cancelled';
  unitPricePaise: number;
  shippingPaise: number;
  totalPaise: number;
  proofUrl?: string;
  tracking?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  eventId?: string;
  vendorId: string;
  customerUserId?: string;
  category: string;
  message?: string;
  budgetPaise?: number;
  eventDate?: string;
  guestCount?: number;
  status: 'new' | 'viewed' | 'responded' | 'quoting' | 'quoted' | 'won' | 'lost' | 'expired';
  source: 'search' | 'category' | 'ai' | 'ads' | 'referral' | 'print';
  sponsored: boolean;
  responseDueAt: string;
  respondedAt?: string;
  createdAt: string;
}

export interface QuoteRecord {
  id: string;
  leadId?: string;
  vendorId: string;
  eventId?: string;
  version: number;
  items: Array<{ label: string; quantity: number; unit: string; unitPricePaise: number; optional: boolean }>;
  discountPaise: number;
  subtotalPaise: number;
  gstPaise: number;
  totalPaise: number;
  validTill: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  acceptedAt?: string;
}

export interface Message {
  id: string;
  leadId: string;
  sender: 'customer' | 'vendor' | 'system';
  body: string;
  attachments: string[];
  readAt?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  eventId?: string;
  vendorId: string;
  leadId?: string;
  quoteId?: string;
  state: string;
  eventDate: string;
  totalPaise: number;
  advancePaise: number;
  commissionPaise: number;
  history: Array<{ at: string; actor: string; from: string; to: string; reason?: string }>;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface LedgerRow {
  id: string;
  bookingId: string;
  account: string;
  amountPaise: number;
  memo: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface SettlementRow {
  id: string;
  bookingId: string;
  vendorId: string;
  amountPaise: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  utr?: string;
  createdAt: string;
  paidAt?: string;
}

export interface DisputeRow {
  id: string;
  bookingId: string;
  raisedBy: 'customer' | 'vendor' | 'admin';
  reason: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'rejected';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export const AD_PLACEMENTS = ['sponsored-search', 'featured-category', 'banner', 'offer', 'lead-gen'] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export interface AdCampaign {
  id: string;
  vendorId: string;
  placement: AdPlacement;
  budgetPaise: number;
  spentPaise: number;
  targeting: { city?: string; pincode?: string; eventTypes?: string[]; minBudgetPaise?: number; dateFrom?: string; dateTo?: string };
  metrics: { impressions: number; profileViews: number; leads: number; quotes: number; bookings: number; bookingValuePaise: number };
  active: boolean;
  createdAt: string;
}

export interface DailyMetrics {
  date: string;
  newEvents: number;
  activeEvents: number;
  publishedInvitations: number;
  leads: number;
  quotes: number;
  bookings: number;
  gmvPaise: number;
  commissionPaise: number;
  medianResponseMinutes: number;
  bookingConversion: number;
  sponsoredImpressions: number;
  organicImpressions: number;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  at: string;
}

/* ------------------------------------------------------------------ */
/* Repository interfaces                                               */
/* ------------------------------------------------------------------ */

export interface UsersRepository {
  create(user: Omit<User, 'locale' | 'createdAt'> & { locale?: string; createdAt?: string }): User;
  byId(id: string): User | undefined;
  byPhone(phone: string): User | undefined;
  list(role?: UserRole): User[];
  touch(id: string, at?: string): void;
}

export interface VendorsRepository {
  create(vendor: Partial<Vendor> & { id: string; name: string; category: string; city: string }): Vendor;
  byId(id: string): Vendor | undefined;
  search(args: { category?: string; city?: string; q?: string; maxPricePaise?: number; minRating?: number; limit?: number }): Vendor[];
  update(id: string, patch: Partial<Vendor>): Vendor;
  packages(vendorId: string): VendorPackage[];
  addPackage(pkg: Omit<VendorPackage, 'sortOrder'> & { sortOrder?: number }): VendorPackage;
  availability(vendorId: string, from?: string, to?: string): Availability[];
  setAvailability(input: Omit<Availability, 'id' | 'updatedAt'> & { id?: string; updatedAt?: string }): Availability;
  reviews(vendorId: string): Review[];
  addReview(review: Omit<Review, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Review;
  recomputeRating(vendorId: string): { rating: number; reviewCount: number };
}

export interface EventsRepository {
  create(event: Omit<EventRecord, 'createdAt' | 'updatedAt' | 'hostNames'> & { hostNames?: string[]; createdAt?: string }): EventRecord;
  byId(id: string): EventRecord | undefined;
  bySlug(slug: string): EventRecord | undefined;
  listByOwner(ownerUserId: string): EventRecord[];
  list(args?: { city?: string; status?: EventRecord['status']; publicOnly?: boolean; limit?: number }): EventRecord[];
  update(id: string, patch: Partial<EventRecord>): EventRecord;
  guests(eventId: string): Guest[];
  addGuest(guest: Omit<Guest, 'id' | 'code'> & { id?: string; code?: string }): Guest;
  guestByCode(code: string): Guest | undefined;
  updateGuest(id: string, patch: Partial<Guest>): Guest;
  rsvpSummary(eventId: string): { invited: number; responded: number; yes: number; no: number; maybe: number; expectedHeads: number };
  budgetItems(eventId: string): BudgetItem[];
  upsertBudgetItem(item: Omit<BudgetItem, 'id'> & { id?: string }): BudgetItem;
  tasks(eventId: string): Task[];
  wishes(eventId: string): EventWish[];
  addWish(wish: Omit<EventWish, 'id' | 'createdAt' | 'approved'> & { id?: string; approved?: boolean; createdAt?: string }): EventWish;
  addTask(task: Omit<Task, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Task;
  updateTask(id: string, patch: Partial<Task>): Task;
}

export interface DesignsRepository<TDoc = unknown> {
  create(design: Omit<DesignRecord<TDoc>, 'createdAt' | 'updatedAt' | 'version'> & { version?: number; createdAt?: string }): DesignRecord<TDoc>;
  byId(id: string): DesignRecord<TDoc> | undefined;
  list(args: { eventId?: string; ownerUserId?: string; limit?: number }): DesignRecord<TDoc>[];
  save(id: string, doc: TDoc, opts?: { note?: string; previewSvg?: string; scheme?: string; name?: string; status?: DesignRecord['status'] }): DesignRecord<TDoc>;
  versions(designId: string): Array<{ version: number; note?: string; createdAt: string }>;
  createPrintOrder(order: Omit<PrintOrder, 'createdAt' | 'updatedAt'> & { createdAt?: string }): PrintOrder;
  printOrders(args: { eventId?: string; vendorId?: string; status?: PrintOrder['status'] }): PrintOrder[];
  updatePrintOrder(id: string, patch: Partial<PrintOrder>): PrintOrder;
}

export interface MarketplaceRepository {
  createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'responseDueAt' | 'status' | 'sponsored'> & { id?: string; status?: Lead['status']; sponsored?: boolean; responseDueMinutes?: number; createdAt?: string }): Lead;
  leadById(id: string): Lead | undefined;
  leadsForVendor(vendorId: string, statuses?: Lead['status'][]): Lead[];
  leadsForEvent(eventId: string): Lead[];
  updateLead(id: string, patch: Partial<Lead>): Lead;
  /** Vendor SLA: leads answered inside the response window. */
  responseStats(vendorId: string): { total: number; responded: number; medianMinutes: number; slaRate: number };
  createQuote(quote: Omit<QuoteRecord, 'id' | 'createdAt' | 'version'> & { id?: string; version?: number; createdAt?: string }): QuoteRecord;
  quotesForLead(leadId: string): QuoteRecord[];
  quoteById(id: string): QuoteRecord | undefined;
  updateQuote(id: string, patch: Partial<QuoteRecord>): QuoteRecord;
  addMessage(message: Omit<Message, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Message;
  messages(leadId: string): Message[];
}

export interface BookingsRepository {
  create(booking: Omit<Booking, 'id' | 'createdAt' | 'history'> & { id?: string; history?: Booking['history']; createdAt?: string }): Booking;
  byId(id: string): Booking | undefined;
  list(args?: { vendorId?: string; eventId?: string; state?: string; limit?: number }): Booking[];
  updateState(id: string, next: { state: string; actor: string; at?: string; reason?: string }): Booking;
  appendLedger(entries: Array<Omit<LedgerRow, 'id' | 'createdAt'> & { id?: string; createdAt?: string }>): LedgerRow[];
  ledger(bookingId: string): LedgerRow[];
  ledgerTotals(bookingId: string): Record<string, number>;
  recordPayment(payment: { id?: string; bookingId: string; kind: 'advance' | 'balance' | 'refund'; provider?: string; providerRef?: string; amountPaise: number; status?: string; idempotencyKey: string; raw?: unknown; createdAt?: string }): { id: string; duplicate: boolean };
  payments(bookingId: string): Array<{ id: string; kind: string; amountPaise: number; status: string; provider: string; providerRef?: string; createdAt: string }>;
  createSettlement(settlement: Omit<SettlementRow, 'id' | 'createdAt' | 'status'> & { id?: string; status?: SettlementRow['status'] }): SettlementRow;
  settlements(args?: { vendorId?: string; status?: SettlementRow['status'] }): SettlementRow[];
  markSettlementPaid(id: string, utr: string, at?: string): SettlementRow;
  openDispute(dispute: Omit<DisputeRow, 'id' | 'createdAt' | 'status'> & { id?: string }): DisputeRow;
  disputes(args?: { status?: DisputeRow['status'] }): DisputeRow[];
  resolveDispute(id: string, resolution: string, status: Extract<DisputeRow['status'], 'resolved' | 'rejected'>, at?: string): DisputeRow;
}

export interface AdsRepository {
  createCampaign(campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'metrics' | 'spentPaise'> & { id?: string; metrics?: AdCampaign['metrics']; spentPaise?: number; createdAt?: string }): AdCampaign;
  campaignById(id: string): AdCampaign | undefined;
  campaignsForVendor(vendorId: string): AdCampaign[];
  activeCampaigns(placement?: AdPlacement): AdCampaign[];
  recordEvent(event: { campaignId: string; kind: 'impression' | 'profile_view' | 'lead' | 'quote' | 'booking'; city?: string; eventId?: string; at?: string; costPaise?: number }): AdCampaign;
  updateCampaign(id: string, patch: Partial<AdCampaign>): AdCampaign;
}

export interface AnalyticsRepository {
  upsertDay(metrics: DailyMetrics): DailyMetrics;
  day(date: string): DailyMetrics | undefined;
  range(from: string, to: string): DailyMetrics[];
  totals(from: string, to: string): { leads: number; quotes: number; bookings: number; gmvPaise: number; commissionPaise: number; bookingConversion: number; medianResponseMinutes: number; sponsoredShare: number };
}

export interface AssistantRepository {
  createConversation(conversation: { id?: string; userId?: string; eventId?: string; title?: string; createdAt?: string }): { id: string; userId?: string; eventId?: string; title?: string; createdAt: string };
  addMessage(message: { id?: string; conversationId: string; role: 'user' | 'assistant' | 'system' | 'tool'; content: string; toolCalls?: unknown[]; provider?: string; model?: string; tokensIn?: number; tokensOut?: number; costUsd?: number; latencyMs?: number; createdAt?: string }): { id: string };
  messages(conversationId: string, limit?: number): Array<{ id: string; role: string; content: string; toolCalls: unknown[]; createdAt: string }>;
  conversationsForUser(userId: string): Array<{ id: string; title?: string; createdAt: string; messageCount: number }>;
  /** Assistant spend for the month, used to enforce the cost ceiling. */
  spendUsd(from: string, to: string): number;
}

export interface AuditRepository {
  record(entry: Omit<AuditEntry, 'id' | 'at'> & { id?: string; at?: string }): AuditEntry;
  forEntity(entity: string, entityId: string): AuditEntry[];
  recent(limit?: number): AuditEntry[];
}

export interface PrivacyRepository {
  request(input: { id?: string; userId: string; kind: 'export' | 'delete' | 'consent-withdraw'; note?: string; createdAt?: string }): { id: string; status: string };
  list(userId?: string): Array<{ id: string; userId: string; kind: string; status: string; createdAt: string; completedAt?: string }>;
  /** DPDP Act: export every fact we hold about a user. */
  exportUser(userId: string): Record<string, unknown>;
  /** Hard delete with cascade — the only destructive operation in the system. */
  deleteUser(userId: string): { deleted: boolean; tables: string[] };
}

export interface Store {
  readonly db: DatabaseSync;
  readonly version: number;
  users: UsersRepository;
  vendors: VendorsRepository;
  events: EventsRepository;
  designs: DesignsRepository;
  marketplace: MarketplaceRepository;
  bookings: BookingsRepository;
  ads: AdsRepository;
  analytics: AnalyticsRepository;
  assistant: AssistantRepository;
  audit: AuditRepository;
  privacy: PrivacyRepository;
  transaction<T>(fn: () => T): T;
  close(): void;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

let counter = 0;
export function newId(prefix: string): string {
  counter = (counter + 1) % 1_000_000;
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${stamp}${counter.toString(36).padStart(3, '0')}${rand}`;
}

const now = (): string => new Date().toISOString();

function isoPlusMinutes(minutes: number, from = new Date()): string {
  return new Date(from.getTime() + minutes * 60_000).toISOString();
}

const bool = (value: unknown): boolean => value === 1 || value === true;
const json = <T>(value: unknown, fallback: T): T => {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

/** Escape LIKE wildcards so a search term can never broaden a query. */
const likeTerm = (term: string): string => `%${term.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;

/**
 * Where the database lives.
 *
 * The same value is used by `next dev` (cwd = apps/web), by the CLI (cwd =
 * repo root) and by tests, so the path is resolved from a repository marker
 * rather than from whatever directory the process happens to start in.
 */
export function defaultDatabasePath(cwd: string = process.cwd(), configured = process.env.DATABASE_PATH): string {
  if (configured) {
    const candidate = resolve(cwd, configured.replace(/^\.\//, ''));
    return candidate;
  }

  let directory = resolve(cwd);
  for (let depth = 0; depth < 5; depth += 1) {
    const manifest = join(directory, 'package.json');
    if (existsSync(manifest)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const parsed = JSON.parse(readFileSync(manifest, 'utf8')) as { workspaces?: unknown };
        if (Array.isArray(parsed.workspaces)) return join(directory, 'apps', 'web', 'data', 'mazi.db');
      } catch {
        /* not a workspace root — keep walking */
      }
    }
    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return join(resolve(cwd), 'data', 'mazi.db');
}

export interface OpenStoreOptions {
  /** `:memory:` for tests, a file path for the app. */
  filename?: string;
  /** Run migrations on open (default true). */
  migrate?: boolean;
}

/* ------------------------------------------------------------------ */
/* The store                                                           */
/* ------------------------------------------------------------------ */

export function openStore(options: OpenStoreOptions = {}): Store {
  const filename = options.filename ?? ':memory:';
  if (filename !== ':memory:' && !filename.startsWith('file:')) {
    mkdirSync(dirname(filename), { recursive: true });
  }
  const db = new DatabaseSync(filename);

  // Pragmas: durability + concurrency for a multi-request web server.
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA synchronous = NORMAL;');

  const applied = migrate(db, options.migrate !== false);

  /* ---------------- users ---------------- */
  const users: UsersRepository = {
    create(input) {
      const user: User = {
        id: input.id,
        role: input.role,
        name: input.name,
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.email ? { email: input.email } : {}),
        ...(input.city ? { city: input.city } : {}),
        locale: input.locale ?? 'mr-IN',
        createdAt: input.createdAt ?? now(),
        ...(input.lastSeenAt ? { lastSeenAt: input.lastSeenAt } : {}),
      };
      db.prepare(
        `INSERT INTO users (id, role, name, phone, email, city, locale, created_at, last_seen_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(user.id, user.role, user.name, user.phone ?? null, user.email ?? null, user.city ?? null, user.locale, user.createdAt, user.lastSeenAt ?? null);
      return user;
    },
    byId(id) {
      return mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
    },
    byPhone(phone) {
      return mapUser(db.prepare('SELECT * FROM users WHERE phone = ?').get(phone));
    },
    list(role) {
      const rows = role
        ? db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC').all(role)
        : db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
      return rows.map((r) => mapUser(r)).filter((u): u is User => Boolean(u));
    },
    touch(id, at) {
      db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').run(at ?? now(), id);
    },
  };

  /* ---------------- vendors ---------------- */
  const vendors: VendorsRepository = {
    create(input) {
      const vendor: Vendor = {
        id: input.id,
        ...(input.ownerUserId ? { ownerUserId: input.ownerUserId } : {}),
        name: input.name,
        category: input.category,
        city: input.city,
        ...(input.pincode ? { pincode: input.pincode } : {}),
        ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
        ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
        ...(input.about ? { about: input.about } : {}),
        startingPricePaise: input.startingPricePaise ?? 0,
        plan: input.plan ?? 'free',
        rating: input.rating ?? 0,
        reviewCount: input.reviewCount ?? 0,
        bookingsCompleted: input.bookingsCompleted ?? 0,
        responseMinutes: input.responseMinutes ?? 240,
        identityVerified: input.identityVerified ?? false,
        gstVerified: input.gstVerified ?? false,
        ...(input.gstNumber ? { gstNumber: input.gstNumber } : {}),
        disputeCount: input.disputeCount ?? 0,
        ...(input.calendarFreshAt ? { calendarFreshAt: input.calendarFreshAt } : {}),
        languages: input.languages ?? ['मराठी', 'हिंदी', 'इंग्रजी'],
        createdAt: input.createdAt ?? now(),
      };
      db.prepare(
        `INSERT INTO vendors (id, owner_user_id, name, category, city, pincode, latitude, longitude, about,
           starting_price_paise, plan, rating, review_count, bookings_completed, response_minutes,
           identity_verified, gst_verified, gst_number, dispute_count, calendar_fresh_at, languages, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        vendor.id, vendor.ownerUserId ?? null, vendor.name, vendor.category, vendor.city, vendor.pincode ?? null,
        vendor.latitude ?? null, vendor.longitude ?? null, vendor.about ?? null, vendor.startingPricePaise, vendor.plan,
        vendor.rating, vendor.reviewCount, vendor.bookingsCompleted, vendor.responseMinutes,
        vendor.identityVerified ? 1 : 0, vendor.gstVerified ? 1 : 0, vendor.gstNumber ?? null, vendor.disputeCount,
        vendor.calendarFreshAt ?? null, JSON.stringify(vendor.languages), vendor.createdAt,
      );
      return vendor;
    },
    byId(id) {
      return mapVendor(db.prepare('SELECT * FROM vendors WHERE id = ?').get(id));
    },
    search(args) {
      const where: string[] = [];
      const params: Array<string | number> = [];
      if (args.category) {
        where.push('category = ?');
        params.push(args.category);
      }
      if (args.city) {
        where.push('city = ?');
        params.push(args.city);
      }
      if (args.maxPricePaise) {
        where.push('starting_price_paise <= ?');
        params.push(args.maxPricePaise);
      }
      if (args.minRating) {
        where.push('rating >= ?');
        params.push(args.minRating);
      }
      if (args.q) {
        where.push("(name LIKE ? ESCAPE '\\' OR about LIKE ? ESCAPE '\\' OR category LIKE ? ESCAPE '\\')");
        const term = likeTerm(args.q);
        params.push(term, term, term);
      }
      const sql = `SELECT * FROM vendors ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY rating DESC, bookings_completed DESC LIMIT ?`;
      params.push(args.limit ?? 24);
      return db.prepare(sql).all(...params).map((r) => mapVendor(r)).filter((v): v is Vendor => Boolean(v));
    },
    update(id, patch) {
      const current = vendors.byId(id);
      if (!current) throw new Error(`विक्रेता सापडला नाही: ${id}`);
      const next: Vendor = { ...current, ...patch, id: current.id };
      db.prepare(
        `UPDATE vendors SET owner_user_id = ?, name = ?, category = ?, city = ?, pincode = ?, latitude = ?, longitude = ?,
           about = ?, starting_price_paise = ?, plan = ?, rating = ?, review_count = ?, bookings_completed = ?,
           response_minutes = ?, identity_verified = ?, gst_verified = ?, gst_number = ?, dispute_count = ?,
           calendar_fresh_at = ?, languages = ? WHERE id = ?`,
      ).run(
        next.ownerUserId ?? null, next.name, next.category, next.city, next.pincode ?? null, next.latitude ?? null,
        next.longitude ?? null, next.about ?? null, next.startingPricePaise, next.plan, next.rating, next.reviewCount,
        next.bookingsCompleted, next.responseMinutes, next.identityVerified ? 1 : 0, next.gstVerified ? 1 : 0,
        next.gstNumber ?? null, next.disputeCount, next.calendarFreshAt ?? null, JSON.stringify(next.languages), id,
      );
      return next;
    },
    packages(vendorId) {
      return db.prepare('SELECT * FROM vendor_packages WHERE vendor_id = ? ORDER BY sort_order, price_paise').all(vendorId)
        .map((r) => ({
          id: String(r.id), vendorId: String(r.vendor_id), title: String(r.title),
          pricePaise: Number(r.price_paise),
          ...(r.capacity !== null ? { capacity: Number(r.capacity) } : {}),
          inclusions: json<string[]>(r.inclusions, []), sortOrder: Number(r.sort_order),
        }));
    },
    addPackage(pkg) {
      const record: VendorPackage = { ...pkg, sortOrder: pkg.sortOrder ?? 0 };
      db.prepare('INSERT INTO vendor_packages (id, vendor_id, title, price_paise, capacity, inclusions, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(record.id, record.vendorId, record.title, record.pricePaise, record.capacity ?? null, JSON.stringify(record.inclusions), record.sortOrder);
      return record;
    },
    availability(vendorId, from, to) {
      const rows = db.prepare(
        `SELECT * FROM vendor_availability WHERE vendor_id = ?
         ${from ? 'AND date >= ?' : ''} ${to ? 'AND date <= ?' : ''} ORDER BY date`,
      ).all(...[vendorId, ...(from ? [from] : []), ...(to ? [to] : [])]);
      return rows.map((r) => ({
        id: String(r.id), vendorId: String(r.vendor_id), date: String(r.date),
        status: String(r.status) as Availability['status'],
        ...(r.hold_expires_at ? { holdExpiresAt: String(r.hold_expires_at) } : {}),
        teamCapacity: Number(r.team_capacity), bookedTeamCount: Number(r.booked_team_count),
        ...(r.notes ? { notes: String(r.notes) } : {}), updatedAt: String(r.updated_at),
      }));
    },
    setAvailability(input) {
      const record: Availability = {
        id: input.id ?? newId('avail'), vendorId: input.vendorId, date: input.date, status: input.status,
        ...(input.holdExpiresAt ? { holdExpiresAt: input.holdExpiresAt } : {}),
        teamCapacity: input.teamCapacity, bookedTeamCount: input.bookedTeamCount,
        ...(input.notes ? { notes: input.notes } : {}), updatedAt: input.updatedAt ?? now(),
      };
      const existing = db.prepare('SELECT id FROM vendor_availability WHERE vendor_id = ? AND date = ? AND status = ? AND COALESCE(notes, \'\') = COALESCE(?, \'\')')
        .get(record.vendorId, record.date, record.status, record.notes ?? null);
      if (existing) {
        db.prepare('UPDATE vendor_availability SET hold_expires_at = ?, team_capacity = ?, booked_team_count = ?, updated_at = ? WHERE id = ?')
          .run(record.holdExpiresAt ?? null, record.teamCapacity, record.bookedTeamCount, record.updatedAt, String(existing.id));
        return { ...record, id: String(existing.id) };
      }
      db.prepare(
        `INSERT INTO vendor_availability (id, vendor_id, date, status, hold_expires_at, team_capacity, booked_team_count, notes, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(record.id, record.vendorId, record.date, record.status, record.holdExpiresAt ?? null, record.teamCapacity, record.bookedTeamCount, record.notes ?? null, record.updatedAt);
      return record;
    },
    reviews(vendorId) {
      return db.prepare('SELECT * FROM reviews WHERE vendor_id = ? ORDER BY created_at DESC').all(vendorId)
        .map((r) => ({
          id: String(r.id), vendorId: String(r.vendor_id),
          ...(r.booking_id ? { bookingId: String(r.booking_id) } : {}),
          authorName: String(r.author_name), rating: Number(r.rating),
          ...(r.body ? { body: String(r.body) } : {}),
          verifiedBooking: bool(r.verified_booking), createdAt: String(r.created_at),
        }));
    },
    addReview(review) {
      const record: Review = { ...review, id: review.id ?? newId('rev'), createdAt: review.createdAt ?? now() };
      db.prepare('INSERT INTO reviews (id, vendor_id, booking_id, author_name, rating, body, verified_booking, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(record.id, record.vendorId, record.bookingId ?? null, record.authorName, record.rating, record.body ?? null, record.verifiedBooking ? 1 : 0, record.createdAt);
      return record;
    },
    recomputeRating(vendorId) {
      const row = db.prepare('SELECT AVG(rating) AS avg_rating, COUNT(*) AS count FROM reviews WHERE vendor_id = ?').get(vendorId);
      const rating = Number((Number(row?.avg_rating ?? 0)).toFixed(2));
      const reviewCount = Number(row?.count ?? 0);
      db.prepare('UPDATE vendors SET rating = ?, review_count = ? WHERE id = ?').run(rating, reviewCount, vendorId);
      return { rating, reviewCount };
    },
  };

  /* ---------------- events ---------------- */
  const events: EventsRepository = {
    create(input) {
      const stamp = now();
      const record: EventRecord = {
        ...input,
        hostNames: input.hostNames ?? [],
        createdAt: input.createdAt ?? stamp,
        updatedAt: stamp,
      };
      db.prepare(
        `INSERT INTO events (id, slug, owner_user_id, event_type, title, host_names, event_date, city, venue_name, venue_address,
           guest_count_expected, budget_target_paise, status, muhurat, panchang_snapshot, created_at, updated_at, is_public)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        record.id, record.slug, record.ownerUserId, record.eventType, record.title, JSON.stringify(record.hostNames),
        record.eventDate ?? null, record.city, record.venueName ?? null, record.venueAddress ?? null,
        record.guestCountExpected, record.budgetTargetPaise, record.status,
        record.muhurat ? JSON.stringify(record.muhurat) : null,
        record.panchangSnapshot ? JSON.stringify(record.panchangSnapshot) : null,
        record.createdAt, record.updatedAt, record.isPublic ? 1 : 0,
      );
      return record;
    },
    byId(id) {
      return mapEvent(db.prepare('SELECT * FROM events WHERE id = ?').get(id));
    },
    bySlug(slug) {
      return mapEvent(db.prepare('SELECT * FROM events WHERE slug = ?').get(slug));
    },
    listByOwner(ownerUserId) {
      return db.prepare('SELECT * FROM events WHERE owner_user_id = ? ORDER BY COALESCE(event_date, created_at)').all(ownerUserId)
        .map((r) => mapEvent(r)).filter((e): e is EventRecord => Boolean(e));
    },
    list(args = {}) {
      const where: string[] = [];
      const params: Array<string | number> = [];
      if (args.city) {
        where.push('city = ?');
        params.push(args.city);
      }
      if (args.status) {
        where.push('status = ?');
        params.push(args.status);
      }
      if (args.publicOnly) where.push('is_public = 1');
      params.push(args.limit ?? 50);
      return db.prepare(`SELECT * FROM events ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT ?`)
        .all(...params).map((r) => mapEvent(r)).filter((e): e is EventRecord => Boolean(e));
    },
    update(id, patch) {
      const current = events.byId(id);
      if (!current) throw new Error(`कार्यक्रम सापडला नाही: ${id}`);
      const next: EventRecord = { ...current, ...patch, id: current.id, updatedAt: now() };
      db.prepare(
        `UPDATE events SET slug = ?, event_type = ?, title = ?, host_names = ?, event_date = ?, city = ?, venue_name = ?,
           venue_address = ?, guest_count_expected = ?, budget_target_paise = ?, status = ?, muhurat = ?, panchang_snapshot = ?,
           updated_at = ?, is_public = ?
         WHERE id = ?`,
      ).run(
        next.slug, next.eventType, next.title, JSON.stringify(next.hostNames), next.eventDate ?? null, next.city,
        next.venueName ?? null, next.venueAddress ?? null, next.guestCountExpected, next.budgetTargetPaise, next.status,
        next.muhurat ? JSON.stringify(next.muhurat) : null,
        next.panchangSnapshot ? JSON.stringify(next.panchangSnapshot) : null, next.updatedAt, next.isPublic ? 1 : 0, id,
      );
      return next;
    },
    guests(eventId) {
      return db.prepare('SELECT * FROM guests WHERE event_id = ? ORDER BY name').all(eventId).map((r) => mapGuest(r));
    },
    addGuest(guest) {
      const record: Guest = { ...guest, id: guest.id ?? newId('g'), code: guest.code ?? newId('gc').slice(-8) };
      db.prepare(
        `INSERT INTO guests (id, event_id, name, phone, relation, side, rsvp_status, guest_count, table_no, code, invited_at, responded_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        record.id, record.eventId, record.name, record.phone ?? null, record.relation ?? null, record.side ?? null,
        record.rsvpStatus, record.guestCount, record.tableNo ?? null, record.code,
        record.invitedAt ?? null, record.respondedAt ?? null, record.notes ?? null,
      );
      return record;
    },
    guestByCode(code) {
      const row = db.prepare('SELECT * FROM guests WHERE code = ?').get(code);
      return row ? mapGuest(row) : undefined;
    },
    updateGuest(id, patch) {
      const row = db.prepare('SELECT * FROM guests WHERE id = ?').get(id);
      if (!row) throw new Error(`पाहुणा सापडला नाही: ${id}`);
      const next: Guest = { ...mapGuest(row), ...patch, id };
      db.prepare(
        `UPDATE guests SET name = ?, phone = ?, relation = ?, side = ?, rsvp_status = ?, guest_count = ?, table_no = ?,
           invited_at = ?, responded_at = ?, notes = ? WHERE id = ?`,
      ).run(
        next.name, next.phone ?? null, next.relation ?? null, next.side ?? null, next.rsvpStatus, next.guestCount,
        next.tableNo ?? null, next.invitedAt ?? null, next.respondedAt ?? null, next.notes ?? null, id,
      );
      return next;
    },
    rsvpSummary(eventId) {
      const row = db.prepare(
        `SELECT COUNT(*) AS invited,
                SUM(CASE WHEN rsvp_status <> 'pending' THEN 1 ELSE 0 END) AS responded,
                SUM(CASE WHEN rsvp_status = 'yes' THEN 1 ELSE 0 END) AS yes,
                SUM(CASE WHEN rsvp_status = 'no' THEN 1 ELSE 0 END) AS no,
                SUM(CASE WHEN rsvp_status = 'maybe' THEN 1 ELSE 0 END) AS maybe,
                SUM(CASE WHEN rsvp_status IN ('yes','maybe') THEN guest_count ELSE 0 END) AS heads
         FROM guests WHERE event_id = ?`,
      ).get(eventId);
      return {
        invited: Number(row?.invited ?? 0),
        responded: Number(row?.responded ?? 0),
        yes: Number(row?.yes ?? 0),
        no: Number(row?.no ?? 0),
        maybe: Number(row?.maybe ?? 0),
        expectedHeads: Number(row?.heads ?? 0),
      };
    },
    budgetItems(eventId) {
      return db.prepare('SELECT * FROM budget_items WHERE event_id = ? ORDER BY category, label').all(eventId).map((r) => ({
        id: String(r.id), eventId: String(r.event_id), category: String(r.category), label: String(r.label),
        estimatedPaise: Number(r.estimated_paise), committedPaise: Number(r.committed_paise),
        paidPaise: Number(r.paid_paise),
        ...(r.vendor_id ? { vendorId: String(r.vendor_id) } : {}),
        status: String(r.status) as BudgetItem['status'],
        ...(r.due_date ? { dueDate: String(r.due_date) } : {}),
      }));
    },
    upsertBudgetItem(item) {
      const record: BudgetItem = { ...item, id: item.id ?? newId('bud') };
      db.prepare(
        `INSERT INTO budget_items (id, event_id, category, label, estimated_paise, committed_paise, paid_paise, vendor_id, status, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET category = excluded.category, label = excluded.label,
           estimated_paise = excluded.estimated_paise, committed_paise = excluded.committed_paise,
           paid_paise = excluded.paid_paise, vendor_id = excluded.vendor_id, status = excluded.status, due_date = excluded.due_date`,
      ).run(
        record.id, record.eventId, record.category, record.label, record.estimatedPaise, record.committedPaise,
        record.paidPaise, record.vendorId ?? null, record.status, record.dueDate ?? null,
      );
      return record;
    },
    tasks(eventId) {
      return db.prepare("SELECT * FROM tasks WHERE event_id = ? ORDER BY status = 'done', priority, COALESCE(due_date, '9999')").all(eventId)
        .map((r) => ({
          id: String(r.id), eventId: String(r.event_id), title: String(r.title), category: String(r.category),
          ...(r.due_date ? { dueDate: String(r.due_date) } : {}),
          status: String(r.status) as Task['status'], priority: Number(r.priority),
          ...(r.owner ? { owner: String(r.owner) } : {}),
          createdAt: String(r.created_at),
          ...(r.done_at ? { doneAt: String(r.done_at) } : {}),
        }));
    },
    wishes(eventId) {
      return db.prepare('SELECT * FROM event_wishes WHERE event_id = ? ORDER BY created_at DESC LIMIT 60').all(eventId)
        .map((r) => ({
          id: String(r.id), eventId: String(r.event_id),
          ...(r.guest_name ? { guestName: String(r.guest_name) } : {}),
          body: String(r.body), approved: bool(r.approved), createdAt: String(r.created_at),
        }));
    },
    addWish(wish) {
      const record: EventWish = {
        ...wish,
        id: wish.id ?? newId('wish'),
        approved: wish.approved ?? true,
        createdAt: wish.createdAt ?? now(),
      };
      db.prepare('INSERT INTO event_wishes (id, event_id, guest_name, body, approved, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(record.id, record.eventId, record.guestName ?? null, record.body, record.approved ? 1 : 0, record.createdAt);
      return record;
    },
    addTask(task) {
      const record: Task = { ...task, id: task.id ?? newId('task'), createdAt: task.createdAt ?? now() };
      db.prepare('INSERT INTO tasks (id, event_id, title, category, due_date, status, priority, owner, created_at, done_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(record.id, record.eventId, record.title, record.category, record.dueDate ?? null, record.status, record.priority, record.owner ?? null, record.createdAt, record.doneAt ?? null);
      return record;
    },
    updateTask(id, patch) {
      const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!row) throw new Error(`कार्य सापडले नाही: ${id}`);
      const current: Task = {
        id: String(row.id), eventId: String(row.event_id), title: String(row.title), category: String(row.category),
        ...(row.due_date ? { dueDate: String(row.due_date) } : {}),
        status: String(row.status) as Task['status'], priority: Number(row.priority),
        ...(row.owner ? { owner: String(row.owner) } : {}), createdAt: String(row.created_at),
        ...(row.done_at ? { doneAt: String(row.done_at) } : {}),
      };
      const next: Task = { ...current, ...patch, id };
      if (next.status === 'done' && !next.doneAt) next.doneAt = now();
      db.prepare('UPDATE tasks SET title = ?, category = ?, due_date = ?, status = ?, priority = ?, owner = ?, done_at = ? WHERE id = ?')
        .run(next.title, next.category, next.dueDate ?? null, next.status, next.priority, next.owner ?? null, next.doneAt ?? null, id);
      return next;
    },
  };

  /* ---------------- designs & print ---------------- */
  const designs: DesignsRepository = {
    create(input) {
      const stamp = now();
      const record: DesignRecord = {
        ...input,
        version: input.version ?? 1,
        createdAt: input.createdAt ?? stamp,
        updatedAt: stamp,
      };
      db.prepare(
        `INSERT INTO designs (id, event_id, owner_user_id, name, template_id, preset, scheme, version, doc, preview_svg, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        record.id, record.eventId ?? null, record.ownerUserId, record.name, record.templateId ?? null, record.preset,
        record.scheme, record.version, JSON.stringify(record.doc), record.previewSvg ?? null, record.status,
        record.createdAt, record.updatedAt,
      );
      db.prepare('INSERT INTO design_versions (id, design_id, version, doc, note, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(newId('dv'), record.id, record.version, JSON.stringify(record.doc), 'प्रारंभिक आवृत्ती', record.createdAt);
      return record;
    },
    byId(id) {
      return mapDesign(db.prepare('SELECT * FROM designs WHERE id = ?').get(id));
    },
    list(args) {
      const where: string[] = [];
      const params: Array<string | number> = [];
      if (args.eventId) {
        where.push('event_id = ?');
        params.push(args.eventId);
      }
      if (args.ownerUserId) {
        where.push('owner_user_id = ?');
        params.push(args.ownerUserId);
      }
      params.push(args.limit ?? 50);
      return db.prepare(`SELECT * FROM designs ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY updated_at DESC LIMIT ?`)
        .all(...params).map((r) => mapDesign(r)).filter((d): d is DesignRecord => Boolean(d));
    },
    save(id, doc, opts = {}) {
      const current = designs.byId(id);
      if (!current) throw new Error(`डिझाइन सापडले नाही: ${id}`);
      const version = current.version + 1;
      const stamp = now();
      db.prepare('UPDATE designs SET doc = ?, version = ?, updated_at = ?, preview_svg = COALESCE(?, preview_svg), scheme = COALESCE(?, scheme), name = COALESCE(?, name), status = COALESCE(?, status) WHERE id = ?')
        .run(JSON.stringify(doc), version, stamp, opts.previewSvg ?? null, opts.scheme ?? null, opts.name ?? null, opts.status ?? null, id);
      db.prepare('INSERT INTO design_versions (id, design_id, version, doc, note, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(newId('dv'), id, version, JSON.stringify(doc), opts.note ?? null, stamp);
      return designs.byId(id)!;
    },
    versions(designId) {
      return db.prepare('SELECT version, note, created_at FROM design_versions WHERE design_id = ? ORDER BY version DESC').all(designId)
        .map((r) => ({ version: Number(r.version), ...(r.note ? { note: String(r.note) } : {}), createdAt: String(r.created_at) }));
    },
    createPrintOrder(order) {
      const stamp = now();
      const record: PrintOrder = { ...order, createdAt: order.createdAt ?? stamp, updatedAt: stamp };
      db.prepare(
        `INSERT INTO print_orders (id, event_id, design_id, vendor_id, quantity, paper, finishing, express, status, unit_price_paise, shipping_paise, total_paise, proof_url, tracking, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        record.id, record.eventId ?? null, record.designId, record.vendorId ?? null, record.quantity, record.paper,
        JSON.stringify(record.finishing), record.express ? 1 : 0, record.status, record.unitPricePaise,
        record.shippingPaise, record.totalPaise, record.proofUrl ?? null, record.tracking ?? null,
        record.createdAt, record.updatedAt,
      );
      return record;
    },
    printOrders(args) {
      const where: string[] = [];
      const params: string[] = [];
      if (args.eventId) {
        where.push('event_id = ?');
        params.push(args.eventId);
      }
      if (args.vendorId) {
        where.push('vendor_id = ?');
        params.push(args.vendorId);
      }
      if (args.status) {
        where.push('status = ?');
        params.push(args.status);
      }
      return db.prepare(`SELECT * FROM print_orders ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`)
        .all(...params).map((r) => mapPrintOrder(r));
    },
    updatePrintOrder(id, patch) {
      const row = db.prepare('SELECT * FROM print_orders WHERE id = ?').get(id);
      if (!row) throw new Error(`छपाई ऑर्डर सापडली नाही: ${id}`);
      const next: PrintOrder = { ...mapPrintOrder(row), ...patch, id, updatedAt: now() };
      db.prepare(
        `UPDATE print_orders SET status = ?, quantity = ?, paper = ?, finishing = ?, express = ?, unit_price_paise = ?,
           shipping_paise = ?, total_paise = ?, proof_url = ?, tracking = ?, updated_at = ? WHERE id = ?`,
      ).run(
        next.status, next.quantity, next.paper, JSON.stringify(next.finishing), next.express ? 1 : 0,
        next.unitPricePaise, next.shippingPaise, next.totalPaise, next.proofUrl ?? null, next.tracking ?? null,
        next.updatedAt, id,
      );
      return next;
    },
  };

  /* ---------------- marketplace ---------------- */
  const marketplace: MarketplaceRepository = {
    createLead(input) {
      const created = input.createdAt ?? now();
      const record: Lead = {
        ...input,
        id: input.id ?? newId('lead'),
        status: input.status ?? 'new',
        sponsored: input.sponsored ?? false,
        responseDueAt: isoPlusMinutes(input.responseDueMinutes ?? 120, new Date(created)),
        createdAt: created,
      };
      db.prepare(
        `INSERT INTO leads (id, event_id, vendor_id, customer_user_id, category, message, budget_paise, event_date,
           guest_count, status, source, sponsored, response_due_at, responded_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        record.id, record.eventId ?? null, record.vendorId, record.customerUserId ?? null, record.category,
        record.message ?? null, record.budgetPaise ?? null, record.eventDate ?? null, record.guestCount ?? null,
        record.status, record.source, record.sponsored ? 1 : 0, record.responseDueAt, record.respondedAt ?? null,
        record.createdAt,
      );
      return record;
    },
    leadById(id) {
      return mapLead(db.prepare('SELECT * FROM leads WHERE id = ?').get(id));
    },
    leadsForVendor(vendorId, statuses) {
      const filter = statuses?.length ? ` AND status IN (${statuses.map(() => '?').join(',')})` : '';
      return db.prepare(`SELECT * FROM leads WHERE vendor_id = ?${filter} ORDER BY created_at DESC`)
        .all(...[vendorId, ...(statuses ?? [])]).map((r) => mapLead(r)).filter((l): l is Lead => Boolean(l));
    },
    leadsForEvent(eventId) {
      return db.prepare('SELECT * FROM leads WHERE event_id = ? ORDER BY created_at DESC').all(eventId)
        .map((r) => mapLead(r)).filter((l): l is Lead => Boolean(l));
    },
    updateLead(id, patch) {
      const current = marketplace.leadById(id);
      if (!current) throw new Error(`लीड सापडली नाही: ${id}`);
      const next: Lead = { ...current, ...patch, id };
      db.prepare('UPDATE leads SET status = ?, responded_at = ?, message = ?, budget_paise = ?, event_date = ?, guest_count = ? WHERE id = ?')
        .run(next.status, next.respondedAt ?? null, next.message ?? null, next.budgetPaise ?? null, next.eventDate ?? null, next.guestCount ?? null, id);
      return next;
    },
    responseStats(vendorId) {
      const rows = db.prepare('SELECT created_at, responded_at FROM leads WHERE vendor_id = ?').all(vendorId);
      // Clamped at zero: clock skew or a backfilled reply must never surface as a
      // negative response time on a public listing.
      const minutesSince = (row: Row): number =>
        Math.max(0, (new Date(String(row.responded_at)).getTime() - new Date(String(row.created_at)).getTime()) / 60_000);
      const answered = rows.filter((r) => r.responded_at).map(minutesSince).sort((a, b) => a - b);
      const median = answered.length ? answered[Math.floor(answered.length / 2)]! : 0;
      // SLA = answered inside the two-hour promise shown on every listing.
      const withinSla = rows.filter((r) => r.responded_at && minutesSince(r) <= 120).length;
      return {
        total: rows.length,
        responded: answered.length,
        medianMinutes: Math.round(median),
        slaRate: rows.length ? Number((withinSla / rows.length).toFixed(3)) : 0,
      };
    },
    createQuote(quote) {
      const record: QuoteRecord = { ...quote, id: quote.id ?? newId('quote'), version: quote.version ?? 1, createdAt: quote.createdAt ?? now() };
      db.prepare(
        `INSERT INTO quotes (id, lead_id, vendor_id, event_id, version, items, discount_paise, subtotal_paise, gst_paise, total_paise, valid_till, status, created_at, accepted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        record.id, record.leadId ?? null, record.vendorId, record.eventId ?? null, record.version,
        JSON.stringify(record.items), record.discountPaise, record.subtotalPaise, record.gstPaise, record.totalPaise,
        record.validTill, record.status, record.createdAt, record.acceptedAt ?? null,
      );
      return record;
    },
    quotesForLead(leadId) {
      return db.prepare('SELECT * FROM quotes WHERE lead_id = ? ORDER BY version DESC').all(leadId).map((r) => mapQuote(r));
    },
    quoteById(id) {
      const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
      return row ? mapQuote(row) : undefined;
    },
    updateQuote(id, patch) {
      const current = marketplace.quoteById(id);
      if (!current) throw new Error(`कोट सापडला नाही: ${id}`);
      const next: QuoteRecord = { ...current, ...patch, id };
      db.prepare('UPDATE quotes SET status = ?, accepted_at = ?, items = ?, discount_paise = ?, subtotal_paise = ?, gst_paise = ?, total_paise = ?, valid_till = ? WHERE id = ?')
        .run(next.status, next.acceptedAt ?? null, JSON.stringify(next.items), next.discountPaise, next.subtotalPaise, next.gstPaise, next.totalPaise, next.validTill, id);
      return next;
    },
    addMessage(message) {
      const record: Message = { ...message, id: message.id ?? newId('msg'), createdAt: message.createdAt ?? now() };
      db.prepare('INSERT INTO messages (id, lead_id, sender, body, attachments, read_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(record.id, record.leadId, record.sender, record.body, JSON.stringify(record.attachments), record.readAt ?? null, record.createdAt);
      return record;
    },
    messages(leadId) {
      return db.prepare('SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at').all(leadId).map((r) => ({
        id: String(r.id), leadId: String(r.lead_id), sender: String(r.sender) as Message['sender'],
        body: String(r.body), attachments: json<string[]>(r.attachments, []),
        ...(r.read_at ? { readAt: String(r.read_at) } : {}), createdAt: String(r.created_at),
      }));
    },
  };

  /* ---------------- bookings ---------------- */
  const bookings: BookingsRepository = {
    create(input) {
      const record: Booking = {
        ...input,
        id: input.id ?? newId('bk'),
        history: input.history ?? [],
        createdAt: input.createdAt ?? now(),
      };
      db.prepare(
        `INSERT INTO bookings (id, event_id, vendor_id, lead_id, quote_id, state, event_date, total_paise, advance_paise, commission_paise, history, created_at, confirmed_at, completed_at, cancelled_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        record.id, record.eventId ?? null, record.vendorId, record.leadId ?? null, record.quoteId ?? null, record.state,
        record.eventDate, record.totalPaise, record.advancePaise, record.commissionPaise, JSON.stringify(record.history),
        record.createdAt, record.confirmedAt ?? null, record.completedAt ?? null, record.cancelledAt ?? null,
      );
      return record;
    },
    byId(id) {
      return mapBooking(db.prepare('SELECT * FROM bookings WHERE id = ?').get(id));
    },
    list(args = {}) {
      const where: string[] = [];
      const params: Array<string | number> = [];
      if (args.vendorId) {
        where.push('vendor_id = ?');
        params.push(args.vendorId);
      }
      if (args.eventId) {
        where.push('event_id = ?');
        params.push(args.eventId);
      }
      if (args.state) {
        where.push('state = ?');
        params.push(args.state);
      }
      params.push(args.limit ?? 100);
      return db.prepare(`SELECT * FROM bookings ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY event_date DESC LIMIT ?`)
        .all(...params).map((r) => mapBooking(r)).filter((b): b is Booking => Boolean(b));
    },
    updateState(id, next) {
      const current = bookings.byId(id);
      if (!current) throw new Error(`बुकिंग सापडली नाही: ${id}`);
      const at = next.at ?? now();
      const history = [...current.history, { at, actor: next.actor, from: current.state, to: next.state, ...(next.reason ? { reason: next.reason } : {}) }];
      db.prepare(
        `UPDATE bookings SET state = ?, history = ?, confirmed_at = COALESCE(confirmed_at, ?), completed_at = COALESCE(completed_at, ?), cancelled_at = COALESCE(cancelled_at, ?) WHERE id = ?`,
      ).run(
        next.state, JSON.stringify(history),
        next.state === 'BOOKING_CONFIRMED' ? at : null,
        next.state === 'SERVICE_COMPLETED' ? at : null,
        next.state === 'CANCELLED' ? at : null,
        id,
      );
      return bookings.byId(id)!;
    },
    appendLedger(entries) {
      const insert = db.prepare('INSERT OR IGNORE INTO ledger_entries (id, booking_id, account, amount_paise, memo, idempotency_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const stored: LedgerRow[] = [];
      for (const entry of entries) {
        const record = { ...entry, id: entry.id ?? newId('led'), createdAt: entry.createdAt ?? now() };
        insert.run(record.id, record.bookingId, record.account, record.amountPaise, record.memo, record.idempotencyKey, record.createdAt);
        stored.push(record);
      }
      return stored;
    },
    ledger(bookingId) {
      return db.prepare('SELECT * FROM ledger_entries WHERE booking_id = ? ORDER BY created_at').all(bookingId).map((r) => ({
        id: String(r.id), bookingId: String(r.booking_id), account: String(r.account),
        amountPaise: Number(r.amount_paise), memo: String(r.memo), idempotencyKey: String(r.idempotency_key),
        createdAt: String(r.created_at),
      }));
    },
    ledgerTotals(bookingId) {
      const rows = db.prepare('SELECT account, SUM(amount_paise) AS total FROM ledger_entries WHERE booking_id = ? GROUP BY account').all(bookingId);
      const totals: Record<string, number> = {};
      for (const row of rows) totals[String(row.account)] = Number(row.total ?? 0);
      return totals;
    },
    recordPayment(payment) {
      const existing = db.prepare('SELECT id FROM payments WHERE idempotency_key = ?').get(payment.idempotencyKey);
      if (existing) return { id: String(existing.id), duplicate: true };
      const id = payment.id ?? newId('pay');
      db.prepare(
        `INSERT INTO payments (id, booking_id, kind, provider, provider_ref, amount_paise, status, idempotency_key, raw, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id, payment.bookingId, payment.kind, payment.provider ?? 'simulated', payment.providerRef ?? null,
        payment.amountPaise, payment.status ?? 'created', payment.idempotencyKey,
        payment.raw ? JSON.stringify(payment.raw) : null, payment.createdAt ?? now(),
      );
      return { id, duplicate: false };
    },
    payments(bookingId) {
      return db.prepare('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at').all(bookingId).map((r) => ({
        id: String(r.id), kind: String(r.kind), amountPaise: Number(r.amount_paise), status: String(r.status),
        provider: String(r.provider), ...(r.provider_ref ? { providerRef: String(r.provider_ref) } : {}),
        createdAt: String(r.created_at),
      }));
    },
    createSettlement(settlement) {
      const record: SettlementRow = { ...settlement, id: settlement.id ?? newId('stl'), status: settlement.status ?? 'pending', createdAt: now() };
      db.prepare('INSERT INTO settlements (id, booking_id, vendor_id, amount_paise, status, utr, created_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(record.id, record.bookingId, record.vendorId, record.amountPaise, record.status, record.utr ?? null, record.createdAt, record.paidAt ?? null);
      return record;
    },
    settlements(args = {}) {
      const where: string[] = [];
      const params: string[] = [];
      if (args.vendorId) {
        where.push('vendor_id = ?');
        params.push(args.vendorId);
      }
      if (args.status) {
        where.push('status = ?');
        params.push(args.status);
      }
      return db.prepare(`SELECT * FROM settlements ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`)
        .all(...params).map((r) => ({
          id: String(r.id), bookingId: String(r.booking_id), vendorId: String(r.vendor_id),
          amountPaise: Number(r.amount_paise), status: String(r.status) as SettlementRow['status'],
          ...(r.utr ? { utr: String(r.utr) } : {}), createdAt: String(r.created_at),
          ...(r.paid_at ? { paidAt: String(r.paid_at) } : {}),
        }));
    },
    markSettlementPaid(id, utr, at) {
      db.prepare('UPDATE settlements SET status = ?, utr = ?, paid_at = ? WHERE id = ?').run('paid', utr, at ?? now(), id);
      const row = db.prepare('SELECT * FROM settlements WHERE id = ?').get(id);
      if (!row) throw new Error(`सेटलमेंट सापडले नाही: ${id}`);
      return {
        id: String(row.id), bookingId: String(row.booking_id), vendorId: String(row.vendor_id),
        amountPaise: Number(row.amount_paise), status: String(row.status) as SettlementRow['status'],
        ...(row.utr ? { utr: String(row.utr) } : {}), createdAt: String(row.created_at),
        ...(row.paid_at ? { paidAt: String(row.paid_at) } : {}),
      };
    },
    openDispute(dispute) {
      const record: DisputeRow = { ...dispute, id: dispute.id ?? newId('disp'), status: 'open', createdAt: now() };
      db.prepare('INSERT INTO disputes (id, booking_id, raised_by, reason, evidence, status, resolution, created_at, resolved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(record.id, record.bookingId, record.raisedBy, record.reason, JSON.stringify(record.evidence), record.status, null, record.createdAt, null);
      return record;
    },
    disputes(args = {}) {
      const rows = args.status
        ? db.prepare('SELECT * FROM disputes WHERE status = ? ORDER BY created_at DESC').all(args.status)
        : db.prepare('SELECT * FROM disputes ORDER BY created_at DESC').all();
      return rows.map((r) => ({
        id: String(r.id), bookingId: String(r.booking_id), raisedBy: String(r.raised_by) as DisputeRow['raisedBy'],
        reason: String(r.reason), evidence: json<string[]>(r.evidence, []), status: String(r.status) as DisputeRow['status'],
        ...(r.resolution ? { resolution: String(r.resolution) } : {}), createdAt: String(r.created_at),
        ...(r.resolved_at ? { resolvedAt: String(r.resolved_at) } : {}),
      }));
    },
    resolveDispute(id, resolution, status, at) {
      db.prepare('UPDATE disputes SET status = ?, resolution = ?, resolved_at = ? WHERE id = ?').run(status, resolution, at ?? now(), id);
      const found = bookings.disputes().find((d) => d.id === id);
      if (!found) throw new Error(`वाद सापडला नाही: ${id}`);
      return found;
    },
  };

  /* ---------------- ads ---------------- */
  const ads: AdsRepository = {
    createCampaign(campaign) {
      const record: AdCampaign = {
        ...campaign,
        id: campaign.id ?? newId('camp'),
        spentPaise: campaign.spentPaise ?? 0,
        metrics: campaign.metrics ?? { impressions: 0, profileViews: 0, leads: 0, quotes: 0, bookings: 0, bookingValuePaise: 0 },
        createdAt: campaign.createdAt ?? now(),
      };
      db.prepare('INSERT INTO ad_campaigns (id, vendor_id, placement, budget_paise, spent_paise, targeting, metrics, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(record.id, record.vendorId, record.placement, record.budgetPaise, record.spentPaise, JSON.stringify(record.targeting), JSON.stringify(record.metrics), record.active ? 1 : 0, record.createdAt);
      return record;
    },
    campaignById(id) {
      return mapCampaign(db.prepare('SELECT * FROM ad_campaigns WHERE id = ?').get(id));
    },
    campaignsForVendor(vendorId) {
      return db.prepare('SELECT * FROM ad_campaigns WHERE vendor_id = ? ORDER BY created_at DESC').all(vendorId)
        .map((r) => mapCampaign(r)).filter((c): c is AdCampaign => Boolean(c));
    },
    activeCampaigns(placement) {
      const rows = placement
        ? db.prepare('SELECT * FROM ad_campaigns WHERE active = 1 AND placement = ?').all(placement)
        : db.prepare('SELECT * FROM ad_campaigns WHERE active = 1').all();
      return rows.map((r) => mapCampaign(r)).filter((c): c is AdCampaign => Boolean(c));
    },
    recordEvent(event) {
      db.prepare('INSERT INTO ad_events (id, campaign_id, kind, city, event_id, occurred_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(newId('ade'), event.campaignId, event.kind, event.city ?? null, event.eventId ?? null, event.at ?? now());
      const campaign = ads.campaignById(event.campaignId);
      if (!campaign) throw new Error(`जाहिरात मोहीम सापडली नाही: ${event.campaignId}`);
      const metrics = { ...campaign.metrics };
      if (event.kind === 'impression') metrics.impressions += 1;
      if (event.kind === 'profile_view') metrics.profileViews += 1;
      if (event.kind === 'lead') metrics.leads += 1;
      if (event.kind === 'quote') metrics.quotes += 1;
      if (event.kind === 'booking') metrics.bookings += 1;
      const spentPaise = campaign.spentPaise + (event.costPaise ?? (event.kind === 'lead' ? 5000 : event.kind === 'profile_view' ? 300 : 5));
      db.prepare('UPDATE ad_campaigns SET metrics = ?, spent_paise = ? WHERE id = ?').run(JSON.stringify(metrics), spentPaise, event.campaignId);
      return ads.campaignById(event.campaignId)!;
    },
    updateCampaign(id, patch) {
      const current = ads.campaignById(id);
      if (!current) throw new Error(`जाहिरात मोहीम सापडली नाही: ${id}`);
      const next: AdCampaign = { ...current, ...patch, id };
      db.prepare('UPDATE ad_campaigns SET placement = ?, budget_paise = ?, spent_paise = ?, targeting = ?, metrics = ?, active = ? WHERE id = ?')
        .run(next.placement, next.budgetPaise, next.spentPaise, JSON.stringify(next.targeting), JSON.stringify(next.metrics), next.active ? 1 : 0, id);
      return next;
    },
  };

  /* ---------------- analytics ---------------- */
  const analytics: AnalyticsRepository = {
    upsertDay(metrics) {
      db.prepare(
        `INSERT INTO metrics_daily (date, new_events, active_events, published_invitations, leads, quotes, bookings, gmv_paise, commission_paise, median_response_minutes, booking_conversion, sponsored_impressions, organic_impressions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET new_events = excluded.new_events, active_events = excluded.active_events,
           published_invitations = excluded.published_invitations, leads = excluded.leads, quotes = excluded.quotes,
           bookings = excluded.bookings, gmv_paise = excluded.gmv_paise, commission_paise = excluded.commission_paise,
           median_response_minutes = excluded.median_response_minutes, booking_conversion = excluded.booking_conversion,
           sponsored_impressions = excluded.sponsored_impressions, organic_impressions = excluded.organic_impressions`,
      ).run(
        metrics.date, metrics.newEvents, metrics.activeEvents, metrics.publishedInvitations, metrics.leads,
        metrics.quotes, metrics.bookings, metrics.gmvPaise, metrics.commissionPaise, metrics.medianResponseMinutes,
        metrics.bookingConversion, metrics.sponsoredImpressions, metrics.organicImpressions,
      );
      return metrics;
    },
    day(date) {
      return mapMetrics(db.prepare('SELECT * FROM metrics_daily WHERE date = ?').get(date));
    },
    range(from, to) {
      return db.prepare('SELECT * FROM metrics_daily WHERE date BETWEEN ? AND ? ORDER BY date').all(from, to)
        .map((r) => mapMetrics(r)).filter((m): m is DailyMetrics => Boolean(m));
    },
    totals(from, to) {
      const row = db.prepare(
        `SELECT SUM(leads) AS leads, SUM(quotes) AS quotes, SUM(bookings) AS bookings, SUM(gmv_paise) AS gmv,
                SUM(commission_paise) AS commission, AVG(booking_conversion) AS conversion,
                AVG(median_response_minutes) AS response, SUM(sponsored_impressions) AS sponsored,
                SUM(organic_impressions) AS organic
         FROM metrics_daily WHERE date BETWEEN ? AND ?`,
      ).get(from, to);
      const sponsored = Number(row?.sponsored ?? 0);
      const organic = Number(row?.organic ?? 0);
      return {
        leads: Number(row?.leads ?? 0),
        quotes: Number(row?.quotes ?? 0),
        bookings: Number(row?.bookings ?? 0),
        gmvPaise: Number(row?.gmv ?? 0),
        commissionPaise: Number(row?.commission ?? 0),
        bookingConversion: Number(Number(row?.conversion ?? 0).toFixed(4)),
        medianResponseMinutes: Math.round(Number(row?.response ?? 0)),
        sponsoredShare: sponsored + organic ? Number((sponsored / (sponsored + organic)).toFixed(4)) : 0,
      };
    },
  };

  /* ---------------- assistant ---------------- */
  const assistant: AssistantRepository = {
    createConversation(conversation) {
      const record = {
        id: conversation.id ?? newId('conv'),
        ...(conversation.userId ? { userId: conversation.userId } : {}),
        ...(conversation.eventId ? { eventId: conversation.eventId } : {}),
        ...(conversation.title ? { title: conversation.title } : {}),
        createdAt: conversation.createdAt ?? now(),
      };
      db.prepare('INSERT INTO assistant_conversations (id, user_id, event_id, title, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(record.id, record.userId ?? null, record.eventId ?? null, record.title ?? null, record.createdAt);
      return record;
    },
    addMessage(message) {
      const id = message.id ?? newId('am');
      db.prepare(
        `INSERT INTO assistant_messages (id, conversation_id, role, content, tool_calls, provider, model, tokens_in, tokens_out, cost_usd, latency_ms, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id, message.conversationId, message.role, message.content, JSON.stringify(message.toolCalls ?? []),
        message.provider ?? null, message.model ?? null, message.tokensIn ?? 0, message.tokensOut ?? 0,
        message.costUsd ?? 0, message.latencyMs ?? 0, message.createdAt ?? now(),
      );
      return { id };
    },
    messages(conversationId, limit = 50) {
      return db.prepare('SELECT * FROM assistant_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?').all(conversationId, limit)
        .reverse()
        .map((r) => ({ id: String(r.id), role: String(r.role), content: String(r.content), toolCalls: json<unknown[]>(r.tool_calls, []), createdAt: String(r.created_at) }));
    },
    conversationsForUser(userId) {
      return db.prepare(
        `SELECT c.id, c.title, c.created_at, (SELECT COUNT(*) FROM assistant_messages m WHERE m.conversation_id = c.id) AS message_count
         FROM assistant_conversations c WHERE c.user_id = ? ORDER BY c.created_at DESC`,
      ).all(userId).map((r) => ({
        id: String(r.id), ...(r.title ? { title: String(r.title) } : {}),
        createdAt: String(r.created_at), messageCount: Number(r.message_count ?? 0),
      }));
    },
    spendUsd(from, to) {
      const row = db.prepare('SELECT SUM(cost_usd) AS total FROM assistant_messages WHERE created_at BETWEEN ? AND ?').get(from, to);
      return Number(Number(row?.total ?? 0).toFixed(6));
    },
  };

  /* ---------------- audit & privacy ---------------- */
  const audit: AuditRepository = {
    record(entry) {
      const record: AuditEntry = { ...entry, id: entry.id ?? newId('audit'), at: entry.at ?? now() };
      db.prepare('INSERT INTO audit_log (id, actor, action, entity, entity_id, before, after, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(
          record.id, record.actor, record.action, record.entity, record.entityId ?? null,
          record.before === undefined ? null : JSON.stringify(record.before),
          record.after === undefined ? null : JSON.stringify(record.after), record.at,
        );
      return record;
    },
    forEntity(entity, entityId) {
      return db.prepare('SELECT * FROM audit_log WHERE entity = ? AND entity_id = ? ORDER BY at DESC').all(entity, entityId).map((r) => ({
        id: String(r.id), actor: String(r.actor), action: String(r.action), entity: String(r.entity),
        ...(r.entity_id ? { entityId: String(r.entity_id) } : {}),
        before: r.before === null ? undefined : json<unknown>(r.before, undefined),
        after: r.after === null ? undefined : json<unknown>(r.after, undefined),
        at: String(r.at),
      }));
    },
    recent(limit = 50) {
      return db.prepare('SELECT * FROM audit_log ORDER BY at DESC LIMIT ?').all(limit).map((r) => ({
        id: String(r.id), actor: String(r.actor), action: String(r.action), entity: String(r.entity),
        ...(r.entity_id ? { entityId: String(r.entity_id) } : {}), at: String(r.at),
      }));
    },
  };

  const privacy: PrivacyRepository = {
    request(input) {
      const id = input.id ?? newId('dpdp');
      db.prepare('INSERT INTO privacy_requests (id, user_id, kind, status, note, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, input.userId, input.kind, 'received', input.note ?? null, input.createdAt ?? now(), null);
      return { id, status: 'received' };
    },
    list(userId) {
      const rows = userId
        ? db.prepare('SELECT * FROM privacy_requests WHERE user_id = ? ORDER BY created_at DESC').all(userId)
        : db.prepare('SELECT * FROM privacy_requests ORDER BY created_at DESC').all();
      return rows.map((r) => ({
        id: String(r.id), userId: String(r.user_id), kind: String(r.kind), status: String(r.status),
        createdAt: String(r.created_at), ...(r.completed_at ? { completedAt: String(r.completed_at) } : {}),
      }));
    },
    exportUser(userId) {
      const owned = events.listByOwner(userId);
      const eventIds = owned.map((e) => e.id);
      return {
        exportedAt: now(),
        user: users.byId(userId) ?? null,
        events: owned,
        guests: eventIds.flatMap((id) => events.guests(id)),
        budget: eventIds.flatMap((id) => events.budgetItems(id)),
        tasks: eventIds.flatMap((id) => events.tasks(id)),
        designs: designs.list({ ownerUserId: userId, limit: 500 }),
        assistantConversations: assistant.conversationsForUser(userId),
      };
    },
    deleteUser(userId) {
      const tables = ['events', 'designs', 'assistant_conversations', 'privacy_requests', 'users'];
      store.transaction(() => {
        db.prepare('DELETE FROM users WHERE id = ?').run(userId);
      });
      return { deleted: true, tables };
    },
  };

  const store: Store = {
    db,
    version: applied,
    users,
    vendors,
    events,
    designs,
    marketplace,
    bookings,
    ads,
    analytics,
    assistant,
    audit,
    privacy,
    transaction<T>(fn: () => T): T {
      db.exec('BEGIN');
      try {
        const result = fn();
        db.exec('COMMIT');
        return result;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    close() {
      db.close();
    },
  };

  return store;
}

/* ------------------------------------------------------------------ */
/* Migrations                                                          */
/* ------------------------------------------------------------------ */

export function migrate(db: DatabaseSync, run = true): number {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  )`);
  const row = db.prepare('SELECT MAX(version) AS version FROM schema_migrations').get();
  let current = Number(row?.version ?? 0);

  // A database created by a newer build must not be silently downgraded.
  if (current > LATEST_SCHEMA_VERSION) {
    throw new Error(`डेटाबेस आवृत्ती ${current} ही बिल्ड (${LATEST_SCHEMA_VERSION}) पेक्षा नवीन आहे — नवीन बिल्ड वापरा.`);
  }
  if (!run) return current;

  for (const migration of SQLITE_MIGRATIONS) {
    if (migration.version <= current) continue;
    db.exec('BEGIN');
    try {
      db.exec(migration.sql);
      db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)')
        .run(migration.version, migration.name, now());
      db.exec('COMMIT');
      current = migration.version;
    } catch (error) {
      db.exec('ROLLBACK');
      throw new Error(`Migration ${migration.version} (${migration.name}) failed: ${error instanceof Error ? error.message : error}`);
    }
  }
  return current;
}

/* ------------------------------------------------------------------ */
/* Row mappers                                                         */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

function mapUser(row: Row | undefined): User | undefined {
  if (!row) return undefined;
  return {
    id: String(row.id), role: String(row.role) as UserRole, name: String(row.name),
    ...(row.phone ? { phone: String(row.phone) } : {}),
    ...(row.email ? { email: String(row.email) } : {}),
    ...(row.city ? { city: String(row.city) } : {}),
    locale: String(row.locale ?? 'mr-IN'), createdAt: String(row.created_at),
    ...(row.last_seen_at ? { lastSeenAt: String(row.last_seen_at) } : {}),
  };
}

function mapVendor(row: Row | undefined): Vendor | undefined {
  if (!row) return undefined;
  return {
    id: String(row.id),
    ...(row.owner_user_id ? { ownerUserId: String(row.owner_user_id) } : {}),
    name: String(row.name), category: String(row.category), city: String(row.city),
    ...(row.pincode ? { pincode: String(row.pincode) } : {}),
    ...(row.latitude !== null ? { latitude: Number(row.latitude) } : {}),
    ...(row.longitude !== null ? { longitude: Number(row.longitude) } : {}),
    ...(row.about ? { about: String(row.about) } : {}),
    startingPricePaise: Number(row.starting_price_paise), plan: String(row.plan) as Vendor['plan'],
    rating: Number(row.rating), reviewCount: Number(row.review_count),
    bookingsCompleted: Number(row.bookings_completed), responseMinutes: Number(row.response_minutes),
    identityVerified: bool(row.identity_verified), gstVerified: bool(row.gst_verified),
    ...(row.gst_number ? { gstNumber: String(row.gst_number) } : {}),
    disputeCount: Number(row.dispute_count),
    ...(row.calendar_fresh_at ? { calendarFreshAt: String(row.calendar_fresh_at) } : {}),
    languages: json<string[]>(row.languages, []), createdAt: String(row.created_at),
  };
}

function mapEvent(row: Row | undefined): EventRecord | undefined {
  if (!row) return undefined;
  return {
    id: String(row.id), slug: String(row.slug), ownerUserId: String(row.owner_user_id),
    eventType: String(row.event_type), title: String(row.title), hostNames: json<string[]>(row.host_names, []),
    ...(row.event_date ? { eventDate: String(row.event_date) } : {}),
    city: String(row.city),
    ...(row.venue_name ? { venueName: String(row.venue_name) } : {}),
    ...(row.venue_address ? { venueAddress: String(row.venue_address) } : {}),
    guestCountExpected: Number(row.guest_count_expected), budgetTargetPaise: Number(row.budget_target_paise),
    status: String(row.status) as EventRecord['status'],
    isPublic: bool(row.is_public),
    ...(row.muhurat ? { muhurat: json<Record<string, unknown>>(row.muhurat, {}) } : {}),
    ...(row.panchang_snapshot ? { panchangSnapshot: json<Record<string, unknown>>(row.panchang_snapshot, {}) } : {}),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function mapGuest(row: Row): Guest {
  return {
    id: String(row.id), eventId: String(row.event_id), name: String(row.name),
    ...(row.phone ? { phone: String(row.phone) } : {}),
    ...(row.relation ? { relation: String(row.relation) } : {}),
    ...(row.side ? { side: String(row.side) as Guest['side'] } : {}),
    rsvpStatus: String(row.rsvp_status) as Guest['rsvpStatus'], guestCount: Number(row.guest_count),
    ...(row.table_no ? { tableNo: String(row.table_no) } : {}),
    code: String(row.code),
    ...(row.invited_at ? { invitedAt: String(row.invited_at) } : {}),
    ...(row.responded_at ? { respondedAt: String(row.responded_at) } : {}),
    ...(row.notes ? { notes: String(row.notes) } : {}),
  };
}

function mapDesign(row: Row | undefined): DesignRecord | undefined {
  if (!row) return undefined;
  return {
    id: String(row.id),
    ...(row.event_id ? { eventId: String(row.event_id) } : {}),
    ownerUserId: String(row.owner_user_id), name: String(row.name),
    ...(row.template_id ? { templateId: String(row.template_id) } : {}),
    preset: String(row.preset), scheme: String(row.scheme), version: Number(row.version),
    doc: json<unknown>(row.doc, null),
    ...(row.preview_svg ? { previewSvg: String(row.preview_svg) } : {}),
    status: String(row.status) as DesignRecord['status'],
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function mapPrintOrder(row: Row): PrintOrder {
  return {
    id: String(row.id),
    ...(row.event_id ? { eventId: String(row.event_id) } : {}),
    designId: String(row.design_id),
    ...(row.vendor_id ? { vendorId: String(row.vendor_id) } : {}),
    quantity: Number(row.quantity), paper: String(row.paper), finishing: json<string[]>(row.finishing, []),
    express: bool(row.express), status: String(row.status) as PrintOrder['status'],
    unitPricePaise: Number(row.unit_price_paise), shippingPaise: Number(row.shipping_paise),
    totalPaise: Number(row.total_paise),
    ...(row.proof_url ? { proofUrl: String(row.proof_url) } : {}),
    ...(row.tracking ? { tracking: String(row.tracking) } : {}),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function mapLead(row: Row | undefined): Lead | undefined {
  if (!row) return undefined;
  return {
    id: String(row.id),
    ...(row.event_id ? { eventId: String(row.event_id) } : {}),
    vendorId: String(row.vendor_id),
    ...(row.customer_user_id ? { customerUserId: String(row.customer_user_id) } : {}),
    category: String(row.category),
    ...(row.message ? { message: String(row.message) } : {}),
    ...(row.budget_paise !== null ? { budgetPaise: Number(row.budget_paise) } : {}),
    ...(row.event_date ? { eventDate: String(row.event_date) } : {}),
    ...(row.guest_count !== null ? { guestCount: Number(row.guest_count) } : {}),
    status: String(row.status) as Lead['status'], source: String(row.source) as Lead['source'],
    sponsored: bool(row.sponsored), responseDueAt: String(row.response_due_at),
    ...(row.responded_at ? { respondedAt: String(row.responded_at) } : {}),
    createdAt: String(row.created_at),
  };
}

function mapQuote(row: Row): QuoteRecord {
  return {
    id: String(row.id),
    ...(row.lead_id ? { leadId: String(row.lead_id) } : {}),
    vendorId: String(row.vendor_id),
    ...(row.event_id ? { eventId: String(row.event_id) } : {}),
    version: Number(row.version),
    items: json<QuoteRecord['items']>(row.items, []), discountPaise: Number(row.discount_paise),
    subtotalPaise: Number(row.subtotal_paise), gstPaise: Number(row.gst_paise), totalPaise: Number(row.total_paise),
    validTill: String(row.valid_till), status: String(row.status) as QuoteRecord['status'],
    createdAt: String(row.created_at),
    ...(row.accepted_at ? { acceptedAt: String(row.accepted_at) } : {}),
  };
}

function mapBooking(row: Row | undefined): Booking | undefined {
  if (!row) return undefined;
  return {
    id: String(row.id),
    ...(row.event_id ? { eventId: String(row.event_id) } : {}),
    vendorId: String(row.vendor_id),
    ...(row.lead_id ? { leadId: String(row.lead_id) } : {}),
    ...(row.quote_id ? { quoteId: String(row.quote_id) } : {}),
    state: String(row.state), eventDate: String(row.event_date), totalPaise: Number(row.total_paise),
    advancePaise: Number(row.advance_paise), commissionPaise: Number(row.commission_paise),
    history: json<Booking['history']>(row.history, []), createdAt: String(row.created_at),
    ...(row.confirmed_at ? { confirmedAt: String(row.confirmed_at) } : {}),
    ...(row.completed_at ? { completedAt: String(row.completed_at) } : {}),
    ...(row.cancelled_at ? { cancelledAt: String(row.cancelled_at) } : {}),
  };
}

function mapCampaign(row: Row | undefined): AdCampaign | undefined {
  if (!row) return undefined;
  return {
    id: String(row.id), vendorId: String(row.vendor_id),
    // Rows are constrained at write time; an unknown legacy value degrades to the
    // safest self-serve placement rather than crashing a vendor's dashboard.
    placement: (AD_PLACEMENTS as readonly string[]).includes(String(row.placement))
      ? (String(row.placement) as AdPlacement)
      : 'sponsored-search',
    budgetPaise: Number(row.budget_paise), spentPaise: Number(row.spent_paise),
    targeting: json<AdCampaign['targeting']>(row.targeting, {}),
    metrics: json<AdCampaign['metrics']>(row.metrics, { impressions: 0, profileViews: 0, leads: 0, quotes: 0, bookings: 0, bookingValuePaise: 0 }),
    active: bool(row.active), createdAt: String(row.created_at),
  };
}

function mapMetrics(row: Row | undefined): DailyMetrics | undefined {
  if (!row) return undefined;
  return {
    date: String(row.date), newEvents: Number(row.new_events), activeEvents: Number(row.active_events),
    publishedInvitations: Number(row.published_invitations), leads: Number(row.leads), quotes: Number(row.quotes),
    bookings: Number(row.bookings), gmvPaise: Number(row.gmv_paise), commissionPaise: Number(row.commission_paise),
    medianResponseMinutes: Number(row.median_response_minutes), bookingConversion: Number(row.booking_conversion),
    sponsoredImpressions: Number(row.sponsored_impressions), organicImpressions: Number(row.organic_impressions),
  };
}

export { likeTerm };
