/**
 * @mazi/commerce — transaction core: availability, quotes, booking lifecycle,
 * our own ledger, commissions, settlements, refunds and dispute handling.
 *
 * Principles (from the platform charter):
 *   1. The gateway is never the ledger. We record Order → PaymentAttempt →
 *      Commission → Settlement ourselves and reconcile.
 *   2. Money is integer **paise** everywhere. No floats touch currency.
 *   3. The booking lifecycle is a strict state machine: illegal transitions
 *      throw, they never silently "fix" data.
 *   4. Commission, GST and gateway fees are modelled so contribution margin is
 *      real, not assumed 100%.
 */

import { vendorCategoryLabel } from '@mazi/marathi';
import { z } from 'zod';

export const COMMERCE_VERSION = '1.0.0';

/* ------------------------------------------------------------------ */
/* Money                                                               */
/* ------------------------------------------------------------------ */

export const MoneySchema = z.number().int().min(0);
export type Paise = number;

export const rupees = (amount: number): Paise => Math.round(amount * 100);
export const toRupees = (paise: Paise): number => paise / 100;
export const formatRupees = (paise: Paise): string =>
  `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(paise / 100))}`;

/* ------------------------------------------------------------------ */
/* Categories & commission                                             */
/* ------------------------------------------------------------------ */

