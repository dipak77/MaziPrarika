import { describe, expect, it } from 'vitest';

import {
  adPerformance,
  availabilityState,
  BOOKING_STATE_LABELS,
  BOOKING_STATES,
  BOOKING_TRANSITIONS,
  calculateReadiness,
  calculateRefund,
  COMMERCE_VERSION,
  COMMISSION_RATES,
  commissionForPlan,
  findBackupVendors,
  formatRupees,
  GST_RATE,
  HOLD_TTL_HOURS,
  PLATFORM_FEE_RATE,
  postingForPayment,
  postingForRefund,
  postingForSettlement,
  priceQuote,
  rankForDiscovery,
  reconcileLedger,
  transitionBooking,
  trustBadges,
  type Quote,
  type VendorSignals,
} from './index.js';

const quote = (over: Partial<Quote> = {}): Quote => ({
  id: 'q_test',
  vendorId: 'vnd_test',
  category: 'photographer',
  items: [
    { label: 'मुख्य छायाचित्रण', quantity: 2, unit: 'दिवस', unitPricePaise: 4_000_000, optional: false },
    { label: 'ड्रोन शॉट', quantity: 1, unit: 'नग', unitPricePaise: 1_000_000, optional: true },
  ],
  discountPaise: 100_000,
  validTill: '2027-01-01',
  status: 'sent',
  ...over,
});

describe('money', () => {
  it('formats paise in the Indian numbering system', () => {
    expect(formatRupees(0)).toBe('₹0');
    expect(formatRupees(1_00_00_000)).toBe('₹1,00,000');
    expect(formatRupees(12_34_56_78)).toBe('₹1,23,457');
    expect(formatRupees(45_67_89)).toBe('₹4,568');
  });
});

describe('quote pricing waterfall', () => {
  it('prices subtotal, GST, commission, gateway and contribution consistently', () => {
    const b = priceQuote(quote());
    expect(b.subtotalPaise).toBe(8_000_000); // the optional drone shot is excluded
    expect(b.discountPaise).toBe(100_000);
    expect(b.taxablePaise).toBe(7_900_000);
    expect(b.gstPaise).toBe(Math.round(7_900_000 * GST_RATE));
    expect(b.customerTotalPaise).toBe(b.taxablePaise + b.gstPaise);
    expect(b.commissionPaise).toBe(Math.round(7_900_000 * COMMISSION_RATES.photographer));
    expect(b.platformFeePaise).toBe(Math.round(7_900_000 * PLATFORM_FEE_RATE));
    expect(b.gatewayFeePaise).toBeGreaterThan(0);
    expect(b.gatewayFeeGstPaise).toBe(Math.round(b.gatewayFeePaise * GST_RATE));
  });

  it('never pays the vendor the customer total — contribution is modelled, not assumed', () => {
    const b = priceQuote(quote());
    expect(b.vendorPayoutPaise).toBeLessThan(b.customerTotalPaise);
    // contribution = commission + platform fee − gateway fee (incl. GST on the fee)
    expect(b.contributionPaise).toBe(b.commissionPaise + b.platformFeePaise - b.gatewayFeePaise - b.gatewayFeeGstPaise);
    expect(b.contributionPaise).toBeGreaterThan(0);
    // takeRate is the commission rate actually applied to the taxable amount
    expect(b.takeRate).toBe(COMMISSION_RATES.photographer);
    expect(b.contributionPaise / b.taxablePaise).toBeLessThan(b.takeRate);
  });

  it('honours a Pro-plan commission override', () => {
    const standard = priceQuote(quote());
    const pro = priceQuote(quote(), { commissionRate: commissionForPlan(COMMISSION_RATES.photographer, 'pro') });
    expect(pro.commissionPaise).toBe(Math.round(7_900_000 * 0.05));
    expect(pro.commissionPaise).toBeLessThan(standard.commissionPaise);
  });

  it('caps an oversized discount instead of producing a negative invoice', () => {
    const b = priceQuote(quote({ discountPaise: 99_000_000 }));
    expect(b.discountPaise).toBe(8_000_000);
    expect(b.taxablePaise).toBe(0);
    expect(b.customerTotalPaise).toBe(0);
  });

  it('charges event-critical categories more than logistics partners', () => {
    expect(COMMISSION_RATES.printer).toBeGreaterThan(COMMISSION_RATES.priest);
    expect(COMMISSION_RATES.venue).toBeLessThan(COMMISSION_RATES.makeup);
  });
});

