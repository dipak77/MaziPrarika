'use server';

import { redirect } from 'next/navigation';
import { getStore } from '@/lib/store';
import { slugify } from '@/lib/format';

export async function saveStudioDesign(formData: FormData) {
  const store = getStore();
  const raw = formData.get('design');
  if (typeof raw !== 'string') return;

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }

  const title = parsed.personA && parsed.personB
    ? `${parsed.personA} व ${parsed.personB} यांचा सोहळा`
    : parsed.personA
      ? `${parsed.personA} यांचा सोहळा`
      : 'नवीन कार्यक्रम';

  const baseSlug = slugify(title) || 'navin-karyakram';
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const eventId = `ev_${Date.now().toString(36)}`;
  const ownerUserId = 'usr_demo_user';

  const event = store.events.create({
    id: eventId,
    ownerUserId,
    slug,
    title,
    eventType: parsed.eventType || 'wedding',
    city: parsed.city || 'पुणे',
    venueName: parsed.venue || 'शिवनेरी लॉन्स',
    eventDate: parsed.date || new Date().toISOString().slice(0, 10),
    budgetTargetPaise: 150000000,
    guestCountExpected: 250,
    status: 'planning',
  });

  // Save the design in the store
  store.designs.create({
    id: `des_${Date.now().toString(36)}`,
    eventId: event.id,
    ownerUserId,
    name: title,
    preset: parsed.template || 'paithani',
    scheme: 'traditional',
    status: 'draft',
    doc: parsed,
  });

  redirect(`/studio/${event.slug}`);
}
