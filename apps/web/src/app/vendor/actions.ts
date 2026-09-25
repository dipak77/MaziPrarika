'use server';

import { revalidatePath } from 'next/cache';

import {
  availabilityState,
  calculateRefund,
  postingForPayment,
  postingForSettlement,
  postingForRefund,
  priceQuote,
  transitionBooking,
  VENDOR_CATEGORIES,
  type BookingState,
  type Quote,
} from '@mazi/commerce';

import { getStore } from '@/lib/store';
import { vendorDeskId } from '@/lib/vendor-desk';
import { getSession, requireVendor, requireUser } from '@/lib/session';
import { checkRateLimit } from '@/lib/rate-limit';

export async function respondToLeadAction(formData: FormData): Promise<void> {
  const store = getStore();
  const leadId = String(formData.get('leadId') ?? '').slice(0, 80);
  const body = String(formData.get('body') ?? '')
    .trim()
    .slice(0, 800);
  const lead = store.marketplace.leadById(leadId);
  if (!lead) throw new Error('αñ╡αñ┐αñ¿αñéαññαÑÇ αñ╕αñ╛αñ¬αñíαñ▓αÑÇ αñ¿αñ╛αñ╣αÑÇ');
  if (!body) throw new Error('αñëαññαÑìαññαñ░ αñ▓αñ┐αñ╣αñ╛');

  store.transaction(() => {
    store.marketplace.addMessage({
      leadId,
      sender: 'vendor',
      body,
      attachments: [],
      readAt: new Date().toISOString(),
    });
    store.marketplace.updateLead(leadId, {
      status: lead.status === 'new' || lead.status === 'viewed' ? 'responded' : lead.status,
      respondedAt: new Date().toISOString(),
    });
    store.audit.record({
      actor: lead.vendorId,
      action: 'lead.responded',
      entity: 'lead',
      entityId: leadId,
      after: { length: body.length },
    });
  });

  revalidatePath('/vendor');
  revalidatePath(`/vendor/leads/${leadId}`);
}