describe('plan commissions', () => {
  it('keeps Growth in the 8–10% band and Pro in the 3–5% band', () => {
    expect(commissionForPlan(0.12, 'growth')).toBe(0.1);
    expect(commissionForPlan(0.05, 'growth')).toBe(0.08);
    expect(commissionForPlan(0.12, 'pro')).toBe(0.05);
    expect(commissionForPlan(0.01, 'pro')).toBe(0.03);
    expect(commissionForPlan(0.2, 'free')).toBeLessThanOrEqual(0.15);
  });

  it('honours the launch incentive (first bookings at 0% commission)', () => {
    expect(commissionForPlan(0.1, 'growth', 2)).toBe(0);
  });
});

describe('booking state machine', () => {
  const happy: Array<{ to: (typeof BOOKING_STATES)[number]; actor: 'customer' | 'vendor' | 'admin' | 'system' }> = [
    { to: 'QUOTE_SENT', actor: 'vendor' },
    { to: 'QUOTE_ACCEPTED', actor: 'customer' },
    { to: 'PAYMENT_PENDING', actor: 'system' },
    { to: 'BOOKING_CONFIRMED', actor: 'system' },
    { to: 'SERVICE_SCHEDULED', actor: 'vendor' },
    { to: 'SERVICE_COMPLETED', actor: 'vendor' },
    { to: 'SETTLEMENT', actor: 'system' },
    { to: 'REVIEWED', actor: 'customer' },
  ];

  it('walks the whole happy path forward, journaling every step', () => {
    let state: (typeof BOOKING_STATES)[number] = 'ENQUIRY';
    for (const step of happy) {
      expect(BOOKING_TRANSITIONS[state]).toContain(step.to);
      const result = transitionBooking({ from: state, to: step.to, actor: step.actor, at: '2026-09-24T06:00:00.000Z' });
      expect(result.ok).toBe(true);
      expect(result.state).toBe(step.to);
      expect(result.audit).toMatchObject({ from: state, to: step.to, actor: step.actor, at: '2026-09-24T06:00:00.000Z' });
      state = step.to;
    }
    expect(BOOKING_TRANSITIONS.REVIEWED).toEqual(['DISPUTED']);
  });

  it('refuses illegal jumps and says exactly what is allowed', () => {
    const blocked = transitionBooking({ from: 'ENQUIRY', to: 'SERVICE_COMPLETED', actor: 'customer' });
    expect(blocked.ok).toBe(false);
    expect(blocked.state).toBeUndefined();
    expect(blocked.error).toContain('ENQUIRY → SERVICE_COMPLETED');
    expect(blocked.error).toContain('QUOTE_SENT');
    expect(blocked.audit.from).toBe('ENQUIRY');
  });

  it('refuses the same-state transition', () => {
    const same = transitionBooking({ from: 'QUOTE_SENT', to: 'QUOTE_SENT', actor: 'vendor' });
    expect(same.ok).toBe(false);
    expect(same.error).toContain('आधीच');
  });

  it('enforces who may trigger a transition', () => {
    const wrongActor = transitionBooking({ from: 'SETTLEMENT', to: 'REVIEWED', actor: 'vendor' });
    expect(wrongActor.ok).toBe(false);
    expect(wrongActor.error).toContain('vendor करू शकत नाही');
    expect(transitionBooking({ from: 'SETTLEMENT', to: 'REVIEWED', actor: 'customer' }).ok).toBe(true);
  });

  it('gives every state a Marathi label and a defined transition list', () => {
    for (const state of BOOKING_STATES) {
      expect(BOOKING_STATE_LABELS[state]).toMatch(/[\u0900-\u097F]/);
      expect(Array.isArray(BOOKING_TRANSITIONS[state])).toBe(true);
    }
    expect(BOOKING_STATES).toHaveLength(16);
  });
});