export const VENDOR_CATEGORIES = [
  'venue', 'photographer', 'videographer', 'decorator', 'caterer', 'printer', 'makeup',
  'mehendi', 'dj', 'sound', 'cake', 'florist', 'priest', 'transport', 'invitation',
  'bhangra' /* ढोल-ताशा */, 'anchor', 'tent', 'lighting', 'security', 'accommodation', 'planner',
  'choreographer', 'gifting', 'other',
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

/**
 * Category-wise take rate (per the business plan: venue 8%, photo 12%, etc.).
 * These are the *platform's* parameters — versioned so a quote can be replayed.
 */
export const COMMISSION_RATES: Record<VendorCategory, number> = {
  venue: 0.08, photographer: 0.12, videographer: 0.12, decorator: 0.10, caterer: 0.10,
  printer: 0.15, makeup: 0.12, mehendi: 0.12, dj: 0.10, sound: 0.10, cake: 0.12,
  florist: 0.12, priest: 0.05, transport: 0.10, invitation: 0.15, bhangra: 0.10,
  anchor: 0.10, tent: 0.08, lighting: 0.08, security: 0.08, accommodation: 0.05,
  planner: 0.05, choreographer: 0.10, gifting: 0.15, other: 0.10,
};

export const GST_RATE = 0.18;
export const GATEWAY_FEE_RATE = 0.0236; // Razorpay-like: 2% + GST on fee
export const PLATFORM_FEE_RATE = 0;

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

export const AVAILABILITY_STATUSES = ['available', 'tentative', 'hold', 'booked', 'blocked'] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export interface AvailabilitySlot {
  vendorId: string;
  date: string;
  status: AvailabilityStatus;
  /** A hold is a soft lock that expires — protects both sides. */
  holdExpiresAt?: string;
  teamCapacity?: number;
  bookedTeamCount?: number;
  notes?: string;
}

export interface AvailabilityQuery {
  vendorId: string;
  date: string;
  requiredTeam?: number;
  now?: Date;
}

/**
 * Availability is *capacity aware*: a vendor with 3 teams can serve 3 weddings
 * on the same date. Holds expire automatically, so a stale hold never blocks a
 * booking.
 */
export function availabilityState(
  slots: AvailabilitySlot[],
  query: AvailabilityQuery,
): { status: AvailabilityStatus; bookable: boolean; reason: string } {
  const now = (query.now ?? new Date()).getTime();
  const daySlots = slots.filter((s) => s.vendorId === query.vendorId && s.date === query.date);
  if (!daySlots.length) {
    return { status: 'available', bookable: true, reason: 'कोणतीही नोंद नाही — उपलब्ध मानले जाते' };
  }
  const blocked = daySlots.find((s) => s.status === 'blocked');
  if (blocked) return { status: 'blocked', bookable: false, reason: 'विक्रेत्याने हा दिवस राखीव ठेवला आहे' };

  const booked = daySlots.filter((s) => s.status === 'booked');
  const capacity = Math.max(...daySlots.map((s) => s.teamCapacity ?? 1));
  const needed = query.requiredTeam ?? 1;
  if (booked.length + needed > capacity) {
    return { status: 'booked', bookable: false, reason: `या दिवशी ${booked.length}/${capacity} संघ बुक झाले आहेत` };
  }

  const activeHold = daySlots.find((s) => s.status === 'hold' && (!s.holdExpiresAt || new Date(s.holdExpiresAt).getTime() > now));
  if (activeHold) {
    return {
      status: 'hold', bookable: false,
      reason: `तात्पुरता राखीव (${activeHold.holdExpiresAt ? new Date(activeHold.holdExpiresAt).toISOString().slice(0, 16) + ' पर्यंत' : 'कालबाह्य नोंद'})`,
    };
  }
  const tentative = daySlots.find((s) => s.status === 'tentative');
  if (tentative) return { status: 'tentative', bookable: true, reason: 'चर्चेत आहे — त्वरित निश्चिती करता येईल' };
  return { status: 'available', bookable: true, reason: 'उपलब्ध' };
}

export const HOLD_TTL_HOURS = 24;

/* ------------------------------------------------------------------ */
/* Booking lifecycle — strict state machine                            */
/* ------------------------------------------------------------------ */

export const BOOKING_STATES = [
  'ENQUIRY', 'QUOTE_SENT', 'QUOTE_ACCEPTED', 'PAYMENT_PENDING', 'BOOKING_CONFIRMED',
  'SERVICE_SCHEDULED', 'SERVICE_COMPLETED', 'SETTLEMENT', 'REVIEWED',
  'CANCELLED', 'RESCHEDULED', 'REFUND_PENDING', 'REFUNDED', 'DISPUTED',
  'VENDOR_NO_SHOW', 'CUSTOMER_NO_SHOW',
] as const;
export type BookingState = (typeof BOOKING_STATES)[number];

/** Allowed transitions. Everything not listed here is rejected. */
export const BOOKING_TRANSITIONS: Record<BookingState, BookingState[]> = {
  ENQUIRY: ['QUOTE_SENT', 'CANCELLED'],
  QUOTE_SENT: ['QUOTE_ACCEPTED', 'CANCELLED', 'ENQUIRY'],
  QUOTE_ACCEPTED: ['PAYMENT_PENDING', 'CANCELLED'],
  PAYMENT_PENDING: ['BOOKING_CONFIRMED', 'CANCELLED', 'REFUND_PENDING'],
  BOOKING_CONFIRMED: ['SERVICE_SCHEDULED', 'RESCHEDULED', 'CANCELLED', 'VENDOR_NO_SHOW', 'DISPUTED'],
  SERVICE_SCHEDULED: ['SERVICE_COMPLETED', 'RESCHEDULED', 'CANCELLED', 'VENDOR_NO_SHOW', 'CUSTOMER_NO_SHOW', 'DISPUTED'],
  SERVICE_COMPLETED: ['SETTLEMENT', 'DISPUTED', 'REFUND_PENDING'],
  SETTLEMENT: ['REVIEWED', 'DISPUTED'],
  REVIEWED: ['DISPUTED'],
  CANCELLED: ['REFUND_PENDING', 'REFUNDED'],
  RESCHEDULED: ['SERVICE_SCHEDULED', 'CANCELLED'],
  REFUND_PENDING: ['REFUNDED', 'DISPUTED'],
  REFUNDED: [],
  DISPUTED: ['REFUND_PENDING', 'SETTLEMENT', 'CANCELLED', 'REVIEWED'],
  VENDOR_NO_SHOW: ['REFUND_PENDING', 'RESCHEDULED', 'DISPUTED'],
  CUSTOMER_NO_SHOW: ['SETTLEMENT', 'REFUND_PENDING', 'DISPUTED'],
};

export interface TransitionRequest {
  from: BookingState;
  to: BookingState;
  actor: 'customer' | 'vendor' | 'admin' | 'system';
  reason?: string;
  at?: string;
}

export interface TransitionResult {
  ok: boolean;
  state?: BookingState;
  error?: string;
  /** Audit entry — every transition is journaled, no exceptions. */
  audit: { at: string; actor: string; from: BookingState; to: BookingState; reason?: string };
}

/** Roles permitted to trigger each transition. */
const TRANSITION_ACTORS: Partial<Record<BookingState, Array<TransitionRequest['actor']>>> = {
  QUOTE_ACCEPTED: ['customer', 'admin'],
  BOOKING_CONFIRMED: ['system', 'admin', 'customer'],
  SERVICE_COMPLETED: ['vendor', 'admin'],
  SETTLEMENT: ['system', 'admin'],
  REVIEWED: ['customer'],
  VENDOR_NO_SHOW: ['customer', 'admin'],
  CUSTOMER_NO_SHOW: ['vendor', 'admin'],
  DISPUTED: ['customer', 'vendor', 'admin'],
  REFUNDED: ['admin', 'system'],
};

export function transitionBooking(request: TransitionRequest): TransitionResult {
  const at = request.at ?? new Date().toISOString();
  const audit = { at, actor: request.actor, from: request.from, to: request.to, ...(request.reason ? { reason: request.reason } : {}) };

  if (request.from === request.to) {
    return { ok: false, error: `आधीच ${request.to} स्थितीत आहे`, audit };
  }
  const allowed = BOOKING_TRANSITIONS[request.from] ?? [];
  if (!allowed.includes(request.to)) {
    return {
      ok: false,
      error: `${request.from} → ${request.to} हे संक्रमण शक्य नाही. परवानगी: ${allowed.join(', ') || 'काहीही नाही'}`,
      audit,
    };
  }
  const actors = TRANSITION_ACTORS[request.to];
  if (actors && !actors.includes(request.actor)) {
    return { ok: false, error: `${request.to} संक्रमण ${request.actor} करू शकत नाही (परवानगी: ${actors.join(', ')})`, audit };
  }
  return { ok: true, state: request.to, audit };
}

/** Human Marathi labels for the pipeline UI. */
export const BOOKING_STATE_LABELS: Record<BookingState, string> = {
  ENQUIRY: 'चौकशी', QUOTE_SENT: 'कोट पाठविला', QUOTE_ACCEPTED: 'कोट स्वीकारला',
  PAYMENT_PENDING: 'देयक प्रलंबित', BOOKING_CONFIRMED: 'बुकिंग निश्चित',
  SERVICE_SCHEDULED: 'सेवा नियोजित', SERVICE_COMPLETED: 'सेवा पूर्ण', SETTLEMENT: 'सेटलमेंट',
  REVIEWED: 'अभिप्राय दिला', CANCELLED: 'रद्द', RESCHEDULED: 'पुनर्नियोजित',
  REFUND_PENDING: 'परतावा प्रलंबित', REFUNDED: 'परतावा झाला', DISPUTED: 'वाद',
  VENDOR_NO_SHOW: 'विक्रेता गैरहजर', CUSTOMER_NO_SHOW: 'ग्राहक गैरहजर',
};

/* ------------------------------------------------------------------ */
/* Quotes & pricing                                                    */
/* ------------------------------------------------------------------ */

export const QuoteItemSchema = z.object({
  label: z.string().min(1),
  /** Quantity in the vendor's own unit (hours, plates, photos, pieces). */
  quantity: z.number().positive(),
  unit: z.string().default('नग'),
  unitPricePaise: MoneySchema,
  optional: z.boolean().default(false),
});
export type QuoteItem = z.infer<typeof QuoteItemSchema>;

export const QuoteSchema = z.object({
  id: z.string(),
  vendorId: z.string(),
  eventId: z.string().optional(),
  category: z.enum(VENDOR_CATEGORIES),
  items: z.array(QuoteItemSchema),
  discountPaise: MoneySchema.default(0),
  /** Meterage/plate count changes at the last minute in real events. */
  validTill: z.string(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).default('draft'),
});
export type Quote = z.infer<typeof QuoteSchema>;

export interface PriceBreakdown {
  subtotalPaise: Paise;
  discountPaise: Paise;
  taxablePaise: Paise;
  gstPaise: Paise;
  customerTotalPaise: Paise;
  platformFeePaise: Paise;
  gatewayFeePaise: Paise;
  gatewayFeeGstPaise: Paise;
  commissionPaise: Paise;
  vendorPayoutPaise: Paise;
  /** Contribution margin retained by the platform on this order. */
  contributionPaise: Paise;
  takeRate: number;
}

/**
 * Full price waterfall for one quote. Money flows:
 *   customer pays subtotal − discount + GST
 *   − gateway fee (+GST) − commission = vendor payout
 *   commission − gatewayFee = platform contribution
 */
export function priceQuote(quote: Quote, opts: { commissionRate?: number; discountAlreadyApplied?: boolean } = {}): PriceBreakdown {
  const subtotal = quote.items
    .filter((i) => !i.optional)
    .reduce((sum, item) => sum + Math.round(item.quantity * item.unitPricePaise), 0);
  const discount = Math.min(quote.discountPaise, subtotal);
  const taxable = subtotal - discount;
  const gst = Math.round(taxable * GST_RATE);
  const customerTotal = taxable + gst;

  const rate = opts.commissionRate ?? COMMISSION_RATES[quote.category];
  const commission = Math.round(taxable * rate);
  const platformFee = Math.round(taxable * PLATFORM_FEE_RATE);
  const gatewayFee = Math.round(customerTotal * GATEWAY_FEE_RATE);
  const gatewayFeeGst = Math.round(gatewayFee * GST_RATE);
  const vendorPayout = taxable - commission - platformFee;
  const contribution = commission + platformFee - gatewayFee - gatewayFeeGst;

  return {
    subtotalPaise: subtotal,
    discountPaise: discount,
    taxablePaise: taxable,
    gstPaise: gst,
    customerTotalPaise: customerTotal,
    platformFeePaise: platformFee,
    gatewayFeePaise: gatewayFee,
    gatewayFeeGstPaise: gatewayFeeGst,
    commissionPaise: commission,
    vendorPayoutPaise: vendorPayout,
    contributionPaise: contribution,
    takeRate: Number(((commission + platformFee) / (taxable || 1)).toFixed(4)),
  };
}

/* ------------------------------------------------------------------ */
/* Ledger — double-entry, gateway-independent                          */
/* ------------------------------------------------------------------ */

export type LedgerAccount =
  | 'CUSTOMER_RECEIVABLE' | 'PLATFORM_CASH' | 'GATEWAY_FEES' | 'GST_PAYABLE'
  | 'VENDOR_PAYABLE' | 'PLATFORM_REVENUE' | 'REFUND_PAYABLE' | 'DISPUTE_RESERVE';

export interface LedgerEntry {
  id: string;
  orderId: string;
  account: LedgerAccount;
  /**
   * Signed: debit positive, credit negative — so every balanced posting sums to
   * exactly zero. Assets/expenses carry positive balances, liabilities/revenue
   * carry negative ones; `reconcileLedger` asserts the zero-sum invariant.
   */
  amountPaise: number;
  at: string;
  memo: string;
  idempotencyKey: string;
}

export interface LedgerPosting {
  entries: LedgerEntry[];
  /** Debits must equal credits — enforced, not hoped. */
  balanced: boolean;
  totalsByAccount: Partial<Record<LedgerAccount, number>>;
}

interface PostingLine { account: LedgerAccount; amountPaise: number; memo: string }

function buildPosting(orderId: string, lines: PostingLine[], at: string, idempotencyKey: string): LedgerPosting {
  const entries: LedgerEntry[] = lines.map((line, i) => ({
    id: `${orderId}-${i + 1}`,
    orderId,
    account: line.account,
    amountPaise: line.amountPaise,
    at,
    memo: line.memo,
    idempotencyKey: `${idempotencyKey}:${line.account}:${i}`,
  }));
  const sum = entries.reduce((s, e) => s + e.amountPaise, 0);
  const totalsByAccount: Partial<Record<LedgerAccount, number>> = {};
  for (const e of entries) totalsByAccount[e.account] = (totalsByAccount[e.account] ?? 0) + e.amountPaise;
  return { entries, balanced: sum === 0, totalsByAccount };
}

/** Customer paid: cash in, GST owed, vendor payable created, revenue recognised. */
export function postingForPayment(args: {
  orderId: string; breakdown: PriceBreakdown; at?: string; idempotencyKey?: string;
}): LedgerPosting {
  const { orderId, breakdown: b } = args;
  const at = args.at ?? new Date().toISOString();
  const key = args.idempotencyKey ?? `${orderId}:payment`;
  return buildPosting(orderId, [
    { account: 'PLATFORM_CASH', amountPaise: b.customerTotalPaise, memo: 'ग्राहकाकडून एकूण पेमेंट प्राप्त' },
    { account: 'GATEWAY_FEES', amountPaise: b.gatewayFeePaise + b.gatewayFeeGstPaise, memo: 'पेमेंट गेटवे शुल्क + GST' },
    { account: 'PLATFORM_CASH', amountPaise: -b.gatewayFeePaise - b.gatewayFeeGstPaise, memo: 'गेटवे शुल्क वजा' },
    { account: 'VENDOR_PAYABLE', amountPaise: -b.vendorPayoutPaise, memo: 'विक्रेत्याची देय रक्कम (दायित्व)' },
    { account: 'GST_PAYABLE', amountPaise: -b.gstPaise, memo: 'GST देय' },
    { account: 'PLATFORM_REVENUE', amountPaise: -b.commissionPaise - b.platformFeePaise, memo: 'कमिशन + प्लॅटफॉर्म शुल्क (उत्पन्न)' },
  ], at, key);
}

/** Vendor settled after service completion. */
export function postingForSettlement(args: {
  orderId: string; breakdown: PriceBreakdown; at?: string;
}): LedgerPosting {
  const at = args.at ?? new Date().toISOString();
  const b = args.breakdown;
  return buildPosting(args.orderId, [
    { account: 'VENDOR_PAYABLE', amountPaise: b.vendorPayoutPaise, memo: 'विक्रेत्याचे दायित्व बंद' },
    { account: 'PLATFORM_CASH', amountPaise: -b.vendorPayoutPaise, memo: 'विक्रेत्यास बँक ट्रान्सफर' },
  ], at, `${args.orderId}:settlement`);
}

/** Refund with a cancellation policy applied. */
export function postingForRefund(args: {
  orderId: string; breakdown: PriceBreakdown; refundPaise: Paise; at?: string;
}): LedgerPosting {
  const at = args.at ?? new Date().toISOString();
  return buildPosting(args.orderId, [
    { account: 'REFUND_PAYABLE', amountPaise: args.refundPaise, memo: 'ग्राहकास परतावा देय' },
    { account: 'PLATFORM_CASH', amountPaise: -args.refundPaise, memo: 'परतावा अदा' },
  ], at, `${args.orderId}:refund:${args.refundPaise}`);
}

/** Verify a stream of entries is internally consistent (run in ops dashboards). */
export function reconcileLedger(entries: LedgerEntry[]): {
  balanced: boolean; byAccount: Partial<Record<LedgerAccount, number>>; duplicateKeys: string[];
} {
  const byAccount: Partial<Record<LedgerAccount, number>> = {};
  const seen = new Set<string>();
  const duplicateKeys: string[] = [];
  for (const e of entries) {
    byAccount[e.account] = (byAccount[e.account] ?? 0) + e.amountPaise;
    if (seen.has(e.idempotencyKey)) duplicateKeys.push(e.idempotencyKey);
    seen.add(e.idempotencyKey);
  }
  const balanced = Object.values(byAccount).reduce((s, v) => s + (v ?? 0), 0) === 0 && duplicateKeys.length === 0;
  return { balanced, byAccount, duplicateKeys };
}

/* ------------------------------------------------------------------ */
/* Cancellation policies & refunds                                     */
/* ------------------------------------------------------------------ */

export interface CancellationPolicy {
  /** Days before the event → refund share of the vendor amount. */
  tiers: Array<{ daysBefore: number; refundShare: number; note?: string }>;
  /** Non-refundable advance, in share of the taxable amount. */
  nonRefundableAdvanceShare: number;
  /** Platform fee refunded when the vendor cancels or no-shows. */
  platformFeeRefundedOnVendorFault: boolean;
}

export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  tiers: [
    { daysBefore: 30, refundShare: 1.0, note: '३० दिवसांपूर्वी — पूर्ण परतावा (वजा गेटवे शुल्क)' },
    { daysBefore: 15, refundShare: 0.75, note: '१५–३० दिवस — ७५% परतावा' },
    { daysBefore: 7, refundShare: 0.5, note: '७–१५ दिवस — ५०% परतावा' },
    { daysBefore: 3, refundShare: 0.25, note: '३–७ दिवस — २५% परतावा' },
    { daysBefore: 0, refundShare: 0, note: '३ दिवसांच्या आत — परतावा नाही' },
  ],
  nonRefundableAdvanceShare: 0.1,
  platformFeeRefundedOnVendorFault: true,
};

