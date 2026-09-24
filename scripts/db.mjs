#!/usr/bin/env node
/**
 * Mazi Patrika — database CLI.
 *
 *   node --experimental-sqlite scripts/db.mjs migrate   # apply migrations
 *   node --experimental-sqlite scripts/db.mjs seed      # seed a realistic marketplace
 *   node --experimental-sqlite scripts/db.mjs reset     # drop + migrate + seed
 *   node --experimental-sqlite scripts/db.mjs stats     # row counts and integrity checks
 *
 * The driver is `node:sqlite`, so local/preview environments need no server.
 * Production switches to Postgres by pointing DATABASE_URL at a managed cluster
 * and running infrastructure/postgres/001_init.sql (see docs/DEPLOYMENT.md).
 */

import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// The packages are TypeScript; load them through the workspace build-free
// ESM shim used by the dev server (tsx-free, via Node's type stripping).
const { defaultDatabasePath, openStore, LATEST_SCHEMA_VERSION } = await import('../packages/store/src/index.ts');
const { seedStore } = await import('../packages/store/src/seed.ts');

const command = process.argv[2] ?? 'migrate';
const databasePath = defaultDatabasePath(root);

function open() {
  mkdirSync(dirname(databasePath), { recursive: true });
  return openStore({ filename: databasePath });
}

/** A raw connection that does **not** run migrations — used by `reset`. */
function openRaw() {
  const { DatabaseSync } = require('node:sqlite');
  mkdirSync(dirname(databasePath), { recursive: true });
  return new DatabaseSync(databasePath);
}

function reportCommandFatal(error) {
  console.error(`\n  ✗ ${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
}

try {
  switch (command) {
    case 'migrate': {
      const store = open();
      console.log(`  ✓ migrations applied — schema v${store.version} (latest v${LATEST_SCHEMA_VERSION})`);
      console.log(`    database: ${databasePath}`);
      store.close();
      break;
    }
    case 'seed': {
      const store = open();
      const report = seedStore(store);
      console.log('  ✓ seed complete');
      for (const [key, value] of Object.entries(report)) console.log(`    ${key.padEnd(12)} ${value}`);
      store.close();
      break;
    }
    case 'reset': {
      // Wipe **in place** instead of unlinking the file. A running `next dev`
      // holds an open handle; deleting the file would silently leave the server
      // writing to a ghost database while the CLI seeded a brand new one.
      const raw = openRaw();
      const tables = raw
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
        .all()
        .map((row) => String(row.name));
      raw.exec('PRAGMA foreign_keys = OFF');
      for (const table of tables) raw.exec(`DROP TABLE IF EXISTS "${table}"`);
      raw.exec('PRAGMA foreign_keys = ON');
      raw.close();
      const store = open();
      const report = seedStore(store);
      const totals = integrity(store);
      console.log(`  ✓ database recreated at ${databasePath}`);
      console.log(`    schema v${store.version}, ${Object.values(report).reduce((a, b) => a + b, 0)} seeded rows`);
      console.log(`    ledger balanced: ${totals.ledgerBalanced ? 'yes' : 'NO'} • audits: ${totals.audits}`);
      store.close();
      break;
    }
    case 'stats': {
      const store = open();
      const totals = integrity(store);
      for (const [key, value] of Object.entries(totals)) console.log(`  ${key.padEnd(22)} ${value}`);
      store.close();
      break;
    }
    default:
      console.error(`  Unknown command: ${command}\n  Use migrate | seed | reset | stats`);
      process.exitCode = 1;
  }
} catch (error) {
  reportCommandFatal(error);
}

function integrity(store) {
  const one = (sql) => Number(Object.values(store.db.prepare(sql).get() ?? {})[0] ?? 0);
  const ledgerRows = store.db.prepare('SELECT booking_id, SUM(amount_paise) AS total FROM ledger_entries GROUP BY booking_id').all();
  const unbalanced = ledgerRows.filter((row) => Number(row.total) !== 0);
  return {
    users: one('SELECT COUNT(*) FROM users'),
    vendors: one('SELECT COUNT(*) FROM vendors'),
    events: one('SELECT COUNT(*) FROM events'),
    guests: one('SELECT COUNT(*) FROM guests'),
    leads: one('SELECT COUNT(*) FROM leads'),
    quotes: one('SELECT COUNT(*) FROM quotes'),
    bookings: one('SELECT COUNT(*) FROM bookings'),
    designs: one('SELECT COUNT(*) FROM designs'),
    ledgerEntries: one('SELECT COUNT(*) FROM ledger_entries'),
    ledgerBalanced: unbalanced.length === 0 ? 'yes' : `NO (${unbalanced.length} bookings)`,
    audits: one('SELECT COUNT(*) FROM audit_log'),
  };
}