describe('ledger postings', () => {
  const b = priceQuote(quote());

  it('balances the payment posting to exactly zero', () => {
    const posting = postingForPayment({ orderId: 'bk_test', breakdown: b, at: '2026-09-24T06:00:00.000Z', idempotencyKey: 'bk_test:payment' });
    expect(posting.entries.reduce((s, e) => s + e.amountPaise, 0)).toBe(0);
    expect(posting.balanced).toBe(true);
    expect(posting.totalsByAccount.PLATFORM_CASH).toBe(b.customerTotalPaise - b.gatewayFeePaise - b.gatewayFeeGstPaise);
    expect(posting.totalsByAccount.VENDOR_PAYABLE).toBe(-b.vendorPayoutPaise);
    expect(posting.totalsByAccount.PLATFORM_REVENUE).toBe(-b.commissionPaise - b.platformFeePaise);
  });

  it('balances settlements and refunds', () => {
    const settlement = postingForSettlement({ orderId: 'bk_test', breakdown: b });
    const refund = postingForRefund({ orderId: 'bk_test', breakdown: b, refundPaise: 1_000_000 });
    for (const posting of [settlement, refund]) {
      expect(posting.entries.reduce((s, e) => s + e.amountPaise, 0)).toBe(0);
      expect(posting.balanced).toBe(true);
    }
  });

  it('reconciles a stream of entries and flags duplicate idempotency keys', () => {
    const payment = postingForPayment({ orderId: 'bk_test', breakdown: b, idempotencyKey: 'bk_test:payment' });
    const clean = reconcileLedger([...payment.entries, ...postingForSettlement({ orderId: 'bk_test', breakdown: b }).entries]);
    expect(clean.balanced).toBe(true);
    expect(clean.duplicateKeys).toEqual([]);

    const duplicated = reconcileLedger([...payment.entries, payment.entries[0]!]);
    expect(duplicated.duplicateKeys.length).toBeGreaterThan(0);
    expect(duplicated.balanced).toBe(false);
  });

  it('keeps every entry replayable: same key in, same entry out', () => {
    const first = postingForPayment({ orderId: 'bk_test', breakdown: b, at: '2026-09-24T06:00:00.000Z', idempotencyKey: 'bk_test:payment' });
    const second = postingForPayment({ orderId: 'bk_test', breakdown: b, at: '2026-09-25T06:00:00.000Z', idempotencyKey: 'bk_test:payment' });
    expect(second.entries.map((e) => e.idempotencyKey)).toEqual(first.entries.map((e) => e.idempotencyKey));
  });
});

describe('refunds', () => {
  const b = priceQuote(quote());

  it('refunds in full when the vendor is at fault', () => {
    const refund = calculateRefund({ breakdown: b, daysBeforeEvent: 2, fault: 'vendor' });
    expect(refund.refundPaise).toBe(b.customerTotalPaise);
    expect(refund.policyNote).toContain('विक्रेत्याची चूक');
  });

  it('applies tiered shares and the non-refundable advance for customer cancellations', () => {
    const early = calculateRefund({ breakdown: b, daysBeforeEvent: 45, fault: 'customer' });
    const mid = calculateRefund({ breakdown: b, daysBeforeEvent: 20, fault: 'customer' });
    const late = calculateRefund({ breakdown: b, daysBeforeEvent: 1, fault: 'customer' });
    expect(early.refundPaise).toBeGreaterThan(mid.refundPaise);
    expect(mid.refundPaise).toBeGreaterThan(late.refundPaise);
    expect(late.refundPaise).toBe(0);
    expect(early.deductions.some((d) => d.label.includes('न परतावणारा'))).toBe(true);
    expect(early.refundPaise).toBeLessThanOrEqual(b.customerTotalPaise);
  });

  it('keeps 90% available for force-majeure', () => {
    const force = calculateRefund({ breakdown: b, daysBeforeEvent: 0, fault: 'force-majeure' });
    expect(force.refundPaise).toBe(Math.round(b.taxablePaise * 0.9));
    expect(force.vendorPayoutReversedPaise).toBeGreaterThan(0);
  });
});

