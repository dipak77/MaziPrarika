import { describe, expect, it } from 'vitest';

import {
  LATEST_SCHEMA_VERSION,
  migrate,
  newId,
  openStore,
  type Store,
} from './index.js';
import { seedStore } from './seed.js';

const fresh = (): Store => openStore({ filename: ':memory:' });

describe('store/migrations', () => {
  it('applies every migration and records the version', () => {
    const store = fresh();
    expect(store.version).toBe(LATEST_SCHEMA_VERSION);
    const rows = store.db.prepare('SELECT version, name FROM schema_migrations ORDER BY version').all();
    expect(rows).toHaveLength(LATEST_SCHEMA_VERSION);
    // Derived, not hardcoded: adding a migration must not require editing a test.
    expect(rows.map((r) => Number(r.version))).toEqual(
      Array.from({ length: LATEST_SCHEMA_VERSION }, (_, i) => i + 1),
    );
    store.close();
  });

  it('is idempotent: re-running migrate changes nothing', () => {
    const store = fresh();
    expect(migrate(store.db)).toBe(LATEST_SCHEMA_VERSION);
    expect(migrate(store.db)).toBe(LATEST_SCHEMA_VERSION);
    const count = store.db.prepare('SELECT COUNT(*) AS c FROM schema_migrations').get();
    expect(Number(count?.c)).toBe(LATEST_SCHEMA_VERSION);
    store.close();
  });

  it('refuses to open a database written by a newer build', () => {
    const store = fresh();
    store.db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)')
      .run(99, 'from-the-future', new Date().toISOString());
    expect(() => migrate(store.db)).toThrow(/नवीन आहे/);
    store.close();
  });

  it('enforces foreign keys so orphans cannot exist', () => {
    const store = fresh();
    expect(() => store.events.addGuest({
      eventId: 'evt_missing', name: 'अनाथ', rsvpStatus: 'pending', guestCount: 1, code: 'X1',
    })).toThrow(/FOREIGN KEY/);
    store.close();
  });

  it('rolls a failed transaction back completely', () => {
    const store = fresh();
    store.users.create({ id: 'u1', role: 'customer', name: 'रमेश' });
    expect(() => store.transaction(() => {
      store.users.create({ id: 'u2', role: 'customer', name: 'सुनील' });
      throw new Error('अनपेक्षित');
    })).toThrow('अनपेक्षित');
    expect(store.users.list()).toHaveLength(1);
    store.close();
  });
});

describe('store/users', () => {
  it('stores and finds users by id and phone', () => {
    const store = fresh();
    store.users.create({ id: 'u1', role: 'vendor', name: 'श्री. गणेश भोसले', phone: '9822011111', city: 'पुणे' });
    expect(store.users.byId('u1')?.name).toBe('श्री. गणेश भोसले');
    expect(store.users.byPhone('9822011111')?.role).toBe('vendor');
    expect(store.users.byId('nope')).toBeUndefined();
    store.users.touch('u1', '2026-03-01T00:00:00.000Z');
    expect(store.users.byId('u1')?.lastSeenAt).toBe('2026-03-01T00:00:00.000Z');
    store.close();
  });

  it('rejects duplicate phone numbers (identity is one account per number)', () => {
    const store = fresh();
    store.users.create({ id: 'u1', role: 'customer', name: 'अ', phone: '9999999999' });
    expect(() => store.users.create({ id: 'u2', role: 'customer', name: 'ब', phone: '9999999999' }))
      .toThrow(/UNIQUE|constraint/i);
    store.close();
  });
});