export async function saveQuoteAction(formData: FormData): Promise<void> {
  const store = getStore();
  const leadId = String(formData.get('leadId') ?? '').slice(0, 80);
  const lead = store.marketplace.leadById(leadId);
  if (!lead) throw new Error('αñ╡αñ┐αñ¿αñéαññαÑÇ αñ╕αñ╛αñ¬αñíαñ▓αÑÇ αñ¿αñ╛αñ╣αÑÇ');
  await requireVendor(lead.vendorId);
  if (lead.status === 'won' || lead.status === 'lost') {
    throw new Error('αñ╣αÑÇ αñ╡αñ┐αñ¿αñéαññαÑÇ αñåαñºαÑÇαñÜ αñ¿αñ┐αñ╢αÑìαñÜαñ┐αññ αñ¥αñ╛αñ▓αÑÇ αñåαñ╣αÑç ΓÇö αñ¿αñ╡αÑÇαñ¿ αñòαÑïαñƒ αñ¬αñ╛αñáαñ╡αññαñ╛ αñ»αÑçαñúαñ╛αñ░ αñ¿αñ╛αñ╣αÑÇ');
  }

  const labels = formData.getAll('label').map((value) => String(value).trim().slice(0, 120));
  const quantities = formData.getAll('quantity').map((value) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), 10000) : 0;
  });
  const units = formData.getAll('unit').map((value) => String(value).trim().slice(0, 20) || 'αñ¿αñù');
  const prices = formData.getAll('unitPrice').map((value) => {
    const n = Number(value);
    const clamped = Number.isFinite(n) ? Math.min(Math.max(n, 0), 10_000_000) : 0;
    return Math.round(clamped * 100);
  });

  const items = labels
    .map((label, index) => ({
      label,
      quantity: quantities[index] ?? 0,
      unit: units[index] ?? 'αñ¿αñù',
      unitPricePaise: prices[index] ?? 0,
      optional: false,
    }))
    .filter((item) => item.label.length > 0 && item.quantity > 0 && item.unitPricePaise > 0)
    .slice(0, 20);

  if (!items.length) throw new Error('αñòαñ┐αñ«αñ╛αñ¿ αñÅαñò αñôαñ│ αñ¡αñ░αñ╛ ΓÇö αñ╡αñ╕αÑìαññαÑé, αñ¬αÑìαñ░αñ«αñ╛αñú αñ╡ αñªαñ░');
  if (!(VENDOR_CATEGORIES as readonly string[]).includes(lead.category)) {
    throw new Error(`αñàαñ¿αÑïαñ│αñûαÑÇ αñ╕αÑçαñ╡αñ╛ αñ╢αÑìαñ░αÑçαñúαÑÇ (${lead.category}) ΓÇö αñòαÑïαñƒ αñ¬αñ╛αñáαñ╡αññαñ╛ αñ»αÑçαñúαñ╛αñ░ αñ¿αñ╛αñ╣αÑÇ`);
  }

  const rawDiscount = Number(formData.get('discount') ?? 0);
  const discountRupees = Number.isFinite(rawDiscount) ? Math.min(Math.max(rawDiscount, 0), 10_000_000) : 0;
  const category = lead.category as Quote['category'];
  const validTill = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const discountPaise = Math.round(discountRupees * 100);
  const previewInput: Quote = {
    id: `qt_${leadId}_preview`,
    vendorId: lead.vendorId,
    ...(lead.eventId ? { eventId: lead.eventId } : {}),
    category,
    items,
    discountPaise,
    validTill,
    status: 'sent',
  };
  const breakdown = priceQuote(previewInput);

  const existing = store.marketplace
    .quotesForLead(leadId)
    .find((q) => q.status === 'draft' || q.status === 'sent');

  if (existing) {
    store.transaction(() => {
      store.marketplace.updateQuote(existing.id, {
        items,
        discountPaise,
        subtotalPaise: breakdown.subtotalPaise,
        gstPaise: breakdown.gstPaise,
        totalPaise: breakdown.customerTotalPaise,
        validTill,
        status: 'sent',
        version: existing.version + 1,
      });
      store.marketplace.updateLead(leadId, { status: 'quoted' });
      store.audit.record({
        actor: lead.vendorId,
        action: 'quote.sent',
        entity: 'quote',
        entityId: existing.id,
        after: {
          totalPaise: breakdown.customerTotalPaise,
          items: items.length,
          commissionPaise: breakdown.commissionPaise,
          version: existing.version + 1,
        },
      });
    });
    revalidatePath('/vendor');
    revalidatePath(`/vendor/leads/${leadId}`);
    return;
  }

  const quoteId = `qt_${leadId}_${Date.now().toString(36)}`;
  store.transaction(() => {
    const record = store.marketplace.createQuote({
      id: quoteId,
      leadId,
      vendorId: lead.vendorId,
      ...(lead.eventId ? { eventId: lead.eventId } : {}),
      items,
      discountPaise,
      subtotalPaise: breakdown.subtotalPaise,
      gstPaise: breakdown.gstPaise,
      totalPaise: breakdown.customerTotalPaise,
      validTill,
      status: 'sent',
    });

    store.marketplace.updateLead(leadId, { status: 'quoted' });
    store.audit.record({
      actor: lead.vendorId,
      action: 'quote.sent',
      entity: 'quote',
      entityId: record.id,
      after: {
        totalPaise: record.totalPaise,
        items: items.length,
        commissionPaise: breakdown.commissionPaise,
      },
    });
  });

  revalidatePath('/vendor');
  revalidatePath(`/vendor/leads/${leadId}`);
}