describe('vendor trust signals', () => {
  const signals = (over: Partial<VendorSignals> = {}): VendorSignals => ({
    bookingsCompleted: 42,
    responseRate: 0.95,
    verifiedReviews: 18,
    averageRating: 4.7,
    calendarFreshnessDays: 0,
    identityVerified: true,
    gstVerified: true,
    disputeCount: 0,
    ...over,
  });

  it('awards badges only from stored evidence', () => {
    const weak = trustBadges(signals({ bookingsCompleted: 1, responseRate: 0.4, verifiedReviews: 1, calendarFreshnessDays: 20, identityVerified: false, gstVerified: false }));
    expect(weak.badges).toHaveLength(0);
    const strong = trustBadges(signals());
    expect(strong.badges.map((b) => b.code)).toEqual(['identity', 'gst', 'bookings', 'response', 'reviews', 'calendar']);
  });

  it('penalises disputes in the organic score', () => {
    const clean = trustBadges(signals());
    const disputed = trustBadges(signals({ disputeCount: 2 }));
    expect(disputed.organicScore).toBeLessThan(clean.organicScore);
    expect(clean.organicScore).toBeLessThanOrEqual(100);
  });

  it('ranks sponsored results only when they also earn it organically', () => {
    const ranked = rankForDiscovery({
      vendors: [
        { id: 'strong-organic', signals: signals(), distanceKm: 4, relevance: 90 },
        { id: 'bidder-good', signals: signals({ bookingsCompleted: 20, verifiedReviews: 8 }), distanceKm: 6, relevance: 80, sponsoredBidPaise: 500_000 },
        { id: 'bidder-weak', signals: signals({ bookingsCompleted: 0, responseRate: 0.2, verifiedReviews: 0, averageRating: 2, identityVerified: false, disputeCount: 3 }), distanceKm: 30, relevance: 10, sponsoredBidPaise: 5_000_000 },
      ],
    });
    const weak = ranked.find((r) => r.id === 'bidder-weak')!;
    expect(weak.sponsored).toBe(false);
    const good = ranked.find((r) => r.id === 'bidder-good')!;
    expect(good.sponsored).toBe(true);
    expect(ranked.find((r) => r.id === 'strong-organic')!.sponsored).toBe(false);
    expect(ranked.map((r) => r.position)).toEqual([1, 2, 3]);
  });
});

describe('availability', () => {
  const now = new Date('2026-09-24T06:00:00.000Z');

  it('treats a day with no record as available, and expires stale holds', () => {
    expect(availabilityState([], { vendorId: 'v1', date: '2026-11-12', now }).status).toBe('available');
    const stale = availabilityState(
      [{ vendorId: 'v1', date: '2026-11-12', status: 'hold', holdExpiresAt: new Date(now.getTime() - 3_600_000).toISOString() }],
      { vendorId: 'v1', date: '2026-11-12', now },
    );
    expect(stale.status).toBe('available');
    expect(stale.bookable).toBe(true);
  });

  it('respects capacity: three teams can serve three weddings, not four', () => {
    const slots = [
      { vendorId: 'v1', date: '2026-11-12', status: 'booked' as const, teamCapacity: 3, bookedTeamCount: 2 },
      { vendorId: 'v1', date: '2026-11-12', status: 'booked' as const, teamCapacity: 3, bookedTeamCount: 1 },
    ];
    const third = availabilityState(slots, { vendorId: 'v1', date: '2026-11-12', now });
    expect(third.status).toBe('available');
    const fourth = availabilityState(slots, { vendorId: 'v1', date: '2026-11-12', now, requiredTeam: 2 });
    expect(fourth.bookable).toBe(false);
    expect(fourth.reason).toContain('2/3');
  });

  it('lets a vendor block a date and never lets a hold hide it', () => {
    const blocked = availabilityState([{ vendorId: 'v1', date: '2026-11-12', status: 'blocked' }], { vendorId: 'v1', date: '2026-11-12', now });
    expect(blocked.bookable).toBe(false);
    const held = availabilityState([{ vendorId: 'v1', date: '2026-11-12', status: 'hold', holdExpiresAt: new Date(now.getTime() + HOLD_TTL_HOURS * 3_600_000).toISOString() }], { vendorId: 'v1', date: '2026-11-12', now });
    expect(held.status).toBe('hold');
    expect(held.bookable).toBe(false);
  });
});

