import 'server-only';

import { getStore } from '@/lib/store';

/**
 * Which vendor the desk is signed in as.
 *
 * Demo runs as one curated vendor (a Pune photography studio with real history in
 * the seed); production resolves this from the session. Kept out of the
 * `actions.ts` module so it can stay a plain synchronous helper.
 */
const DEMO_VENDOR = 'vnd_pune_kulkarni_studio';

export function vendorDeskId(): string {
  const store = getStore();
  return store.vendors.byId(DEMO_VENDOR) ? DEMO_VENDOR : (store.vendors.search({ limit: 1 })[0]?.id ?? DEMO_VENDOR);
}