export async function acceptQuoteAsCustomerAction(formData: FormData): Promise<void> {
  const store = getStore();
  const quoteId = String(formData.get('quoteId') ?? '').slice(0, 80);
  const quote = store.marketplace.quoteById(quoteId);
  if (!quote) throw new Error('αñòαÑïαñƒ αñ╕αñ╛αñ¬αñíαñ▓αñ╛ αñ¿αñ╛αñ╣αÑÇ');
  if (quote.status === 'accepted') {
    revalidatePath('/vendor');
    return;
  }
  if (quote.status === 'rejected' || quote.status === 'expired') {
    throw new Error('αñ╣αñ╛ αñòαÑïαñƒ αñåαññαñ╛ αñ╕αÑìαñ╡αÑÇαñòαñ╛αñ░αññαñ╛ αñ»αÑçαñúαñ╛αñ░ αñ¿αñ╛αñ╣αÑÇ (αñòαñ╛αñ▓αñ¼αñ╛αñ╣αÑìαñ»/αñ¿αñ╛αñòαñ╛αñ░αñ▓αÑçαñ▓αñ╛)');
  }
  if (quote.validTill) {
    const validTill = new Date(`${quote.validTill}T23:59:59Z`);
    if (!Number.isNaN(validTill.getTime()) && validTill < new Date()) {
      throw new Error('αñòαÑïαñƒαñÜαÑÇ αñ╡αÑêαñºαññαñ╛ αñ╕αñéαñ¬αñ▓αÑÇ αñåαñ╣αÑç');
    }
  }

  const lead = quote.leadId ? store.marketplace.leadById(quote.leadId) : undefined;
  if (!lead?.eventId) throw new Error('αñòαÑïαñƒαñ▓αñ╛ αñòαñ╛αñ░αÑìαñ»αñòαÑìαñ░αñ« αñ£αÑïαñíαñ▓αÑçαñ▓αñ╛ αñ¿αñ╛αñ╣αÑÇ');

  const bookingId = `bk_${quote.id}`;
  const eventId = lead.eventId;

  if (store.bookings.byId(bookingId)) {
    revalidatePath('/vendor');
    revalidatePath(`/vendor/leads/${lead.id}`);
    return;
  }

  const at = new Date().toISOString();
  const eventDate = lead.eventDate ?? at.slice(0, 10);

  const slot = availabilityState(store.vendors.availability(quote.vendorId, eventDate, eventDate), {
    vendorId: quote.vendorId,
    date: eventDate,
  });
  if (!slot.bookable) {
    throw new Error(`αñ»αñ╛ αññαñ╛αñ░αñûαÑçαñ▓αñ╛ αñ╡αñ┐αñòαÑìαñ░αÑçαññαñ╛ αñëαñ¬αñ▓αñ¼αÑìαñº αñ¿αñ╛αñ╣αÑÇ ΓÇö ${slot.reason}`);
  }

  const breakdown = priceQuote({
    id: quote.id,
    vendorId: quote.vendorId,
    eventId,
    category: lead.category as Quote['category'],
    items: quote.items,
    discountPaise: quote.discountPaise,
    validTill: quote.validTill,
    status: 'accepted',
  });

  const advance = Math.round(breakdown.customerTotalPaise * 0.2);
  const actor = lead.customerUserId ?? 'usr_c_ramesh';

  store.transaction(() => {
    const record = store.bookings.create({
      id: bookingId,
      eventId,
      vendorId: quote.vendorId,
      leadId: lead.id,
      quoteId: quote.id,
      state: 'PAYMENT_PENDING',
      eventDate,
      totalPaise: breakdown.customerTotalPaise,
      advancePaise: advance,
      commissionPaise: breakdown.commissionPaise,
      history: [
        {
          at,
          actor: 'customer',
          from: 'QUOTE_ACCEPTED',
          to: 'PAYMENT_PENDING',
        },
      ],
      createdAt: at,
    });

    store.bookings.appendLedger(
      postingForPayment({ orderId: bookingId, breakdown, at }).entries.map((entry) => ({
        id: entry.id,
        bookingId,
        account: entry.account,
        amountPaise: entry.amountPaise,
        memo: entry.memo,
        idempotencyKey: entry.idempotencyKey,
        createdAt: entry.at,
      })),
    );

    store.bookings.recordPayment({
      bookingId,
      kind: 'advance',
      provider: 'simulated',
      providerRef: `demo_${quote.id}`,
      amountPaise: advance,
      status: 'captured',
      idempotencyKey: `${bookingId}:pay:advance`,
      raw: { method: 'upi', note: 'αÑ¿αÑª% αñàαÑàαñíαñ╡αÑìαñ╣αñ╛αñ¿αÑìαñ╕', via: 'vendor-desk-demo' },
      createdAt: at,
    });

    store.bookings.updateState(bookingId, {
      state: 'BOOKING_CONFIRMED',
      actor: 'system',
      at,
    });

    store.vendors.setAvailability({
      vendorId: quote.vendorId,
      date: eventDate,
      status: 'booked',
      teamCapacity: 2,
      bookedTeamCount: 1,
      notes: lead.id,
    });

    store.marketplace.updateQuote(quote.id, {
      status: 'accepted',
      acceptedAt: at,
    });
    store.marketplace.updateLead(lead.id, { status: 'won' });

    store.audit.record({
      actor,
      action: 'booking.confirmed',
      entity: 'booking',
      entityId: bookingId,
      after: {
        totalPaise: record.totalPaise,
        advancePaise: advance,
        commissionPaise: record.commissionPaise,
        basedOnQuote: quote.id,
        ledgerEntries: 6,
      },
      at,
    });
    store.audit.record({
      actor: 'system',
      action: 'payment.captured',
      entity: 'payment',
      entityId: `${bookingId}:pay:advance`,
      after: { amountPaise: advance, kind: 'advance', provider: 'simulated' },
      at,
    });
  });

  revalidatePath('/vendor');
  revalidatePath(`/vendor/leads/${lead.id}`);
  revalidatePath('/admin');
  const event = store.events.byId(eventId);
  if (event) revalidatePath(`/studio/${event.slug}`);
}