describe('store/vendors', () => {
  function withVendors(store: Store) {
    store.vendors.create({ id: 'v1', name: 'श्री साई मंगल कार्यालय', category: 'venue', city: 'पुणे', startingPricePaise: 12_500_000, rating: 4.8, identityVerified: true });
    store.vendors.create({ id: 'v2', name: 'कुलकर्णी पिक्चर्स', category: 'photographer', city: 'पुणे', startingPricePaise: 6_500_000, rating: 4.7, identityVerified: true });
    store.vendors.create({ id: 'v3', name: 'पाटील डेकोर्स', category: 'decorator', city: 'कोल्हापूर', startingPricePaise: 9_500_000, rating: 4.9 });
  }

  it('searches by category, city, budget, rating and free text', () => {
    const store = fresh();
    withVendors(store);
    expect(store.vendors.search({ category: 'venue' }).map((v) => v.id)).toEqual(['v1']);
    expect(store.vendors.search({ city: 'पुणे' }).map((v) => v.id).sort()).toEqual(['v1', 'v2']);
    expect(store.vendors.search({ city: 'पुणे', maxPricePaise: 10_000_000 }).map((v) => v.id)).toEqual(['v2']);
    expect(store.vendors.search({ minRating: 4.8 }).map((v) => v.id).sort()).toEqual(['v1', 'v3']);
    expect(store.vendors.search({ q: 'कुलकर्णी' }).map((v) => v.id)).toEqual(['v2']);
    expect(store.vendors.search({ city: 'नाशिक' })).toEqual([]);
    store.close();
  });

  it('treats LIKE wildcards as literal text, not as a query language', () => {
    const store = fresh();
    withVendors(store);
    expect(store.vendors.search({ q: '%' })).toEqual([]);
    expect(store.vendors.search({ q: "' OR 1=1 --" })).toEqual([]);
    store.close();
  });

  it('keeps packages ordered and capacity aware', () => {
    const store = fresh();
    withVendors(store);
    store.vendors.addPackage({ id: 'p2', vendorId: 'v1', title: 'प्रिमियम सभागृह', pricePaise: 22_000_000, inclusions: ['थीम सजावट'], capacity: 800, sortOrder: 2 });
    store.vendors.addPackage({ id: 'p1', vendorId: 'v1', title: 'साधारण सभागृह', pricePaise: 12_500_000, inclusions: ['मंडप'], capacity: 500, sortOrder: 1 });
    expect(store.vendors.packages('v1').map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(store.vendors.packages('v1')[1]?.inclusions).toEqual(['थीम सजावट']);
    store.close();
  });

  it('upserts availability per vendor/day/status and holds expiry', () => {
    const store = fresh();
    withVendors(store);
    store.vendors.setAvailability({ id: 'a1', vendorId: 'v1', date: '2027-04-18', status: 'hold', teamCapacity: 1, bookedTeamCount: 0, holdExpiresAt: '2026-03-02T10:00:00.000Z' });
    store.vendors.setAvailability({ id: 'a1', vendorId: 'v1', date: '2027-04-18', status: 'hold', teamCapacity: 1, bookedTeamCount: 1, holdExpiresAt: '2026-03-05T10:00:00.000Z' });
    const slots = store.vendors.availability('v1', '2027-04-18', '2027-04-18');
    expect(slots).toHaveLength(1);
    expect(slots[0]?.bookedTeamCount).toBe(1);

    store.vendors.setAvailability({ id: 'a2', vendorId: 'v1', date: '2027-04-18', status: 'booked', teamCapacity: 1, bookedTeamCount: 1 });
    expect(store.vendors.availability('v1').map((s) => s.status).sort()).toEqual(['booked', 'hold']);
    store.close();
  });

  it('recomputes the rating from verified reviews only', () => {
    const store = fresh();
    withVendors(store);
    store.vendors.addReview({ id: 'r1', vendorId: 'v1', authorName: 'क', rating: 5, verifiedBooking: true, body: 'उत्तम' });
    store.vendors.addReview({ id: 'r2', vendorId: 'v1', authorName: 'ख', rating: 4, verifiedBooking: true });
    const recomputed = store.vendors.recomputeRating('v1');
    expect(recomputed.reviewCount).toBe(2);
    expect(recomputed.rating).toBe(4.5);
    expect(store.vendors.byId('v1')?.rating).toBe(4.5);
    expect(store.vendors.reviews('v1')).toHaveLength(2);
    store.close();
  });
});

describe('store/events', () => {
  function withEvent(store: Store) {
    store.users.create({ id: 'u1', role: 'customer', name: 'श्री. रमेश पाटील' });
    return store.events.create({
      id: 'e1', slug: 'patil-patil-vivah-2027', ownerUserId: 'u1', eventType: 'wedding',
      title: 'पाटील कुटुंबाचा विवाह सोहळा', hostNames: ['श्री. रमेश पाटील'], eventDate: '2027-04-18',
      city: 'पुणे', venueName: 'श्री साई मंगल कार्यालय', guestCountExpected: 650,
      budgetTargetPaise: 180_000_000, status: 'scheduled',
    });
  }

  it('creates, finds by slug and updates an event', () => {
    const store = fresh();
    withEvent(store);
    expect(store.events.bySlug('patil-patil-vivah-2027')?.city).toBe('पुणे');
    expect(store.events.byId('e1')?.hostNames).toEqual(['श्री. रमेश पाटील']);
    const updated = store.events.update('e1', { guestCountExpected: 700, status: 'planning' });
    expect(updated.guestCountExpected).toBe(700);
    expect(updated.status).toBe('planning');
    expect(store.events.byId('e1')?.guestCountExpected).toBe(700);
    expect(store.events.listByOwner('u1')).toHaveLength(1);
    expect(() => store.events.update('missing', {})).toThrow(/सापडला नाही/);
    store.close();
  });

  it('tracks guests, RSVP heads and invite codes', () => {
    const store = fresh();
    withEvent(store);
    store.events.addGuest({ id: 'g1', eventId: 'e1', name: 'काका — श्री. रविंद्र पाटील', relation: 'father.elderBrother', side: 'groom', rsvpStatus: 'yes', guestCount: 4, code: 'PATIL001' });
    store.events.addGuest({ id: 'g2', eventId: 'e1', name: 'मामा — श्री. दिनकर देशपांडे', relation: 'mother.youngerBrother', side: 'bride', rsvpStatus: 'maybe', guestCount: 3, code: 'PATIL002' });
    store.events.addGuest({ id: 'g3', eventId: 'e1', name: 'शेजारी — श्री. प्रकाश जोशी', rsvpStatus: 'pending', guestCount: 2, code: 'PATIL003' });

    const summary = store.events.rsvpSummary('e1');
    expect(summary).toEqual({ invited: 3, responded: 2, yes: 1, no: 0, maybe: 1, expectedHeads: 7 });
    expect(store.events.guestByCode('PATIL002')?.name).toContain('दिनकर');

    const updated = store.events.updateGuest('g3', { rsvpStatus: 'yes', respondedAt: '2027-03-10T12:00:00.000Z' });
    expect(updated.rsvpStatus).toBe('yes');
    expect(store.events.rsvpSummary('e1').expectedHeads).toBe(9);
    store.close();
  });

  it('upserts budget lines and computes the committed picture', () => {
    const store = fresh();
    withEvent(store);
    store.events.upsertBudgetItem({ id: 'b1', eventId: 'e1', category: 'venue', label: 'मंगल कार्यालय भाडे', estimatedPaise: 36_000_000, committedPaise: 36_000_000, paidPaise: 10_000_000, status: 'committed' });
    store.events.upsertBudgetItem({ id: 'b2', eventId: 'e1', category: 'caterer', label: 'भोजन व्यवस्था', estimatedPaise: 33_000_000, committedPaise: 0, paidPaise: 0, status: 'planned' });
    store.events.upsertBudgetItem({ id: 'b1', eventId: 'e1', category: 'venue', label: 'मंगल कार्यालय भाडे (सुधारित)', estimatedPaise: 36_000_000, committedPaise: 34_000_000, paidPaise: 10_000_000, status: 'committed' });

    const items = store.events.budgetItems('e1');
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === 'b1')?.label).toContain('सुधारित');
    expect(items.reduce((sum, i) => sum + i.committedPaise, 0)).toBe(34_000_000);
    store.close();
  });

  it('orders tasks by open-first priority and stamps completion', () => {
    const store = fresh();
    withEvent(store);
    store.events.addTask({ id: 't1', eventId: 'e1', title: 'मेनू निश्चित करणे', category: 'भोजन', status: 'open', priority: 1 });
    store.events.addTask({ id: 't2', eventId: 'e1', title: 'साहित्य यादी तपासणे', category: 'विधी', status: 'done', priority: 1 });
    const ordered = store.events.tasks('e1');
    expect(ordered[0]?.id).toBe('t1');

    const done = store.events.updateTask('t1', { status: 'done' });
    expect(done.doneAt).toBeTruthy();
    expect(store.events.tasks('e1')[0]?.status).toBe('done');
    store.close();
  });
});

