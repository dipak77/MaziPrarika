#!/usr/bin/env node
/**
 * Mazi Patrika — Vendor OS end-to-end test.
 *
 *   npm run test:e2e                      # against http://localhost:3000
 *   BASE_URL=http://localhost:4321 npm run test:e2e
 *
 * This is the test that would have caught every bug we actually hit while building
 * the marketplace, so it drives the **real HTTP surface**: it posts to the same
 * Server Actions a vendor's browser calls, then reads the SQLite database directly
 * to prove what happened. No mocked store, no shallow rendering.
 *
 * What it proves, in order:
 *   1. a vendor's reply lands in the thread and stamps the SLA clock, once
 *   2. a quote is priced by the live commission waterfall (GST, gateway, payout)
 *   3. accepting that quote writes exactly one booking, one balanced double-entry
 *      posting in *our* ledger, one idempotent payment, and holds the calendar day
 *   4. a double tap (the classic slow-phone failure) creates nothing extra
 *   5. every public route still answers, and the ledger still sums to zero
 *
 * The action ids are discovered from the running build, not pasted in, so a
 * refactor of `app/vendor/actions.ts` cannot silently make this test lie.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defaultDatabasePath, openStore } from '../packages/store/src/index.ts';
import { COMMISSION_RATES } from '../packages/commerce/src/index.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

const results = [];
const check = (name, ok, detail = '') => {
  results.push([ok ? 'PASS' : 'FAIL', name, detail]);
  return ok;
};

/* ------------------------------------------------------------------ */
/* action-id discovery                                                 */
/* ------------------------------------------------------------------ */

/** Walk `.next/server` for the compiled page modules that hold the id map. */
function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    // `.json` matters: in `next dev` the id → export-name map only exists inside
    // the URL-encoded `moduleId` strings of server-reference-manifest.json.
    else if (entry.endsWith('.js') || entry.endsWith('.json')) out.push(full);
  }
  return out;
}

function discoverActionIds() {
  const ids = new Map();
  // Both build outputs: `.next` (production build) and `.next-dev` (dev server).
  const files = [...walk(join(root, 'apps/web/.next/server')), ...walk(join(root, 'apps/web/.next-dev/server'))];
  const id = '(4[0-9a-f]{40,})';
  const patterns = [
    new RegExp(`"id":"${id}","exportedName":"([A-Za-z0-9_$]+)"`, 'g'),
    new RegExp(`\\\\"id\\\\":\\\\"${id}\\\\",\\\\"exportedName\\\\":\\\\"([A-Za-z0-9_$]+)\\\\"`, 'g'),
    new RegExp(`%22id%22%3A%22${id}%22%2C%22exportedName%22%3A%22([A-Za-z0-9_$]+)%22`, 'g'),
  ];
  for (const file of files) {
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) ids.set(match[2], match[1]);
    }
  }
  return ids;
}

/** The page-local inline action the reply form posts to (no-JS progressive path). */
function replyActionId(html) {
  return /\$ACTION_ID_([0-9a-f]{40,})/.exec(html)?.[1];
}

/* ------------------------------------------------------------------ */
/* transports                                                          */
/* ------------------------------------------------------------------ */

/** What a browser with JavaScript disabled posts. */
async function postForm(url, fields) {
  const body = new FormData();
  for (const [key, value] of fields) body.append(key, value);
  const response = await fetch(url, { method: 'POST', body, redirect: 'manual' });
  return response.status;
}

/**
 * What React's client posts for an action invoked from a Client Component:
 * a multipart body where the referenced FormData parts come **before** the
 * serialised arguments (React's `encodeReply` ordering) and the action id rides in
 * a header.
 */
async function postAction(url, actionId, fields) {
  const body = new FormData();
  for (const [key, value] of fields) body.append(`1_${key}`, value);
  body.append('0', JSON.stringify(['$K1']));
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Next-Action': actionId, Accept: 'text/x-component' },
    body,
    redirect: 'manual',
  });
  const text = await response.text();
  const message = /"message":"([^"]+)"/.exec(text)?.[1] ?? null;
  // A hand-built request has no router state tree, so Next renders its fallback
  // 404 into the flight payload after revalidation. The action still ran.
  const artifact = message === 'This page could not be found.';
  return { status: response.status, message, artifact };
}

const store = () => openStore({ filename: defaultDatabasePath(root) });
const one = (db, sql, ...params) => Number(Object.values(db.prepare(sql).get(...params) ?? {})[0] ?? 0);