describe('event readiness', () => {
  const input = {
    eventType: 'wedding',
    daysToEvent: 30,
    vendors: [
      { category: 'venue' as const, status: 'confirmed' as const },
      { category: 'caterer' as const, status: 'tentative' as const },
      { category: 'photographer' as const, status: 'confirmed' as const },
    ],
    guests: { invited: 100, responded: 90, expected: 100 },
    budget: { targetPaise: 27_000_000, committedPaise: 20_000_000, paidPaise: 6_000_000 },
    tasks: { total: 12, done: 9, overdue: 0 },
    invitations: { published: true, sentShare: 0.9 },
    muhuratChosen: true,
  };

  it('scores a nearly-ready wedding and explains every dimension', () => {
    const report = calculateReadiness(input);
    expect(report.score).toBeGreaterThanOrEqual(85);
    expect(report.grade).toBe('तयार');

    const halfResponded = calculateReadiness({ ...input, guests: { invited: 100, responded: 50, expected: 100 } });
    expect(halfResponded.score).toBeGreaterThanOrEqual(65);
    expect(halfResponded.score).toBeLessThan(85);
    expect(halfResponded.grade).toBe('जवळपास तयार');
    expect(report.dimensions.map((d) => d.key).sort()).toEqual(['budget', 'guests', 'invitations', 'muhurat', 'tasks', 'vendors']);
    expect(report.dimensions.find((d) => d.key === 'vendors')?.note).toContain('केटरर');
    expect(report.dimensions.reduce((s, d) => s + d.weight, 0)).toBe(100);
  });

  it('raises a risk naming the vendor category and the next action', () => {
    const report = calculateReadiness(input);
    const risk = report.risks.find((r) => r.message.includes('केटरर'));
    expect(risk?.severity).toBe('high'); // inside 45 days, "in talks" is a real risk
    expect(risk?.action).toContain('आगाऊ');
  });

  it('drops to धोक्यात when essentials are missing close to the date', () => {
    const report = calculateReadiness({
      ...input,
      daysToEvent: 10,
      vendors: [],
      guests: { invited: 100, responded: 5, expected: 100 },
      tasks: { total: 12, done: 1, overdue: 4 },
      invitations: { published: false, sentShare: 0.05 },
      muhuratChosen: false,
    });
    expect(report.score).toBeLessThan(45);
    expect(report.grade).toBe('धोक्यात');
    expect(report.risks.filter((risk) => risk.severity === 'high').length).toBeGreaterThanOrEqual(2);
    expect(report.risks.some((risk) => risk.message.includes('मुहूर्त'))).toBe(true);
  });

  it('is deterministic and versioned', () => {
    expect(calculateReadiness(input)).toEqual(calculateReadiness(input));
    expect(COMMERCE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('backup vendors', () => {
  const candidates = [
    { vendorId: 'a', name: 'अ', category: 'decorator' as const, distanceKm: 5, rating: 4.8, pricePaise: 200_000, availability: 'available' as const },
    { vendorId: 'b', name: 'ब', category: 'decorator' as const, distanceKm: 12, rating: 4.2, pricePaise: 260_000, availability: 'tentative' as const },
    { vendorId: 'c', name: 'क', category: 'decorator' as const, distanceKm: 3, rating: 5, pricePaise: 900_000, availability: 'available' as const },
    { vendorId: 'd', name: 'ड', category: 'decorator' as const, distanceKm: 2, rating: 4.9, pricePaise: 210_000, availability: 'booked' as const },
  ];

  it('suggests only available vendors inside a 25% budget band, best first', () => {
    const backups = findBackupVendors({ candidates, budgetPaise: 210_000, date: '2026-11-12', limit: 3 });
    expect(backups.map((b) => b.vendorId)).toEqual(['a', 'b']);
    expect(backups.every((b) => b.availability !== 'booked')).toBe(true);
  });

  it('never returns more than the requested limit', () => {
    expect(findBackupVendors({ candidates, budgetPaise: 210_000, date: '2026-11-12', limit: 1 })).toHaveLength(1);
  });
});

describe('ad performance', () => {
  const campaign = {
    id: 'ad_1',
    vendorId: 'vnd_1',
    placement: 'sponsored-search' as const,
    budgetPaise: 500_000,
    spentPaise: 200_000,
    targeting: { city: 'पुणे' },
    metrics: { impressions: 20_000, profileViews: 1_000, leads: 100, quotes: 40, bookings: 8, bookingValuePaise: 1_600_000 },
    active: true,
  };

  it('computes funnel conversions, cost per booking and ROAS', () => {
    const perf = adPerformance(campaign);
    expect(perf.ctr).toBeCloseTo(0.05, 4);
    expect(perf.costPerLeadPaise).toBe(2_000);
    expect(perf.costPerBookingPaise).toBe(25_000);
    expect(perf.roas).toBe(8);
    expect(perf.funnel.map((f) => f.stage)).toEqual(['इम्प्रेशन', 'प्रोफाइल पाहणी', 'चौकशी', 'कोट', 'बुकिंग']);
  });

  it('returns zeroes instead of NaN/Infinity on an empty campaign', () => {
    const perf = adPerformance({ ...campaign, spentPaise: 0, metrics: { impressions: 0, profileViews: 0, leads: 0, quotes: 0, bookings: 0, bookingValuePaise: 0 } });
    expect(perf.ctr).toBe(0);
    expect(perf.roas).toBe(0);
    expect(Number.isFinite(perf.costPerBookingPaise)).toBe(true);
  });
});