describe('store/designs & print', () => {
  function withDesign(store: Store) {
    store.users.create({ id: 'u1', role: 'customer', name: 'रमेश' });
    store.events.create({
      id: 'e1', slug: 'evt', ownerUserId: 'u1', eventType: 'wedding', title: 'विवाह',
      city: 'पुणे', guestCountExpected: 100, budgetTargetPaise: 1_000_000, status: 'planning',
    });
    return store.designs.create({
      id: 'd1', eventId: 'e1', ownerUserId: 'u1', name: 'पैठणी पत्रिका', templateId: 'tpl-paithani-royal',
      preset: 'invitation-5x7', scheme: 'paithani', doc: { version: 3, elements: [] }, status: 'draft',
    });
  }

  it('versions every save so nothing is ever lost', () => {
    const store = fresh();
    withDesign(store);
    store.designs.save('d1', { version: 3, elements: [{ id: 'x' }] }, { note: 'नावे जोडली', scheme: 'paithani' });
    store.designs.save('d1', { version: 3, elements: [{ id: 'y' }] }, { note: 'मुहूर्त जोडला', status: 'approved' });

    const design = store.designs.byId('d1');
    expect(design?.version).toBe(3);
    expect(design?.status).toBe('approved');
    expect((design?.doc as { elements: unknown[] }).elements).toEqual([{ id: 'y' }]);

    const versions = store.designs.versions('d1');
    expect(versions.map((v) => v.version)).toEqual([3, 2, 1]);
    expect(versions[0]?.note).toBe('मुहूर्त जोडला');
    expect(store.designs.list({ eventId: 'e1' })).toHaveLength(1);
    store.close();
  });

  it('moves a print order through production states', () => {
    const store = fresh();
    withDesign(store);
    store.designs.createPrintOrder({
      id: 'po1', eventId: 'e1', designId: 'd1', vendorId: undefined, quantity: 500,
      paper: 'मॅट ३०० GSM', finishing: ['गोल्ड फॉइल'], express: false, status: 'placed',
      unitPricePaise: 2_400_000, shippingPaise: 35_000, totalPaise: 12_035_000,
    });
    const dispatched = store.designs.updatePrintOrder('po1', { status: 'dispatched', tracking: 'BLDT1234567' });
    expect(dispatched.status).toBe('dispatched');
    expect(store.designs.printOrders({ eventId: 'e1' })[0]?.tracking).toBe('BLDT1234567');
    expect(store.designs.printOrders({ status: 'placed' })).toEqual([]);
    store.close();
  });
});

