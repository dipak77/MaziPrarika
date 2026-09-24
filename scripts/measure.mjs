#!/usr/bin/env node
/**
 * Mazi Patrika — performance harness.
 *
 *   npm run build && npx next start -p 3100     # in apps/web
 *   npm run measure                             # defaults to http://localhost:3100
 *   BASE_URL=http://localhost:3000 SAMPLES=25 npm run measure
 *
 * Measures what the SLOs are written about: server response time per route
 * (p50 / p95 / max), the compressed and raw payload size, and the engine's own
 * throughput. Run it against a **production build** — dev-server numbers are
 * meaningless because routes compile on first hit.
 *
 * The numbers this prints on the reference machine are recorded in
 * docs/PERFORMANCE.md; re-run and update that table when something changes
 * materially, so the document never drifts from reality.
 */

const BASE = (process.env.BASE_URL ?? 'http://localhost:3100').replace(/\/$/, '');
const SAMPLES = Number(process.env.SAMPLES ?? 12);

const ROUTES = [
  '/',
  '/create',
  '/vendors',
  '/vendors/vnd_pune_kulkarni_studio',
  '/vendor',
  '/panchang',
  '/events',
  '/admin',
  '/studio/patil-patil-vivah-2027',
  '/e/patil-patil-vivah-2027',
  '/api/vendors?limit=9',
  '/api/health',
  '/api/panchang?city=%E0%A4%AA%E0%A5%81%E0%A4%A3%E0%A5%87&date=2026-11-08',
];

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
const ms = (value) => Number(value.toFixed(1));

async function timeRoute(route) {
  await fetch(BASE + route); // warm: first hit compiles/negotiates

  const times = [];
  let compressed = 0;
  let raw = 0;
  let status = 0;

  for (let i = 0; i < SAMPLES; i += 1) {
    const started = performance.now();
    const response = await fetch(BASE + route);
    const body = await response.arrayBuffer();
    times.push(performance.now() - started);
    status = response.status;
    raw = body.byteLength;
    compressed = Number(response.headers.get('content-length') ?? body.byteLength);
  }

  times.sort((a, b) => a - b);
  return {
    route,
    status,
    p50: ms(percentile(times, 50)),
    p95: ms(percentile(times, 95)),
    max: ms(times.at(-1)),
    responseBytes: compressed || raw,
  };
}

async function engineThroughput() {
  const { computePanchang, findMuhurats } = await import('../packages/panchang/src/index.ts');
  const cities = [
    { city: 'पुणे', latitude: 18.5204, longitude: 73.8567, tzOffsetHours: 5.5 },
    { city: 'मुंबई', latitude: 19.076, longitude: 72.8777, tzOffsetHours: 5.5 },
    { city: 'नागपूर', latitude: 21.1458, longitude: 79.0882, tzOffsetHours: 5.5 },
    { city: 'कोल्हापूर', latitude: 16.705, longitude: 74.2433, tzOffsetHours: 5.5 },
  ];

  // One day's panchang, distinct inputs so nothing is memoised.
  const dayRuns = 200;
  let started = performance.now();
  for (let i = 0; i < dayRuns; i += 1) {
    const day = 1 + (i % 28);
    const month = 1 + (i % 12);
    computePanchang(2027, month, day, cities[i % cities.length]);
  }
  const perDayMs = (performance.now() - started) / dayRuns;

  // A full-year muhurat scan, again with distinct windows: this is the honest
  // worst case the /panchang page can ask for (the page itself scans 60 days).
  const scanRuns = 10;
  started = performance.now();
  let results = 0;
  for (let i = 0; i < scanRuns; i += 1) {
    const from = `202${6 + (i % 2)}-0${(i % 9) + 1}-01`;
    const to = `${from.slice(0, 4)}-12-31`;
    results = findMuhurats({ eventType: 'wedding', location: cities[i % cities.length], from, to, limit: 400 }).length;
  }
  const perScanMs = (performance.now() - started) / scanRuns;

  // The page's actual workload: a 60-day window.
  started = performance.now();
  const sixty = findMuhurats({ eventType: 'wedding', location: cities[0], from: '2027-01-01', to: '2027-03-01', limit: 80 });
  const sixtyMs = performance.now() - started;

  return { perDayMs: ms(perDayMs), perScanMs: ms(perScanMs), sixtyMs: ms(sixtyMs), yearResults: results, sixtyDays: sixty.length };
}

async function main() {
  console.log(`\n  Mazi Patrika — performance (${BASE}, ${SAMPLES} samples/route)\n`);

  const rows = [];
  for (const route of ROUTES) rows.push(await timeRoute(route));
  console.table(
    rows.map((row) => ({
      route: row.route,
      status: row.status,
      'p50 ms': row.p50,
      'p95 ms': row.p95,
      'max ms': row.max,
      bytes: row.responseBytes,
    })),
  );

  const api = rows.find((row) => row.route.startsWith('/api/vendors'));
  const slowest = [...rows].sort((a, b) => b.p95 - a.p95)[0];
  console.log(`  api/vendors p95  ${api.p95} ms   (SLO 200 ms)`);
  console.log(`  slowest page p95 ${slowest.p95} ms   ${slowest.route}`);
  console.log(`  fonts            immutable, 1 year | icons 30 days | sw.js must-revalidate\n`);

  const engine = await engineThroughput();
  console.log(`  computePanchang, one day (unmemoised): ${engine.perDayMs} ms`);
  console.log(`  findMuhurats, ${engine.sixtyDays}-result 60-day window (what /panchang does): ${engine.sixtyMs} ms`);
  console.log(`  findMuhurats, full year (${engine.yearResults} results, unmemoised): ${engine.perScanMs} ms\n`);
}

main().catch((error) => {
  console.error(`\n  ✗ ${error instanceof Error ? error.message : error}`);
  console.error(`    is a production server running at ${BASE}? (npm run build && npx next start -p 3100)\n`);
  process.exit(1);
});
