'use server';

import { revalidatePath } from 'next/cache';

import { calculateReadiness } from '@mazi/commerce';
import { composeInvitation } from '@mazi/marathi';

import { getStore } from '@/lib/store';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Studio server actions.
 *
 * Every mutation validates its own input, writes an audit entry, and revalidates
 * only the paths that changed — the workspace is re-rendered on the server, so
 * the client never holds authoritative state.
 */

const requireString = (value: FormDataEntryValue | null, field: string, max = 400): string => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new Error(`${field} आवश्यक आहे`);
  if (text.length > max) throw new Error(`${field} खूप मोठा आहे`);
  return text;
};

const optionalString = (value: FormDataEntryValue | null, max = 800): string | undefined => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? text.slice(0, max) : undefined;
};

export async function addTaskAction(formData: FormData): Promise<void> {
  const rl = await checkRateLimit('studio:task', 20, 60_000);
  if (rl.limited) throw new Error('खूप विनंत्या — एका मिनिटाने पुन्हा प्रयत्न करा.');
  const store = getStore();
  const slug = requireString(formData.get('slug'), 'कार्यक्रम', 80);
  const event = store.events.bySlug(slug);
  if (!event) throw new Error('कार्यक्रम सापडला नाही');

  const priorityRaw = Number(formData.get('priority') ?? 2);
  const priority = Number.isFinite(priorityRaw) ? Math.max(1, Math.min(Math.round(priorityRaw), 5)) : 2;
  store.transaction(() => {
    const task = store.events.addTask({
      eventId: event.id,
      title: requireString(formData.get('title'), 'कार्य', 160),
      category: optionalString(formData.get('category')) ?? 'सामान्य',
      status: 'open',
      priority,
      ...(optionalString(formData.get('dueDate')) ? { dueDate: optionalString(formData.get('dueDate'))! } : {}),
    });
    store.audit.record({ actor: event.ownerUserId, action: 'task.created', entity: 'task', entityId: task.id, after: { title: task.title, dueDate: task.dueDate } });
  });
  revalidatePath(`/studio/${slug}`);
}

export async function toggleTaskAction(formData: FormData): Promise<void> {
  const rl = await checkRateLimit('studio:task-toggle', 30, 60_000);
  if (rl.limited) throw new Error('खूप विनंत्या — एका मिनिटाने पुन्हा प्रयत्न करा.');
  const store = getStore();
  const slug = requireString(formData.get('slug'), 'कार्यक्रम', 80);
  const event = store.events.bySlug(slug);
  if (!event) throw new Error('कार्यक्रम सापडला नाही');
  const id = requireString(formData.get('taskId'), 'कार्य', 80);
  const current = store.events.tasks(event.id).find((task) => task.id === id);
  if (!current) throw new Error('कार्य सापडले नाही');

  store.transaction(() => {
    const next = store.events.updateTask(id, { status: current.status === 'done' ? 'open' : 'done' });
    store.audit.record({ actor: event.ownerUserId, action: 'task.toggled', entity: 'task', entityId: id, before: { status: current.status }, after: { status: next.status } });
  });
  revalidatePath(`/studio/${slug}`);
}