describe('store/marketplace', () => {
  function withLead(store: Store) {
    store.users.create({ id: 'u1', role: 'customer', name: 'रमेश' });
    store.vendors.create({ id: 'v1', name: 'कुलकर्णी पिक्चर्स', category: 'photographer', city: 'पुणे' });
    return store.marketplace.createLead({
      id: 'l1', vendorId: 'v1', customerUserId: 'u1', category: 'photographer',
      message: 'हळदी ते स्वागत छायाचित्रण हवे', budgetPaise: 11_000_000, eventDate: '2027-04-18',
      guestCount: 650, source: 'search', createdAt: '2026-03-01T09:15:00.000Z', responseDueMinutes: 120,
    });
  }

  it('creates a lead with a two-hour response promise', () => {
    const store = fresh();
    const lead = withLead(store);
    expect(lead.status).toBe('new');
    expect(lead.responseDueAt).toBe('2026-03-01T11:15:00.000Z');
    expect(store.marketplace.leadById('l1')?.message).toContain('छायाचित्रण');
    store.close();
  });

  it('measures vendor response SLA honestly', () => {
    const store = fresh();
    withLead(store);
    store.marketplace.createLead({
      id: 'l2', vendorId: 'v1', customerUserId: 'u1', category: 'photographer', source: 'ai',
      createdAt: '2026-03-02T09:00:00.000Z',
    });
    store.marketplace.updateLead('l1', { status: 'responded', respondedAt: '2026-03-01T09:45:00.000Z' });
    store.marketplace.updateLead('l2', { status: 'new' });

    const stats = store.marketplace.responseStats('v1');
    expect(stats.total).toBe(2);
    expect(stats.responded).toBe(1);
    expect(stats.medianMinutes).toBe(30);
    expect(stats.slaRate).toBe(0.5);
    store.close();
  });

  it('keeps quote versions and the message thread', () => {
    const store = fresh();
    withLead(store);
    store.marketplace.createQuote({
      id: 'q1', leadId: 'l1', vendorId: 'v1', eventId: undefined, version: 1,
      items: [{ label: 'विवाह पॅकेज', quantity: 1, unit: 'पॅकेज', unitPricePaise: 6_500_000, optional: false }],
      discountPaise: 0, subtotalPaise: 6_500_000, gstPaise: 1_170_000, totalPaise: 7_670_000,
      validTill: '2026-03-15', status: 'sent',
    });
    store.marketplace.createQuote({
      id: 'q2', leadId: 'l1', vendorId: 'v1', version: 2,
      items: [{ label: 'विवाह पॅकेज + ड्रोन', quantity: 1, unit: 'पॅकेज', unitPricePaise: 8_300_000, optional: false }],
      discountPaise: 300_000, subtotalPaise: 8_000_000, gstPaise: 1_440_000, totalPaise: 9_440_000,
      validTill: '2026-03-20', status: 'sent',
    });
    expect(store.marketplace.quotesForLead('l1').map((q) => q.version)).toEqual([2, 1]);

    const accepted = store.marketplace.updateQuote('q2', { status: 'accepted', acceptedAt: '2026-03-04T10:00:00.000Z' });
    expect(accepted.status).toBe('accepted');

    store.marketplace.addMessage({ id: 'm1', leadId: 'l1', sender: 'customer', body: 'ड्रोन शॉट समाविष्ट आहे ना?', attachments: [] });
    store.marketplace.addMessage({ id: 'm2', leadId: 'l1', sender: 'vendor', body: 'हो, ड्रोन संच समाविष्ट आहे.', attachments: ['quote-v2.pdf'] });
    const thread = store.marketplace.messages('l1');
    expect(thread.map((m) => m.sender)).toEqual(['customer', 'vendor']);
    expect(thread[1]?.attachments).toEqual(['quote-v2.pdf']);
    store.close();
  });
});

