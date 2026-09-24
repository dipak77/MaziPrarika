'use server';

import { revalidatePath } from 'next/cache';

import { availabilityState, postingForPayment, priceQuote, type Quote } from '@mazi/commerce';

import { getStore } from '@/lib/store';
import { vendorDeskId } from '@/lib/vendor-desk';

/**
 * Vendor OS actions.
 *
 * A vendor on this platform answers enquiries, quotes in line items, holds a
 * date, and gets paid — all in Marathi, all on a phone. Everything that moves a
 * lead forward writes an audit entry, because a marketplace where a vendor can
 * silently change a quote is a marketplace nobody will trust with a wedding.
 */

export async function respondToLeadAction(formData: FormData): Promise<void> {
  const store = getStore();
  const leadId = String(formData.get('leadId') ?? '').slice(0, 80);
  const body = String(formData.get('body') ?? '')
    .trim()
    .slice(0, 800);
  const lead = store.marketplace.leadById(leadId);
  if (!lead) throw new Error('विनंती सापडली नाही');
  if (!body) throw new Error('उत्तर लिहा');

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

  revalidatePath('/vendor');
  revalidatePath(`/vendor/leads/${leadId}`);
}

export async function saveQuoteAction(formData: FormData): Promise<void> {
  const store = getStore();
  const leadId = String(formData.get('leadId') ?? '').slice(0, 80);
  const lead = store.marketplace.leadById(leadId);
  if (!lead) throw new Error('विनंती सापडली नाही');

  const labels = formData.getAll('label').map((value) => String(value).trim());
  const quantities = formData.getAll('quantity').map((value) => Number(value) || 0);
  const units = formData.getAll('unit').map((value) => String(value).trim() || 'नग');
  const prices = formData.getAll('unitPrice').map((value) => Math.round((Number(value) || 0) * 100));

  const items = labels
    .map((label, index) => ({
      label,
      quantity: quantities[index] ?? 0,
      unit: units[index] ?? 'नग',
      unitPricePaise: prices[index] ?? 0,
      optional: false,
    }))
    .filter((item) => item.label.length > 0 && item.quantity > 0 && item.unitPricePaise > 0);

  if (!items.length) throw new Error('किमान एक ओळ भरा — वस्तू, प्रमाण व दर');

  const discountRupees = Number(formData.get('discount') ?? 0) || 0;
  const quoteInput: Quote = {
    id: `qt_${leadId}_${Date.now().toString(36)}`,
    vendorId: lead.vendorId,
    ...(lead.eventId ? { eventId: lead.eventId } : {}),
    category: lead.category as Quote['category'],
    items,
    discountPaise: Math.round(discountRupees * 100),
    validTill: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
    status: 'sent',
  };
  const breakdown = priceQuote(quoteInput);

  const record = store.marketplace.createQuote({
    id: quoteInput.id,
    leadId,
    vendorId: lead.vendorId,
    ...(lead.eventId ? { eventId: lead.eventId } : {}),
    items,
    discountPaise: quoteInput.discountPaise,
    subtotalPaise: breakdown.subtotalPaise,
    gstPaise: breakdown.gstPaise,
    totalPaise: breakdown.customerTotalPaise,
    validTill: quoteInput.validTill,
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

  revalidatePath('/vendor');
  revalidatePath(`/vendor/leads/${leadId}`);
}

/**
 * Accept a quote as the customer (demo shortcut for the walkthrough).
 *
 * This is where the platform's real money story is written: a booking row in the
 * customer's name, a **double-entry posting in our own ledger** (the gateway is
 * never the source of truth), an idempotent payment record, and only then the
 * state machine advance to `BOOKING_CONFIRMED`. Everything happens in one SQLite
 * transaction, because a booking that exists without its ledger — or vice versa —
 * is a support ticket nobody can reconstruct.
 */
export async function acceptQuoteAsCustomerAction(formData: FormData): Promise<void> {
  const store = getStore();
  const quoteId = String(formData.get('quoteId') ?? '').slice(0, 80);
  const quote = store.marketplace.quoteById(quoteId);
  if (!quote) throw new Error('कोट सापडला नाही');

  const lead = quote.leadId ? store.marketplace.leadById(quote.leadId) : undefined;
  if (!lead?.eventId) throw new Error('कोटला कार्यक्रम जोडलेला नाही');

  const bookingId = `bk_${quote.id}`;
  const eventId = lead.eventId;

  // Idempotency: the same tap, a double tap on a slow phone, or a refresh must
  // never create a second booking or a second ledger posting.
  if (store.bookings.byId(bookingId)) {
    revalidatePath('/vendor');
    revalidatePath(`/vendor/leads/${lead.id}`);
    return;
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

  const at = new Date().toISOString();
  const advance = Math.round(breakdown.customerTotalPaise * 0.2);
  const eventDate = lead.eventDate ?? at.slice(0, 10);
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

    // Our own ledger. Debits equal credits, per booking and in total.
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
      raw: { method: 'upi', note: '२०% अॅडव्हान्स', via: 'vendor-desk-demo' },
      createdAt: at,
    });

    store.bookings.updateState(bookingId, {
      state: 'BOOKING_CONFIRMED',
      actor: 'system',
      at,
    });

    const slot = availabilityState(store.vendors.availability(quote.vendorId, eventDate, eventDate), {
      vendorId: quote.vendorId,
      date: eventDate,
    });
    if (slot.bookable) {
      store.vendors.setAvailability({
        vendorId: quote.vendorId,
        date: eventDate,
        status: 'booked',
        teamCapacity: 2,
        bookedTeamCount: 1,
        notes: lead.id,
      });
    }

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
  const vendorId = String(formData.get('vendorId') ?? vendorDeskId());
  const from = String(formData.get('from') ?? '');
  const to = String(formData.get('to') ?? '');
  const status = String(formData.get('status') ?? 'blocked') as 'blocked' | 'available';
  if (!from || !to) throw new Error('तारखा निवडा');

  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (end < start) throw new Error('शेवटची तारीख आधीची असू शकत नाही');
  if ((end.getTime() - start.getTime()) / 86_400_000 > 60) throw new Error('एका वेळी ६० दिवसांपर्यंत');

  for (let day = new Date(start); day <= end; day = new Date(day.getTime() + 86_400_000)) {
    store.vendors.setAvailability({
      vendorId,
      date: day.toISOString().slice(0, 10),
      status,
      teamCapacity: 2,
      bookedTeamCount: 0,
      notes: status === 'blocked' ? 'वैयक्तिक राखीव' : 'उपलब्ध',
    });
  }

  store.audit.record({
    actor: vendorId,
    action: 'calendar.updated',
    entity: 'vendor',
    entityId: vendorId,
    after: { from, to, status },
  });
  revalidatePath('/vendor');
}
