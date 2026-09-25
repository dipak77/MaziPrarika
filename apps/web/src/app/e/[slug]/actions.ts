'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { matchGuestForRsvp, safeEventSlug } from '@/lib/rsvp-match';
import { verifyHoneypot } from '@/lib/session';
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

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const submissions = new Map<string, number[]>();

function hitBucket(key: string, limit: number): boolean {
  const now = Date.now();
  const recent = (submissions.get(key) ?? []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= limit) {
    submissions.set(key, recent);
    return true;
  }
  recent.push(now);
  submissions.set(key, recent);
  return false;
}

async function rateLimited(): Promise<boolean> {
  const headerStore = await headers();
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    submissions.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissions.set(ip, recent);
  if (submissions.size > 10_000) {
    for (const [key, times] of submissions) {
      if (times.every((at) => now - at >= RATE_LIMIT_WINDOW_MS)) submissions.delete(key);
    }
  }
  return false;
}

export async function rsvpAction(formData: FormData): Promise<RsvpState> {
  if (!verifyHoneypot(formData)) return { ok: true, message: 'धन्यवाद, नोंद झाली.' };
  if (await rateLimited()) return { ok: false, message: 'कृपया थोडे वाट पहा.' };
  const slug = safeEventSlug(String(formData.get('slug') ?? ''));
  if (!slug) return { ok: false, message: 'कार्यक्रम सापडला नाही.' };
  const store = getStore();
  const event = store.events.bySlug(slug);
  if (!event) return { ok: false, message: 'कार्यक्रम सापडला नाही.' };

  const rawStatus = String(formData.get('status') ?? 'yes');
  const status: 'yes' | 'no' | 'maybe' = rawStatus === 'no' ? 'no' : rawStatus === 'maybe' ? 'maybe' : 'yes';
  const name = String(formData.get('name') ?? '').trim().slice(0, 120);
  const phone = String(formData.get('phone') ?? '').trim().slice(0, 15);
  const code = String(formData.get('code') ?? '').trim().slice(0, 40);
  const heads = Math.max(1, Math.min(20, Number(formData.get('heads') ?? 1) || 1));

  if (!name) return { ok: false, message: 'कृपया नाव लिहा.' };
  if (phone && !/^[0-9+\-\s]{8,15}$/.test(phone)) return { ok: false, message: 'मोबाइल क्रमांक तपासा.' };
  if (hitBucket(`rsvp:${slug}:${name}`, 4)) return { ok: false, message: 'कृपया थोडे वाट पहा.' };

  // A personal code updates that guest only. A walk-in may update their own
  // earlier reply when the phone matches. A blank phone never overwrites a
  // guest who already left one.
  const matched = matchGuestForRsvp(store.events.guests(event.id), event.id, {
    name,
    ...(phone ? { phone } : {}),
    ...(code ? { code } : {}),
  });
  if (matched.kind === 'invalid-code') return { ok: false, message: 'निमंत्रण कोड जुळला नाही.' };
  const existing = matched.kind === 'update' ? matched.guest : undefined;

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
  if (!verifyHoneypot(formData)) return { ok: true, message: 'शुभेच्छा नोंदवल्या — धन्यवाद!' };
  if (await rateLimited()) return { ok: false, message: 'कृपया थोडे वाट पहा.' };
  const slug = safeEventSlug(String(formData.get('slug') ?? ''));
  if (!slug) return { ok: false, message: 'कार्यक्रम सापडला नाही.' };
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
