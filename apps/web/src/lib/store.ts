import 'server-only';

import { defaultDatabasePath, openStore, type Store } from '@mazi/store';
import { seedStore } from '@mazi/store/seed';

/**
 * One process-wide store handle.
 *
 * Next.js dev mode hot-reloads modules, so the handle lives on `globalThis` —
 * otherwise every edit would open another SQLite connection and the WAL would
 * grow without bound.
 */

interface StoreGlobal {
  __maziStore?: Store;
}

const globalRef = globalThis as unknown as StoreGlobal;

export function databasePath(): string {
  return defaultDatabasePath(process.cwd());
}

export function getStore(): Store {
  if (globalRef.__maziStore) return globalRef.__maziStore;

  const filename = databasePath();
  const store = openStore({ filename });

  // A fresh checkout gets a working demo without a second command. Production
  // never seeds itself — `npm run db:reset` is the only way data arrives there,
  // unless a pilot sets SEED_ON_BOOT=1 on purpose.
  const seedOnBoot = process.env.NODE_ENV !== 'production' || process.env.SEED_ON_BOOT === '1';
  if (seedOnBoot) {
    try {
      const vendorCount = store.db.prepare('SELECT COUNT(*) AS c FROM vendors').get();
      if (Number(vendorCount?.c ?? 0) === 0) seedStore(store);
    } catch {
      // Seeding is best-effort — a read-only or partially migrated database still
      // serves whatever it has instead of taking the site down.
    }
  }

  globalRef.__maziStore = store;
  return store;
}

/** Test/edge helpers. */
export function resetStoreCache(): void {
  globalRef.__maziStore?.close();
  globalRef.__maziStore = undefined;
}
