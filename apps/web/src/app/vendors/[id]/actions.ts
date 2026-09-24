'use server';

import { revalidatePath } from 'next/cache';

import { getStore } from '@/lib/store';

/**
 * Enquiry action for a vendor profile.
 *
 * Requesting a quote is deliberately *not* a booking. It creates a lead with an
 * SLA clock, opens a thread, and tells the customer exactly when to expect an
 * answer — instant booking is explicitly out of scope for this marketplace
 * because a wedding vendor's calendar is not a hotel's inventory.
 */
export async function requestVendorQuoteAction(formData: FormData): Promise<void> {
  const vendorId = String(formData.get('vendorId') ?? '').slice(0, 80);
  const eventSlug = String(formData.get('eventSlug') ?? '').slice(0, 120);
  const message = String(formData.get('message') ?? '').trim().slice(0, 600);
  const budget = Number(formData.get('budgetPaise') ?? 0);

  const store = getStore();
  const vendor = store.vendors.byId(vendorId);
  if (!vendor) throw new Error('विक्रेता सापडला नाही');

  const event = eventSlug ? store.events.bySlug(eventSlug) : undefined;
  if (!event) throw new Error('कार्यक्रम निवडा — कोट कार्यक्रमाशी जोडला जातो');

  const existing = store.marketplace
    .leadsForEvent(event.id)
    .find((lead) => lead.vendorId === vendorId && lead.status !== 'lost');
  if (existing) {
    revalidatePath(`/vendors/${vendorId}`);
    return;
  }

  const lead = store.marketplace.createLead({
    eventId: event.id,
    vendorId,
    customerUserId: event.ownerUserId,
    category: vendor.category,
    message: message || `${event.title} — उपलब्धता व पॅकेजचा तपशील कळवा.`,
    ...(budget > 0 ? { budgetPaise: budget } : {}),
    ...(event.eventDate ? { eventDate: event.eventDate } : {}),
    guestCount: event.guestCountExpected,
    source: 'search',
    responseDueMinutes: Math.max(60, vendor.responseMinutes * 3),
  });

  store.marketplace.addMessage({
    leadId: lead.id,
    sender: 'customer',
    body: lead.message ?? '',
    attachments: [],
    readAt: new Date().toISOString(),
  });

  store.audit.record({
    actor: event.ownerUserId,
    action: 'lead.created',
    entity: 'lead',
    entityId: lead.id,
    after: { vendorId, category: vendor.category, source: 'search' },
  });

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath(`/vendor`);
  revalidatePath(`/studio/${event.slug}`);
}
