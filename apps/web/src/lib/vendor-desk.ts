import 'server-only';

import { cookies } from 'next/headers';

import { getStore } from '@/lib/store';
import { verifySession } from '@/lib/session';

/**
 * Which vendor the desk is signed in as.
 *
 * A signed vendor session wins. The seeded walkthrough otherwise opens the
 * Pune photography studio that has history in the database.
 */
const DEMO_VENDOR = 'vnd_pune_kulkarni_studio';

export async function vendorDeskId(): Promise<string> {
  const store = getStore();
  try {
    const raw = (await cookies()).get('mazi_session')?.value;
    if (raw) {
      const session = verifySession(raw);
      if (session?.vendorId && store.vendors.byId(session.vendorId)) return session.vendorId;
    }
  } catch {
    // cookies() is unavailable outside a request; the demo desk still opens.
  }
  return store.vendors.byId(DEMO_VENDOR) ? DEMO_VENDOR : (store.vendors.search({ limit: 1 })[0]?.id ?? DEMO_VENDOR);
}