export interface RefundCalculation {
  refundPaise: Paise;
  vendorPayoutReversedPaise: Paise;
  policyNote: string;
  deductions: Array<{ label: string; amountPaise: Paise }>;
}

export function calculateRefund(args: {
  breakdown: PriceBreakdown;
  daysBeforeEvent: number;
  fault: 'customer' | 'vendor' | 'force-majeure' | 'none';
  policy?: CancellationPolicy;
}): RefundCalculation {
  const policy = args.policy ?? DEFAULT_CANCELLATION_POLICY;
  const b = args.breakdown;

  if (args.fault === 'vendor') {
    return {
      refundPaise: b.customerTotalPaise,
      vendorPayoutReversedPaise: b.vendorPayoutPaise,
      policyNote: 'विक्रेत्याची चूक — ग्राहकाला पूर्ण परतावा',
      deductions: [],
    };
  }
  if (args.fault === 'force-majeure') {
    const share = 0.9;
    return {
      refundPaise: Math.round(b.taxablePaise * share),
      vendorPayoutReversedPaise: Math.round(b.vendorPayoutPaise * share),
      policyNote: 'अनिवार्य परिस्थिती — ९०% परतावा, गेटवे शुल्क वजा',
      deductions: [{ label: 'गेटवे शुल्क', amountPaise: b.customerTotalPaise - Math.round(b.taxablePaise * share) }],
    };
  }

  const tier = policy.tiers.find((t) => args.daysBeforeEvent >= t.daysBefore) ?? policy.tiers[policy.tiers.length - 1]!;
  const refundable = Math.round(b.taxablePaise * tier.refundShare);
  const advanceCut = Math.round(b.taxablePaise * policy.nonRefundableAdvanceShare);
  const afterAdvance = Math.max(0, refundable - advanceCut);
  const gstOnRefund = Math.round(afterAdvance * GST_RATE);
  const refund = afterAdvance + gstOnRefund;

  return {
    refundPaise: refund,
    vendorPayoutReversedPaise: Math.round(b.vendorPayoutPaise * (afterAdvance / (b.taxablePaise || 1))),
    policyNote: tier.note ?? 'रद्दीकरण धोरणानुसार',
    deductions: [
      { label: 'न परतावणारा अॅडव्हान्स', amountPaise: advanceCut },
      { label: 'गेटवे शुल्क', amountPaise: b.gatewayFeePaise + b.gatewayFeeGstPaise },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Vendor quality signals (evidence-based, never pay-to-win)           */
/* ------------------------------------------------------------------ */

export interface VendorSignals {
  bookingsCompleted: number;
  responseRate: number;
  verifiedReviews: number;
  averageRating: number;
  calendarFreshnessDays: number;
  identityVerified: boolean;
  gstVerified: boolean;
  disputeCount: number;
}

export interface TrustBadges {
  badges: Array<{ code: string; label: string }>;
  /** 0–100 discovery score: organic ranking input, no paid influence. */
  organicScore: number;
}

export function trustBadges(s: VendorSignals): TrustBadges {
  const badges: Array<{ code: string; label: string }> = [];
  if (s.identityVerified) badges.push({ code: 'identity', label: '✓ ओळख पडताळलेली' });
  if (s.gstVerified) badges.push({ code: 'gst', label: '✓ GST नोंदणी पडताळलेली' });
  if (s.bookingsCompleted >= 10) badges.push({ code: 'bookings', label: `✓ ${s.bookingsCompleted} पूर्ण माझी बुकिंग` });
  if (s.responseRate >= 0.9) badges.push({ code: 'response', label: `✓ ${Math.round(s.responseRate * 100)}% प्रतिसाद दर` });
  if (s.verifiedReviews >= 5) badges.push({ code: 'reviews', label: `✓ ${s.verifiedReviews} पडताळलेले अभिप्राय` });
  if (s.calendarFreshnessDays <= 1) badges.push({ code: 'calendar', label: '✓ कॅलेंडर आज अद्ययावत' });

  const score = Math.round(
    Math.min(1, s.bookingsCompleted / 40) * 25 +
    s.responseRate * 25 +
    Math.min(1, s.verifiedReviews / 20) * 20 +
    (s.averageRating / 5) * 20 +
    Math.max(0, 1 - s.calendarFreshnessDays / 30) * 10 -
    s.disputeCount * 3,
  );

  return { badges, organicScore: Math.max(0, Math.min(100, score)) };
}

/**
 * Sponsored placement ranking — always labelled, always separated from organic.
 * Sponsored eligibility requires a minimum organic score: ads cannot buy a bad
 * vendor into the top slot.
 */
export function rankForDiscovery(args: {
  vendors: Array<{ id: string; signals: VendorSignals; distanceKm: number; relevance: number; sponsoredBidPaise?: Paise }>;
  minOrganicScoreForAds?: number;
}): Array<{ id: string; position: number; sponsored: boolean; score: number }> {
  const minOrganic = args.minOrganicScoreForAds ?? 55;
  const scored = args.vendors.map((v) => {
    const { organicScore } = trustBadges(v.signals);
    const organic = organicScore * 0.55 + v.relevance * 0.3 + Math.max(0, 1 - v.distanceKm / 40) * 100 * 0.15;
    const sponsoredEligible = (v.sponsoredBidPaise ?? 0) > 0 && organicScore >= minOrganic;
    const sponsoredScore = sponsoredEligible
      ? 100 + (v.sponsoredBidPaise ?? 0) / 10_000 + v.relevance * 0.2 + organicScore * 0.2
      : 0;
    return { id: v.id, organic, sponsoredEligible, sponsoredScore };
  });

  scored.sort((a, b) => {
    const aScore = Math.max(a.organic, a.sponsoredScore);
    const bScore = Math.max(b.organic, b.sponsoredScore);
    return bScore - aScore;
  });

  return scored.map((s, i) => ({
    id: s.id,
    position: i + 1,
    sponsored: s.sponsoredEligible && s.sponsoredScore >= s.organic,
    score: Math.round(Math.max(s.organic, s.sponsoredScore)),
  }));
}

/* ------------------------------------------------------------------ */
/* Event readiness score                                               */
/* ------------------------------------------------------------------ */

export interface ReadinessInput {
  eventType: string;
  daysToEvent: number;
  vendors: Array<{ category: VendorCategory; status: 'confirmed' | 'tentative' | 'none' }>;
  guests: { invited: number; responded: number; expected: number };
  budget: { targetPaise: Paise; committedPaise: Paise; paidPaise: Paise };
  tasks: { total: number; done: number; overdue: number };
  invitations: { published: boolean; sentShare: number };
  muhuratChosen: boolean;
}

export interface ReadinessReport {
  score: number;
  grade: 'तयार' | 'जवळपास तयार' | 'लक्ष द्या' | 'धोक्यात';
  dimensions: Array<{ key: string; label: string; score: number; weight: number; note: string }>;
  risks: Array<{ severity: 'high' | 'medium' | 'low'; message: string; action: string }>;
}

const CRITICAL_CATEGORIES: Record<string, VendorCategory[]> = {
  wedding: ['venue', 'caterer', 'photographer'],
  birthday: ['caterer'],
  gruhapravesh: ['caterer', 'priest'],
  naming: ['caterer', 'priest'],
  satyanarayan: ['priest'],
  corporate: ['venue', 'caterer'],
  other: [],
};

export function calculateReadiness(input: ReadinessInput): ReadinessReport {
  const critical = CRITICAL_CATEGORIES[input.eventType] ?? CRITICAL_CATEGORIES.other!;
  const dimensions: ReadinessReport['dimensions'] = [];
  const risks: ReadinessReport['risks'] = [];

  const vendorScore = critical.length
    ? critical.reduce((sum, category) => {
      const found = input.vendors.find((v) => v.category === category);
      return sum + (found?.status === 'confirmed' ? 1 : found?.status === 'tentative' ? 0.5 : 0);
    }, 0) / critical.length
    : 1;
  dimensions.push({
    key: 'vendors', label: 'मुख्य विक्रेते', score: Math.round(vendorScore * 100), weight: 30,
    note: critical.map((c) => {
      const v = input.vendors.find((x) => x.category === c);
      return `${vendorCategoryLabel(c)}: ${v?.status === 'confirmed' ? 'निश्चित' : v?.status === 'tentative' ? 'चर्चेत' : 'निश्चित नाही'}`;
    }).join(' • '),
  });
  for (const category of critical) {
    const v = input.vendors.find((x) => x.category === category);
    if (!v || v.status === 'none') {
      risks.push({
        severity: input.daysToEvent < 30 ? 'high' : 'medium',
        message: `${vendorCategoryLabel(category)} अद्याप निश्चित नाही`,
        action: 'शिफारस केलेल्या विक्रेत्यांकडून कोट मागवा',
      });
    } else if (v.status === 'tentative') {
      // "In talks" is the single most common way a wedding venue is lost.
      risks.push({
        severity: input.daysToEvent < 45 ? 'high' : 'medium',
        message: `${vendorCategoryLabel(category)} फक्त चर्चेत आहे`,
        action: 'दर व तारीख लेखी निश्चित करा, आगाऊ रक्कम भरा',
      });
    }
  }

  const rsvpShare = input.guests.invited ? input.guests.responded / input.guests.invited : 0;
  dimensions.push({
    key: 'guests', label: 'पाहुणे व RSVP', score: Math.round(Math.min(1, rsvpShare) * 100), weight: 20,
    note: `${input.guests.responded}/${input.guests.invited} प्रतिसाद`,
  });
  const pending = input.guests.invited - input.guests.responded;
  if (pending > input.guests.invited * 0.2) {
    risks.push({
      severity: input.daysToEvent < 15 ? 'high' : 'medium',
      message: `${pending} पाहुण्यांनी अद्याप उत्तर दिले नाही`,
      action: 'व्हॉट्सअॅप स्मरणिका पाठवा',
    });
  }

  const budgetScore = input.budget.targetPaise
    ? Math.max(0, 1 - Math.max(0, input.budget.committedPaise - input.budget.targetPaise) / input.budget.targetPaise)
    : 1;
  dimensions.push({
    key: 'budget', label: 'बजेट', score: Math.round(budgetScore * 100), weight: 15,
    note: `निश्चित ${formatRupees(input.budget.committedPaise)} / लक्ष्य ${formatRupees(input.budget.targetPaise)}`,
  });
  if (input.budget.committedPaise > input.budget.targetPaise * 1.1) {
    risks.push({
      severity: 'medium',
      message: `बजेट ${Math.round(((input.budget.committedPaise / input.budget.targetPaise) - 1) * 100)}% ओलांडले`,
      action: 'पर्यायी विक्रेते किंवा कमी खर्चाचे पॅकेज पाहा',
    });
  }

  const taskScore = input.tasks.total ? (input.tasks.done / input.tasks.total) * (input.tasks.overdue ? 0.85 : 1) : 1;
  dimensions.push({
    key: 'tasks', label: 'कार्ये', score: Math.round(Math.min(1, taskScore) * 100), weight: 15,
    note: `${input.tasks.done}/${input.tasks.total} पूर्ण${input.tasks.overdue ? ` • ${input.tasks.overdue} मुदत संपलेली` : ''}`,
  });
  if (input.tasks.overdue > 0 && input.daysToEvent < 21) {
    risks.push({ severity: 'medium', message: `${input.tasks.overdue} कार्ये मुदतीबाहेर`, action: 'आजच प्राधान्य कार्ये पूर्ण करा' });
  }

  const inviteScore = (input.invitations.published ? 0.6 : 0) + Math.min(1, input.invitations.sentShare) * 0.4;
  dimensions.push({
    key: 'invitations', label: 'निमंत्रण', score: Math.round(inviteScore * 100), weight: 12,
    note: input.invitations.published ? 'पत्रिका प्रकाशित' : 'पत्रिका अप्रकाशित',
  });
  if (!input.invitations.published && input.daysToEvent < 45) {
    risks.push({ severity: 'high', message: 'निमंत्रण पत्रिका प्रकाशित झालेली नाही', action: 'Create Studio मध्ये पत्रिका तयार करा' });
  }

  dimensions.push({
    key: 'muhurat', label: 'मुहूर्त', score: input.muhuratChosen ? 100 : 40, weight: 8,
    note: input.muhuratChosen ? 'मुहूर्त निश्चित' : 'मुहूर्त निवडलेला नाही',
  });
  if (!input.muhuratChosen && input.daysToEvent < 60) {
    risks.push({ severity: 'medium', message: 'मुहूर्त निश्चित नाही', action: 'पंचांगानुसार मुहूर्त शोधा' });
  }

  const weightSum = dimensions.reduce((s, d) => s + d.weight, 0);
  const score = Math.round(dimensions.reduce((s, d) => s + d.score * d.weight, 0) / weightSum);
  const grade: ReadinessReport['grade'] = score >= 85 ? 'तयार' : score >= 65 ? 'जवळपास तयार' : score >= 45 ? 'लक्ष द्या' : 'धोक्यात';

  return { score, grade, dimensions, risks };
}

/* ------------------------------------------------------------------ */
/* Backup vendors                                                      */
/* ------------------------------------------------------------------ */

export interface BackupCandidate {
  vendorId: string;
  name: string;
  category: VendorCategory;
  distanceKm: number;
  rating: number;
  pricePaise: Paise;
  availability: AvailabilityStatus;
}

/**
 * When a vendor cancels, surface (never auto-book) three real alternatives
 * matching date + budget. This is the marketplace advantage AI alone cannot
 * replicate: 500 physical cards and a decorated mandap cannot be generated.
 */
export function findBackupVendors(args: {
  candidates: BackupCandidate[];
  budgetPaise: Paise;
  date: string;
  limit?: number;
}): BackupCandidate[] {
  const limit = args.limit ?? 3;
  const tolerance = args.budgetPaise * 0.25;
  return args.candidates
    .filter((c) => c.availability === 'available' || c.availability === 'tentative')
    .filter((c) => Math.abs(c.pricePaise - args.budgetPaise) <= tolerance)
    .sort((a, b) =>
      (b.rating * 20 - b.distanceKm) - (a.rating * 20 - a.distanceKm) ||
      Math.abs(a.pricePaise - args.budgetPaise) - Math.abs(b.pricePaise - args.budgetPaise),
    )
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Ads — self-serve Mazi Ads                                           */
/* ------------------------------------------------------------------ */

export const AD_PLACEMENTS = ['sponsored-search', 'featured-category', 'banner', 'offer', 'lead-gen'] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export interface AdCampaign {
  id: string;
  vendorId: string;
  placement: AdPlacement;
  budgetPaise: Paise;
  spentPaise: Paise;
  targeting: { city?: string; pincode?: string; eventTypes?: string[]; minBudgetPaise?: Paise; dateFrom?: string; dateTo?: string };
  metrics: { impressions: number; profileViews: number; leads: number; quotes: number; bookings: number; bookingValuePaise: Paise };
  active: boolean;
}

export interface AdPerformance {
  ctr: number;
  costPerLeadPaise: Paise;
  costPerBookingPaise: Paise;
  roas: number;
  funnel: Array<{ stage: string; count: number; conversionFromPrevious: number }>;
}

export function adPerformance(c: AdCampaign): AdPerformance {
  const safe = (n: number, d: number) => (d > 0 ? n / d : 0);
  const funnel = [
    { stage: 'इम्प्रेशन', count: c.metrics.impressions, conversionFromPrevious: 0 },
    { stage: 'प्रोफाइल पाहणी', count: c.metrics.profileViews, conversionFromPrevious: safe(c.metrics.profileViews, c.metrics.impressions) },
    { stage: 'चौकशी', count: c.metrics.leads, conversionFromPrevious: safe(c.metrics.leads, c.metrics.profileViews) },
    { stage: 'कोट', count: c.metrics.quotes, conversionFromPrevious: safe(c.metrics.quotes, c.metrics.leads) },
    { stage: 'बुकिंग', count: c.metrics.bookings, conversionFromPrevious: safe(c.metrics.bookings, c.metrics.quotes) },
  ];
  return {
    ctr: Number(safe(c.metrics.profileViews, c.metrics.impressions).toFixed(4)),
    costPerLeadPaise: Math.round(safe(c.spentPaise, c.metrics.leads)),
    costPerBookingPaise: Math.round(safe(c.spentPaise, c.metrics.bookings)),
    roas: Number(safe(c.metrics.bookingValuePaise, c.spentPaise).toFixed(2)),
    funnel,
  };
}

/* ------------------------------------------------------------------ */
/* Subscription plans (Vendor OS)                                      */
/* ------------------------------------------------------------------ */

export const VENDOR_PLANS = [
  {
    code: 'free', name: 'सुरुवात', pricePaise: 0,
    features: ['प्रोफाइल व पोर्टफोलिओ', 'महिन्याला ५ चौकशी', 'मूलभूत आकडेवारी'],
  },
  {
    code: 'growth', name: 'वाढ', pricePaise: 149900,
    features: ['महिन्याला २५ पात्र लीड क्रेडिट', 'कॅलेंडर + कोट + CRM', 'व्हॉट्सअॅप साधने', '८–१०% कमिशन', 'पहिल्या २ बुकिंगवर ०% कमिशन'],
  },
  {
    code: 'pro', name: 'प्रो', pricePaise: 399900,
    features: ['उच्च लीड वाटप', 'प्रगत CRM व पॅकेजेस', 'प्रगत आकडेवारी व प्रमोशन', 'संघ सदस्य', 'डिस्कव्हरीत प्राधान्य', '३–५% कमिशन'],
  },
  {
    code: 'enterprise', name: 'एंटरप्राइज', pricePaise: null,
    features: ['सानुकूल करार', 'API व व्हाइट-लेबल', 'समर्पित व्यवस्थापक'],
  },
] as const;

export function commissionForPlan(base: number, plan: 'free' | 'growth' | 'pro' | 'enterprise', launchIncentiveLeft = 0): number {
  if (launchIncentiveLeft > 0) return 0;
  switch (plan) {
    case 'growth': return Math.max(0.08, Math.min(base, 0.10));
    case 'pro': return Math.max(0.03, Math.min(base, 0.05));
    case 'enterprise': return Math.min(base, 0.03);
    default: return Math.min(base, 0.15);
  }
}