export async function setVacationAction(formData: FormData): Promise<void> {
  const store = getStore();
  const deskId = await vendorDeskId();
  const session = await getSession();
  const requested = String(formData.get('vendorId') ?? deskId).slice(0, 80);
  const vendorId = session?.role === 'admin' ? requested : deskId;
  const vendor = store.vendors.byId(vendorId);
  if (!vendor) throw new Error('αñ╡αñ┐αñòαÑìαñ░αÑçαññαñ╛ αñ╕αñ╛αñ¬αñíαñ▓αñ╛ αñ¿αñ╛αñ╣αÑÇ');
  const from = String(formData.get('from') ?? '');
  const to = String(formData.get('to') ?? '');
  const rawStatus = String(formData.get('status') ?? 'blocked');
  const status = rawStatus === 'available' ? 'available' : 'blocked';
  if (!from || !to) throw new Error('αññαñ╛αñ░αñûαñ╛ αñ¿αñ┐αñ╡αñíαñ╛');

  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (end < start) throw new Error('αñ╢αÑçαñ╡αñƒαñÜαÑÇ αññαñ╛αñ░αÑÇαñû αñåαñºαÑÇαñÜαÑÇ αñàαñ╕αÑé αñ╢αñòαññ αñ¿αñ╛αñ╣αÑÇ');
  if ((end.getTime() - start.getTime()) / 86_400_000 > 60) throw new Error('αñÅαñòαñ╛ αñ╡αÑçαñ│αÑÇ αÑ¼αÑª αñªαñ┐αñ╡αñ╕αñ╛αñéαñ¬αñ░αÑìαñ»αñéαññ');

  store.transaction(() => {
    for (let day = new Date(start); day <= end; day = new Date(day.getTime() + 86_400_000)) {
      store.vendors.setAvailability({
        vendorId,
        date: day.toISOString().slice(0, 10),
        status,
        teamCapacity: 2,
        bookedTeamCount: 0,
        notes: status === 'blocked' ? 'αñ╡αÑêαñ»αñòαÑìαññαñ┐αñò αñ░αñ╛αñûαÑÇαñ╡' : 'αñëαñ¬αñ▓αñ¼αÑìαñº',
      });
    }

    store.audit.record({
      actor: vendorId,
      action: 'calendar.updated',
      entity: 'vendor',
      entityId: vendorId,
      after: { from, to, status },
    });
  });
  revalidatePath('/vendor');
}