async function main() {
  /* ---- 1. pick a live enquiry for the demo vendor desk ---------------- */
  const seed = store().db;
  // An unanswered enquiry is the honest starting point for the SLA leg: the seeded
  // 'quoted' leads would pass trivially because their clock is already stamped.
  const lead = seed
    .prepare("SELECT id, vendor_id, category, event_date FROM leads WHERE status IN ('new','viewed','responded') ORDER BY created_at LIMIT 1")
    .get();
  // A lead that has never been quoted, on an event — the quote leg needs both.
  const quoteLead = seed
    .prepare(
      `SELECT l.id, l.vendor_id, l.category, l.event_id, l.event_date FROM leads l
       WHERE NOT EXISTS (SELECT 1 FROM quotes q WHERE q.lead_id = l.id) AND l.event_id IS NOT NULL
       ORDER BY l.created_at LIMIT 1`,
    )
    .get();

  if (!lead || !quoteLead) {
    console.error('  ✗ the database is not in a seeded state — run `npm run db:reset` first');
    process.exit(2);
  }
  console.log(`  reply leg: ${lead.id} (${lead.vendor_id}) • quote leg: ${quoteLead.id} (${quoteLead.vendor_id})\n`);

  /* ---- 2. reply to the enquiry --------------------------------------- */
  const leadPage = `${BASE}/vendor/leads/${lead.id}`;
  const html = await (await fetch(leadPage)).text();
  const inlineReply = replyActionId(html);
  const ids = discoverActionIds();

  const body = 'एक E2E चाचणी उत्तर — तारीख उपलब्ध आहे, कॅन्डिड पॅकेजसह दर पाठवत आहे.';
  const replyStatus = await postForm(leadPage, [
    [`$ACTION_ID_${inlineReply}`, ''],
    ['leadId', String(lead.id)],
    ['body', body],
  ]);
  check('reply: action accepted over HTTP', replyStatus === 200, `status ${replyStatus}`);

  {
    const db = store().db;
    const mine = one(db, 'SELECT COUNT(*) FROM messages WHERE lead_id = ? AND sender = ? AND body = ?', String(lead.id), 'vendor', body);
    check('reply: exactly one vendor message stored', mine === 1, `rows ${mine}`);
    const responded = db.prepare('SELECT responded_at FROM leads WHERE id = ?').get(String(lead.id))?.responded_at;
    check('reply: SLA clock stamped', Boolean(responded), String(responded));
  }

  /* ---- 3. send a quote ------------------------------------------------ */
  const quoteUrl = `${BASE}/vendor/leads/${quoteLead.id}`;
  // Warm the route first: in `next dev` the very first request to a route compiles
  // it, and a Server Action POST that races that compile is not a product bug — but
  // it would make this test flaky, so the page is rendered before it is posted to.
  await fetch(quoteUrl);
  const quoteAction = ids.get('saveQuoteAction');
  check('discovery: saveQuoteAction id found in the build', Boolean(quoteAction), quoteAction ?? 'not found');

  const lineItems = [
    ['label', 'मुख्य सेवा पॅकेज'], ['quantity', '1'], ['unit', 'पॅकेज'], ['unitPrice', '145000'],
    ['label', 'अतिरिक्त सहाय्यक टीम'], ['quantity', '6'], ['unit', 'तास'], ['unitPrice', '9500'],
    ['discount', '4000'],
  ];
  const quoteResult = await postAction(quoteUrl, quoteAction, [['leadId', String(quoteLead.id)], ...lineItems]);
  check('quote: action accepted', quoteResult.status === 200 && (!quoteResult.message || quoteResult.artifact), JSON.stringify(quoteResult));

  const category = String(quoteLead.category);
  const lineSubtotal = 145_000 * 100 + 6 * 9_500 * 100;
  const taxable = lineSubtotal - 4_000 * 100;
  let quoteId = '';
  {
    const db = store().db;
    const rows = db.prepare('SELECT * FROM quotes WHERE lead_id = ?').all(String(quoteLead.id));
    quoteId = rows.length ? String(rows[0].id) : '';
    check('quote: exactly one quote written', rows.length === 1, `rows ${rows.length}`);
    if (rows.length) {
      const row = rows[0];
      check('quote: subtotal from line items', Number(row.subtotal_paise) === lineSubtotal, `${row.subtotal_paise} vs ${lineSubtotal}`);
      check('quote: GST 18% on taxable value', Number(row.gst_paise) === Math.round(taxable * 0.18), String(row.gst_paise));
      check('quote: customer total = taxable + GST', Number(row.total_paise) === taxable + Math.round(taxable * 0.18), String(row.total_paise));
    }
    check('quote: lead moved to quoted', String(db.prepare('SELECT status FROM leads WHERE id = ?').get(String(quoteLead.id)).status) === 'quoted');
    check('quote: audited', one(db, "SELECT COUNT(*) FROM audit_log WHERE action = 'quote.sent' AND entity_id = ?", quoteId) === 1);
  }

  /* ---- 4. the customer accepts — twice -------------------------------- */
  const acceptAction = ids.get('acceptQuoteAsCustomerAction');
  check('discovery: acceptQuoteAsCustomerAction id found in the build', Boolean(acceptAction), acceptAction ?? 'not found');
  const first = await postAction(quoteUrl, acceptAction, [['quoteId', quoteId]]);
  const second = await postAction(quoteUrl, acceptAction, [['quoteId', quoteId]]);
  check(
    'accept: both taps accepted (double-tap safe)',
    [first, second].every((r) => r.status === 200 && (!r.message || r.artifact)),
    JSON.stringify([first, second]),
  );

  {
    const db = store().db;
    const bookings = db.prepare('SELECT * FROM bookings WHERE quote_id = ?').all(quoteId);
    check('booking: exactly one booking for the quote', bookings.length === 1, `rows ${bookings.length}`);
    const booking = bookings[0] ?? {};
    const bookingId = `bk_${quoteId}`;
    check('booking: id is bk_<quoteId>', String(booking.id) === bookingId, String(booking.id));
    check('booking: state is BOOKING_CONFIRMED', String(booking.state) === 'BOOKING_CONFIRMED', String(booking.state));
    check('booking: advance is 20% of the customer total', Number(booking.advance_paise) === Math.round(Number(booking.total_paise) * 0.2), String(booking.advance_paise));
    check(
      `booking: commission follows the ${category} rate (${(COMMISSION_RATES[category] ?? 0) * 100}%)`,
      Number(booking.commission_paise) === Math.round(taxable * (COMMISSION_RATES[category] ?? 0)),
      `${booking.commission_paise} vs ${Math.round(taxable * (COMMISSION_RATES[category] ?? 0))}`,
    );
    const history = JSON.parse(String(booking.history ?? '[]'));
    check(
      'booking: advanced through the state machine (… → PAYMENT_PENDING → BOOKING_CONFIRMED)',
      history.at(-2)?.to === 'PAYMENT_PENDING' && history.at(-1)?.to === 'BOOKING_CONFIRMED',
      JSON.stringify(history),
    );

    const ledger = db.prepare('SELECT * FROM ledger_entries WHERE booking_id = ?').all(bookingId);
    check('ledger: six postings for the booking', ledger.length === 6, `entries ${ledger.length}`);
    const sum = ledger.reduce((total, row) => total + Number(row.amount_paise), 0);
    check('ledger: booking posting sums to zero', sum === 0, `sum ${sum}`);
    const accounts = ledger.map((row) => String(row.account)).sort().join(',');
    check(
      'ledger: cash, gateway cost, GST, vendor payable and revenue accounts all used',
      accounts === 'GATEWAY_FEES,GST_PAYABLE,PLATFORM_CASH,PLATFORM_CASH,PLATFORM_REVENUE,VENDOR_PAYABLE',
      accounts,
    );
    const duplicates = db
      .prepare('SELECT idempotency_key, COUNT(*) AS c FROM ledger_entries GROUP BY idempotency_key HAVING c > 1')
      .all();
    check('ledger: no duplicated postings anywhere', duplicates.length === 0, JSON.stringify(duplicates));

    const payments = db.prepare('SELECT * FROM payments WHERE booking_id = ?').all(bookingId);
    check('payment: one captured advance', payments.length === 1 && String(payments[0].kind) === 'advance', JSON.stringify(payments));
    check('payment: idempotency key prevents a second capture', one(db, 'SELECT COUNT(*) FROM payments WHERE booking_id = ?', bookingId) === 1);

    check('lead: marked won', String(db.prepare('SELECT status FROM leads WHERE id = ?').get(String(quoteLead.id)).status) === 'won');
    check('quote: marked accepted with a timestamp', Boolean(db.prepare('SELECT accepted_at FROM quotes WHERE id = ?').get(quoteId)?.accepted_at));
    const availability = db.prepare('SELECT * FROM vendor_availability WHERE vendor_id = ? AND date = ?').get(String(quoteLead.vendor_id), String(quoteLead.event_date));
    check(
      'calendar: the event date is held for the vendor',
      Boolean(availability) && String(availability.status) === 'booked',
      JSON.stringify(availability ?? null),
    );
  }

  /* ---- 5. marketplace-wide integrity + public routes ------------------ */
  {
    const db = store().db;
    const unbalanced = db
      .prepare('SELECT booking_id, SUM(amount_paise) AS total FROM ledger_entries GROUP BY booking_id')
      .all()
      .filter((row) => Number(row.total) !== 0);
    check('integrity: every booking balances', unbalanced.length === 0, JSON.stringify(unbalanced));
    check('integrity: ledger zero-sum overall', one(db, 'SELECT SUM(amount_paise) FROM ledger_entries') === 0);
  }

  const routes = ['/', '/create', '/vendors', '/vendor', '/panchang', '/events', '/admin', '/offline', '/manifest.webmanifest', '/api/health'];
  for (const route of routes) {
    const response = await fetch(`${BASE}${route}`, { redirect: 'manual' });
    check(`route ${route} answers`, response.status === 200, `status ${response.status}`);
  }

  /* ---- report --------------------------------------------------------- */
  const failed = results.filter(([state]) => state === 'FAIL');
  for (const [state, name, detail] of results) {
    console.log(`${state === 'PASS' ? '  ✓' : '  ✗'} ${name}${detail ? ` — ${detail}` : ''}`);
  }
  console.log(`\n  ${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(`\n  ✗ ${error instanceof Error ? error.stack : error}\n`);
  process.exit(1);
});