export async function addGuestAction(formData: FormData): Promise<void> {
  const store = getStore();
  const slug = requireString(formData.get('slug'), 'कार्यक्रम', 80);
  const event = store.events.bySlug(slug);
  if (!event) throw new Error('कार्यक्रम सापडला नाही');

  const rawGuestCount = Number(formData.get('guestCount') ?? 1);
  const guestCount = Number.isFinite(rawGuestCount) ? Math.max(1, Math.min(Math.round(rawGuestCount), 50)) : 1;
  store.transaction(() => {
  const rawSide = optionalString(formData.get('side')) as 'bride' | 'groom' | 'both' | 'host' | 'guest' | undefined;
  const allowedSides = new Set(['bride', 'groom', 'both', 'host', 'guest']);
  const side = rawSide && allowedSides.has(rawSide) ? rawSide : 'both';
  const guest = store.events.addGuest({
    eventId: event.id,
    name: requireString(formData.get('name'), 'पाहुण्याचे नाव', 120),
    ...(optionalString(formData.get('phone'), 20) ? { phone: optionalString(formData.get('phone'), 20)! } : {}),
    ...(optionalString(formData.get('relation'), 60) ? { relation: optionalString(formData.get('relation'), 60)! } : {}),
    side,
    rsvpStatus: 'pending',
    guestCount: Math.max(1, Math.min(50, Number(formData.get('guestCount') ?? 1) || 1)),
    invitedAt: new Date().toISOString(),
  });
    store.audit.record({
      actor: event.ownerUserId, action: 'guest.added', entity: 'guest', entityId: guest.id,
      after: { name: guest.name, relation: guest.relation, code: guest.code },
    });
  });
  revalidatePath(`/studio/${slug}`);
}

export async function updateEventAction(formData: FormData): Promise<void> {
  const store = getStore();
  const slug = requireString(formData.get('slug'), 'कार्यक्रम', 80);
  const event = store.events.bySlug(slug);
  if (!event) throw new Error('कार्यक्रम सापडला नाही');

  const before = { title: event.title, eventDate: event.eventDate, venueName: event.venueName, guestCountExpected: event.guestCountExpected };
  const rawExpected = Number(formData.get('guestCountExpected') ?? event.guestCountExpected);
  const guestCountExpected = Number.isFinite(rawExpected) ? Math.max(1, Math.min(Math.round(rawExpected), 5000)) : event.guestCountExpected;
  let updated: typeof event;
  store.transaction(() => {
    updated = store.events.update(event.id, {
      title: optionalString(formData.get('title'), 160) ?? event.title,
      ...(optionalString(formData.get('eventDate'), 10) ? { eventDate: optionalString(formData.get('eventDate'), 10)! } : {}),
      ...(optionalString(formData.get('venueName'), 160) ? { venueName: optionalString(formData.get('venueName'), 160)! } : {}),
      guestCountExpected,
    });
    store.audit.record({
      actor: event.ownerUserId, action: 'event.updated', entity: 'event', entityId: event.id,
      before, after: { title: updated.title, eventDate: updated.eventDate, venueName: updated.venueName, guestCountExpected: updated.guestCountExpected },
    });
  });
  revalidatePath(`/studio/${slug}`);
}

export async function requestQuoteAction(formData: FormData): Promise<void> {
  const store = getStore();
  const slug = requireString(formData.get('slug'), 'कार्यक्रम', 80);
  const vendorId = requireString(formData.get('vendorId'), 'विक्रेता', 80);
  const event = store.events.bySlug(slug);
  if (!event) throw new Error('कार्यक्रम सापडला नाही');

  const vendor = store.vendors.byId(vendorId);
  if (!vendor) throw new Error('विक्रेता सापडला नाही');

  const existing = store.marketplace
    .leadsForEvent(event.id)
    .find((lead) => lead.vendorId === vendorId && lead.category === vendor.category);
  if (existing) {
    revalidatePath(`/studio/${slug}`);
    return;
  }

  const budgetPaise = Number.isFinite(event.budgetTargetPaise) ? Math.max(0, Math.min(Math.round(event.budgetTargetPaise * 0.1), 100_000_000_00)) : 0;
  const clampedBudget = Math.max(vendor.startingPricePaise, budgetPaise);
  const guestCount = Number.isFinite(event.guestCountExpected) ? Math.max(1, Math.min(Math.round(event.guestCountExpected), 5000)) : 1;
  store.transaction(() => {
    const lead = store.marketplace.createLead({
      eventId: event.id,
      vendorId,
      customerUserId: event.ownerUserId,
      category: vendor.category,
      message: `${event.title.slice(0, 160)} — ${guestCount} पाहुणे. कृपया उपलब्धता व पॅकेजचा तपशील कळवा.`.slice(0, 800),
      budgetPaise: clampedBudget,
      ...(event.eventDate ? { eventDate: event.eventDate } : {}),
      guestCount,
      source: 'search',
      responseDueMinutes: 120,
    });

    store.marketplace.addMessage({
      leadId: lead.id,
      sender: 'customer',
      body: lead.message ?? '',
      attachments: [],
      readAt: new Date().toISOString(),
    });

    store.audit.record({ actor: event.ownerUserId, action: 'lead.created', entity: 'lead', entityId: lead.id, after: { vendorId, category: vendor.category, budgetPaise: clampedBudget } });
  });
  revalidatePath(`/studio/${slug}`);
  revalidatePath('/vendor');
}

