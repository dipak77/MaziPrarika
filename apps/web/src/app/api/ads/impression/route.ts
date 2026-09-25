import { NextResponse } from 'next/server';
import { z } from 'zod';

import { checkRateLimitSync } from '@/lib/rate-limit';
import { getStore } from '@/lib/store';

/**
 * POST /api/ads/impression
 *
 * Search itself must not spend a campaign. The discovery feed calls this once
 * per sponsored card it actually rendered. One viewer, one vendor, one hour.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  vendorIds: z.array(z.string().trim().min(1).max(80)).max(12),
  city: z.string().trim().max(60).optional(),
});

export async function POST(request: Request) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'अवैध जाहिरात नोंद.' }, { status: 400 });

  const forwarded = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  const ip = forwarded || request.headers.get('x-real-ip')?.trim() || 'anon';
  const store = getStore();
  const campaigns = store.ads.activeCampaigns('sponsored-search');
  let recorded = 0;

  for (const vendorId of parsed.data.vendorIds) {
    if (checkRateLimitSync(`ad:${ip}:${vendorId}`, 1, 60 * 60 * 1000)) continue;
    const campaign = campaigns.find((row) => row.vendorId === vendorId && row.active);
    if (!campaign) continue;
    if (parsed.data.city && campaign.targeting.city && campaign.targeting.city !== parsed.data.city) continue;
    const room = campaign.budgetPaise - campaign.spentPaise;
    if (room <= 0) continue;
    store.ads.recordEvent({
      campaignId: campaign.id,
      kind: 'impression',
      ...(parsed.data.city ? { city: parsed.data.city } : {}),
      costPaise: Math.min(5, room),
    });
    recorded += 1;
  }

  return NextResponse.json({ recorded }, { headers: { 'cache-control': 'no-store' } });
}
