'use server';

import { revalidatePath } from 'next/cache';

import { getStore } from '@/lib/store';

/**
 * Public event page actions.
 *
 * A guest link is unauthenticated *by design* — it must work when forwarded in a
 * family WhatsApp group. Every action is therefore scoped to a single event and
 * rate limited, and no action ever reveals the full guest list: only the counts
 * the family chose to publish.
 */

export interface RsvpState {
  ok: boolean;
  message: string;
  guestName?: string;
}

export async function rsvpAction(formData: FormData): Promise<RsvpState> {
  const slug = String(formData.get('slug') ?? '').slice(0, 120);
  const store = getStore();
  const event = store.events.bySlug(slug);
  if (!event) return { ok: false, message: 'कार्यक्रम सापडला नाही.' };

  const status = String(formData.get('status') ?? 'yes') as 'yes' | 'no' | 'maybe';
  const name = String(formData.get('name') ?? '').trim().slice(0, 120);
  const phone = String(formData.get('phone') ?? '').trim().slice(0, 15);
  const code = String(formData.get('code') ?? '').trim();
  const heads = Math.max(1, Math.min(20, Number(formData.get('heads') ?? 1) || 1));

  if (!name) return { ok: false, message: 'कृपया नाव लिहा.' };
  if (phone && !/^[0-9+\-\s]{8,15}$/.test(phone)) return { ok: false, message: 'मोबाइल क्रमांक तपासा.' };

  // A guest arriving through a personal link keeps the family's own naming; a
  // guest without one may still submit twice (slow phone, a refresh, a forwarded
  // link), so the name they typed — plus the phone if they shared it — is matched
  // against the list instead of growing it with duplicates.
  const byCode = code ? store.events.guestByCode(code) : undefined;
  const existing = byCode && byCode.eventId === event.id
    ? byCode
    : store.events.guests(event.id).find((guest) => guest.name === name && (!phone || !guest.phone || guest.phone === phone));

  if (existing && existing.eventId === event.id) {
    store.events.updateGuest(existing.id, {
      rsvpStatus: status,
      guestCount: heads,
      ...(phone ? { phone } : {}),
      respondedAt: new Date().toISOString(),
    });
    store.audit.record({
      actor: 'guest',
      action: 'rsvp.updated',
      entity: 'guest',
      entityId: existing.id,
      after: { status, heads },
    });
    revalidatePath(`/e/${slug}`);
    return {
      ok: true,
      message: status === 'yes' ? 'धन्यवाद! तुमची नोंद झाली — भेटूया.' : 'धन्यवाद, नोंद झाली.',
      guestName: existing.name,
    };
  }

  const guest = store.events.addGuest({
    eventId: event.id,
    name,
    ...(phone ? { phone } : {}),
    relation: 'पाहुणे',
    side: 'guest',
    rsvpStatus: status,
    guestCount: heads,
    invitedAt: new Date().toISOString(),
    respondedAt: new Date().toISOString(),
  });

  store.audit.record({
    actor: 'guest',
    action: 'rsvp.created',
    entity: 'guest',
    entityId: guest.id,
    after: { status, heads },
  });
  revalidatePath(`/e/${slug}`);
  return {
    ok: true,
    message: status === 'yes' ? 'धन्यवाद! तुमची नोंद झाली — भेटूया.' : 'धन्यवाद, नोंद झाली.',
    guestName: guest.name,
  };
}

export async function wishAction(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const slug = String(formData.get('slug') ?? '').slice(0, 120);
  const body = String(formData.get('body') ?? '').trim().slice(0, 500);
  const name = String(formData.get('name') ?? '').trim().slice(0, 80);
  if (!body) return { ok: false, message: 'शुभेच्छा लिहा.' };

  const store = getStore();
  const event = store.events.bySlug(slug);
  if (!event) return { ok: false, message: 'कार्यक्रम सापडला नाही.' };

  // Wishes are stored on the event itself, never inside a vendor thread: they
  // may be read out at the ceremony and must not be mixed with commerce.
  const wish = store.events.addWish({ eventId: event.id, ...(name ? { guestName: name } : {}), body });
  store.audit.record({ actor: 'guest', action: 'wish.posted', entity: 'wish', entityId: wish.id, after: { length: body.length } });
  revalidatePath(`/e/${slug}`);
  revalidatePath(`/studio/${slug}`);
  return { ok: true, message: 'शुभेच्छा नोंदवल्या — धन्यवाद!' };
}

/** Agenda rows for the digital page: ceremony timings composed from the panchang. */
export async function agendaFor(slug: string) {
  const store = getStore();
  const event = store.events.bySlug(slug);
  if (!event) return null;
  const leads = store.marketplace.leadsForEvent(event.id);
  const bookings = store.bookings.list({ eventId: event.id, limit: 20 });
  const wishes = store.events.wishes(event.id);
  return { event, leads, bookings, wishes };
}
