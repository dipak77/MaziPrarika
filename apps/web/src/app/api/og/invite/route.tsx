import type { NextRequest } from 'next/server';
import { ogCardFromEvent, ogFallbackCard, renderOgImage, type OgCardData } from '@/lib/og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function cardForSlug(slug: string): Promise<OgCardData> {
  if (slug.length === 0) return ogFallbackCard();
  try {
    const { getStore } = await import('@/lib/store');
    const event = getStore().events.bySlug(slug);
    if (!event) return ogFallbackCard();
    return ogCardFromEvent(event);
  } catch {
    return ogFallbackCard();
  }
}

export async function GET(request: NextRequest) {
  try {
    const param = new URL(request.url).searchParams.get('slug') ?? '';
    const slug = param.trim().slice(0, 80);
    const card = await cardForSlug(slug);
    return renderOgImage(card);
  } catch {
    return renderOgImage(ogFallbackCard());
  }
}
