/**
 * Who an unauthenticated RSVP is allowed to update.
 *
 * A personal invitation code updates that guest only. A walk-in without a code
 * may update a previous walk-in of the same name when the phone matches, or
 * when neither side has a phone and the name is unique. A missing phone never
 * matches a guest who already left one — that was how one visitor could change
 * another guest's reply.
 */

export interface RsvpGuestRef {
  id: string;
  eventId: string;
  name: string;
  phone?: string;
  code: string;
}

export type RsvpMatch =
  | { kind: 'update'; guest: RsvpGuestRef }
  | { kind: 'invalid-code' }
  | { kind: 'create' };

export function matchGuestForRsvp(
  guests: readonly RsvpGuestRef[],
  eventId: string,
  input: { name: string; phone?: string; code?: string },
): RsvpMatch {
  const code = input.code?.trim();
  if (code) {
    const guest = guests.find((row) => row.eventId === eventId && row.code === code);
    return guest ? { kind: 'update', guest } : { kind: 'invalid-code' };
  }

  const name = input.name.trim();
  const phone = input.phone?.trim();
  const named = guests.filter((row) => row.eventId === eventId && row.name === name);
  if (phone) {
    const byPhone = named.filter((row) => row.phone === phone);
    if (byPhone.length === 1) return { kind: 'update', guest: byPhone[0]! };
    return { kind: 'create' };
  }

  const open = named.filter((row) => !row.phone);
  if (open.length === 1) return { kind: 'update', guest: open[0]! };
  return { kind: 'create' };
}

/** Event slugs are ascii tokens. Anything else must not become a redirect path. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function safeEventSlug(value: string): string | undefined {
  const slug = value.trim().toLowerCase();
  if (slug.length < 1 || slug.length > 80) return undefined;
  if (!SLUG.test(slug)) return undefined;
  return slug;
}