describe('store/bookings, ledger & disputes', () => {
  function withBooking(store: Store) {
    store.users.create({ id: 'u1', role: 'customer', name: 'रमेश' });
    store.vendors.create({ id: 'v1', name: 'कुलकर्णी पिक्चर्स', category: 'photographer', city: 'पुणे' });
    return store.bookings.create({
      id: 'b1', vendorId: 'v1', state: 'BOOKING_CONFIRMED', eventDate: '2027-04-18',
      totalPaise: 7_670_000, advancePaise: 2_301_000, commissionPaise: 980_000,
      history: [{ at: '2026-03-02T10:00:00.000Z', actor: 'customer', from: 'ENQUIRY', to: 'QUOTE_SENT' }],
    });
  }

  it('appends to the booking history on every state change', () => {
    const store = fresh();
    withBooking(store);
    store.bookings.updateState('b1', { state: 'SERVICE_SCHEDULED', actor: 'vendor', at: '2026-04-01T10:00:00.000Z' });
    store.bookings.updateState('b1', { state: 'SERVICE_COMPLETED', actor: 'vendor', at: '2026-04-19T10:00:00.000Z' });

    const booking = store.bookings.byId('b1');
    expect(booking?.state).toBe('SERVICE_COMPLETED');
    expect(booking?.history).toHaveLength(3);
    expect(booking?.history[2]?.from).toBe('SERVICE_SCHEDULED');
    expect(booking?.completedAt).toBe('2026-04-19T10:00:00.000Z');
    expect(store.bookings.list({ vendorId: 'v1' })).toHaveLength(1);
    store.close();
  });

  it('never double-books a ledger entry with the same idempotency key', () => {
    const store = fresh();
    withBooking(store);
    const entries = [
      { bookingId: 'b1', account: 'PLATFORM_CASH', amountPaise: 7_670_000, memo: 'पेमेंट', idempotencyKey: 'b1:cash' },
      { bookingId: 'b1', account: 'VENDOR_PAYABLE', amountPaise: -6_690_000, memo: 'देय', idempotencyKey: 'b1:payable' },
      { bookingId: 'b1', account: 'PLATFORM_REVENUE', amountPaise: -980_000, memo: 'कमिशन', idempotencyKey: 'b1:revenue' },
    ];
    store.bookings.appendLedger(entries);
    store.bookings.appendLedger(entries);

    const rows = store.bookings.ledger('b1');
    expect(rows).toHaveLength(3);
    expect(rows.reduce((sum, r) => sum + r.amountPaise, 0)).toBe(0);
    expect(store.bookings.ledgerTotals('b1').PLATFORM_CASH).toBe(7_670_000);
    store.close();
  });

  it('detects gateway webhook replays', () => {
    const store = fresh();
    withBooking(store);
    const first = store.bookings.recordPayment({ bookingId: 'b1', kind: 'advance', amountPaise: 2_301_000, status: 'captured', idempotencyKey: 'b1:advance' });
    const replay = store.bookings.recordPayment({ bookingId: 'b1', kind: 'advance', amountPaise: 2_301_000, status: 'captured', idempotencyKey: 'b1:advance' });
    expect(first.duplicate).toBe(false);
    expect(replay.duplicate).toBe(true);
    expect(replay.id).toBe(first.id);
    expect(store.bookings.payments('b1')).toHaveLength(1);
    store.close();
  });

  it('settles a vendor and records the UTR', () => {
    const store = fresh();
    withBooking(store);
    const settlement = store.bookings.createSettlement({ id: 's1', bookingId: 'b1', vendorId: 'v1', amountPaise: 6_690_000 });
    expect(settlement.status).toBe('pending');
    const paid = store.bookings.markSettlementPaid('s1', 'HDFC2026042012345', '2026-04-20T09:00:00.000Z');
    expect(paid.status).toBe('paid');
    expect(paid.utr).toBe('HDFC2026042012345');
    expect(store.bookings.settlements({ vendorId: 'v1', status: 'paid' })).toHaveLength(1);
    store.close();
  });

  it('runs the dispute workflow to a resolution', () => {
    const store = fresh();
    withBooking(store);
    const dispute = store.bookings.openDispute({
      id: 'd1', bookingId: 'b1', raisedBy: 'customer',
      reason: 'अल्बममध्ये २० फोटो गायब आहेत', evidence: ['प्रूफ', 'चॅट'],
    });
    expect(dispute.status).toBe('open');
    const resolved = store.bookings.resolveDispute('d1', 'विक्रेत्याने सुधारित अल्बम ७ दिवसांत द्यायचा', 'resolved', '2026-05-01T10:00:00.000Z');
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolution).toContain('सुधारित');
    expect(store.bookings.disputes({ status: 'open' })).toEqual([]);
    store.close();
  });
});

