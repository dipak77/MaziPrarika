'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { getStore } from '@/lib/store';

const vendorQuoteHits = new Map<string, number[]>();
async function vendorQuoteRateLimited(): Promise<boolean> {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const now = Date.now();
  const recent = (vendorQuoteHits.get(ip) ?? []).filter((at) => now - at < 60_000);
  if (recent.length >= 10) { vendorQuoteHits.set(ip, recent); return true; }
  recent.push(now); vendorQuoteHits.set(ip, recent); return false;
}

/**
 * Enquiry action for a vendor profile.
 *
 * Requesting a quote is deliberately *not* a booking. It creates a lead with an
 * SLA clock, opens a thread, and tells the customer exactly when to expect an
 * answer — instant booking is explicitly out of scope for this marketplace
 * because a wedding vendor's calendar is not a hotel's inventory.
 */
export async function requestVendorQuoteAction(formData: FormData): Promise<void> {
  if (await vendorQuoteRateLimited()) throw new Error('खूप विनंत्या — एका मिनिटाने पुन्हा प्रयत्न करा.');
  const vendorId = String(formData.get('vendorId') ?? '').trim().slice(0, 80);
  const eventSlug = String(formData.get('eventSlug') ?? '').trim().slice(0, 120);
  const message = String(formData.get('message') ?? '').trim().slice(0, 600);
  const rawBudget = Number(formData.get('budgetPaise') ?? 0);
  const budget = Number.isFinite(rawBudget) ? Math.min(Math.max(Math.round(rawBudget), 0), 10_000_000_00) : 0;

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