/** The readiness panel is computed from live data, never stored and trusted. */
export async function readinessFor(slug: string) {
  const store = getStore();
  const event = store.events.bySlug(slug);
  if (!event) return null;

  const rsvp = store.events.rsvpSummary(event.id);
  const budget = store.events.budgetItems(event.id);
  const tasks = store.events.tasks(event.id);
  const leads = store.marketplace.leadsForEvent(event.id);
  const designs = store.designs.list({ eventId: event.id });

  const vendorStatus: Array<{ category: 'venue' | 'caterer' | 'photographer' | 'decorator' | 'printer' | 'priest' | 'other'; status: 'confirmed' | 'tentative' | 'none' }> = [];
  for (const lead of leads) {
    const booking = store.bookings
      .list({ eventId: event.id, limit: 100 })
      .find((b) => b.leadId === lead.id);
    const status = booking && booking.state !== 'CANCELLED' ? 'confirmed' : 'tentative';
    const known = vendorStatus.find((v) => v.category === lead.category);
    if (!known) {
      const mapped = (['venue', 'caterer', 'photographer', 'decorator', 'printer', 'priest'].includes(lead.category)
        ? lead.category
        : 'other') as 'venue' | 'caterer' | 'photographer' | 'decorator' | 'printer' | 'priest' | 'other';
      vendorStatus.push({ category: mapped, status });
    } else if (status === 'confirmed') {
      known.status = 'confirmed';
    }
  }

  const today = new Date();
  const daysToEvent = event.eventDate
    ? Math.max(0, Math.round((new Date(`${event.eventDate}T00:00:00Z`).getTime() - today.getTime()) / 86_400_000))
    : 90;

  const report = calculateReadiness({
    eventType: event.eventType,
    daysToEvent,
    vendors: vendorStatus,
    guests: { invited: rsvp.invited, responded: rsvp.responded, expected: event.guestCountExpected },
    budget: {
      targetPaise: event.budgetTargetPaise,
      committedPaise: budget.reduce((sum, item) => sum + item.committedPaise, 0),
      paidPaise: budget.reduce((sum, item) => sum + item.paidPaise, 0),
    },
    tasks: {
      total: tasks.length,
      done: tasks.filter((task) => task.status === 'done').length,
      overdue: tasks.filter((task) => task.status === 'open' && task.dueDate && task.dueDate < today.toISOString().slice(0, 10)).length,
    },
    invitations: {
      published: designs.some((design) => design.status === 'approved' || design.status === 'printing'),
      sentShare: rsvp.invited ? Math.min(1, rsvp.responded / rsvp.invited) : 0,
    },
    muhuratChosen: Boolean(event.muhurat),
  });

  return { event, report, rsvp, budget, tasks, leads, designs, daysToEvent };
}

/** Preview text for the invitation studio — one composer, many surfaces. */
export async function composePreview(slug: string) {
  const store = getStore();
  const event = store.events.bySlug(slug);
  if (!event) return null;
  return composeInvitation({
    eventType: event.eventType,
    hosts: event.hostNames.map((name) => ({ name })),
    date: event.eventDate ?? new Date().toISOString().slice(0, 10),
    venue: { name: event.venueName ?? event.city, city: event.city },
    tone: 'traditional',
    register: 'formal',
    english: false,
    showBranding: false,
  });
}