describe('store/ads, analytics, assistant, audit, privacy', () => {
  it('accumulates campaign metrics from real events', () => {
    const store = fresh();
    store.vendors.create({ id: 'v1', name: 'स्वर साऊंड', category: 'dj', city: 'पुणे' });
    store.ads.createCampaign({ id: 'c1', vendorId: 'v1', placement: 'sponsored-search', budgetPaise: 2_000_000, active: true, targeting: { city: 'पुणे' } });
    store.ads.recordEvent({ campaignId: 'c1', kind: 'impression' });
    store.ads.recordEvent({ campaignId: 'c1', kind: 'impression' });
    store.ads.recordEvent({ campaignId: 'c1', kind: 'profile_view' });
    const after = store.ads.recordEvent({ campaignId: 'c1', kind: 'lead' });

    expect(after.metrics.impressions).toBe(2);
    expect(after.metrics.profileViews).toBe(1);
    expect(after.metrics.leads).toBe(1);
    expect(after.spentPaise).toBeGreaterThan(0);
    expect(store.ads.activeCampaigns('sponsored-search')).toHaveLength(1);
    expect(store.ads.campaignsForVendor('v1')).toHaveLength(1);
    store.close();
  });

  it('aggregates the daily marketplace metrics into a period summary', () => {
    const store = fresh();
    store.analytics.upsertDay({
      date: '2026-03-01', newEvents: 12, activeEvents: 340, publishedInvitations: 9, leads: 48, quotes: 22,
      bookings: 8, gmvPaise: 24_000_000, commissionPaise: 2_400_000, medianResponseMinutes: 62,
      bookingConversion: 0.31, sponsoredImpressions: 4_200, organicImpressions: 16_500,
    });
    store.analytics.upsertDay({
      date: '2026-03-02', newEvents: 14, activeEvents: 350, publishedInvitations: 11, leads: 52, quotes: 26,
      bookings: 9, gmvPaise: 27_000_000, commissionPaise: 2_700_000, medianResponseMinutes: 60,
      bookingConversion: 0.33, sponsoredImpressions: 4_600, organicImpressions: 17_200,
    });
    const totals = store.analytics.totals('2026-03-01', '2026-03-31');
    expect(totals.leads).toBe(100);
    expect(totals.quotes).toBe(48);
    expect(totals.bookings).toBe(17);
    expect(totals.gmvPaise).toBe(51_000_000);
    expect(totals.commissionPaise).toBe(5_100_000);
    expect(totals.medianResponseMinutes).toBe(61);
    expect(totals.sponsoredShare).toBeGreaterThan(0.19);
    expect(totals.sponsoredShare).toBeLessThan(0.22);
    expect(store.analytics.range('2026-03-01', '2026-03-02')).toHaveLength(2);
    expect(store.analytics.day('2026-03-01')?.leads).toBe(48);

    // Same-day re-write replaces rather than duplicates (idempotent ingest).
    store.analytics.upsertDay({
      date: '2026-03-01', newEvents: 12, activeEvents: 340, publishedInvitations: 9, leads: 50, quotes: 22,
      bookings: 8, gmvPaise: 24_000_000, commissionPaise: 2_400_000, medianResponseMinutes: 62,
      bookingConversion: 0.31, sponsoredImpressions: 4_200, organicImpressions: 16_500,
    });
    expect(store.analytics.totals('2026-03-01', '2026-03-01').leads).toBe(50);
    store.close();
  });

  it('stores assistant conversations and can report monthly spend', () => {
    const store = fresh();
    store.users.create({ id: 'u1', role: 'customer', name: 'रमेश' });
    store.assistant.createConversation({ id: 'c1', userId: 'u1', title: 'विवाह नियोजन' });
    store.assistant.addMessage({ id: 'm1', conversationId: 'c1', role: 'user', content: 'मुहूर्त सांगा', createdAt: '2026-03-05T10:00:00.000Z' });
    store.assistant.addMessage({
      id: 'm2', conversationId: 'c1', role: 'assistant', content: 'मुहूर्त अनुकूलता…',
      toolCalls: [{ tool: 'FindMuhurat', ok: true }], provider: 'groq', model: 'llama-3.3-70b-versatile',
      tokensIn: 900, tokensOut: 120, costUsd: 0.0006, latencyMs: 1200, createdAt: '2026-03-05T10:00:01.000Z',
    });

    const messages = store.assistant.messages('c1');
    expect(messages.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(messages[1]?.toolCalls).toEqual([{ tool: 'FindMuhurat', ok: true }]);
    expect(store.assistant.conversationsForUser('u1')[0]?.messageCount).toBe(2);
    expect(store.assistant.spendUsd('2026-03-01', '2026-03-31')).toBeCloseTo(0.0006, 6);
    expect(store.assistant.spendUsd('2026-04-01', '2026-04-30')).toBe(0);
    store.close();
  });

  it('writes an append-only audit trail', () => {
    const store = fresh();
    store.audit.record({ actor: 'usr_admin_seema', action: 'vendor.verified', entity: 'vendor', entityId: 'v1', before: { identityVerified: false }, after: { identityVerified: true }, at: '2026-03-01T10:00:00.000Z' });
    store.audit.record({ actor: 'usr_admin_seema', action: 'vendor.gst_verified', entity: 'vendor', entityId: 'v1', at: '2026-03-02T10:00:00.000Z' });
    expect(store.audit.forEntity('vendor', 'v1')).toHaveLength(2);
    expect(store.audit.recent(1)).toHaveLength(1);
    store.close();
  });

  it('honours DPDP export and delete requests', () => {
    const store = fresh();
    store.users.create({ id: 'u1', role: 'customer', name: 'रमेश', phone: '9822012345' });
    store.events.create({
      id: 'e1', slug: 'evt', ownerUserId: 'u1', eventType: 'wedding', title: 'विवाह',
      hostNames: ['श्री. रमेश पाटील'], city: 'पुणे', guestCountExpected: 10, budgetTargetPaise: 0, status: 'planning',
    });
    store.events.addGuest({ id: 'g1', eventId: 'e1', name: 'काका', rsvpStatus: 'yes', guestCount: 2, code: 'C1' });

    const request = store.privacy.request({ userId: 'u1', kind: 'export' });
    expect(request.status).toBe('received');

    const exported = store.privacy.exportUser('u1') as { user: { name: string }; events: unknown[]; guests: unknown[] };
    expect(exported.user.name).toBe('रमेश');
    expect(exported.events).toHaveLength(1);
    expect(exported.guests).toHaveLength(1);

    const deletion = store.privacy.deleteUser('u1');
    expect(deletion.deleted).toBe(true);
    expect(store.users.byId('u1')).toBeUndefined();
    // Cascade removes the event and its guests.
    expect(store.events.byId('e1')).toBeUndefined();
    expect(store.db.prepare('SELECT COUNT(*) AS c FROM guests').get()?.c).toBe(0);
    store.close();
  });
});

describe('store/seed', () => {
  it('loads a realistic marketplace with a balanced ledger', () => {
    const store = fresh();
    const report = seedStore(store, { today: new Date('2026-09-24T06:00:00.000Z') });

    expect(report.vendors).toBeGreaterThanOrEqual(12);
    expect(report.leads).toBeGreaterThanOrEqual(12);
    expect(report.bookings).toBeGreaterThanOrEqual(5);
    expect(report.metricsDays).toBe(60);

    const rows = store.db.prepare('SELECT booking_id, SUM(amount_paise) AS total FROM ledger_entries GROUP BY booking_id').all();
    expect(rows.length).toBe(report.bookings);
    for (const row of rows) expect(Number(row.total)).toBe(0);

    const venue = store.vendors.byId('vnd_chinchwad_mangal');
    expect(venue?.name).toContain('चिंचवड');
    expect(store.vendors.packages('vnd_chinchwad_mangal')).toHaveLength(3);

    const event = store.events.bySlug('patil-patil-vivah-2027');
    expect(event?.budgetTargetPaise).toBe(180_000_000);
    expect(store.events.rsvpSummary('evt_patil_vivah').invited).toBe(12);
    expect(store.events.tasks('evt_patil_vivah').length).toBeGreaterThan(5);
    expect(store.marketplace.leadsForVendor('vnd_pune_kulkarni_studio').length).toBeGreaterThan(0);
    expect(store.designs.list({ eventId: 'evt_patil_vivah' }).length).toBe(2);
    expect(store.bookings.disputes()[0]?.evidence.length).toBeGreaterThan(1);
    expect(store.analytics.totals('2026-08-01', '2026-09-30').gmvPaise).toBeGreaterThan(0);

    // Seed is deterministic: same input date, identical numbers.
    const second = fresh();
    const secondReport = seedStore(second, { today: new Date('2026-09-24T06:00:00.000Z') });
    expect(secondReport).toEqual(report);
    expect(second.analytics.day('2026-09-24')?.leads).toBe(store.analytics.day('2026-09-24')?.leads);
    store.close();
    second.close();
  });

  it('keeps the vendor response promise measurable in the seeded data', () => {
    const store = fresh();
    seedStore(store, { today: new Date('2026-09-24T06:00:00.000Z') });
    const stats = store.marketplace.responseStats('vnd_pune_kulkarni_studio');
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.responded).toBeGreaterThan(0);
    expect(stats.slaRate).toBeGreaterThanOrEqual(0);
    expect(stats.slaRate).toBeLessThanOrEqual(1);
    store.close();
  });
});

describe('store/ids', () => {
  it('mints unique, prefixed, sortable-ish identifiers', () => {
    const ids = new Set(Array.from({ length: 500 }, () => newId('evt')));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id.startsWith('evt_')).toBe(true);
  });
});