export async function settleBookingAction(formData: FormData): Promise<void> {
  const store = getStore();
  const bookingId = String(formData.get('bookingId') ?? '').slice(0, 80);
  const booking = store.bookings.byId(bookingId);
  if (!booking) throw new Error('αñ¼αÑüαñòαñ┐αñéαñù αñ╕αñ╛αñ¬αñíαñ▓αÑÇ αñ¿αñ╛αñ╣αÑÇ');

  const { session } = await requireVendor(booking.vendorId);
  const quote = booking.quoteId ? store.marketplace.quoteById(booking.quoteId) : undefined;
  const lead = booking.leadId ? store.marketplace.leadById(booking.leadId) : undefined;
  if (!quote || !lead) throw new Error('αñ¼αÑüαñòαñ┐αñéαñùαñ╢αÑÇ αñ╕αñéαñ¼αñéαñºαñ┐αññ αññαñ¬αñ╢αÑÇαñ▓ αñ╕αñ╛αñ¬αñíαñ▓αÑç αñ¿αñ╛αñ╣αÑÇαññ');

  const openDispute = store.bookings
    .disputes()
    .find((d) => d.bookingId === bookingId && (d.status === 'open' || d.status === 'investigating'));
  if (openDispute) {
    throw new Error('αñ»αñ╛ αñ¼αÑüαñòαñ┐αñéαñùαñ╡αñ░ αñÜαñ╛αñ▓αÑé αññαñòαÑìαñ░αñ╛αñ░ αñåαñ╣αÑç ΓÇö αñ¬αÑìαñ░αñÑαñ« αññαñòαÑìαñ░αñ╛αñ░αÑÇαñÜαñ╛ αñ¿αñ┐αñ¬αñƒαñ╛αñ░αñ╛ αñòαñ░αñ╛');
  }

  const parsedEventDate = new Date(`${booking.eventDate}T00:00:00Z`);
  if (!booking.eventDate || Number.isNaN(parsedEventDate.getTime())) {
    throw new Error('αñòαñ╛αñ░αÑìαñ»αñòαÑìαñ░αñ« αññαñ╛αñ░αÑÇαñû αñàαñ╡αÑêαñº αñåαñ╣αÑç ΓÇö αñ╕αÑçαñƒαñ▓αñ«αÑçαñéαñƒ αñ╢αñòαÑìαñ» αñ¿αñ╛αñ╣αÑÇ');
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  if (booking.eventDate > todayStr) {
    throw new Error('αñòαñ╛αñ░αÑìαñ»αñòαÑìαñ░αñ« αññαñ╛αñ░αÑÇαñû αñàαñªαÑìαñ»αñ╛αñ¬ αñ¥αñ╛αñ▓αÑçαñ▓αÑÇ αñ¿αñ╛αñ╣αÑÇ ΓÇö αñ╕αÑçαñƒαñ▓αñ«αÑçαñéαñƒ αñ╢αñòαÑìαñ» αñ¿αñ╛αñ╣αÑÇ');
  }

  const breakdown = priceQuote({
    id: quote.id,
    vendorId: booking.vendorId,
    eventId: booking.eventId,
    category: lead.category as Quote['category'],
    items: quote.items,
    discountPaise: quote.discountPaise,
    validTill: quote.validTill,
    status: 'accepted',
  });

  const at = new Date().toISOString();
  const actorFor = (state: string): 'vendor' | 'admin' | 'system' => {
    if (state === 'SETTLEMENT') return session.role === 'admin' ? 'admin' : 'system';
    return session.role === 'admin' ? 'admin' : 'vendor';
  };
  const steps: string[] =
    booking.state === 'BOOKING_CONFIRMED'
      ? ['SERVICE_SCHEDULED', 'SERVICE_COMPLETED', 'SETTLEMENT']
      : booking.state === 'SERVICE_SCHEDULED'
        ? ['SERVICE_COMPLETED', 'SETTLEMENT']
        : booking.state === 'SERVICE_COMPLETED'
          ? ['SETTLEMENT']
          : [];
  if (steps.length === 0) throw new Error('αñ»αñ╛ αñ╕αÑìαñÑαñ┐αññαÑÇαññαÑéαñ¿ αñ╕αÑçαñƒαñ▓αñ«αÑçαñéαñƒ αñ╢αñòαÑìαñ» αñ¿αñ╛αñ╣αÑÇ.');
  const vendorPayout = Math.round(breakdown.vendorPayoutPaise);

  store.transaction(() => {
    for (const state of steps) {
      store.bookings.updateState(bookingId, { state, actor: actorFor(state), at });
    }

    const settlementPosting = postingForSettlement({ orderId: bookingId, breakdown, at });
    store.bookings.appendLedger(
      settlementPosting.entries.map((entry) => ({
        id: entry.id,
        bookingId,
        account: entry.account,
        amountPaise: entry.amountPaise,
        memo: entry.memo,
        idempotencyKey: entry.idempotencyKey,
        createdAt: entry.at,
      })),
    );

    const existingSettlement = store.bookings
      .settlements({ vendorId: booking.vendorId })
      .find((s) => s.bookingId === bookingId);
    if (!existingSettlement) {
      store.bookings.createSettlement({
        bookingId,
        vendorId: booking.vendorId,
        amountPaise: vendorPayout,
      });
    }

    store.audit.record({
      actor: session.userId,
      action: 'booking.settled',
      entity: 'booking',
      entityId: bookingId,
      after: { vendorPayoutPaise: vendorPayout },
      at,
    });
  });

  revalidatePath('/vendor');
  revalidatePath('/admin');
  revalidatePath('/console');
}

export async function refundBookingAction(formData: FormData): Promise<void> {
  const store = getStore();
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('αñ¬αñ░αññαñ╛αñ╡αñ╛ αñ¬αÑìαñ░αñòαÑìαñ░αñ┐αñ»αñ╛ αñòαÑçαñ╡αñ│ αÑ▓αñíαñ«αñ┐αñ¿ αñòαñ░αÑé αñ╢αñòαññαñ╛αññ');
  }

  const bookingId = String(formData.get('bookingId') ?? '').slice(0, 80);
  const booking = store.bookings.byId(bookingId);
  if (!booking) throw new Error('αñ¼αÑüαñòαñ┐αñéαñù αñ╕αñ╛αñ¬αñíαñ▓αÑÇ αñ¿αñ╛αñ╣αÑÇ');

  const reason = String(formData.get('reason') ?? 'αñùαÑìαñ░αñ╛αñ╣αñòαñ╛αñÜαÑìαñ»αñ╛ αñ╡αñ┐αñ¿αñéαññαÑÇαñ¿αÑüαñ╕αñ╛αñ░ αñ¬αñ░αññαñ╛αñ╡αñ╛').trim().slice(0, 200);
  const quote = booking.quoteId ? store.marketplace.quoteById(booking.quoteId) : undefined;
  const lead = booking.leadId ? store.marketplace.leadById(booking.leadId) : undefined;
  if (!quote || !lead) throw new Error('αñ¼αÑüαñòαñ┐αñéαñùαñ╢αÑÇ αñ╕αñéαñ¼αñéαñºαñ┐αññ αññαñ¬αñ╢αÑÇαñ▓ αñ╕αñ╛αñ¬αñíαñ▓αÑç αñ¿αñ╛αñ╣αÑÇαññ');
  if (booking.state === 'REFUNDED') return;

  const breakdown = priceQuote({
    id: quote.id,
    vendorId: booking.vendorId,
    eventId: booking.eventId,
    category: lead.category as Quote['category'],
    items: quote.items,
    discountPaise: quote.discountPaise,
    validTill: quote.validTill,
    status: 'accepted',
  });

  const rawFault = String(formData.get('fault') ?? '').trim();
  const fault =
    rawFault === 'vendor' || rawFault === 'force-majeure' || rawFault === 'none' ? rawFault : 'customer';

  const rawDays = formData.get('daysBeforeEvent');
  let daysBeforeEvent: number;
  if (rawDays !== null && rawDays !== undefined && String(rawDays).trim() !== '' && Number.isFinite(Number(rawDays))) {
    daysBeforeEvent = Math.max(0, Math.trunc(Number(rawDays)));
  } else {
    const eventTime = new Date(`${booking.eventDate}T00:00:00Z`).getTime();
    const diff = eventTime - Date.now();
    daysBeforeEvent = Number.isFinite(diff) ? Math.max(0, Math.floor(diff / 86_400_000)) : 0;
  }

  const calc = calculateRefund({ breakdown, daysBeforeEvent, fault });
  const rawRefundField = formData.get('refundRupees');
  let refundPaise: number;
  if (rawRefundField !== null && rawRefundField !== undefined && String(rawRefundField).trim() !== '') {
    const rawRefund = Number(rawRefundField);
    refundPaise = Math.round(Math.min(Math.max(rawRefund * 100, 0), booking.totalPaise));
  } else {
    refundPaise = Math.round(calc.refundPaise);
  }
  if (refundPaise <= 0) throw new Error('αñ¬αñ░αññαñ╛αñ╡αñ╛ αñ░αñòαÑìαñòαñ« αñ╢αÑéαñ¿αÑìαñ» αñàαñ╕αÑé αñ╢αñòαññ αñ¿αñ╛αñ╣αÑÇ');

  let refundId = String(formData.get('refundId') ?? '').trim().slice(0, 80);
  if (!refundId) {
    refundId = `rf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  const payments = store.bookings.payments(bookingId);
  const captured = payments
    .filter((p) => (p.kind === 'advance' || p.kind === 'balance') && p.status === 'captured')
    .reduce((sum, p) => sum + Math.round(p.amountPaise), 0);
  const capturedBase = captured > 0 ? captured : Math.round(booking.advancePaise);
  const gatewayKept = Math.round(breakdown.gatewayFeePaise + breakdown.gatewayFeeGstPaise);
  const refundedSoFar = payments
    .filter((p) => p.kind === 'refund' && p.status === 'captured')
    .reduce((sum, p) => sum + Math.round(p.amountPaise), 0);
  if (refundedSoFar + refundPaise > capturedBase - gatewayKept) {
    throw new Error('αñ¬αñ░αññαñ╛αñ╡αñ╛ αñ░αñòαÑìαñòαñ« αñ£αñ«αñ╛ αñ░αñòαñ«αÑçαñ¬αÑçαñòαÑìαñ╖αñ╛ αñ£αñ╛αñ╕αÑìαññ αñåαñ╣αÑç ΓÇö αññαñ¬αñ╛αñ╕αÑéαñ¿ αñ¬αÑüαñ¿αÑìαñ╣αñ╛ αñ¬αÑìαñ░αñ»αññαÑìαñ¿ αñòαñ░αñ╛');
  }

  const at = new Date().toISOString();
  const idempotencyKey = `${bookingId}:pay:refund:${refundId}`;

  store.transaction(() => {
    const current = store.bookings.byId(bookingId);
    if (!current) throw new Error('αñ¼αÑüαñòαñ┐αñéαñù αñ╕αñ╛αñ¬αñíαñ▓αÑÇ αñ¿αñ╛αñ╣αÑÇ');
    if (current.state === 'REFUNDED') return;
    if (current.state !== 'CANCELLED' && current.state !== 'REFUND_PENDING') {
      try {
        store.bookings.updateState(bookingId, {
          state: 'CANCELLED',
          actor: 'admin',
          reason,
          at,
        });
      } catch {
        void 0;
      }
    }
    const afterCancel = store.bookings.byId(bookingId);
    if (afterCancel && afterCancel.state !== 'REFUND_PENDING' && afterCancel.state !== 'REFUNDED') {
      store.bookings.updateState(bookingId, {
        state: 'REFUND_PENDING',
        actor: 'admin',
        reason,
        at,
      });
    }
    const afterPending = store.bookings.byId(bookingId);
    if (afterPending && afterPending.state !== 'REFUNDED') {
      store.bookings.updateState(bookingId, {
        state: 'REFUNDED',
        actor: 'admin',
        reason,
        at,
      });
    }

    const refundPosting = postingForRefund({
      orderId: bookingId,
      breakdown,
      refundPaise,
      refundId,
      vendorPayoutReversedPaise: Math.round(calc.vendorPayoutReversedPaise),
      at,
    });

    store.bookings.appendLedger(
      refundPosting.entries.map((entry) => ({
        id: entry.id,
        bookingId,
        account: entry.account,
        amountPaise: entry.amountPaise,
        memo: entry.memo,
        idempotencyKey: entry.idempotencyKey,
        createdAt: entry.at,
      })),
    );

    store.bookings.recordPayment({
      bookingId,
      kind: 'refund',
      provider: 'simulated',
      providerRef: `refund_${bookingId}_${refundId}`,
      amountPaise: refundPaise,
      status: 'captured',
      idempotencyKey,
      raw: {
        reason,
        initiatedBy: session.userId,
        policyNote: calc.policyNote,
        deductions: calc.deductions,
        daysBeforeEvent,
        fault,
        refundId,
      },
      createdAt: at,
    });

    store.audit.record({
      actor: session.userId,
      action: 'booking.refunded',
      entity: 'booking',
      entityId: bookingId,
      after: { refundPaise, reason, refundId },
      at,
    });
  });

  revalidatePath('/vendor');
  revalidatePath('/admin');
  revalidatePath('/console');
}

export async function disputeBookingAction(formData: FormData): Promise<void> {
  const store = getStore();
  const session = await getSession();
  if (!session) throw new Error('αñ╕αññαÑìαñ░ αñåαñ╡αñ╢αÑìαñ»αñò αñåαñ╣αÑç.');
  const bookingId = String(formData.get('bookingId') ?? '').slice(0, 80);
  const booking = store.bookings.byId(bookingId);
  if (!booking) throw new Error('αñ¼αÑüαñòαñ┐αñéαñù αñ╕αñ╛αñ¬αñíαñ▓αÑÇ αñ¿αñ╛αñ╣αÑÇ');

  const reason = String(formData.get('reason') ?? 'αñ╕αÑçαñ╡αÑçαñ¼αñªαÑìαñªαñ▓ αññαñòαÑìαñ░αñ╛αñ░').trim().slice(0, 300);
  if (!reason) throw new Error('αññαñòαÑìαñ░αñ╛αñ░αÑÇαñÜαÑç αñòαñ╛αñ░αñú αñ▓αñ┐αñ╣αñ╛');
  const evidence = formData
    .getAll('evidence')
    .map((v) => String(v).trim().slice(0, 500))
    .filter((v) => v.length > 0);
  const raisedBy = session.role === 'vendor' ? 'vendor' : session.role === 'admin' ? 'admin' : 'customer';

  const at = new Date().toISOString();
  store.transaction(() => {
    store.bookings.updateState(bookingId, {
      state: 'DISPUTED',
      actor: session.role === 'vendor' ? 'vendor' : session.role === 'admin' ? 'admin' : 'customer',
      reason,
      at,
    });

    store.bookings.openDispute({
      bookingId,
      raisedBy,
      reason,
      evidence,
    });

    store.audit.record({
      actor: session.userId,
      action: 'booking.disputed',
      entity: 'booking',
      entityId: bookingId,
      after: { reason },
      at,
    });
  });

  revalidatePath('/vendor');
  revalidatePath('/admin');
  revalidatePath('/console');
}
