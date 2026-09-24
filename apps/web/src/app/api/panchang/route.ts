import { NextResponse } from 'next/server';

import { findMuhurats } from '@mazi/panchang';

import { locationFor, panchangFor } from '@/lib/panchang';

/**
 * GET /api/panchang?city=पुणे&date=2027-04-18
 * GET /api/panchang?city=पुणे&from=…&to=…&eventType=wedding   → muhurat suitability
 *
 * Deterministic, cacheable, and auditable: the response states the ephemeris
 * version and ayanamsa so a printed patrika can be reproduced years later.
 */
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawCity = (url.searchParams.get('city') ?? 'पुणे').trim().slice(0, 60);
  const city = rawCity || 'पुणे';
  const location = locationFor(city);
  const panchangLocation = {
    city: location.city,
    latitude: location.latitude,
    longitude: location.longitude,
    tzOffsetHours: location.tzOffsetHours,
  };

  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  if (from && to) {
    const ALLOWED_EVENT_TYPES = new Set([
      'wedding',
      'engagement',
      'mundan',
      'namkaran',
      'vastu',
      'upanayan',
      'satyanarayan',
      'other',
    ]);
    const rawEventType = url.searchParams.get('eventType') ?? 'other';
    const eventType = ALLOWED_EVENT_TYPES.has(rawEventType) ? rawEventType : 'other';
    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
      return NextResponse.json({ error: 'अवैध दिनांक श्रेणी.' }, { status: 400 });
    }
    const rawLimit = Number(url.searchParams.get('limit') ?? 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 30) : 10;
    const fromDate = new Date(`${from}T00:00:00Z`);
    const toDate = new Date(`${to}T00:00:00Z`);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || toDate < fromDate) {
      return NextResponse.json({ error: 'अवैध दिनांक श्रेणी.' }, { status: 400 });
    }
    if ((toDate.getTime() - fromDate.getTime()) / 86_400_000 > 366) {
      return NextResponse.json({ error: 'श्रेणी ३६६ दिवसांपेक्षा जास्त असू शकत नाही.' }, { status: 400 });
    }
    const results = findMuhurats({ eventType, location: panchangLocation, from, to, limit });
    return NextResponse.json(
      {
        city: location.label,
        range: { from, to },
        eventType,
        results: results.map((result) => ({
          date: result.date,
          weekday: result.weekday,
          score: result.score,
          band: result.band,
          tithi: `${result.panchang.tithi.paksha} ${result.panchang.tithi.name}`,
          nakshatra: result.panchang.nakshatra.name,
          recommendedWindows: result.recommendedWindows.map((w) => ({ label: w.label, start: w.start, end: w.end })),
          avoidWindows: result.avoidWindows.map((w) => ({ label: w.label, start: w.start, end: w.end })),
          factors: result.factors.map((f) => ({ id: f.id, label: f.label, impact: f.impact, delta: f.delta, detail: f.detail })),
        })),
        methodology: results[0]?.methodology ?? null,
      },
      { headers: { 'cache-control': 'public, max-age=3600, stale-while-revalidate=86400' } },
    );
  }

  const dateParam = url.searchParams.get('date');
  if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: 'अवैध दिनांक.' }, { status: 400 });
  }
  const date = dateParam ? new Date(`${dateParam}T00:00:00Z`) : new Date();
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: 'अवैध दिनांक.' }, { status: 400 });
  }

  const panchang = panchangFor(city, date);
  return NextResponse.json(
    { city: location.label, ...panchang },
    { headers: { 'cache-control': 'public, max-age=3600, stale-while-revalidate=86400' } },
  );
}
