import { describe, expect, it } from 'vitest';

import { matchGuestForRsvp, safeEventSlug, type RsvpGuestRef } from '../apps/web/src/lib/rsvp-match';

const guests: RsvpGuestRef[] = [
  { id: 'g1', eventId: 'e1', name: 'काका', phone: '9822011111', code: 'PATIL001' },
  { id: 'g2', eventId: 'e1', name: 'शेजारी', code: 'PATIL002' },
  { id: 'g3', eventId: 'e2', name: 'काका', phone: '9822011111', code: 'OTHER001' },
];

describe('matchGuestForRsvp', () => {
  it('updates the guest named by a code on this event', () => {
    const match = matchGuestForRsvp(guests, 'e1', { name: 'कोणीही', code: 'PATIL001' });
    expect(match).toEqual({ kind: 'update', guest: guests[0] });
  });

  it('does not fall through to a name match when the code is wrong', () => {
    expect(matchGuestForRsvp(guests, 'e1', { name: 'काका', phone: '9822011111', code: 'NOPE' }).kind).toBe('invalid-code');
  });

  it('does not let a nameless submission overwrite a guest who left a phone', () => {
    expect(matchGuestForRsvp(guests, 'e1', { name: 'काका' }).kind).toBe('create');
  });

  it('updates a walk-in when the name and phone both match', () => {
    const match = matchGuestForRsvp(guests, 'e1', { name: 'काका', phone: '9822011111' });
    expect(match.kind).toBe('update');
  });

  it('updates a unique guest who never left a phone', () => {
    const match = matchGuestForRsvp(guests, 'e1', { name: 'शेजारी' });
    expect(match).toEqual({ kind: 'update', guest: guests[1] });
  });

  it('does not use a code from another event', () => {
    expect(matchGuestForRsvp(guests, 'e1', { name: 'काका', code: 'OTHER001' }).kind).toBe('invalid-code');
  });
});

describe('safeEventSlug', () => {
  it('accepts seeded slugs', () => {
    expect(safeEventSlug('patil-patil-vivah-2027')).toBe('patil-patil-vivah-2027');
  });

  it('rejects path tricks', () => {
    expect(safeEventSlug('../admin')).toBeUndefined();
    expect(safeEventSlug('//evil.com')).toBeUndefined();
    expect(safeEventSlug('a/b')).toBeUndefined();
    expect(safeEventSlug('')).toBeUndefined();
  });
});
